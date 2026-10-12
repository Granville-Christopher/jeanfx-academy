import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { DeskMark } from "@/components/desk/desk-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getDepositProofs,
  loginDesk,
  logoutDeskSession,
  openDepositProof,
  saveDeskSettings,
} from "@/lib/desk.functions";
import type { DepositProofSummary } from "@/lib/deposit-proof";
import {
  formatUsd,
  monthlyUsd,
  payableUsd,
  type DeskPlan,
  type SiteSettings,
} from "@/lib/site-content";

const tabs = [
  ["identity", "Identity"],
  ["method", "Method"],
  ["plans", "Plans"],
  ["wallets", "Wallets"],
  ["results", "Results"],
  ["proofs", "Proofs"],
] as const;

type Tab = (typeof tabs)[number][0];

export function AdminDesk({
  signedIn,
  settings,
}: {
  signedIn: boolean;
  settings: SiteSettings | null;
}) {
  if (!signedIn || !settings) return <LoginScreen />;
  return <DeskEditor initial={settings} />;
}

function LoginScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-16">
      <form
        className="w-full max-w-md border border-border bg-card/60 p-7 sm:p-9"
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          setError("");
          try {
            const result = await loginDesk({ data: { password } });
            if (!result.ok) {
              setError(result.error);
              return;
            }
            await router.invalidate();
          } catch {
            setError("Could not reach the desk. Try again.");
          } finally {
            setPending(false);
          }
        }}
      >
        <p className="kicker">Private</p>
        <h1 className="display-type mt-4 text-4xl text-foreground">Desk settings</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          The trader name, plan prices, and payment wallets on the public site are edited here.
        </p>
        <label className="mt-8 block">
          <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Desk password
          </span>
          <Input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 h-11 rounded-none"
            required
          />
        </label>
        {error ? (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="mt-6 h-11 w-full rounded-none" disabled={pending}>
          {pending ? "Checking…" : "Enter the desk"}
        </Button>
        <a href="/" className="mt-5 inline-flex text-sm text-primary hover:text-accent">
          Back to the public site
        </a>
      </form>
    </main>
  );
}

