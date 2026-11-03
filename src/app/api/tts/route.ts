// Text-to-speech via Sarvam (bulbul:v3). Returns base64 WAV.
export async function POST(request: Request) {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "SARVAM_API_KEY is not set in .env.local" }, { status: 500 });
  }

  const { text, language = "en-IN" } = (await request.json()) as { text: string; language?: string };
  const clean = text.replace(/[*#_`>]/g, "").slice(0, 2500);

  const res = await fetch("https://api.sarvam.ai/text-to-speech", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-subscription-key": apiKey },
    body: JSON.stringify({
      text: clean,
      language_code: language,
      speaker: "priya",
      model: "bulbul:v3",
    }),
  });

  if (!res.ok) {
    return Response.json({ error: `Sarvam TTS failed (${res.status}): ${await res.text()}` }, { status: 502 });
  }

  const data = await res.json();
  return Response.json({ audio: data.audios?.[0] ?? null });
}
