import { randomUUID } from "node:crypto";

import { payableUsd } from "@/lib/site-content";
import {
  proofContentType,
  safeFileName,
  type DepositProofInput,
  type DepositProofSummary,
} from "@/lib/deposit-proof";
import { academyCollection, readSettings } from "@/lib/settings-store.server";

type DepositProofDoc = {
  _id: string;
  createdAt: string;
  planId: DepositProofSummary["planId"];
  planName: string;
  amountUsd: number;
  reference: string;
  fileName: string;
  contentType: string;
  dataUrl: string;
};

const attempts = new Map<string, { count: number; resetAt: number }>();

export function proofAttemptError(key: string): string | null {
  const now = Date.now();
  const row = attempts.get(key);
  if (row && row.resetAt > now && row.count >= 6) {
    return "Too many proofs from this connection. Wait a few minutes and try again.";
  }
  if (!row || row.resetAt <= now) attempts.set(key, { count: 1, resetAt: now + 30 * 60 * 1000 });
  else row.count += 1;
  return null;
}

async function proofs() {
  return academyCollection<DepositProofDoc>("depositProofs");
}

export async function saveDepositProof(input: DepositProofInput): Promise<void> {
  const settings = await readSettings();
  const plan = settings.plans.find((entry) => entry.id === input.planId);
  if (!plan) throw new Error("UNKNOWN_PLAN");
  const desk = await proofs();
  if (!desk) throw new Error("DATABASE_UNAVAILABLE");
  await desk.insertOne({
    _id: randomUUID(),
    createdAt: new Date().toISOString(),
    planId: plan.id,
    planName: plan.name,
    amountUsd: payableUsd(plan),
    reference: input.reference,
    fileName: safeFileName(input.fileName),
    contentType: proofContentType(input.dataUrl),
    dataUrl: input.dataUrl.replace(/\s+/g, ""),
  });
}

export async function listDepositProofs(): Promise<DepositProofSummary[]> {
  const desk = await proofs();
  if (!desk) throw new Error("DATABASE_UNAVAILABLE");
  const docs = await desk
    .find({}, { projection: { dataUrl: 0 } })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
  return docs.map((doc) => ({
    id: doc._id,
    createdAt: doc.createdAt,
    planId: doc.planId,
    planName: doc.planName,
    amountUsd: doc.amountUsd,
    reference: doc.reference,
    fileName: doc.fileName,
    contentType: doc.contentType,
  }));
}

export async function readDepositProof(
  id: string,
): Promise<{ dataUrl: string; contentType: string; fileName: string } | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const desk = await proofs();
  if (!desk) throw new Error("DATABASE_UNAVAILABLE");
  const doc = await desk.findOne(
    { _id: id },
    { projection: { dataUrl: 1, contentType: 1, fileName: 1 } },
  );
  if (!doc?.dataUrl) return null;
  return { dataUrl: doc.dataUrl, contentType: doc.contentType, fileName: doc.fileName };
}
