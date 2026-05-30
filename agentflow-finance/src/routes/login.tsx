import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { authApi } from "@/lib/api";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — QaiKbank" }, { name: "description", content: "Log in to your QaiKbank account." }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

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
      await authApi.login({ email, password });
      navigate({ to: "/chat" });
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-4 py-20 sm:px-6">
      <img src={logo} alt="QaiKbank" className="h-8" />
      <h1 className="mt-8 text-balance text-3xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">Pick up where you left off with Ducky.</p>

      <form onSubmit={handleSubmit} className="mt-8 w-full space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
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
          {loading ? "Logging in..." : "Log in"}
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
        New here? <Link to="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">Create an account</Link>
      </p>
    </section>
  );
}
