import Groq from "groq-sdk";
import { PlanWeek } from "../types";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || "",
  dangerouslyAllowBrowser: true,
});

export const generateMarketingPlan = async (product: any): Promise<PlanWeek[]> => {
  const priceDisplay = product.price || (product.price_cents ? `$${(product.price_cents / 100).toFixed(2)}` : 'N/A');
  const prompt = `Generate a 4-week marketing plan for the following product:
  Name: ${product.name}
  Description: ${product.description || 'N/A'}
  Product Type: ${product.product_type || product.product_category || 'General'}
  Price: ${priceDisplay}

  CRITICAL RULES FOR SPECIFICITY — every action must include:
  - REAL platform/community names (e.g. "r/Entrepreneur", "Indie Hackers", "Creator Economy Facebook Group", "Skool AI Automation Hub") — not vague phrases like "online communities"
  - EXACT numbers (e.g. "offer a 20% launch discount", "DM 10 micro-influencers with 5k-20k followers", "post 3x per week")
  - NAMED channels or tools where relevant (e.g. "Twitter/X", "LinkedIn newsletter", "Beehiiv", "ConvertKit", "ProductHunt")
  - CONCRETE next steps (e.g. "write a cold outreach template offering a 30-day free trial", not "reach out to potential partners")

  BAD example action: "Partner with writing communities to offer exclusive discounts"
  GOOD example action: "Reach out to 3 communities (Indie Hackers, r/SideProject, and Creator Economy Skool group) with a 25% launch discount code valid for 7 days — DM the community admins first"

  The plan should focus on building authority and driving conversions.
  Return ONLY a valid JSON array of 4 weeks, where each week has:
  - week: number (1-4)
  - theme: string (the focus of the week)
  - actions: string[] (3-4 specific marketing actions, each following the SPECIFICITY rules above)
  - contentPrompts: string[] (2-3 content ideas with a named platform and angle, e.g. "LinkedIn post: behind-the-scenes of building [product name] — target founders and freelancers")
  - conversionActivity: string (a concrete CTA with specific offer, platform, and deadline)

  Return ONLY the JSON array, no markdown, no code fences.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "You are a senior marketing strategist who gives hyper-specific, actionable advice. Always name real platforms, communities, and exact numbers. Never use vague language. Always respond with valid JSON only, no markdown formatting." },
      { role: "user", content: prompt }
    ],
    temperature: 0.5,
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content || "[]";
  const parsed = JSON.parse(text);
  // Handle both { weeks: [...] } and direct array format
  return Array.isArray(parsed) ? parsed : (parsed.weeks || parsed.plan || []);
};

export const generateImagePrompt = async (params: {
  contentType: string;
  topic: string;
  goal: string;
}): Promise<string> => {
  const prompt = `Write a concise image generation prompt for a social media visual.

Content type: ${params.contentType}
Topic: ${params.topic}
Goal: ${params.goal}

Rules:
- Max 30 words
- Describe a real, photorealistic scene or flat-design illustration that matches the topic
- Professional, clean, suitable for ${params.contentType}
- No text overlays, no logos, no people's faces
- Return ONLY the image prompt string, nothing else`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You write concise, vivid image generation prompts. Return only the prompt text.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.8,
  });

  return response.choices[0]?.message?.content?.trim() || `Professional ${params.contentType} visual for ${params.topic}`;
};

export const generateReengagementEmail = async (lead: {
  email: string;
  source: string;
  stage: string;
  notes?: string;
  last_contacted?: string;
}): Promise<{ subject: string; body: string }> => {
  const daysSince = lead.last_contacted
    ? Math.floor((Date.now() - new Date(lead.last_contacted).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const prompt = `Write a short, warm, personalized re-engagement email for a lead who has gone quiet.

Lead info:
- Email: ${lead.email}
- How they found us: ${lead.source}
- Stage in funnel: ${lead.stage}
- Last contacted: ${daysSince !== null ? `${daysSince} days ago` : 'never'}
- Notes: ${lead.notes || 'none'}

Rules:
- Keep it under 120 words
- Sound human and genuine, NOT salesy
- Reference their source/stage naturally if possible
- Include ONE specific value reminder or soft offer
- End with a low-friction CTA (reply, book a call, or try again)
- Subject line must be under 50 chars, conversational

Return ONLY valid JSON: { "subject": "...", "body": "..." }`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You are a friendly copywriter who writes short, genuine re-engagement emails. Always return valid JSON only.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const parsed = JSON.parse(response.choices[0]?.message?.content || '{}');
  return { subject: parsed.subject || 'Checking in', body: parsed.body || '' };
};

export const generateContentDraft = async (params: {
  type: string;
  topic: string;
  goal: string;
  product: any;
}): Promise<string> => {
  const platformGuide: Record<string, string> = {
    'LinkedIn Post': `LinkedIn Post (1,300 chars ideal, 3,000 max). Use line breaks for readability. Include 3-5 relevant hashtags at the end. Open with a hook line. Use emojis sparingly for emphasis.`,
    'Twitter Thread': `Twitter/X Thread (280 chars per tweet). Write 4-6 tweets numbered 1/, 2/, etc. First tweet is the hook. Last tweet is the CTA. Keep each tweet self-contained. Include 1-2 hashtags on the first tweet only.`,
    'Email Newsletter': `Email Newsletter. Include a compelling subject line on the first line as "Subject: ...". Keep paragraphs short (2-3 sentences). Include a clear CTA button text in [brackets]. Aim for 300-500 words.`,
    'Blog Outline': `Blog Post Outline. Include a working title, meta description (155 chars), 5-8 H2 sections with 2-3 bullet points each, and a conclusion with CTA. Optimized for SEO.`,
    'Instagram Caption': `Instagram Caption (2,200 chars max, first 125 chars visible before "more"). Open with a strong hook in the first line. Use line breaks and emojis for readability. Include 20-30 relevant hashtags in a separate block at the end. End with a CTA (comment, save, share).`,
    'Instagram Reel Script': `Instagram Reel Script (60-90 seconds). Format as: HOOK (first 3 seconds to stop the scroll), BODY (main content in 3-4 short points), CTA (what to do next). Include on-screen text suggestions in [brackets]. Keep language conversational and punchy.`,
    'Facebook Post': `Facebook Post (ideal 40-80 chars for engagement, max 63,206). Open with a question or bold statement. Use short paragraphs. Include a CTA. Can be longer and more conversational than LinkedIn. Add 1-3 relevant hashtags.`,
    'YouTube Script': `YouTube Video Script (8-12 minutes). Format as: HOOK (first 30 seconds — pose the problem), INTRO (brief channel intro + what they'll learn), BODY (3-5 main points with transitions), CTA (subscribe, comment, related video). Include [B-ROLL] and [GRAPHIC] cues where visuals should change.`,
    'YouTube Shorts Script': `YouTube Shorts Script (under 60 seconds). Format as: HOOK (first 2 seconds), KEY POINT (one clear takeaway), CTA (follow for more). Keep it punchy and fast-paced. Include on-screen text suggestions in [brackets].`,
    'TikTok Script': `TikTok Script (15-60 seconds). Format as: HOOK (first 1-2 seconds to stop scroll), CONTENT (quick-hit value, trending format), CTA. Write in casual, authentic voice. Include trending sound/format suggestions. Add 3-5 hashtags including niche + trending ones.`,
    'Pinterest Pin': `Pinterest Pin description (500 chars max) + Title (100 chars max). Write a keyword-rich title first, then a description with natural keyword placement. Include a clear CTA. Pinterest is a search engine — optimize for discovery. Suggest ideal pin dimensions (1000x1500px standard, 1000x2100px for infographics).`,
    'Threads Post': `Threads Post (500 chars max). Conversational and authentic tone. Can be a single post or a thread of 2-3 posts. Less formal than LinkedIn, more thoughtful than Twitter. No hashtags needed (Threads doesn't heavily use them yet). Focus on starting conversations.`,
  };

  const guide = platformGuide[params.type] || `${params.type} content. Make it platform-appropriate.`;

  const prompt = `Generate a ${params.type} draft for the following:
  Product: ${params.product.name}
  Product Description: ${params.product.description || 'N/A'}
  Topic: ${params.topic}
  Goal: ${params.goal}

  PLATFORM SPECIFICATIONS:
  ${guide}

  Make it engaging, professional, and tailored for a solopreneur's audience.
  Return only the text content of the draft.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "You are a marketing copywriter for solopreneurs." },
      { role: "user", content: prompt }
    ],
    temperature: 0.8,
  });

  return response.choices[0]?.message?.content || "";
};
