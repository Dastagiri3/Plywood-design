import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate(isAdmin ? "/admin" : "/", { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    const { email: e2, password: p2 } = parsed.data;
    setBusy(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email: e2, password: p2 });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Welcome back");
    } else {
      const { error } = await supabase.auth.signUp({
        email: e2,
        password: p2,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Account created — check your email to verify.");
    }
  };

  return (
    <main className="min-h-screen grid place-items-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-ember opacity-50 pointer-events-none" />
      <div className="absolute inset-0 grid-lines opacity-40 pointer-events-none" />

      <div className="relative w-full max-w-md mx-auto px-6 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground mb-8 transition"
        >
          <ArrowLeft className="h-3 w-3" /> Back to site
        </Link>

        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-sm p-8 shadow-deep">
          <div className="mb-6">
            <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-2">Admin</div>
            <h1 className="font-display text-3xl text-foreground">
              {mode === "login" ? "Sign in" : "Create account"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "login"
                ? "Manage products and customer inquiries."
                : "New admin account — needs role assignment."}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <input
              type="email"
              autoComplete="email"
              placeholder="Email"
              className="w-full bg-input/60 border border-border focus:border-primary outline-none rounded-sm px-4 py-3 text-sm transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
            />
            <input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="Password"
              className="w-full bg-input/60 border border-border focus:border-primary outline-none rounded-sm px-4 py-3 text-sm transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              maxLength={72}
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-ember text-primary-foreground rounded-sm font-medium tracking-wide shadow-ember hover:brightness-110 transition disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
            className="mt-5 text-xs text-muted-foreground hover:text-foreground transition w-full text-center"
          >
            {mode === "login"
              ? "Need an account? Create one"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default Auth;