import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";

import tradingDesk from "@/assets/jeanfx-trading-desk.jpg";
import { DepositProofForm } from "@/components/desk/deposit-proof-form";
import { DeskMark } from "@/components/desk/desk-mark";
import { WalletQr } from "@/components/desk/wallet-qr";
import { Button } from "@/components/ui/button";
import {
  amountInstruction,
  formatUsd,
  monthlyUsd,
  payableUsd,
  paymentReference,
  type DeskPlan,
  type SiteSettings,
} from "@/lib/site-content";

const nav = [
  { href: "#results", label: "Results" },
  { href: "#approach", label: "Method" },
  { href: "#curriculum", label: "Curriculum" },
  { href: "#mentorship", label: "Plans" },
];

export function PublicHome({ settings }: { settings: SiteSettings }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<DeskPlan | null>(null);
  const [reference, setReference] = useState("");

  const selectPlan = (plan: DeskPlan) => {
    setSelectedPlan(plan);
    setReference(paymentReference(settings.traderName, plan.id));
    setMenuOpen(false);
    document.getElementById("enrol")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <a
        href="#top"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <a
            href="#top"
            className="inline-flex min-w-0 items-center gap-3"
            aria-label={`${settings.traderName} home`}
          >
            <DeskMark name={settings.traderName} />
            <span className="display-type truncate text-[1.15rem] text-foreground">
              {settings.traderName}
            </span>
          </a>
          <nav aria-label="Main navigation" className="hidden items-center gap-8 lg:flex">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="rounded-none px-4">
              <a href="#mentorship">
                View plans <ArrowUpRight aria-hidden="true" size={15} />
              </a>
            </Button>
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center border border-border text-foreground lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <X aria-hidden="true" size={16} />
              ) : (
                <Menu aria-hidden="true" size={16} />
              )}
              <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
            </button>
          </div>
        </div>
        {menuOpen ? (
          <nav
            id="mobile-nav"
            aria-label="Mobile navigation"
            className="border-t border-border px-5 py-3 lg:hidden"
          >
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block py-3 text-sm text-foreground"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
        ) : null}
      </header>

      <section
        id="top"
        className="relative isolate flex min-h-[760px] items-end overflow-hidden sm:min-h-[820px]"
      >
        <img
          src={tradingDesk}
          alt="A private trading desk with a market chart on the screen"
          width={1536}
          height={1024}
          fetchPriority="high"
          className="absolute inset-0 -z-20 size-full object-cover object-[62%_42%]"
        />
        <div className="hero-veil absolute inset-0 -z-10" />
        <div className="mx-auto grid w-full max-w-7xl items-end gap-10 px-5 pb-44 pt-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:pb-32 lg:pt-20">
          <div className="max-w-3xl">
            <p className="kicker mb-6 inline-flex items-center gap-3">
              <span className="h-px w-8 bg-primary" />
              {settings.eyebrow} · {settings.traderName}
            </p>
            <h1 className="display-type max-w-4xl text-5xl leading-[1.02] text-foreground sm:text-6xl lg:text-7xl">
              {settings.headline}
              <br />
              <em className="italic text-primary">{settings.headlineAccent}</em>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-foreground/85 sm:text-lg sm:leading-8">
              {settings.subheadline}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="min-h-12 rounded-none px-6">
                <a href="#mentorship">
                  View mentorship plans <ArrowRight aria-hidden="true" />
                </a>
              </Button>
              <a
                href="#results"
                className="inline-flex min-h-12 items-center gap-2 px-1 text-sm font-medium text-foreground/85 hover:text-primary"
              >
                See what is measured <ArrowDown aria-hidden="true" size={15} />
              </a>
            </div>
          </div>
          <aside className="hidden border-l border-primary/50 pl-6 lg:block">
            <p className="kicker">On the desk</p>
            <p className="display-type mt-4 text-3xl leading-8 text-foreground">
              Clarity before
              <br />
              conviction.
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Study the setup. Name the risk. Know when there is no trade.
            </p>
          </aside>
        </div>
        <div className="absolute inset-x-0 bottom-0 border-t border-foreground/10 bg-background/85 backdrop-blur-sm">
          <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
            {settings.metrics.map((metric, index) => (
              <div
                key={metric.label}
                className={`px-5 py-4 sm:px-8 ${index % 2 === 0 ? "border-r border-foreground/10" : ""} ${index < 2 ? "border-b border-foreground/10 lg:border-b-0" : ""} lg:border-r lg:last:border-r-0`}
              >
                <p className="display-type text-2xl text-foreground sm:text-3xl">{metric.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="results" className="section-rule scroll-mt-24 bg-background">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="kicker">{settings.resultsKicker}</p>
              <h2 className="display-type mt-4 text-4xl text-foreground sm:text-5xl">
                {settings.resultsTitle}
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-foreground/85 sm:text-lg sm:leading-8">
              {settings.resultsBody}
            </p>
          </div>
          <div className="mt-12 grid gap-px bg-border md:grid-cols-2 xl:grid-cols-4">
            {settings.metrics.map((metric) => (
              <article key={metric.label} className="bg-card/70 p-6">
                <p className="display-type text-4xl text-foreground">{metric.value}</p>
                <h3 className="mt-4 text-sm font-medium text-foreground">{metric.label}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{metric.detail}</p>
              </article>
            ))}
          </div>
          <div className="mt-12 border border-border">
            <div className="flex items-end justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
              <h3 className="text-sm font-medium text-foreground">Desk notes</h3>
              <p className="text-xs text-muted-foreground">
                Teaching reviews. Not a verified profit record.
              </p>
            </div>
            <div className="divide-y divide-border">
              {settings.notes.map((note) => (
                <article
                  key={`${note.market}-${note.title}`}
                  className="grid gap-3 px-5 py-6 sm:px-6 lg:grid-cols-[140px_160px_minmax(0,1fr)] lg:gap-8"
                >
                  <p className="text-sm font-medium text-primary">{note.market}</p>
                  <p className="text-sm text-muted-foreground">{note.session}</p>
                  <div>
                    <h4 className="text-base font-medium text-foreground">{note.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{note.lesson}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="approach" className="section-rule scroll-mt-24 bg-card/40">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="kicker">{settings.approachKicker}</p>
            <h2 className="display-type mt-4 max-w-lg text-4xl text-foreground sm:text-5xl">
              {settings.approachTitle}
            </h2>
          </div>
          <div>
            <p className="text-lg leading-8 text-foreground/90">{settings.approachBody}</p>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">{settings.approachNote}</p>
            <div className="mt-10 grid border-y border-border sm:grid-cols-3 sm:divide-x sm:divide-border">
              {settings.principles.map((item, index) => (
                <article key={item.title} className="py-6 sm:px-5 sm:first:pl-0 sm:last:pr-0">
                  <span className="text-xs text-primary">0{index + 1}</span>
                  <h3 className="mt-4 text-base font-medium text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="curriculum" className="section-rule scroll-mt-24 bg-background">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <p className="kicker">Curriculum</p>
          <h2 className="display-type mt-4 max-w-xl text-4xl text-foreground sm:text-5xl">
            What the mentorship covers.
          </h2>
          <ol className="mt-12 divide-y divide-border border-y border-border">
            {settings.curriculum.map((item, index) => (
              <li
                key={item.title}
                className="grid gap-3 py-6 sm:grid-cols-[80px_220px_minmax(0,1fr)] sm:items-baseline sm:gap-8"
              >
                <span className="text-xs text-primary">0{index + 1}</span>
                <h3 className="text-lg text-foreground">{item.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="mentorship" className="section-rule scroll-mt-24 bg-card/50">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end">
            <div>
              <p className="kicker">Mentorship</p>
              <h2 className="display-type mt-4 text-4xl text-foreground sm:text-5xl">
                Choose a length.
              </h2>
            </div>
            <div className="max-w-sm text-sm leading-6 text-muted-foreground">
              <p>
                Prices are set by {settings.traderName} and shown in US dollars. A discount leaves
                the full price struck through. The monthly figure uses the price students pay.
              </p>
              <p className="mt-3">
                The broker we use is{" "}
                <a
                  href="https://meridiancapital.orivexcopy.com"
                  className="text-primary underline-offset-4 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  meridiancapital.orivexcopy.com
                </a>
                .
              </p>
            </div>
          </div>
          <div className="mt-8 grid gap-px bg-border md:grid-cols-2 xl:grid-cols-4">
            {settings.plans.map((plan) => {
              const pay = payableUsd(plan);
              const discounted = plan.discountPercent > 0 && pay < plan.priceUsd;
              return (
                <article
                  key={plan.id}
                  className={`relative flex min-h-[340px] flex-col p-6 sm:p-7 ${plan.featured ? "bg-primary/10 ring-2 ring-inset ring-primary" : "bg-background"}`}
                >
                  {plan.featured ? (
                    <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 border border-primary bg-primary px-2 py-1 text-[0.65rem] font-medium uppercase tracking-wide text-primary-foreground">
                      Recommended
                    </span>
                  ) : null}
                  <p className="mb-8 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {plan.durationLabel}
                  </p>
                  <h3 className="display-type text-3xl text-foreground">{plan.name}</h3>
                  <p className="mt-3 min-h-12 text-sm leading-6 text-muted-foreground">
                    {plan.description}
                  </p>
                  <p className="mt-3 text-sm text-primary">Live trading sessions included</p>
                  <div className="mt-7 border-t border-border pt-5">
                    {discounted ? (
                      <p className="text-sm text-muted-foreground line-through">
                        {formatUsd(plan.priceUsd)}
                      </p>
                    ) : null}
                    <p className="display-type text-4xl text-foreground">
                      {formatUsd(discounted ? pay : plan.priceUsd)}
                      <span className="ml-2 text-sm text-muted-foreground">USD</span>
                    </p>
                    {discounted ? (
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-primary">
                        {plan.discountPercent}% off
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatUsd(monthlyUsd(plan))} per month
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant={plan.featured ? "default" : "outline"}
                    className="mt-6 min-h-11 w-full rounded-none"
                    onClick={() => selectPlan(plan)}
                  >
                    Select plan <ArrowRight aria-hidden="true" size={15} />
                  </Button>
                </article>
              );
            })}
          </div>
          <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0 text-primary" size={15} />
            <p>
              Mentorship is educational. Trading can lose money. No profits or specific outcomes are
              promised.
            </p>
          </div>

          <ol className="mt-10 grid gap-px bg-border md:grid-cols-3">
            {[
              ["01", "Choose a length", "Select the plan that matches how long you want to study."],
              ["02", "Send the amount", "Pay the published wallet in the asset and network shown."],
              [
                "03",
                "Send the proof",
                "Upload a screenshot or PDF of the transfer. Enrolment starts after payment is confirmed.",
              ],
            ].map(([step, title, body]) => (
              <li key={step} className="bg-background p-6">
                <span className="text-xs text-primary">{step}</span>
                <h3 className="mt-3 text-base font-medium text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>

          <div
            id="enrol"
            aria-live="polite"
            className="mt-8 scroll-mt-28 border border-primary/40 bg-background"
          >
            <div className="flex items-start gap-4 border-b border-border px-5 py-6 sm:px-7">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center border border-primary/45 text-primary">
                {selectedPlan ? (
                  <Check aria-hidden="true" size={16} />
                ) : (
                  <ArrowUpRight aria-hidden="true" size={16} />
                )}
              </span>
              <div>
                <h3 className="text-lg text-foreground">
                  {selectedPlan
                    ? `${selectedPlan.name} · ${formatUsd(payableUsd(selectedPlan))}`
                    : "Select a plan to see payment details."}
                </h3>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {selectedPlan
                    ? settings.paymentNote
                    : `Plans are paid in crypto to a wallet published by ${settings.traderName}. Nothing is charged on this page.`}
                </p>
              </div>
            </div>
            {selectedPlan ? (
              <div className="grid gap-8 px-5 py-6 sm:px-7 lg:grid-cols-[240px_minmax(0,1fr)]">
                <div>
                  <p className="kicker">Payment reference</p>
                  <p className="mt-3 break-all font-mono text-sm text-foreground">{reference}</p>
                  <div className="mt-4">
                    <CopyButton value={reference} label="Copy reference" />
                  </div>
                  <p className="mt-4 text-xs leading-5 text-muted-foreground">
                    Put this reference in the transfer memo when the network allows it, and keep it
                    when you contact the desk.
                  </p>
                  {settings.contactLine ? (
                    <p className="mt-4 text-sm text-foreground">
                      Contact: <span className="text-primary">{settings.contactLine}</span>
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-4">
                  {settings.wallets.length === 0 ? (
                    <p className="border border-dashed border-border px-5 py-8 text-sm leading-6 text-muted-foreground">
                      {settings.traderName} has not published a payment wallet yet. Do not send
                      funds until an address appears here.
                    </p>
                  ) : (
                    settings.wallets.map((wallet) => (
                      <article
                        key={wallet.id}
                        className="grid gap-5 border border-border p-5 sm:grid-cols-[168px_minmax(0,1fr)]"
                      >
                        {wallet.qrImage ? (
                          <img
                            src={wallet.qrImage}
                            alt={`Uploaded QR code for the ${wallet.asset} wallet`}
                            className="size-[168px] bg-white object-contain"
                          />
                        ) : (
                          <WalletQr
                            value={wallet.address}
                            label={`${wallet.asset} ${wallet.network}`}
                          />
                        )}
                        <div className="min-w-0">
                          <p className="kicker">
                            {wallet.asset} · {wallet.network}
                          </p>
                          <p className="mt-3 break-all font-mono text-sm leading-6 text-foreground">
                            {wallet.address}
                          </p>
                          <p className="mt-3 text-sm leading-6 text-foreground/85">
                            {amountInstruction(wallet.asset, payableUsd(selectedPlan))}
                          </p>
                          <div className="mt-4">
                            <CopyButton value={wallet.address} label="Copy address" />
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                  <DepositProofForm plan={selectedPlan} reference={reference} />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section id="questions" className="section-rule scroll-mt-24 bg-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="kicker">Before you pay</p>
            <h2 className="display-type mt-4 text-4xl text-foreground">Straight answers.</h2>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {[
              [
                "Is this a signal service?",
                `No. ${settings.traderName} teaches a process. You still decide whether to place a trade.`,
              ],
              [
                "Are the results a promise?",
                "No. Figures and notes on this page are supplied by the desk. They are not audited, and they are not a forecast of your results.",
              ],
              [
                "How does payment work?",
                "Choose a plan, send the amount to the published wallet, and include the reference. Enrolment starts after payment is confirmed.",
              ],
              [
                "Can a transfer be reversed?",
                "No. Check the asset, the network, and the amount before you send. A screenshot is not confirmation.",
              ],
            ].map(([question, answer]) => (
              <article key={question} className="py-5">
                <h3 className="text-base font-medium text-foreground">{question}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="section-rule bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <a href="#top" className="inline-flex items-center gap-3">
              <DeskMark name={settings.traderName} />
              <span className="display-type text-lg text-foreground">{settings.traderName}</span>
            </a>
            <a
              href="/admin"
              className="text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-primary"
            >
              Desk settings
            </a>
          </div>
          <p className="max-w-3xl text-xs leading-5 text-muted-foreground">
            Mentorship with {settings.traderName} is education. It is not financial advice, a signal
            service, or a promise of profit. Trading involves substantial risk of loss. Figures on
            this page are supplied by the desk and are not independently audited.
          </p>
        </div>
      </footer>
    </main>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  return (
    <div>
      <button
        type="button"
        className="inline-flex items-center gap-2 border border-border px-3 py-2 text-xs uppercase tracking-[0.14em] text-foreground hover:border-primary hover:text-primary"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setState("copied");
            window.setTimeout(() => setState("idle"), 1600);
          } catch {
            setState("failed");
          }
        }}
      >
        {state === "copied" ? (
          <Check aria-hidden="true" size={14} />
        ) : (
          <Copy aria-hidden="true" size={14} />
        )}
        {state === "copied" ? "Copied" : label}
      </button>
      {state === "failed" ? (
        <p className="mt-2 text-xs text-muted-foreground">Select the text and copy it manually.</p>
      ) : null}
    </div>
  );
}
