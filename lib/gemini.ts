export async function generateSummary(title: string, body: string): Promise<string> {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) return fallback(body);

  const clean = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1500);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Write a compelling 200-word summary for this blog post. Use flowing prose only, no bullet points.\n\nTitle: "${title}"\n\nContent: "${clean}"\n\nSummary:` }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
        }),
      }
    );
    if (!res.ok) return fallback(body);
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || fallback(body);
  } catch {
    return fallback(body);
  }
}

function fallback(body: string): string {
  const text = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.split(' ').slice(0, 200).join(' ') + '...';
}