function DeskEditor({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [draft, setDraft] = useState<SiteSettings>(initial);
  const [tab, setTab] = useState<Tab>("identity");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const update = (patch: Partial<SiteSettings>) =>
    setDraft((current) => ({ ...current, ...patch }));

  return (
    <main
      className={`min-h-screen bg-background text-foreground ${tab === "proofs" ? "" : "pb-28"}`}
    >
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <DeskMark name={draft.traderName} />
            <div className="min-w-0">
              <p className="kicker">Desk settings</p>
              <p className="truncate text-sm text-foreground">{draft.traderName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-primary hover:text-accent">
              View site
            </a>
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground"
              disabled={signingOut}
              onClick={async () => {
                setSigningOut(true);
                try {
                  await logoutDeskSession();
                  await router.invalidate();
                } finally {
                  setSigningOut(false);
                }
              }}
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div
          className="flex gap-2 overflow-x-auto border-b border-border pb-3"
          role="tablist"
          aria-label="Settings sections"
        >
          {tabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`shrink-0 border px-3 py-2 text-xs uppercase tracking-[0.14em] ${tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-8" role="tabpanel">
          {tab === "identity" ? <IdentityFields draft={draft} update={update} /> : null}
          {tab === "method" ? <MethodFields draft={draft} update={update} /> : null}
          {tab === "plans" ? <PlanFields draft={draft} update={update} /> : null}
          {tab === "wallets" ? <WalletFields draft={draft} update={update} /> : null}
          {tab === "results" ? <ResultFields draft={draft} update={update} /> : null}
          {tab === "proofs" ? <ProofFields /> : null}
        </div>
      </div>

      {tab === "proofs" ? null : (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Saving updates the public site.</p>
            )}
            <Button
              type="button"
              className="h-11 rounded-none px-6 sm:ml-auto"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                setError("");
                try {
                  const result = await saveDeskSettings({ data: draft });
                  if (!result.ok) {
                    setError(result.error);
                    return;
                  }
                  setDraft(result.settings);
                  toast.success("Saved. The public site is using these settings.");
                  try {
                    await router.invalidate();
                  } catch (refreshError) {
                    console.error(refreshError);
                  }
                } catch (saveError) {
                  setError(saveFailureMessage(saveError));
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? "Saving…" : "Save desk settings"}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

function ProofFields() {
  const [proofs, setProofs] = useState<DepositProofSummary[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [openingId, setOpeningId] = useState("");
  const [open, setOpen] = useState<{
    id: string;
    dataUrl: string;
    contentType: string;
    fileName: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDepositProofs()
      .then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          setStatus("error");
          setError(result.error);
          return;
        }
        setProofs(result.proofs);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
        setError("The desk could not load deposit proofs.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="grid gap-6">
      <Intro
        title="Deposit proofs"
        body="Files students upload beside the payment wallet are stored in the database. Open one to see the transfer receipt."
      />
      {status === "loading" ? (
        <p className="text-sm text-muted-foreground">Loading proofs…</p>
      ) : null}
      {status === "error" ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {status === "ready" && proofs.length === 0 ? (
        <p className="border border-dashed border-border px-5 py-8 text-sm leading-6 text-muted-foreground">
          No deposit proofs yet. They appear here after a student uploads a receipt.
        </p>
      ) : null}
      <div className="grid gap-4">
        {proofs.map((proof) => (
          <article key={proof.id} className="grid gap-3 border border-border p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base text-foreground">
                  {proof.planName} · {formatUsd(proof.amountUsd)}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {new Date(proof.createdAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <button
                type="button"
                className="border border-primary px-3 py-2 text-xs uppercase tracking-[0.14em] text-primary"
                disabled={openingId === proof.id}
                onClick={async () => {
                  setOpeningId(proof.id);
                  try {
                    const result = await openDepositProof({ data: { id: proof.id } });
                    if (!result.ok) {
                      toast.error(result.error);
                      return;
                    }
                    setOpen({ id: proof.id, ...result.proof });
                  } catch {
                    toast.error("That proof could not be opened.");
                  } finally {
                    setOpeningId("");
                  }
                }}
              >
                {openingId === proof.id ? "Opening…" : "View receipt"}
              </button>
            </div>
            <p className="break-all font-mono text-sm text-foreground">{proof.reference}</p>
            <p className="text-sm text-muted-foreground">{proof.fileName}</p>
            {open?.id === proof.id ? (
              open.contentType === "application/pdf" ? (
                <iframe title={open.fileName} src={open.dataUrl} className="h-80 w-full bg-white" />
              ) : (
                <img src={open.dataUrl} alt="" className="max-h-80 bg-white object-contain" />
              )
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function IdentityFields({
  draft,
  update,
}: {
  draft: SiteSettings;
  update: (patch: Partial<SiteSettings>) => void;
}) {
  return (
    <section className="grid gap-6">
      <Intro
        title="Trader identity"
        body="The public site uses this name everywhere, so another trader can run the same desk without rebuilding it."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Trader name">
          <Input
            value={draft.traderName}
            onChange={(event) => update({ traderName: event.target.value })}
            className="rounded-none"
          />
        </Field>
        <Field label="Contact line" hint="Email, Telegram, or WhatsApp. Leave blank to hide it.">
          <Input
            value={draft.contactLine}
            onChange={(event) => update({ contactLine: event.target.value })}
            className="rounded-none"
          />
        </Field>
        <Field label="Eyebrow">
          <Input
            value={draft.eyebrow}
            onChange={(event) => update({ eyebrow: event.target.value })}
            className="rounded-none"
          />
        </Field>
        <Field label="Headline">
          <Input
            value={draft.headline}
            onChange={(event) => update({ headline: event.target.value })}
            className="rounded-none"
          />
        </Field>
        <Field label="Accent line" className="sm:col-span-2">
          <Input
            value={draft.headlineAccent}
            onChange={(event) => update({ headlineAccent: event.target.value })}
            className="rounded-none"
          />
        </Field>
        <Field label="Intro" className="sm:col-span-2">
          <Textarea
            value={draft.subheadline}
            onChange={(event) => update({ subheadline: event.target.value })}
            className="min-h-28 rounded-none"
          />
        </Field>
      </div>
    </section>
  );
}

function MethodFields({
  draft,
  update,
}: {
  draft: SiteSettings;
  update: (patch: Partial<SiteSettings>) => void;
}) {
  return (
    <section className="grid gap-8">
      <Intro
        title="Method"
        body="This is the story under the headline: how the desk teaches, and the risk note that sits with it."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Section label">
          <Input
            value={draft.approachKicker}
            onChange={(event) => update({ approachKicker: event.target.value })}
            className="rounded-none"
          />
        </Field>
        <Field label="Section title">
          <Input
            value={draft.approachTitle}
            onChange={(event) => update({ approachTitle: event.target.value })}
            className="rounded-none"
          />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <Textarea
            value={draft.approachBody}
            onChange={(event) => update({ approachBody: event.target.value })}
            className="min-h-28 rounded-none"
          />
        </Field>
        <Field label="Risk note" className="sm:col-span-2">
          <Textarea
            value={draft.approachNote}
            onChange={(event) => update({ approachNote: event.target.value })}
            className="min-h-24 rounded-none"
          />
        </Field>
      </div>
      <div className="grid gap-4">
        <h3 className="text-sm font-medium text-foreground">Three principles</h3>
        {draft.principles.map((item, index) => (
          <div key={index} className="grid gap-3 border border-border p-4 sm:grid-cols-2">
            <Field label={`Title ${index + 1}`}>
              <Input
                value={item.title}
                className="rounded-none"
                onChange={(event) => {
                  const principles = draft.principles.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, title: event.target.value } : entry,
                  );
                  update({ principles });
                }}
              />
            </Field>
            <Field label="Body">
              <Textarea
                value={item.body}
                className="min-h-20 rounded-none"
                onChange={(event) => {
                  const principles = draft.principles.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, body: event.target.value } : entry,
                  );
                  update({ principles });
                }}
              />
            </Field>
          </div>
        ))}
      </div>
      <div className="grid gap-4">
        <h3 className="text-sm font-medium text-foreground">Curriculum</h3>
        {draft.curriculum.map((item, index) => (
          <div key={index} className="grid gap-3 border border-border p-4 sm:grid-cols-2">
            <Field label={`Lesson ${index + 1}`}>
              <Input
                value={item.title}
                className="rounded-none"
                onChange={(event) => {
                  const curriculum = draft.curriculum.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, title: event.target.value } : entry,
                  );
                  update({ curriculum });
                }}
              />
            </Field>
            <Field label="Body">
              <Textarea
                value={item.body}
                className="min-h-20 rounded-none"
                onChange={(event) => {
                  const curriculum = draft.curriculum.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, body: event.target.value } : entry,
                  );
                  update({ curriculum });
                }}
              />
            </Field>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlanFields({
  draft,
  update,
}: {
  draft: SiteSettings;
  update: (patch: Partial<SiteSettings>) => void;
}) {
  const setPlan = (id: DeskPlan["id"], patch: Partial<DeskPlan>) => {
    update({
      plans: draft.plans.map((plan) => (plan.id === id ? { ...plan, ...patch } : plan)),
    });
  };

  return (
    <section className="grid gap-6">
      <Intro
        title="Plan prices"
        body="These four lengths stay in place. The price is the full amount. A discount percentage strikes that amount through on the site and shows what students pay. The six-month plan starts as the recommended plan."
      />
      <div className="grid gap-4">
        {draft.plans.map((plan) => (
          <article key={plan.id} className="grid gap-4 border border-border p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base text-foreground">{plan.name || "Untitled plan"}</h3>
              <button
                type="button"
                className={`border px-3 py-1.5 text-xs uppercase tracking-[0.14em] ${plan.featured ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
                onClick={() =>
                  update({
                    plans: draft.plans.map((entry) => ({
                      ...entry,
                      featured: entry.id === plan.id,
                    })),
                  })
                }
              >
                {plan.featured ? "Recommended" : "Mark as recommended"}
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Field label="Name">
                <Input
                  value={plan.name}
                  className="rounded-none"
                  onChange={(event) => setPlan(plan.id, { name: event.target.value })}
                />
              </Field>
              <Field label="Length label">
                <Input
                  value={plan.durationLabel}
                  className="rounded-none"
                  onChange={(event) => setPlan(plan.id, { durationLabel: event.target.value })}
                />
              </Field>
              <Field label="Months">
                <Input
                  type="number"
                  min={1}
                  max={36}
                  value={plan.months}
                  className="rounded-none"
                  onChange={(event) =>
                    setPlan(plan.id, { months: wholeNumber(event.target.value, plan.months) })
                  }
                />
              </Field>
              <Field
                label="Price (USD)"
                hint={
                  plan.discountPercent > 0
                    ? `Students pay ${formatUsd(payableUsd(plan))}`
                    : plan.months > 0
                      ? `${formatUsd(monthlyUsd(plan))} / month`
                      : undefined
                }
              >
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={plan.priceUsd}
                  className="rounded-none"
                  onChange={(event) =>
                    setPlan(plan.id, { priceUsd: wholeNumber(event.target.value, plan.priceUsd) })
                  }
                />
              </Field>
              <Field label="Discount %" hint="0 shows the full price only.">
                <Input
                  type="number"
                  min={0}
                  max={90}
                  step={1}
                  value={plan.discountPercent}
                  className="rounded-none"
                  onChange={(event) =>
                    setPlan(plan.id, {
                      discountPercent: wholeNumber(event.target.value, plan.discountPercent),
                    })
                  }
                />
              </Field>
            </div>
            <Field label="Description">
              <Textarea
                value={plan.description}
                className="min-h-20 rounded-none"
                onChange={(event) => setPlan(plan.id, { description: event.target.value })}
              />
            </Field>
          </article>
        ))}
      </div>
    </section>
  );
}

function WalletFields({
  draft,
  update,
}: {
  draft: SiteSettings;
  update: (patch: Partial<SiteSettings>) => void;
}) {
  return (
    <section className="grid gap-6">
      <Intro
        title="Payment wallets"
        body="Paste the address students should pay, or upload a QR image. A code is drawn from the address when you do not upload one. Publish nothing until the address is the one you control."
      />
      <Field label="Payment note" hint="Shown after a student selects a plan.">
        <Textarea
          value={draft.paymentNote}
          className="min-h-24 rounded-none"
          onChange={(event) => update({ paymentNote: event.target.value })}
        />
      </Field>
      <div className="grid gap-4">
        {draft.wallets.map((wallet, index) => (
          <article key={wallet.id} className="grid gap-4 border border-border p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium text-foreground">Wallet {index + 1}</h3>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-destructive"
                onClick={() =>
                  update({ wallets: draft.wallets.filter((entry) => entry.id !== wallet.id) })
                }
              >
                <Trash2 aria-hidden="true" size={14} /> Remove
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {["USDT", "USDC", "BTC", "ETH", "SOL"].map((asset) => (
                <button
                  key={asset}
                  type="button"
                  className="border border-border px-2 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary"
                  onClick={() =>
                    update({
                      wallets: draft.wallets.map((entry) =>
                        entry.id === wallet.id ? { ...entry, asset } : entry,
                      ),
                    })
                  }
                >
                  {asset}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Asset">
                <Input
                  value={wallet.asset}
                  className="rounded-none"
                  onChange={(event) =>
                    update({
                      wallets: draft.wallets.map((entry) =>
                        entry.id === wallet.id ? { ...entry, asset: event.target.value } : entry,
                      ),
                    })
                  }
                />
              </Field>
              <Field label="Network">
                <Input
                  value={wallet.network}
                  className="rounded-none"
                  onChange={(event) =>
                    update({
                      wallets: draft.wallets.map((entry) =>
                        entry.id === wallet.id ? { ...entry, network: event.target.value } : entry,
                      ),
                    })
                  }
                />
              </Field>
            </div>
            <div className="flex flex-wrap gap-2">
              {["TRC-20", "ERC-20", "Bitcoin", "Solana", "BEP-20"].map((network) => (
                <button
                  key={network}
                  type="button"
                  className="border border-border px-2 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary"
                  onClick={() =>
                    update({
                      wallets: draft.wallets.map((entry) =>
                        entry.id === wallet.id ? { ...entry, network } : entry,
                      ),
                    })
                  }
                >
                  {network}
                </button>
              ))}
            </div>
            <Field
              label="Wallet address"
              hint="Paste the address or a payment link. The desk keeps the address."
            >
              <Input
                value={wallet.address}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                className="rounded-none font-mono"
                onChange={(event) =>
                  update({
                    wallets: draft.wallets.map((entry) =>
                      entry.id === wallet.id ? { ...entry, address: event.target.value } : entry,
                    ),
                  })
                }
              />
            </Field>
            <Field
              label="QR image"
              hint="Optional. PNG or JPG. If you skip this, the site draws a code from the address."
            >
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="block w-full text-sm text-muted-foreground file:mr-3 file:border file:border-primary/40 file:bg-transparent file:px-3 file:py-2 file:text-xs file:uppercase file:tracking-[0.14em] file:text-primary"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  try {
                    const qrImage = await fileToQrDataUrl(file);
                    update({
                      wallets: draft.wallets.map((entry) =>
                        entry.id === wallet.id ? { ...entry, qrImage } : entry,
                      ),
                    });
                  } catch (uploadError) {
                    toast.error(
                      uploadError instanceof Error
                        ? uploadError.message
                        : "Could not read that image.",
                    );
                  }
                }}
              />
              {wallet.qrImage ? (
                <div className="mt-3 flex items-center gap-4">
                  <img src={wallet.qrImage} alt="" className="size-20 bg-white object-contain" />
                  <button
                    type="button"
                    className="text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
                    onClick={() =>
                      update({
                        wallets: draft.wallets.map((entry) =>
                          entry.id === wallet.id ? { ...entry, qrImage: "" } : entry,
                        ),
                      })
                    }
                  >
                    Use a generated code
                  </button>
                </div>
              ) : null}
            </Field>
          </article>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        className="h-11 w-fit rounded-none"
        disabled={draft.wallets.length >= 4}
        onClick={() =>
          update({
            wallets: [
              ...draft.wallets,
              {
                id: crypto.randomUUID(),
                asset: "USDT",
                network: "TRC-20",
                address: "",
                qrImage: "",
              },
            ],
          })
        }
      >
        <Plus aria-hidden="true" size={15} /> Add wallet
      </Button>
    </section>
  );
}

function ResultFields({
  draft,
  update,
}: {
  draft: SiteSettings;
  update: (patch: Partial<SiteSettings>) => void;
}) {
  return (
    <section className="grid gap-8">
      <Intro
        title="Results"
        body="These figures and notes appear on the public site. Use records you can stand behind. The legal line in the footer stays in place even if you edit this copy."
      />
      <div className="grid gap-5">
        <Field label="Section label">
          <Input
            value={draft.resultsKicker}
            className="rounded-none"
            onChange={(event) => update({ resultsKicker: event.target.value })}
          />
        </Field>
        <Field label="Section title">
          <Input
            value={draft.resultsTitle}
            className="rounded-none"
            onChange={(event) => update({ resultsTitle: event.target.value })}
          />
        </Field>
        <Field label="Introduction">
          <Textarea
            value={draft.resultsBody}
            className="min-h-28 rounded-none"
            onChange={(event) => update({ resultsBody: event.target.value })}
          />
        </Field>
      </div>
      <div className="grid gap-4">
        <h3 className="text-sm font-medium text-foreground">Four figures</h3>
        {draft.metrics.map((metric, index) => (
          <div
            key={index}
            className="grid gap-3 border border-border p-4 lg:grid-cols-[160px_180px_minmax(0,1fr)]"
          >
            <Field label="Figure">
              <Input
                value={metric.value}
                className="rounded-none"
                onChange={(event) => {
                  const metrics = draft.metrics.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, value: event.target.value } : entry,
                  );
                  update({ metrics });
                }}
              />
            </Field>
            <Field label="Label">
              <Input
                value={metric.label}
                className="rounded-none"
                onChange={(event) => {
                  const metrics = draft.metrics.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, label: event.target.value } : entry,
                  );
                  update({ metrics });
                }}
              />
            </Field>
            <Field label="Detail">
              <Textarea
                value={metric.detail}
                className="min-h-20 rounded-none"
                onChange={(event) => {
                  const metrics = draft.metrics.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, detail: event.target.value } : entry,
                  );
                  update({ metrics });
                }}
              />
            </Field>
          </div>
        ))}
      </div>
      <div className="grid gap-4">
        <h3 className="text-sm font-medium text-foreground">Desk notes</h3>
        {draft.notes.map((note, index) => (
          <div key={index} className="grid gap-3 border border-border p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Market">
                <Input
                  value={note.market}
                  className="rounded-none"
                  onChange={(event) => {
                    const notes = draft.notes.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, market: event.target.value } : entry,
                    );
                    update({ notes });
                  }}
                />
              </Field>
              <Field label="Session">
                <Input
                  value={note.session}
                  className="rounded-none"
                  onChange={(event) => {
                    const notes = draft.notes.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, session: event.target.value } : entry,
                    );
                    update({ notes });
                  }}
                />
              </Field>
            </div>
            <Field label="Title">
              <Input
                value={note.title}
                className="rounded-none"
                onChange={(event) => {
                  const notes = draft.notes.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, title: event.target.value } : entry,
                  );
                  update({ notes });
                }}
              />
            </Field>
            <Field label="Lesson">
              <Textarea
                value={note.lesson}
                className="min-h-24 rounded-none"
                onChange={(event) => {
                  const notes = draft.notes.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, lesson: event.target.value } : entry,
                  );
                  update({ notes });
                }}
              />
            </Field>
          </div>
        ))}
      </div>
    </section>
  );
}

