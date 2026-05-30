import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { DuckyChat } from "@/components/ducky-chat";
import skyscrapers from "@/assets/skyscrapers.png";
import mascots from "@/assets/mascots.png";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Gauge,
  Handshake,
  FileSignature,
  ScrollText,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QaiKbank — Banking that talks back" },
      { name: "description", content: "Chat with Ducky to apply, verify, underwrite and sign a loan in minutes. Powered by an orchestra of autonomous AI agents." },
      { property: "og:title", content: "QaiKbank — Banking that talks back" },
      { property: "og:description", content: "A conversational bank powered by autonomous agents." },
    ],
  }),
  component: Home,
});

const services = [
  { icon: Sparkles, title: "Sales", desc: "Onboards. Captures intent. Feels like chat, works like a banker.", tag: "01" },
  { icon: ShieldCheck, title: "Verification", desc: "Reads PAN, Aadhaar, payslips. Flags mismatches instantly.", tag: "02" },
  { icon: Gauge, title: "Underwriting", desc: "QaiKTrustScore, DTI, approval probability — in seconds.", tag: "03" },
  { icon: Handshake, title: "Negotiation", desc: "Reshapes tenure, EMI and amount to an offer that fits.", tag: "04" },
  { icon: ScrollText, title: "Compliance", desc: "Consent, audit trail and reasoning logged per decision.", tag: "05" },
  { icon: FileSignature, title: "Sanction", desc: "Sanction letters and schedules — generated instantly.", tag: "06" },
];

const pipeline: Array<[string, string, string]> = [
  ["Sales", "Profile captured", "Income · intent · goals"],
  ["Verification", "PAN + payslip OK", "OCR · cross-match · KYC"],
  ["Underwriting", "QaiKTrustScore 742", "DTI 28% · risk low"],
  ["Negotiation", "EMI optimized −12%", "₹22,134 → ₹19,480"],
  ["Compliance", "Consent logged", "Audit trail sealed"],
  ["Sanction", "Letter generated", "PDF · schedule · e-sign"],
];

