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

  The plan should focus on building authority and driving conversions.
  Return ONLY a valid JSON array of 4 weeks, where each week has:
  - week: number (1-4)
  - theme: string (the focus of the week)
  - actions: string[] (3-4 specific marketing actions)
  - contentPrompts: string[] (2-3 content ideas)
  - conversionActivity: string (the primary call to action for that week)

  Return ONLY the JSON array, no markdown, no code fences.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "You are a marketing strategist. Always respond with valid JSON only, no markdown formatting." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content || "[]";
  const parsed = JSON.parse(text);
  // Handle both { weeks: [...] } and direct array format
  return Array.isArray(parsed) ? parsed : (parsed.weeks || parsed.plan || []);
};

export const generateContentDraft = async (params: {
  type: string;
  topic: string;
  goal: string;
  product: any;
}): Promise<string> => {
  const prompt = `Generate a ${params.type} draft for the following:
  Product: ${params.product.name}
  Product Description: ${params.product.description || 'N/A'}
  Topic: ${params.topic}
  Goal: ${params.goal}

  Make it engaging, professional, and tailored for a solopreneur's audience.
  If it's a LinkedIn post, include relevant emojis and hashtags.
  If it's an email, include a subject line.
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
