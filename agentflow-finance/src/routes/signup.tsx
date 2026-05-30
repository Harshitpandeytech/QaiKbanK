import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { authApi } from "@/lib/api";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — QaiKbank" }, { name: "description", content: "Create your QaiKbank account and start chatting with Ducky." }] }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email address");
      return;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      await authApi.signup({
        name: name.trim(),
        email,
        password,
        phone: phone.trim() || undefined,
      });
      navigate({ to: "/chat" });
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-4 py-20 sm:px-6">
      <img src={logo} alt="QaiKbank" className="h-8" />
      <h1 className="mt-8 text-balance text-3xl font-bold tracking-tight">Meet your AI banker</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">A 60-second setup — then Ducky takes it from here.</p>

      <form onSubmit={handleSubmit} className="mt-8 w-full space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="grid gap-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            placeholder="Ada Lovelace"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
        >
          {loading ? "Creating account..." : "Create account"}
        </Button>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>
        <div className="flex justify-center">
          <GoogleLoginButton
            onSuccess={() => navigate({ to: "/chat" })}
            onError={(message) => setError(message)}
          />
        </div>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account? <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">Log in</Link>
      </p>
    </section>
  );
}