function Home() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-hero noise">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" aria-hidden />

        {/* skyline backdrop */}
        <img
          src={skyscrapers}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto w-full max-w-[1600px] select-none object-cover opacity-90 skyline-mask"
        />

        {/* floating mascot peeking */}
        <img
          src={mascots}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -left-10 bottom-10 hidden w-[230px] select-none animate-wobble lg:block"
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-40 pt-12 sm:px-6 lg:px-8 lg:pb-56 lg:pt-16">
          {/* MEGA TYPE */}
          <div className="relative mt-6 animate-fade-up">
            <h1 className="mega text-[20vw] sm:text-[18vw] lg:text-[15vw]">
              <span className="block">Banking,</span>
              <span className="block">
                <span className="text-stroke-accent">but it</span>{" "}
                <span className="italic font-light tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  talks
                </span>
              </span>
              <span className="block">
                <span className="relative">
                  back.
                  <span className="absolute -right-2 -top-3 text-xs font-medium uppercase tracking-widest text-accent/90 sm:-right-6 sm:-top-2">
                    ™
                  </span>
                </span>
              </span>
            </h1>
          </div>

          {/* sub-row: copy left · chat right */}
          <div className="relative mt-14 grid items-end gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <p className="max-w-md text-base text-foreground/70 sm:text-lg">
                Six autonomous agents. One conversation with{" "}
                <strong className="text-foreground">Ducky</strong>. Apply,
                verify, underwrite, negotiate and sign — before your chai goes cold.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="group h-12 rounded-full bg-foreground px-6 text-base text-background hover:bg-foreground/90">
                  <Link to="/signup">
                    Start chatting
                    <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="h-12 rounded-full px-5 text-base underline-offset-4 hover:underline">
                  <Link to="/services">How it works <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </div>

              <dl className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-foreground/15 pt-5">
                {[
                  { k: "<3m", v: "to first offer" },
                  { k: "06", v: "autonomous agents" },
                  { k: "00", v: "paperwork" },
                ].map((s) => (
                  <div key={s.v}>
                    <dt className="mega text-3xl text-foreground">{s.k}</dt>
                    <dd className="mt-2 text-[11px] uppercase tracking-widest text-foreground/55">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative lg:col-span-7">
              <div className="relative ml-auto flex w-full justify-end">
                <img
                  src={mascots}
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute -top-24 right-1/3 hidden w-[160px] -rotate-6 animate-wobble-2 select-none md:block"
                />
                <div className="relative">
                  <DuckyChat />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MARQUEE */}
        <div className="relative border-y-2 border-foreground/90 bg-foreground py-4 text-background">
          <div className="flex animate-marquee whitespace-nowrap">
            {Array.from({ length: 2 }).map((_, n) => (
              <div key={n} className="flex shrink-0 items-center gap-8 px-4 text-sm font-semibold uppercase tracking-[0.18em]">
                {[
                  "Zero paperwork",
                  "★",
                  "Six agents · one chat",
                  "★",
                  "QaiKTrustScore engine",
                  "★",
                  "Explainable AI",
                  "★",
                  "Audit-ready logs",
                  "★",
                  "Banking that talks back",
                  "★",
                ].map((t, i) => (
                  <span key={`${n}-${i}`} className={t === "★" ? "text-accent" : ""}>
                    {t}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EDITORIAL STATEMENT ─── */}
      <section className="relative overflow-hidden bg-background">
        <div className="mx-auto grid max-w-7xl items-start gap-10 px-4 py-24 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-32">
          <p className="lg:col-span-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/50">
            ¶ Manifesto / 01
          </p>
          <div className="lg:col-span-10">
            <h2 className="mega text-balance text-[10vw] sm:text-[7.5vw] lg:text-[5.2vw]" style={{ wordSpacing: "0.12em" }}>
              Most banks bolt AI{" "}
              <span className="outline-text">onto a form.</span>{" "}
              We turned the form into a{" "}
              <span className="bg-accent px-3 leading-none">team of agents</span>{" "}
              that actually decide — together — and explain themselves.
            </h2>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-foreground/60">
              <span className="font-semibold text-foreground">Ducky, AI Banker</span>
              <span>·</span>
              <span>Orchestrated by the Master Agent</span>
              <span>·</span>
              <span>Co-signed by Compliance</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SIX AGENTS / asymmetric ─── */}
      <section id="services" className="relative bg-card/40 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/50">
                The crew
              </p>
              <h2 className="mt-3 mega text-5xl sm:text-6xl lg:text-7xl">
                Six agents.<br />
                <span className="outline-text">One conversation.</span>
              </h2>
            </div>
            <Link to="/services" className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-foreground/70 hover:text-foreground">
              Meet the stack
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3 lg:grid-cols-6 lg:auto-rows-[220px]">
            {services.map((s, i) => {
              // bento-ish: every 4th card spans 2 cols
              const span = i % 4 === 0 ? "lg:col-span-3" : "lg:col-span-2";
              const highlight = i === 0;
              return (
                <article
                  key={s.title}
                  className={`group relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft ${span} ${
                    highlight
                      ? "border-foreground bg-foreground text-background"
                      : "border-border/70 bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${highlight ? "text-background/60" : "text-foreground/50"}`}>
                      Agent {s.tag}
                    </span>
                    <div className={`grid h-10 w-10 place-items-center rounded-xl ${highlight ? "bg-accent text-foreground" : "bg-secondary text-primary"}`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-auto pt-10">
                    <h3 className={`mega text-3xl ${highlight ? "" : ""}`}>{s.title}</h3>
                    <p className={`mt-2 max-w-sm text-sm leading-relaxed ${highlight ? "text-background/70" : "text-muted-foreground"}`}>
                      {s.desc}
                    </p>
                  </div>
                  {highlight && (
                    <span className="pointer-events-none absolute -bottom-10 -right-10 h-44 w-44 rounded-full bg-accent/40 blur-3xl" aria-hidden />
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── LIVE PIPELINE (reimagined) ─── */}
      <section className="relative overflow-hidden bg-background py-24">
        <img
          src={mascots}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -right-16 top-10 hidden w-[260px] -rotate-12 select-none opacity-90 animate-wobble lg:block"
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/50">
              Live decision pipeline
            </p>
            <h2 className="mt-3 mega text-5xl sm:text-6xl lg:text-7xl">
              A loan, decided in <span className="italic font-light" style={{ fontFamily: "'Instrument Serif', serif" }}>the time</span> it takes to make coffee.
            </h2>
          </div>

          <ol className="mt-14 divide-y divide-foreground/10 border-y border-foreground/10">
            {pipeline.map(([agent, status, detail], i) => (
              <li
                key={agent}
                className="group grid grid-cols-12 items-center gap-4 py-6 transition-colors hover:bg-accent/10"
              >
                <span className="col-span-2 mega text-3xl text-foreground/30 sm:text-4xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="col-span-4 mega text-2xl sm:text-3xl">{agent}</span>
                <span className="col-span-3 hidden text-sm text-muted-foreground sm:block">{detail}</span>
                <span className="col-span-6 sm:col-span-3 text-right text-sm font-semibold uppercase tracking-[0.14em]">
                  <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground" /> {status}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── BIG CTA ─── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-foreground px-8 py-20 text-background sm:px-16 sm:py-28">
          <img
            src={skyscrapers}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-screen"
          />
          <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-accent/50 blur-3xl" aria-hidden />
          <img
            src={mascots}
            alt=""
            aria-hidden
            className="pointer-events-none absolute -bottom-8 right-6 hidden w-[200px] animate-wobble-2 select-none md:block"
          />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-background/60">
              Ready when you are
            </p>
            <h2 className="mt-4 mega text-balance text-6xl sm:text-7xl lg:text-8xl">
              Meet your <span className="text-accent">new banker.</span>
            </h2>
            <p className="mt-6 max-w-xl text-base text-background/70">
              Ducky is online. Tell it what you need — the rest happens in the background, on the record, and in your favour.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-full bg-accent px-6 text-base text-accent-foreground hover:bg-accent/90">
                <Link to="/signup">Create account <ArrowUpRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-background/30 bg-transparent px-6 text-base text-background hover:bg-background/10 hover:text-background">
                <Link to="/login">I have an account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
