import { z } from "zod";

import { planIds, type PlanId } from "@/lib/site-content";

const dataUrlPattern =
  /^data:(image\/(?:png|jpeg|webp)|application\/pdf);base64,[A-Za-z0-9+/=\s]+$/;

export const depositProofInputSchema = z.object({
  planId: z.enum(planIds),
  reference: z
    .string()
    .trim()
    .min(6, "Choose a plan so the proof has a payment reference.")
    .max(40, "That payment reference is too long.")
    .regex(/^[A-Za-z0-9-]+$/, "Use the payment reference shown on this page."),
  fileName: z.string().trim().min(1).max(120),
  dataUrl: z
    .string()
    .max(2_200_000, "That file is too large. Use a screenshot or PDF under 1.5 MB.")
    .refine((value) => dataUrlPattern.test(value), "Upload a PNG, JPG, WEBP, or PDF."),
});

export type DepositProofInput = z.infer<typeof depositProofInputSchema>;

export type DepositProofSummary = {
  id: string;
  createdAt: string;
  planId: PlanId;
  planName: string;
  amountUsd: number;
  reference: string;
  fileName: string;
  contentType: string;
};

export function proofContentType(dataUrl: string): string {
  const match = /^data:([^;]+);base64,/.exec(dataUrl);
  return match?.[1] ?? "application/octet-stream";
}

export function safeFileName(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "proof";
  const cleaned = base
    .replace(/[^\w.\- ]+/g, "")
    .trim()
    .slice(0, 80);
  return cleaned || "proof";
}

export function formatProofIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Check the file and try again.";
}
