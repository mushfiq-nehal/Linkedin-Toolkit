export const prerender = false;

import type { APIRoute } from 'astro';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

type Task = 'hashtags' | 'hooks' | 'headline' | 'about';

const PROMPTS: Record<Task, (content: string) => string> = {
  hashtags: (content) => `You are a LinkedIn growth expert. Given the following LinkedIn post, suggest exactly 8 highly relevant hashtags.

Rules:
- Each hashtag must start with #
- Mix 2-3 broad hashtags (high reach) with 5-6 niche/specific ones
- Only include hashtags with active LinkedIn communities
- Return ONLY the hashtags, one per line, nothing else

Post:
${content}`,

  hooks: (content) => `You are a LinkedIn content strategist. Analyze this LinkedIn post and write 3 alternative opening hooks (first line only).

Rules:
- Each hook must make a reader desperately want to click "see more"
- Use techniques like: bold claim, surprising statistic, provocative question, or specific promise
- Keep each hook under 100 characters
- Do NOT open with "I"
- Return ONLY the 3 hooks, numbered 1. 2. 3. — no explanations

Post:
${content}`,

  headline: (content) => `You are a LinkedIn profile optimization expert. Rewrite this LinkedIn headline in 3 improved versions.

Rules:
- Each version must be under 220 characters
- Lead with the person's strongest value or impact
- Include relevant keywords for discoverability
- Be specific — avoid vague words like "passionate" or "enthusiastic"
- Use | or · as separators for readability
- Return ONLY the 3 headlines, numbered 1. 2. 3. — no explanations

Current headline:
${content}`,

  about: (content) => `You are a LinkedIn profile optimization expert. Write a professional LinkedIn About section based on the user's input.

Rules:
- Write in first person ("I")
- Opening hook: first 300 characters must grab attention (visible without "see more")
- Include: what they do, key achievements with specifics, background, current focus, and a CTA for connections
- Use specific, quantified results wherever possible — avoid generic claims
- Stay under 2,600 characters
- Keep paragraphs short (2-3 sentences each) for readability
- Include industry-relevant keywords naturally
- Return ONLY the About section text, nothing else

Context provided by the user:
${content}`,
};

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.OPENROUTER_API_KEY;
  const MODEL = import.meta.env.OPENROUTER_MODEL ?? 'nvidia/nemotron-3-ultra-550b-a55b:free';
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY is not configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { task: Task; content: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { task, content } = body;
  if (!task || !content?.trim()) {
    return new Response(JSON.stringify({ error: 'Missing task or content.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const prompt = PROMPTS[task];
  if (!prompt) {
    return new Response(JSON.stringify({ error: `Unknown task: ${task}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  console.log(`[AI] task=${task} model=${MODEL} content_len=${content.length}`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40_000);

    let res: Response;
    try {
      res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://linkedintoolkit.com',
          'X-Title': 'LinkedIn Toolkit',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: prompt(content) }],
          max_tokens: 512,
          temperature: 0.7,
        }),
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ error: `OpenRouter error: ${res.status} ${errText}` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const result = data.choices?.[0]?.message?.content?.trim() ?? '';
    console.log(`[AI] response ok, result_len=${result.length}`);

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    const message = isTimeout
      ? 'Request timed out (20 s). The model may be busy — try again in a moment.'
      : err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: isTimeout ? 504 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
