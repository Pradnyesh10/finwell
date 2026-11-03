// Speech-to-text via Sarvam (saaras:v3, auto language detection).
export async function POST(request: Request) {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "SARVAM_API_KEY is not set in .env.local" }, { status: 500 });
  }

  const incoming = await request.formData();
  const audio = incoming.get("file");
  if (!(audio instanceof Blob)) {
    return Response.json({ error: "No audio file received" }, { status: 400 });
  }

  // Sarvam rejects codec suffixes like "audio/webm;codecs=opus" — send the bare MIME type.
  const mime = (audio.type || "audio/webm").split(";")[0];
  const ext = mime.split("/")[1] ?? "webm";
  const form = new FormData();
  form.append("file", new Blob([await audio.arrayBuffer()], { type: mime }), `speech.${ext}`);
  form.append("model", "saaras:v3");
  form.append("mode", "transcribe");
  form.append("language_code", "unknown");

  const res = await fetch("https://api.sarvam.ai/speech-to-text", {
    method: "POST",
    headers: { "api-subscription-key": apiKey },
    body: form,
  });

  if (!res.ok) {
    return Response.json({ error: `Sarvam STT failed (${res.status}): ${await res.text()}` }, { status: 502 });
  }

  const data = await res.json();
  return Response.json({ transcript: data.transcript ?? "", language: data.language_code ?? null });
}
