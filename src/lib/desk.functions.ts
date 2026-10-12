import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";

import { isDeskAdmin, loginWithPassword, logoutDesk } from "@/lib/admin-auth.server";
import { depositProofInputSchema, formatProofIssue } from "@/lib/deposit-proof";
import {
  listDepositProofs,
  proofAttemptError,
  readDepositProof,
  saveDepositProof,
} from "@/lib/deposit-proofs.server";
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
    try {
      const signedIn = await isDeskAdmin();
      if (!signedIn) {
        return { ok: false as const, error: "Sign in again before saving." };
      }
      const settings = await writeSettings(data);
      return { ok: true as const, settings };
    } catch (error) {
      console.error("Desk settings were not saved.", error);
      if (error instanceof Error && error.message === "DATABASE_UNAVAILABLE") {
        return {
          ok: false as const,
          error:
            "The database refused the save. In MongoDB Atlas, open Network Access and allow this server, then try again.",
        };
      }
      const detail = (error as { detail?: string } | null)?.detail;
      if (error instanceof Error && error.message === "INVALID_SETTINGS") {
        return { ok: false as const, error: detail || "Check the form and try again." };
      }
      const code = (error as { code?: string } | null)?.code;
      if (code === "EACCES" || code === "EPERM" || code === "EROFS" || code === "ENOSPC") {
        return {
          ok: false as const,
          error: "The desk could not write the settings file on this server.",
        };
      }
      if (error instanceof Error && /password string too short/i.test(error.message)) {
        return { ok: false as const, error: "Sign in again before saving." };
      }
      return { ok: false as const, error: "The desk could not save those settings." };
    }
  });

export const submitDepositProof = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }) => {
    const parsed = depositProofInputSchema.safeParse(data);
    if (!parsed.success) {
      return { ok: false as const, error: formatProofIssue(parsed.error) };
    }
    const limited = proofAttemptError(getRequestIP({ xForwardedFor: true }) ?? "local");
    if (limited) return { ok: false as const, error: limited };
    try {
      await saveDepositProof(parsed.data);
      return { ok: true as const };
    } catch (error) {
      console.error("Deposit proof was not stored.", error);
      if (error instanceof Error && error.message === "DATABASE_UNAVAILABLE") {
        return {
          ok: false as const,
          error: "The database is not available, so the proof was not stored.",
        };
      }
      return { ok: false as const, error: "The proof could not be stored. Try again." };
    }
  });

export const getDepositProofs = createServerFn({ method: "GET" }).handler(async () => {
  const signedIn = await isDeskAdmin();
  if (!signedIn) return { ok: false as const, error: "Sign in again.", proofs: [] };
  try {
    return { ok: true as const, proofs: await listDepositProofs() };
  } catch (error) {
    console.error("Deposit proofs could not be listed.", error);
    return {
      ok: false as const,
      error: "The database did not return deposit proofs.",
      proofs: [],
    };
  }
});

export const openDepositProof = createServerFn({ method: "POST" })
  .validator((data: { id?: string }) => ({
    id: typeof data?.id === "string" ? data.id : "",
  }))
  .handler(async ({ data }) => {
    const signedIn = await isDeskAdmin();
    if (!signedIn) return { ok: false as const, error: "Sign in again." };
    try {
      const proof = await readDepositProof(data.id);
      if (!proof) return { ok: false as const, error: "That proof is no longer available." };
      return { ok: true as const, proof };
    } catch (error) {
      console.error("Deposit proof could not be opened.", error);
      return { ok: false as const, error: "The database did not return that proof." };
    }
  });
