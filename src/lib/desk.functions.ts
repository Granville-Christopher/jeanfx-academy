import { createServerFn } from "@tanstack/react-start";

import { isDeskAdmin, loginWithPassword, logoutDesk } from "@/lib/admin-auth.server";
import { readSettings, writeSettings } from "@/lib/settings-store.server";

export const getPublicSettings = createServerFn({ method: "GET" }).handler(async () => {
  return readSettings();
});

export const getDeskSession = createServerFn({ method: "GET" }).handler(async () => {
  const signedIn = await isDeskAdmin();
  if (!signedIn) return { signedIn: false as const, settings: null };
  return { signedIn: true as const, settings: await readSettings() };
});

export const loginDesk = createServerFn({ method: "POST" })
  .validator((data: { password?: string }) => ({
    password: typeof data?.password === "string" ? data.password : "",
  }))
  .handler(async ({ data }) => loginWithPassword(data.password));

export const logoutDeskSession = createServerFn({ method: "POST" }).handler(async () => {
  await logoutDesk();
  return { ok: true as const };
});

export const saveDeskSettings = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }) => {
    const signedIn = await isDeskAdmin();
    if (!signedIn) {
      return { ok: false as const, error: "Sign in again before saving." };
    }
    try {
      const settings = await writeSettings(data);
      return { ok: true as const, settings };
    } catch (error) {
      if (error instanceof Error && error.message === "DATABASE_UNAVAILABLE") {
        return {
          ok: false as const,
          error:
            "The database did not accept the save. Check MONGODB_URI and the network access list.",
        };
      }
      const detail = (error as { detail?: string } | null)?.detail;
      if (error instanceof Error && error.message === "INVALID_SETTINGS") {
        return { ok: false as const, error: detail || "Check the form and try again." };
      }
      return { ok: false as const, error: "The desk could not save those settings." };
    }
  });
