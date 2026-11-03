"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Mic, Square, Send, Volume2, VolumeX, Loader2, User } from "lucide-react";
import { getTransactions, calculateFinancialSnapshot } from "@/lib/finance-store";
import { businessProfile, calculateBusinessSnapshot, businessExpenses, getOrders, payables, receivables } from "@/lib/business-store";
import { analyse, getHoldings } from "@/lib/portfolio-store";
import { getSession, type Mode } from "@/lib/session";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const LANGUAGES = [
  { code: "en-IN", label: "English" },
  { code: "hi-IN", label: "हिन्दी" },
  { code: "ta-IN", label: "தமிழ்" },
  { code: "te-IN", label: "తెలుగు" },
  { code: "kn-IN", label: "ಕನ್ನಡ" },
  { code: "mr-IN", label: "मराठी" },
  { code: "bn-IN", label: "বাংলা" },
  { code: "gu-IN", label: "ગુજરાતી" },
];

const SUGGESTIONS: Record<Mode, { tag: string; q: string }[]> = {
  business: [
    { tag: "Sales", q: "Summarise my business this month in simple words." },
    { tag: "Money", q: "Where am I losing money in the shop?" },
    { tag: "Orders", q: "Which orders need my attention today?" },
    { tag: "Customers", q: "Who are my best customers and how much have they spent?" },
    { tag: "Cash", q: "Can I pay all my suppliers this month with the cash I have?" },
  ],
  personal: [
    { tag: "Savings", q: "Is my emergency fund enough and how much should I save each month?" },
    { tag: "Stocks", q: "How is my stock portfolio doing and what ROI can I expect?" },
    { tag: "EMI", q: "Should I prepay my home loan or invest the extra money?" },
    { tag: "Spending", q: "Where am I overspending this month?" },
    { tag: "Health", q: "Give me a one-minute health check of my household money." },
  ],
};

