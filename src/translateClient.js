// src/translateClient.js
export async function translateText(text, target, source = "en") {
  const r = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, target, source }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || "Translate failed");
  return j.text;
}
