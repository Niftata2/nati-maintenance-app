"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ShieldCheck, Wrench, Users, BarChart3, Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      const role = sessionData?.user?.role;

      if (role === "OWNER") router.push("/manager");
      else if (role === "CASHIER") router.push("/pos");
      else if (role === "TECHNICIAN") router.push("/my-jobs");
      else router.push("/dashboard");

      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const quickLogin = async (roleEmail: string, rolePassword: string) => {
    setEmail(roleEmail);
    setPassword(rolePassword);
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: roleEmail,
        password: rolePassword,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid credentials");
        setLoading(false);
        return;
      }
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      const role = sessionData?.user?.role;
      if (role === "OWNER") router.push("/manager");
      else if (role === "CASHIER") router.push("/pos");
      else if (role === "TECHNICIAN") router.push("/my-jobs");
      else router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950">
        {/* Glow orbs */}
        <div className="absolute top-0 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Nati<span className="text-emerald-400">.</span>
              </h1>
            </div>
          </div>

          {/* Tagline + Features */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-white leading-tight">
                Repair shop management made simple.
              </h2>
              <p className="text-emerald-100/70 mt-4 text-lg">
                Track every device, every payment, and every repair — all in one place.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Track repairs in real time</p>
                  <p className="text-sm text-emerald-100/60">From intake to delivery</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Live business insights</p>
                  <p className="text-sm text-emerald-100/60">Sales, jobs, revenue — updated</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Built for your team</p>
                  <p className="text-sm text-emerald-100/60">Owner, cashier & technician roles</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 text-xs text-emerald-100/40">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure • Fast • Reliable</span>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground">
              Nati<span className="text-emerald-500">.</span>
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@natimaintenance.com"
                required
                className="w-full px-3.5 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2 transition-all"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Quick login */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Zap className="w-3 h-3" />
                Quick login
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => quickLogin("admin@natimaintenance.com", "admin123")}
                disabled={loading}
                className="p-3 bg-card border border-border rounded-lg hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left group"
              >
                <div className="text-xs font-semibold text-foreground group-hover:text-emerald-500">
                  Owner
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Admin access
                </div>
              </button>
              <button
                onClick={() => quickLogin("cashier@natimaintenance.com", "cashier123")}
                disabled={loading}
                className="p-3 bg-card border border-border rounded-lg hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left group"
              >
                <div className="text-xs font-semibold text-foreground group-hover:text-blue-500">
                  Cashier
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Payments & POS
                </div>
              </button>
              <button
                onClick={() => quickLogin("technician@natimaintenance.com", "technician123")}
                disabled={loading}
                className="p-3 bg-card border border-border rounded-lg hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-left group"
              >
                <div className="text-xs font-semibold text-foreground group-hover:text-purple-500">
                  Technician
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Repair jobs
                </div>
              </button>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-8">
            © {new Date().getFullYear()} Nati Maintenance. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}