function Intro({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 className="display-type text-3xl text-foreground">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string | undefined;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={className}>
      <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      {hint ? (
        <span className="mt-1 block text-xs leading-5 text-muted-foreground/80">{hint}</span>
      ) : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function saveFailureMessage(error: unknown): string {
  if (!(error instanceof Error)) return "The desk could not save. Try again.";
  const message = error.message.replace(/\s+/g, " ").trim();
  if (!message || message.includes("<") || message.length > 220) {
    return "The desk could not save. Try again.";
  }
  if (message === "Forbidden") {
    return "The desk blocked that save. Refresh the page and sign in again.";
  }
  return message;
}

function wholeNumber(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function fileToQrDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Use a PNG or JPG.");
  if (file.size > 2_000_000) throw new Error("Use an image under 2 MB.");
  const bitmap = await createImageBitmap(file);
  const size = 280;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not read that image.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, size, size);
  const scale = Math.min(size / bitmap.width, size / bitmap.height);
  const width = bitmap.width * scale;
  const height = bitmap.height * scale;
  context.drawImage(bitmap, (size - width) / 2, (size - height) / 2, width, height);
  bitmap.close();
  const url = canvas.toDataURL("image/jpeg", 0.85);
  if (url.length > 120_000) throw new Error("That image is still too large.");
  return url;
}
