import { createHash, timingSafeEqual } from "node:crypto";

export function passwordsMatch(input: string, expected: string): boolean {
  if (!expected) return false;
  const left = createHash("sha256").update(input).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}
