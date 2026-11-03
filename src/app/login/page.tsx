"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Store, ArrowRight, Check, Mic, Languages, ShieldCheck } from "lucide-react";
import { homeFor, setSession, type Mode } from "@/lib/session";
import { cn } from "@/lib/utils";

const MODES: { mode: Mode; title: string; subtitle: string; icon: typeof User; points: string[]; accent: string }[] = [
  {
    mode: "personal",
    title: "Personal",
    subtitle: "Manage your household money",
    icon: User,
    accent: "from-primary to-blue-600",
    points: ["Income, expenses & EMIs", "Emergency fund & risk score", "Investment & loan planning"],
  },
  {
    mode: "business",
    title: "Business",
    subtitle: "Run your shop like a pro",
    icon: Store,
    accent: "from-emerald-500 to-teal-600",
    points: ["Orders, products & customers", "Import CSV data & product photos", "AI assistant for business owners"],
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("personal");
  const [name, setName] = useState("Rahul Kamlani");
  const [phone, setPhone] = useState("9876543210");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      setOtpSent(true);
      setOtp("1234");
      return;
    }
    setSession({ name: name.trim() || "Guest", phone, mode });
    router.push(homeFor(mode));
  };

  return (
    <div className="min-h-full flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 z-10">
        <div className="flex flex-col justify-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-500">
              <span className="text-3xl font-black text-white italic">F</span>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter">FINWELL</h1>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">One app · Personal &amp; Business money</p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground">
            Switch between your household finances and your shop in one tap — with an AI copilot that understands
            your language.
          </p>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2"><Mic className="h-4 w-4 text-primary" /> Ask by voice, get answers spoken back</p>
            <p className="flex items-center gap-2"><Languages className="h-4 w-4 text-primary" /> 8 Indian languages, powered by Sarvam AI</p>
            <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Numbers calculated by code, explained by AI</p>
          </div>
        </div>

        <form onSubmit={login} className="glass-card p-6 space-y-5">
          <h2 className="text-xl font-bold">Choose your account</h2>
          <div className="grid grid-cols-2 gap-3">
            {MODES.map(m => (
              <button
                type="button"
                key={m.mode}
                onClick={() => setMode(m.mode)}
                className={cn(
                  "relative rounded-xl border p-4 text-left transition",
                  mode === m.mode ? "border-primary bg-primary/10" : "border-[var(--border)] hover:bg-white/5"
                )}
              >
                {mode === m.mode && <Check className="absolute right-3 top-3 h-4 w-4 text-primary" />}
                <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white", m.accent)}>
                  <m.icon className="h-5 w-5" />
                </div>
                <p className="font-bold">{m.title}</p>
                <p className="text-xs text-muted-foreground">{m.subtitle}</p>
                <ul className="mt-3 space-y-1 text-[11px] text-muted-foreground">
                  {m.points.map(p => <li key={p}>• {p}</li>)}
                </ul>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={mode === "business" ? "Owner name" : "Your name"}
              className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <div className="flex rounded-lg border border-[var(--border)] focus-within:border-primary">
              <span className="px-3 py-2.5 text-sm text-muted-foreground border-r border-[var(--border)]">+91</span>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Mobile number"
                className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
              />
            </div>
            {otpSent && (
              <div>
                <input
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="OTP"
                  className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm tracking-[0.5em] outline-none focus:border-primary"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">Demo mode — OTP auto-filled.</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={phone.length !== 10}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r py-3 font-semibold text-white disabled:opacity-40",
              mode === "business" ? "from-emerald-500 to-teal-600" : "from-primary to-blue-600"
            )}
          >
            {otpSent ? `Continue to ${mode === "business" ? "Business" : "Personal"}` : "Get OTP"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
