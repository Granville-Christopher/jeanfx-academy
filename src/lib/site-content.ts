import { z } from "zod";

import { mentorshipPlans } from "@/lib/mentorship-plans";

export const planIds = ["monthly", "quarterly", "half-year", "annual"] as const;
export type PlanId = (typeof planIds)[number];

const requiredText = (max: number, message: string) =>
  z.string().trim().min(1, message).max(max, `Keep this under ${max} characters.`);

const walletSchema = z.object({
  id: z.string().trim().min(1).max(64),
  asset: requiredText(20, "Name the asset, such as USDT or BTC."),
  network: requiredText(32, "Name the network, such as TRC-20 or Bitcoin."),
  address: z
    .string()
    .trim()
    .min(8, "Enter the full wallet address.")
    .max(128, "That address is too long.")
    .regex(/^[A-Za-z0-9]+$/, "Paste the address only, without spaces or a payment link."),
  qrImage: z
    .string()
    .max(120_000, "That wallet image is too large. Upload a smaller PNG or JPG.")
    .refine(
      (value) =>
        value === "" ||
        /^data:image\/(png|jpe?g|webp)(?:;[^,]*)?;base64,[A-Za-z0-9+/=\s]+$/.test(value),
      "Upload a PNG or JPG of the wallet code.",
    ),
});

const principleSchema = z.object({
  title: requiredText(80, "Add a short title."),
  body: requiredText(500, "Add a sentence for this point."),
});

const metricSchema = z.object({
  value: requiredText(24, "Add the figure students should see."),
  label: requiredText(40, "Add a label for this figure."),
  detail: requiredText(400, "Add one sentence explaining this figure."),
});

const noteSchema = z.object({
  market: requiredText(24, "Name the market."),
  session: requiredText(40, "Name the session or mark it as a sample."),
  title: requiredText(80, "Add a title for this note."),
  lesson: requiredText(800, "Write the lesson from this review."),
});

const planSchema = z.object({
  id: z.enum(planIds),
  name: requiredText(40, "Name this plan."),
  durationLabel: requiredText(24, "Add the length, such as 6 months."),
  months: z.number().int().min(1, "Use at least 1 month.").max(36, "Keep a plan within 36 months."),
  priceUsd: z
    .number()
    .int("Use a whole dollar amount.")
    .min(1, "Set a price of at least $1.")
    .max(1_000_000, "Keep the price under $1,000,000."),
  discountPercent: z
    .number()
    .int("Use a whole percentage.")
    .min(0, "Use 0 when a plan is not discounted.")
    .max(90, "Keep a discount at 90% or less."),
  description: requiredText(180, "Add a one-line description."),
  featured: z.boolean(),
});

