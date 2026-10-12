import { loadLocalEnv } from "@/lib/load-env.server";

loadLocalEnv();
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  defaultSiteSettings,
  formatIssue,
  parseSettings,
  type SiteSettings,
} from "@/lib/site-content";

type MongoClientType = import("mongodb").MongoClient;

const globalForMongo = globalThis as unknown as { deskMongo?: Promise<MongoClientType> };

export function createFileStore(directory: string) {
  const filePath = path.join(directory, "site-settings.json");
  let queue: Promise<void> = Promise.resolve();

  return {
    async read(): Promise<SiteSettings> {
      try {
        const raw = await readFile(filePath, "utf8");
        const parsed = parseSettings(JSON.parse(raw) as unknown);
        if (parsed.success) return parsed.data;
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        if (code !== "ENOENT") {
          console.error("Desk settings file could not be read. Using the built-in defaults.");
        }
      }
      return defaultSiteSettings;
    },
    async write(settings: SiteSettings): Promise<void> {
      const run = queue.then(async () => {
        await mkdir(directory, { recursive: true });
        const temporary = `${filePath}.tmp`;
        await writeFile(temporary, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
        await rename(temporary, filePath);
      });
      queue = run.then(
        () => undefined,
        () => undefined,
      );
      await run;
    },
  };
}

const fileStore = createFileStore(path.join(process.cwd(), "data"));

export async function readSettings(): Promise<SiteSettings> {
  if (!process.env["MONGODB_URI"]?.trim()) return fileStore.read();
  try {
    const stored = await readMongoSettings();
    if (!stored) return defaultSiteSettings;
    const parsed = parseSettings(stored);
    if (!parsed.success) return defaultSiteSettings;
    return parsed.data;
  } catch {
    console.error("MongoDB unavailable. Reading the local desk file instead.");
    return fileStore.read();
  }
}

export async function writeSettings(input: unknown): Promise<SiteSettings> {
  const parsed = parseSettings(input);
  if (!parsed.success) {
    const error = new Error("INVALID_SETTINGS");
    (error as Error & { detail?: string }).detail = formatIssue(parsed.error);
    throw error;
  }
  if (process.env["MONGODB_URI"]?.trim()) {
    try {
      await writeMongoSettings(parsed.data);
      return parsed.data;
    } catch {
      throw new Error("DATABASE_UNAVAILABLE");
    }
  }
  await fileStore.write(parsed.data);
  return parsed.data;
}

async function collection() {
  const uri = process.env["MONGODB_URI"]?.trim();
  if (!uri) return null;
  if (!globalForMongo.deskMongo) {
    const connecting = import("mongodb").then(async ({ MongoClient }) => {
      const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
      await client.connect();
      return client;
    });
    globalForMongo.deskMongo = connecting;
    connecting.catch(() => {
      if (globalForMongo.deskMongo === connecting) delete globalForMongo.deskMongo;
    });
  }
  const client = await globalForMongo.deskMongo;
  return client
    .db("academy")
    .collection<{ _id: string; settings: unknown; updatedAt?: string }>("siteSettings");
}

async function readMongoSettings(): Promise<unknown> {
  const desk = await collection();
  if (!desk) return null;
  const doc = await desk.findOne({ _id: "desk" });
  if (!doc || typeof doc !== "object" || !("settings" in doc)) return null;
  return doc.settings;
}

async function writeMongoSettings(settings: SiteSettings): Promise<void> {
  const desk = await collection();
  if (!desk) throw new Error("DATABASE_UNAVAILABLE");
  await desk.updateOne(
    { _id: "desk" },
    { $set: { settings, updatedAt: new Date().toISOString() } },
    { upsert: true },
  );
}
