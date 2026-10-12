import { loadLocalEnv } from "@/lib/load-env.server";

loadLocalEnv();
import { randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

import { getRequestIP, useSession as openDeskSession } from "@tanstack/react-start/server";

import { passwordsMatch } from "@/lib/passwords";

type DeskSession = { role?: "admin" };

const failures = new Map<string, { count: number; resetAt: number }>();

function dataDir() {
  return path.join(process.cwd(), "data");
}

export function getAdminPassword(): string {
  const fromEnv = process.env["ADMIN_PASSWORD"]?.trim() ?? "";
  if (fromEnv.length >= 8) return fromEnv;
  const file = path.join(dataDir(), "admin-password.txt");
  if (existsSync(file)) return readFileSync(file, "utf8").trim();
  mkdirSync(dataDir(), { recursive: true });
  const generated = `desk-${randomBytes(9).toString("hex")}`;
  writeFileSync(file, `${generated}\n`, { mode: 0o600 });
  console.info("Desk password written to data/admin-password.txt");
  return generated;
}

export function getSessionSecret(): string {
  const fromEnv = process.env["ADMIN_SECRET"]?.trim() ?? "";
  if (fromEnv.length >= 32) return fromEnv;
  const file = path.join(dataDir(), "session-secret");
  if (existsSync(file)) {
    const stored = readFileSync(file, "utf8").trim();
    if (stored.length >= 32) return stored;
  }
  mkdirSync(dataDir(), { recursive: true });
  const generated = randomBytes(32).toString("hex");
  writeFileSync(file, `${generated}\n`, { mode: 0o600 });
  return generated;
}

function sessionConfig() {
  return {
    password: getSessionSecret(),
    name: "desk",
    maxAge: 60 * 60 * 24 * 7,
    cookie: {
      httpOnly: true,
      sameSite: "lax" as const,
      path: "/",
      secure: process.env["NODE_ENV"] === "production",
    },
  };
}

function clientKey() {
  return getRequestIP({ xForwardedFor: true }) ?? "local";
}

export async function isDeskAdmin(): Promise<boolean> {
  const session = await openDeskSession<DeskSession>(sessionConfig());
  return session.data.role === "admin";
}

export async function loginWithPassword(
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = clientKey();
  const now = Date.now();
  const row = failures.get(key);
  if (row && row.resetAt > now && row.count >= 8) {
    return { ok: false, error: "Too many attempts. Wait a few minutes and try again." };
  }
  if (!passwordsMatch(password, getAdminPassword())) {
    if (!row || row.resetAt <= now) {
      failures.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    } else {
      row.count += 1;
    }
    return { ok: false, error: "That password does not open the desk." };
  }
  failures.delete(key);
  const session = await openDeskSession<DeskSession>(sessionConfig());
  await session.update({ role: "admin" });
  return { ok: true };
}

export async function logoutDesk(): Promise<void> {
  const session = await openDeskSession<DeskSession>(sessionConfig());
  await session.clear();
}