export const siteSettingsSchema = z.object({
  traderName: requiredText(48, "Enter the trader name students should see."),
  eyebrow: requiredText(80, "Add the short line above the headline."),
  headline: requiredText(90, "Add the headline."),
  headlineAccent: requiredText(90, "Add the accent line of the headline."),
  subheadline: requiredText(500, "Add the sentence under the headline."),
  contactLine: z.string().trim().max(80, "Keep the contact line under 80 characters."),
  approachKicker: requiredText(60, "Add a short label for the method section."),
  approachTitle: requiredText(80, "Add a title for the method section."),
  approachBody: requiredText(900, "Describe the method."),
  approachNote: requiredText(500, "Add the risk note under the method."),
  principles: z.array(principleSchema).length(3),
  curriculum: z.array(principleSchema).length(4),
  resultsKicker: requiredText(60, "Add a short label for the results section."),
  resultsTitle: requiredText(80, "Add a title for the results section."),
  resultsBody: requiredText(900, "Explain what the results on this page mean."),
  metrics: z.array(metricSchema).length(4),
  notes: z.array(noteSchema).length(3),
  plans: z
    .array(planSchema)
    .length(4)
    .refine((plans) => new Set(plans.map((plan) => plan.id)).size === 4, "Keep all four plans."),
  wallets: z.array(walletSchema).max(4, "Publish at most four wallets."),
  paymentNote: z
    .string()
    .trim()
    .min(20, "Keep a payment warning students can actually read.")
    .max(600, "Keep the payment note under 600 characters."),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type DeskWallet = SiteSettings["wallets"][number];
export type DeskPlan = SiteSettings["plans"][number];

const planCopy: Record<PlanId, string> = {
  monthly: "A focused month on structure, risk, and the desk's review habit.",
  quarterly: "A quarter to practice one method and revisit every decision.",
  "half-year": "Half a year to build a journal you can trust under pressure.",
  annual: "A full year beside the desk, refining the same process.",
};

export const defaultSiteSettings: SiteSettings = {
  traderName: "JeanFX",
  eyebrow: "Private mentorship",
  headline: "Learn the market.",
  headlineAccent: "Keep score of the process.",
  subheadline:
    "A private desk for traders who want a clearer read, defined risk, and a review habit that shows whether the work is improving.",
  contactLine: "",
  approachKicker: "The method",
  approachTitle: "Process over prediction.",
  approachBody:
    "Markets do not pay anyone for certainty. This mentorship studies how a trade is considered, from the first read of structure to the decision to stand aside.",
  approachNote:
    "Education only. Your results depend on your decisions, your risk, and the market in front of you. Nothing here is a promise of profit.",
  principles: [
    {
      title: "Read the context",
      body: "Frame the higher timeframe before you care about an entry.",
    },
    {
      title: "Define the risk",
      body: "The invalidation comes first. Size is what remains after that.",
    },
    {
      title: "Review the decision",
      body: "Write down what you took, what you skipped, and whether the process held.",
    },
  ],
  curriculum: [
    {
      title: "Market structure",
      body: "Learn to describe where price is before you look for a trigger.",
    },
    {
      title: "Session and location",
      body: "Study which part of the day you trade, and where price sits in the range.",
    },
    {
      title: "Risk and size",
      body: "Turn the invalidation into a position size you can actually live with.",
    },
    {
      title: "Journal",
      body: "Keep a record that makes next week's review faster than your memory.",
    },
  ],
  resultsKicker: "Results, kept honest",
  resultsTitle: "What this desk measures.",
  resultsBody:
    "The figures below describe how the work is judged. They are not a track record of profits, and they are not a forecast. Replace them only with records you can explain.",
  metrics: [
    {
      value: "Risk first",
      label: "Before size",
      detail: "Invalidation is named before a position is considered.",
    },
    {
      value: "Weekly",
      label: "Review rhythm",
      detail: "Taken trades and passes are revisited on a fixed cadence.",
    },
    {
      value: "1 method",
      label: "Not a new idea",
      detail: "The desk repeats one read of structure instead of chasing setups.",
    },
    {
      value: "Manual",
      label: "Payment check",
      detail: "Enrolment starts after payment is confirmed.",
    },
  ],
  notes: [
    {
      market: "EURUSD",
      session: "Sample · London",
      title: "The level was clean. The calendar was not.",
      lesson:
        "A teaching note, not a track record: structure supported the idea, but a scheduled release sat inside the window. The review was to cut size or stand aside. Replace this with a journal entry from your own desk.",
    },
    {
      market: "NAS100",
      session: "Sample · New York",
      title: "Location mattered more than the trigger.",
      lesson:
        "A teaching note: the trigger fired in the middle of the range. A trigger without location was not treated as a setup. Swap this for a review you actually took.",
    },
    {
      market: "XAUUSD",
      session: "Sample · Asia",
      title: "The no-trade was the result.",
      lesson:
        "A teaching note: conditions were thin and the invalidation was too wide for the risk budget. Passing was logged on purpose. Replace this with a pass you can explain.",
    },
  ],
  plans: mentorshipPlans.map((plan) => {
    const id = plan.id as PlanId;
    return {
      id,
      name: plan.name,
      durationLabel: plan.duration,
      months: Number.parseInt(plan.duration, 10),
      priceUsd: plan.price,
      discountPercent: 0,
      description: planCopy[id],
      featured: Boolean(plan.featured),
    };
  }),
  wallets: [],
  paymentNote:
    "Send the plan amount on the network printed beside the wallet. Crypto transfers cannot be reversed. Enrolment starts after payment is confirmed.",
};

export function formatIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Check the form and try again.";
  const labels: Record<string, string> = {
    traderName: "Trader name",
    eyebrow: "Eyebrow",
    headline: "Headline",
    headlineAccent: "Accent line",
    subheadline: "Intro",
    contactLine: "Contact line",
    approachKicker: "Method label",
    approachTitle: "Method title",
    approachBody: "Method description",
    approachNote: "Method note",
    principles: "Method point",
    curriculum: "Curriculum",
    resultsKicker: "Results label",
    resultsTitle: "Results title",
    resultsBody: "Results introduction",
    metrics: "Result figure",
    notes: "Desk note",
    plans: "Plan",
    wallets: "Wallet",
    paymentNote: "Payment note",
  };
  const key = String(issue.path[0] ?? "");
  const label = labels[key];
  const index = typeof issue.path[1] === "number" ? ` ${issue.path[1] + 1}` : "";
  if (!label) return issue.message;
  return `${label}${index}: ${issue.message}`;
}

export function parseSettings(input: unknown) {
  const parsed = siteSettingsSchema.safeParse(preprocess(input));
  if (!parsed.success) return parsed;
  return { success: true as const, data: normalizeSettings(parsed.data) };
}

export function normalizeSettings(settings: SiteSettings): SiteSettings {
  const featuredId = settings.plans.find((plan) => plan.featured)?.id ?? "half-year";
  return {
    ...settings,
    plans: sortPlans(settings.plans).map((plan) => ({
      ...plan,
      featured: plan.id === featuredId,
    })),
  };
}

export function sortPlans<T extends { id: PlanId }>(plans: T[]): T[] {
  return [...plans].sort((a, b) => planIds.indexOf(a.id) - planIds.indexOf(b.id));
}

function preprocess(input: unknown): unknown {
  if (!input || typeof input !== "object") return input;
  const record = { ...(input as Record<string, unknown>) };
  const wallets = record["wallets"];
  if (Array.isArray(wallets)) {
    record["wallets"] = wallets.flatMap((wallet) => {
      if (!wallet || typeof wallet !== "object") return [wallet];
      const entry = { ...(wallet as Record<string, unknown>) };
      const address = normalizeWalletAddress(entry["address"]);
      const qrImage = typeof entry["qrImage"] === "string" ? entry["qrImage"].trim() : "";
      if (!address && !qrImage) return [];
      return [{ ...entry, address, qrImage }];
    });
  }
  const plans = record["plans"];
  if (Array.isArray(plans)) {
    record["plans"] = plans.map((plan) => {
      if (!plan || typeof plan !== "object") return plan;
      const entry = plan as Record<string, unknown>;
      return {
        ...entry,
        priceUsd: coerceWhole(entry["priceUsd"]),
        months: coerceWhole(entry["months"]),
        discountPercent: coerceWhole(entry["discountPercent"] ?? 0),
      };
    });
  }
  return record;
}

export function normalizeWalletAddress(value: unknown): string {
  if (typeof value !== "string") return "";
  let address = value.replace(/[\s\u200B-\u200D\uFEFF]/g, "");
  address = address.replace(/^[a-z][a-z0-9+.-]*:/i, "");
  address = address.split(/[?#]/)[0] ?? address;
  if (/^[A-Za-z0-9]+$/.test(address)) return address;
  const runs = address.match(/[A-Za-z0-9]{8,128}/g);
  if (runs && runs.length > 0) {
    return [...runs].sort((left, right) => right.length - left.length)[0] ?? "";
  }
  return address.replace(/[^A-Za-z0-9]/g, "");
}

function coerceWhole(value: unknown): unknown {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.round(parsed);
  }
  return value;
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function payableUsd(plan: { priceUsd: number; discountPercent?: number }): number {
  const percent = Math.min(90, Math.max(0, Math.round(plan.discountPercent ?? 0)));
  if (percent <= 0) return plan.priceUsd;
  return Math.max(1, Math.round((plan.priceUsd * (100 - percent)) / 100));
}

export function monthlyUsd(plan: {
  priceUsd: number;
  months: number;
  discountPercent?: number;
}): number {
  const price = payableUsd(plan);
  if (plan.months <= 0) return price;
  return Math.round(price / plan.months);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  if (!first) return "FX";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const last = parts[parts.length - 1] ?? first;
  return `${first.slice(0, 1)}${last.slice(0, 1)}`.toUpperCase();
}

export function isStableAsset(asset: string): boolean {
  return /^(usdt|usdc|dai|usde)$/i.test(asset.trim());
}

export function paymentReference(traderName: string, planId: string): string {
  const desk =
    traderName
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 8)
      .toUpperCase() || "DESK";
  const plan =
    planId
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 8)
      .toUpperCase() || "PLAN";
  const stamp = Date.now().toString(36).slice(-4).toUpperCase();
  const salt = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${desk}-${plan}-${stamp}${salt}`;
}

export function amountInstruction(asset: string, priceUsd: number): string {
  const assetLabel = asset.trim().toUpperCase() || "CRYPTO";
  if (isStableAsset(asset)) {
    return `Send ${priceUsd.toLocaleString("en-US")} ${assetLabel} for this ${formatUsd(priceUsd)} plan.`;
  }
  return `Send the ${assetLabel} equivalent of ${formatUsd(priceUsd)}. Confirm the coin amount with the desk before you transfer.`;
}
