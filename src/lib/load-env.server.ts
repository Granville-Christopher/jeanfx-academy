import { existsSync } from "node:fs";
import path from "node:path";
import { loadEnvFile } from "node:process";

const envFile = path.join(process.cwd(), ".env");

export function loadLocalEnv() {
  if (existsSync(envFile)) loadEnvFile(envFile);
}

loadLocalEnv();
