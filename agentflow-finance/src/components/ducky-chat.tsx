import { useEffect, useState } from "react";
import ducky from "@/assets/ducky.png";
import { ArrowUp } from "lucide-react";

const script = [
  { from: "user", text: "I need a loan of ₹5,00,000 for a wedding." },
  { from: "ducky", text: "On it. Pulling income, liabilities and computing your QaiKTrustScore…" },
  { from: "ducky", text: "Approved at ₹4,20,000 · 24 months · EMI ₹19,480 — want me to negotiate tenure?" },
];

export function DuckyChat() {
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState("");

  useEffect(() => {
    if (shown >= script.length) return;
    const msg = script[shown];
    let i = 0;
    setTyping("");
    const id = setInterval(() => {
      i++;
      setTyping(msg.text.slice(0, i));
      if (i >= msg.text.length) {
        clearInterval(id);
        setTimeout(() => setShown((s) => s + 1), 700);
      }
    }, 22);
    return () => clearInterval(id);
  }, [shown]);

  useEffect(() => {
    if (shown >= script.length) {
      const id = setTimeout(() => setShown(0), 2800);
      return () => clearTimeout(id);
    }
  }, [shown]);

  return (
    <div className="relative h-[520px] w-[420px]">
      <div className="absolute -inset-4 rounded-3xl bg-accent/30 blur-2xl" aria-hidden />
      <div className="relative flex h-full flex-col rounded-3xl border border-border/70 bg-card/90 p-4 shadow-soft backdrop-blur">
        <div className="flex items-center gap-3 border-b border-border/60 pb-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-full animate-pulse-ring" />
            <img src={ducky} alt="Ducky" className="relative h-10 w-10 rounded-full bg-accent/40 object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">Ducky</p>
            <p className="mt-1 text-xs text-muted-foreground">Your AI banker · online</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[10px] font-medium text-secondary-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> 6 agents active
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3">
          {script.slice(0, shown).map((m, i) => (
            <Bubble key={i} from={m.from as "user" | "ducky"} text={m.text} />
          ))}
          {shown < script.length && (
            <Bubble from={script[shown].from as "user" | "ducky"} text={typing} typing />
          )}
        </div>

        <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2">
          <input
            disabled
            placeholder="Message Ducky…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-background">
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Bubble({ from, text, typing }: { from: "user" | "ducky"; text: string; typing?: boolean }) {
  const isUser = from === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-up`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-snug ${
          isUser
            ? "bg-foreground text-background rounded-br-sm"
            : "bg-secondary text-foreground rounded-bl-sm"
        }`}
      >
        <span className={typing ? "caret" : ""}>{text}</span>
      </div>
    </div>
  );
}
