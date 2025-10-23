// /api/translate.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, target, source = "en" } = req.body || {};
  if (!text || !target) {
    return res.status(400).json({ error: "Missing 'text' or 'target'." });
  }

  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "Missing GOOGLE_TRANSLATE_API_KEY." });
  }

  try {
    const r = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          source,
          target,
          format: "text",
        }),
      }
    );

    const j = await r.json();
    if (!r.ok) {
      const msg = j?.error?.message || "Translate failed";
      return res.status(r.status).json({ error: msg });
    }

    const translated = j?.data?.translations?.[0]?.translatedText || "";
    return res.status(200).json({ text: translated });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Translate error" });
  }
}
