import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { title, body } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ summary: '' });
    }

    // fallback if no API key
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ summary: getFallback(body) });
    }

    const clean = body
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1500);

    const prompt = `
Write a compelling, engaging summary of exactly around 200 words for this blog post.
Write in flowing prose only, no bullet points.
Make it interesting enough that readers want to read the full post.

Title: "${title}"

Content: "${clean}"

Summary:
`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are a professional blog editor who writes high-quality summaries.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
    });

    const summary = completion.choices[0]?.message?.content?.trim();

    console.log(
      'AI Summary generated successfully:',
      summary?.slice(0, 80) + '...'
    );

    return NextResponse.json({
      summary: summary || getFallback(body),
    });

  } catch (e: any) {
    console.error('Summary error:', e.message);
    return NextResponse.json({
      summary: getFallback(''),
    });
  }
}

function getFallback(body: string): string {
  const text = body
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text.split(' ').slice(0, 200).join(' ') + '...';
}