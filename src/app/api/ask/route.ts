const SARVAM_URL = "https://api.sarvam.ai/v1/chat/completions";

const LANGUAGE_NAMES: Record<string, string> = {
  "en-IN": "English",
  "hi-IN": "Hindi",
  "bn-IN": "Bengali",
  "ta-IN": "Tamil",
  "te-IN": "Telugu",
  "kn-IN": "Kannada",
  "ml-IN": "Malayalam",
  "mr-IN": "Marathi",
  "gu-IN": "Gujarati",
  "pa-IN": "Punjabi",
  "od-IN": "Odia",
};

type ChatTurn = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "SARVAM_API_KEY is not set in .env.local" }, { status: 500 });
  }

  const { question, history = [], context, language = "en-IN", mode = "personal" } = (await request.json()) as {
    question: string;
    history?: ChatTurn[];
    context: unknown;
    language?: string;
    mode?: "personal" | "business";
  };

  const persona =
    mode === "business"
      ? [
          "You are FINWELL Business Assistant, helping an Indian small-business owner (a perfume shop) run their business:",
          "sales, orders, payments to capture, fulfilment, customers, products, margins, expenses, cash, payables and receivables.",
          "Do NOT give stock, inventory, restocking or reorder suggestions — the owner manages stock themselves. If asked, just report the inventory numbers.",
        ]
      : [
          "You are FINWELL Copilot, a personal finance advisor for an Indian household:",
          "income, expenses, EMIs, savings rate, emergency fund, and their share/stock portfolio (holdings, P&L, projected ROI).",
          "Portfolio projections are estimates; never promise returns.",
        ];

  const system = [
    ...persona,
    "All numbers below were computed by the app's code. Use ONLY these numbers, never invent figures, and cite the specific number you rely on.",
    "Answer in 3-6 short sentences or bullets, end with one concrete next action. Amounts in ₹ with Indian formatting.",
    `Reply in ${LANGUAGE_NAMES[language] ?? "English"}.`,
    "",
    "FINANCIAL DATA (JSON):",
    JSON.stringify(context),
  ].join("\n");

  const res = await fetch(SARVAM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-subscription-key": apiKey },
    body: JSON.stringify({
      model: "sarvam-105b-conversations",
      messages: [{ role: "system", content: system }, ...history.slice(-6), { role: "user", content: question }],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    return Response.json({ error: `Sarvam chat failed (${res.status}): ${await res.text()}` }, { status: 502 });
  }

  const data = await res.json();
  const raw: string = data.choices?.[0]?.message?.content ?? "";
  const answer = raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  return Response.json({ answer });
}
