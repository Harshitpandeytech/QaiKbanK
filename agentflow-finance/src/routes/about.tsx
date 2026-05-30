import { createFileRoute } from "@tanstack/react-router";
import ducky from "@/assets/ducky.png";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — QaiKbank" },
      { name: "description", content: "We're rebuilding the bank as a team of autonomous AI agents — explainable, fast, and always on." },
      { property: "og:title", content: "About QaiKbank" },
      { property: "og:description", content: "Rebuilding the bank as a team of autonomous AI agents." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <section className="bg-hero">
        <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">About</p>
          <h1 className="mt-3 text-balance text-5xl font-bold tracking-tight sm:text-6xl">
            We're rewriting banking,
            <br />one conversation at a time.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            QaiKbank is a research-led financial platform turning the loan desk into a
            transparent, multi-agent AI system. Less forms. More clarity. Decisions you can read.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-16 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Our thesis</h2>
          <p className="mt-4 text-muted-foreground">
            Banking has spent two decades adding screens. We think the next decade
            removes them. Conversation is the most natural interface humans have ever
            built — pair it with autonomous agents and credit becomes a dialogue,
            not a queue.
          </p>
          <p className="mt-4 text-muted-foreground">
            Every QaiKbank decision is produced by a team — and every team member
            shows its work. That's what makes us different from a chatbot bolted onto a form.
          </p>
        </div>
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-accent/30 blur-2xl" aria-hidden />
          <div className="relative rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
            <img src={ducky} alt="Ducky" className="mx-auto h-40 w-40 object-contain animate-float" />
            <p className="mt-4 font-display text-xl font-semibold">Meet Ducky</p>
            <p className="mt-2 text-sm text-muted-foreground">
              The friendly face of the QaiKbank agent network. Always on, always polite,
              never asks for the same document twice.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-card/50 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-balance text-3xl font-bold tracking-tight">What we believe</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { t: "Explainability beats accuracy.", d: "A 99% model you can't audit is worth less than a 92% one you can." },
              { t: "Conversation is the new form.", d: "If a customer can describe it, the bank should be able to act on it." },
              { t: "Agents over interfaces.", d: "Specialists collaborating beat monolithic models every time." },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-border bg-background p-6">
                <p className="font-display text-lg font-semibold">{x.t}</p>
                <p className="mt-2 text-sm text-muted-foreground">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
