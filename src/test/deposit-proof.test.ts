import { describe, expect, it } from "vitest";

import { depositProofInputSchema, proofContentType, safeFileName } from "@/lib/deposit-proof";

const png =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

describe("deposit proofs", () => {
  it("accepts a png receipt and a payment reference", () => {
    const parsed = depositProofInputSchema.safeParse({
      planId: "half-year",
      reference: "JEANFX-HALFYEAR-AB12C",
      fileName: "receipt.png",
      dataUrl: png,
    });
    expect(parsed.success).toBe(true);
    expect(proofContentType(png)).toBe("image/png");
    expect(safeFileName("../../receipt .png")).toBe("receipt .png");
  });

  it("rejects a file that is not an image or pdf", () => {
    const parsed = depositProofInputSchema.safeParse({
      planId: "monthly",
      reference: "JEANFX-MONTHLY-AB12C",
      fileName: "note.txt",
      dataUrl: "data:text/plain;base64,aGVsbG8=",
    });
    expect(parsed.success).toBe(false);
  });
});
