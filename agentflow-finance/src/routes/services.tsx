import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldCheck, Gauge, Handshake, ScrollText, FileSignature, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "What we offer — QaiKbank" },
      { name: "description", content: "Six autonomous agents working together to deliver a loan in minutes — not days." },
      { property: "og:title", content: "What QaiKbank offers" },
      { property: "og:description", content: "Six autonomous agents working together to deliver a loan in minutes." },
    ],
  }),
  component: Services,
});

const all = [
  { icon: Sparkles, title: "Sales Agent", desc: "Onboards every customer. Captures income, employment, intent and amount in plain conversation — outputs a structured profile downstream." },
  { icon: ShieldCheck, title: "Verification Agent", desc: "OCR-driven KYC. Validates PAN, Aadhaar, payslips and statements. Returns a confidence score and flags mismatches." },
  { icon: Gauge, title: "Underwriting Agent", desc: "Computes QaiKTrustScore, debt-to-income, repayment capacity and approval probability. EMI estimation in real time." },
  { icon: Handshake, title: "Negotiation Agent", desc: "Reshapes the offer: tenure, EMI, and amount, until the deal works for both sides." },
  { icon: ScrollText, title: "Compliance Agent", desc: "Logs consent, builds audit trails, generates explainability reports for every decision the system makes." },
  { icon: FileSignature, title: "Sanction Agent", desc: "Produces sanction letter PDF, repayment schedule and approval summary — sharable, signable, instant." },
];

function Services() {
  return (
    <>
      <section className="bg-hero">
        <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">What we offer</p>
          <h1 className="mt-3 text-balance text-5xl font-bold tracking-tight sm:text-6xl">
            A bank, unbundled into agents.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Each agent owns one job — and does it brilliantly. The Master Agent
            orchestrates them into a single, seamless customer experience.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((s) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-soft">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-border bg-card p-10 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            All of this — through one chat with Ducky.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            You don't pick agents. You just talk. The Master Agent decides who needs to act, and when.
          </p>
          <Button asChild size="lg" className="mt-6 h-12 rounded-full bg-foreground px-6 text-background hover:bg-foreground/90">
            <Link to="/signup">Try Ducky now <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </>
  );
}
