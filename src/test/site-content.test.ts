import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { mentorshipPlans } from "@/lib/mentorship-plans";
import { passwordsMatch } from "@/lib/passwords";
import {
  amountInstruction,
  defaultSiteSettings,
  initials,
  isStableAsset,
  monthlyUsd,
  payableUsd,
  parseSettings,
  paymentReference,
} from "@/lib/site-content";
import { createFileStore } from "@/lib/settings-store.server";

describe("desk settings", () => {
  it("keeps the original plan prices as defaults", () => {
    for (const plan of mentorshipPlans) {
      expect(defaultSiteSettings.plans.find((entry) => entry.id === plan.id)?.priceUsd).toBe(
        plan.price,
      );
    }
  });

  it("rejects a missing trader name and a blank wallet address", () => {
    const broken = parseSettings({
      ...defaultSiteSettings,
      traderName: "  ",
      wallets: [{ id: "w1", asset: "USDT", network: "TRC-20", address: "short", qrImage: "" }],
    });
    expect(broken.success).toBe(false);
  });

  it("keeps a pasted payment link, drops a blank wallet, and rounds a decimal price", () => {
    const parsed = parseSettings({
      ...defaultSiteSettings,
      plans: defaultSiteSettings.plans.map((plan) =>
        plan.id === "monthly" ? { ...plan, priceUsd: 250.6 } : plan,
      ),
      wallets: [
        { id: "blank", asset: "USDT", network: "TRC-20", address: "   ", qrImage: "" },
        {
          id: "link",
          asset: "USDT",
          network: "TRC-20",
          address: "tron:TXYZ1234567890address?amount=10",
        },
      ],
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.wallets).toHaveLength(1);
    expect(parsed.data.wallets[0]?.address).toBe("TXYZ1234567890address");
    expect(parsed.data.wallets[0]?.qrImage).toBe("");
    expect(parsed.data.plans.find((plan) => plan.id === "monthly")?.priceUsd).toBe(251);
  });

  it("strips spaces from a pasted wallet address and keeps one recommended plan", () => {
    const parsed = parseSettings({
      ...defaultSiteSettings,
      plans: defaultSiteSettings.plans.map((plan) => ({ ...plan, featured: true })),
      wallets: [
        {
          id: "w1",
          asset: "usdt",
          network: "TRC-20",
          address: "TXYZ1234567890 address",
          qrImage: "",
        },
      ],
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.wallets[0]?.address).toBe("TXYZ1234567890address");
    expect(parsed.data.plans.filter((plan) => plan.featured)).toHaveLength(1);
  });

  it("describes stablecoin amounts in units and other assets as an equivalent", () => {
    expect(isStableAsset("USDT")).toBe(true);
    expect(amountInstruction("USDT", 1500)).toContain("1,500 USDT");
    expect(amountInstruction("BTC", 1500)).toContain("equivalent");
    expect(monthlyUsd({ priceUsd: 1500, months: 6 })).toBe(250);
    expect(payableUsd({ priceUsd: 1500, discountPercent: 20 })).toBe(1200);
    expect(monthlyUsd({ priceUsd: 1500, months: 6, discountPercent: 20 })).toBe(200);
  });

  it("keeps a saved plan that has no discount field and still recommends the half-year plan", () => {
    const stored = {
      ...defaultSiteSettings,
      plans: defaultSiteSettings.plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        durationLabel: plan.durationLabel,
        months: plan.months,
        priceUsd: plan.priceUsd,
        description: plan.description,
        featured: false,
      })),
    };
    const parsed = parseSettings(stored);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.plans.every((plan) => plan.discountPercent === 0)).toBe(true);
    expect(parsed.data.plans.find((plan) => plan.featured)?.id).toBe("half-year");
  });

  it("builds a reference from the trader and the plan", () => {
    expect(paymentReference("Jean FX", "half-year")).toMatch(/^JEANFX-HALFYEAR-/);
    expect(initials("Jean FX")).toBe("JF");
    expect(initials("Alex")).toBe("AL");
  });

  it("compares passwords without accepting a blank secret", () => {
    expect(passwordsMatch("correct-horse", "correct-horse")).toBe(true);
    expect(passwordsMatch("wrong", "correct-horse")).toBe(false);
    expect(passwordsMatch("anything", "")).toBe(false);
  });

  it("round-trips settings through the local file", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "desk-"));
    const store = createFileStore(directory);
    const next = {
      ...defaultSiteSettings,
      traderName: "North Desk",
    };
    await store.write(next);
    const saved = JSON.parse(
      await readFile(path.join(directory, "site-settings.json"), "utf8"),
    ) as {
      traderName: string;
    };
    expect(saved.traderName).toBe("North Desk");
    await expect(store.read()).resolves.toMatchObject({ traderName: "North Desk" });
  });
});