function buildContext(mode: Mode) {
  if (mode === "business") {
    const b = calculateBusinessSnapshot();
    const orders = getOrders();
    return {
      business: {
        profile: businessProfile,
        last30Days: {
          totalSales: b.totalSales, orders: b.orderCount, avgOrderValue: Math.round(b.avgOrderValue),
          sessions: b.sessions, conversionRatePct: +(b.conversionRate * 100).toFixed(2),
          grossProfit: b.grossProfit, grossMarginPct: +(b.grossMarginPct * 100).toFixed(1),
          operatingExpenses: b.operatingExpenses, netProfit: b.netProfit,
        },
        cashInBank: b.cashInBank,
        ordersToFulfill: b.toFulfill,
        paymentsToCapture: b.toCapture,
        expenses: businessExpenses, payables, receivables,
        products: b.topProducts.map(p => ({ title: p.title, price: p.price, cost: p.cost, inventory: p.inventory, unitsSold30d: p.unitsSold30d, revenue30d: p.revenue30d })),
        topCustomers: b.customers.slice(0, 8),
        recentOrders: orders.slice(0, 15).map(o => ({ id: o.id, date: o.date.slice(0, 10), customer: o.customer, channel: o.channel, total: o.total, payment: o.payment, fulfillment: o.fulfillment })),
      },
    };
  }
  const transactions = getTransactions();
  const pf = analyse(getHoldings(), 3);
  return {
    personal: { snapshot: calculateFinancialSnapshot(transactions), transactions },
    stockPortfolio: {
      invested: Math.round(pf.invested), currentValue: Math.round(pf.current), pnl: Math.round(pf.pnl),
      predictedValueIn3Years: Math.round(pf.predicted), predictedRoiPct: +(pf.predictedRoi * 100).toFixed(1),
      holdings: pf.rows.map(r => ({ symbol: r.symbol, qty: r.qty, avgBuyPerUnit: r.avgPrice, currentPerUnit: r.currentPrice, pnl: Math.round(r.pnl), expectedReturnPctPerYear: r.expectedReturnPct, predictedPerUnit3y: Math.round(r.predictedUnit), predictedRoiPct: +(r.predictedRoi * 100).toFixed(1) })),
    },
  };
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en-IN");
  const [speak, setSpeak] = useState(true);
  const [busy, setBusy] = useState<null | "listening" | "transcribing" | "thinking" | "speaking">(null);
  const [error, setError] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mode, setMode] = useState<Mode>("personal");

  useEffect(() => {
    setMode(getSession()?.mode ?? "personal");
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) {
      window.history.replaceState(null, "", "/copilot");
      ask(q, language, getSession()?.mode ?? "personal");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function ask(question: string, lang = language, m: Mode = mode) {
    if (!question.trim()) return;
    setError(null);
    const history = messages;
    setMessages(m => [...m, { role: "user", content: question }]);
    setInput("");
    setBusy("thinking");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history, context: buildContext(m), language: lang, mode: m }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages(m => [...m, { role: "assistant", content: data.answer }]);
      if (speak) await playSpeech(data.answer, lang);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function playSpeech(text: string, lang: string) {
    setBusy("speaking");
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language: lang }),
    });
    const data = await res.json();
    if (!res.ok || !data.audio) throw new Error(data.error ?? "No audio returned");
    audioRef.current?.pause();
    const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
    audioRef.current = audio;
    await audio.play();
  }

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      rec.ondataavailable = e => chunks.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setBusy("transcribing");
        try {
          const form = new FormData();
          form.append("file", new Blob(chunks, { type: rec.mimeType }), "speech.webm");
          const res = await fetch("/api/stt", { method: "POST", body: form });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          const lang = LANGUAGES.some(l => l.code === data.language) ? data.language : language;
          setLanguage(lang);
          await ask(data.transcript, lang);
        } catch (e) {
          setError(e instanceof Error ? e.message : String(e));
          setBusy(null);
        }
      };
      rec.start();
      recorder.current = rec;
      setBusy("listening");
    } catch {
      setError("Microphone access was denied.");
    }
  }

  function stopRecording() {
    recorder.current?.stop();
    recorder.current = null;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-10 h-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            {mode === "business" ? "AI Business Assistant" : "AI Finance Copilot"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {mode === "business" ? "Ask about sales, orders, customers and cash" : "Ask about savings, EMIs, spending and your stocks"} — speak in your language. Powered by Sarvam AI.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
          >
            {LANGUAGES.map(l => <option key={l.code} value={l.code} className="bg-slate-900">{l.label}</option>)}
          </select>
          <button
            onClick={() => { setSpeak(s => !s); audioRef.current?.pause(); }}
            className="rounded-lg border border-[var(--border)] p-2 hover:bg-white/10"
            title={speak ? "Voice replies on" : "Voice replies off"}
          >
            {speak ? <Volume2 className="h-5 w-5 text-primary" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
          </button>
        </div>
      </div>

      {messages.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SUGGESTIONS[mode].map(s => (
            <button key={s.q} onClick={() => ask(s.q)} className="glass-card p-4 text-left text-sm hover:bg-white/5 transition">
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                mode === "business" ? "text-emerald-400" : "text-primary",
              )}>{s.tag}</span>
              <p className="mt-1">{s.q}</p>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4 flex-1">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
            <div className={cn("h-8 w-8 shrink-0 rounded-full flex items-center justify-center", m.role === "user" ? "bg-primary/20" : "bg-success/20")}>
              {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className={cn("glass-card px-4 py-3 text-sm whitespace-pre-wrap max-w-[80%]", m.role === "user" && "bg-primary/10")}>
              {m.content}
              {m.role === "assistant" && (
                <button onClick={() => playSpeech(m.content, language).catch(e => setError(String(e))).finally(() => setBusy(null))} className="ml-2 align-middle text-muted-foreground hover:text-primary">
                  <Volume2 className="inline h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
        {busy && busy !== "listening" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {busy === "transcribing" ? "Transcribing your voice…" : busy === "thinking" ? "Analysing your finances…" : "Speaking…"}
          </div>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      <form
        onSubmit={e => { e.preventDefault(); ask(input); }}
        className="glass-card flex items-center gap-2 p-2 sticky bottom-0"
      >
        <button
          type="button"
          onClick={busy === "listening" ? stopRecording : startRecording}
          disabled={!!busy && busy !== "listening"}
          className={cn(
            "rounded-full p-3 transition",
            busy === "listening" ? "bg-red-500 text-white animate-pulse" : "bg-primary/15 text-primary hover:bg-primary/25",
          )}
          title={busy === "listening" ? "Stop and send" : "Ask by voice"}
        >
          {busy === "listening" ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={busy === "listening" ? "Listening… tap ■ when done" : mode === "business" ? "Ask about your business…" : "Ask about your money…"}
          className="flex-1 bg-transparent px-2 py-2 text-sm outline-none"
        />
        <button type="submit" disabled={!!busy || !input.trim()} className="rounded-lg bg-primary p-2.5 text-white disabled:opacity-40">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
