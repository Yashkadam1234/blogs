import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

// ==============================
// HELPERS
// ==============================

function cleanInput(text: string) {
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1500);
}

// 🔥 STRONG ENFORCER (FIXES AI OUTPUT)
function enforceRules(text: string, original: string) {
  let clean = text
    .replace(/\?/g, '')
    .replace(/!/g, '')
    .replace(/In a world[^.]*\./gi, '')
    .replace(/This (story|passage)[^.]*\./gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  let sentences = clean
    .split('. ')
    .map((s) => s.trim())
    .filter(Boolean);

  // remove weak / emotional / invalid lines
  sentences = sentences.filter(
    (s) =>
      s.length > 40 &&
      !/you|we|I|us/i.test(s) &&
      !/feel|emotion|journey|transform|story/i.test(s)
  );

  sentences = sentences.slice(0, 4);

  let result = sentences.join('. ');

  // word limit
  const words = result.split(' ');
  if (words.length > 110) {
    result = words.slice(0, 110).join(' ');
  }

  // fallback if bad
  if (!result || result.length < 80) {
    return fallbackSummary(original);
  }

  return result.endsWith('.') ? result : result + '.';
}

// fallback = deterministic safe summary
function fallbackSummary(text: string) {
  const sentences = text.split('. ').slice(0, 3);
  return sentences.join('. ') + '.';
}

// ==============================
// GET POSTS
// ==============================
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const q = searchParams.get('q') || '';
  const per = 9;
  const from = (page - 1) * per;

  const sb = getSupabaseAdmin();

  let query = sb
    .from('posts')
    .select('*, author:users(id,name,role)', { count: 'exact' })
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(from, from + per - 1);

  if (q) {
    query = query.or(`title.ilike.%${q}%,body.ilike.%${q}%`);
  }

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    count,
    page,
    totalPages: Math.ceil((count || 0) / per),
  });
}

// ==============================
// CREATE POST + PERFECT SUMMARY
// ==============================
export async function POST(req: NextRequest) {
  try {
    const sb = getSupabaseAdmin();
    const { title, body, user_id } = await req.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    const clean = cleanInput(body);
    let summary = '';

    // ==============================
    // AI SUMMARY
    // ==============================
    if (process.env.GROQ_API_KEY) {
      try {
        const aiRes = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `
You are a strict summarization engine.

RULES:
- 3 to 4 sentences only
- 90 to 120 words
- No questions
- No emotional language
- No storytelling
- No metaphors
- No opinions
- Do not address reader
- Only compress the text

Output ONLY summary.
`,
            },
            {
              role: 'user',
              content: clean,
            },
          ],
          temperature: 0,
          top_p: 0.1,
          max_tokens: 160,
        });

        summary =
          aiRes.choices[0]?.message?.content?.trim() || '';

        // 🔥 enforce strict output
        summary = enforceRules(summary, clean);
      } catch (err) {
        console.error('Groq error:', err);
      }
    }

    // ==============================
    // FALLBACK (SAFE)
    // ==============================
    if (!summary) {
      summary = fallbackSummary(clean);
    }

    // ==============================
    // SAVE TO DATABASE
    // ==============================
    const { data, error } = await sb
      .from('posts')
      .insert([
        {
          title,
          body,
          summary,
          user_id,
          published: true,
          created_at: new Date(),
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      post: data,
    });
  } catch (err: any) {
    console.error('POST error:', err.message);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
