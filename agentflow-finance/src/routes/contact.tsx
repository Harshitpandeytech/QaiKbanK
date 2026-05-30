import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — QaiKbank" },
      { name: "description", content: "Get in touch with the QaiKbank team. We respond fast — almost as fast as Ducky." },
      { property: "og:title", content: "Contact QaiKbank" },
      { property: "og:description", content: "Get in touch with the QaiKbank team." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <section className="mx-auto grid max-w-6xl gap-16 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Contact</p>
        <h1 className="mt-3 text-balance text-5xl font-bold tracking-tight">Say hello. We're real humans.</h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          Whether you're curious about the platform, want a demo, or just want to chat
          about agentic banking — we're here.
        </p>

        <div className="mt-10 space-y-4">
          {[
            { i: Mail, t: "hello@qaikbank.ai", s: "Drop us a note" },
            { i: MessageSquare, t: "Talk to Ducky", s: "Live in the app" },
            { i: MapPin, t: "Bengaluru · Remote-first", s: "We work everywhere" },
          ].map((x) => (
            <div key={x.t} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/40">
                <x.i className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">{x.t}</p>
                <p className="text-xs text-muted-foreground">{x.s}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="rounded-3xl border border-border bg-card p-8 shadow-soft"
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Ada Lovelace" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@company.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="msg">What's on your mind?</Label>
            <Textarea id="msg" rows={5} placeholder="Tell us a bit about your use case…" />
          </div>
          <Button type="submit" className="mt-2 h-11 rounded-full bg-foreground text-background hover:bg-foreground/90">
            Send message
          </Button>
        </div>
      </form>
    </section>
  );
}
