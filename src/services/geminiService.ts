import { GoogleGenAI, Type } from "@google/genai";
import { PlanWeek } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateMarketingPlan = async (product: any): Promise<PlanWeek[]> => {
  const priceDisplay = product.price || (product.price_cents ? `$${(product.price_cents / 100).toFixed(2)}` : 'N/A');
  const prompt = `Generate a 4-week marketing plan for the following product:
  Name: ${product.name}
  Description: ${product.description || 'N/A'}
  Product Type: ${product.product_type || product.product_category || 'General'}
  Price: ${priceDisplay}

  The plan should focus on building authority and driving conversions. 
  Return a JSON array of 4 weeks, where each week has:
  - week: number (1-4)
  - theme: string (the focus of the week)
  - actions: string[] (3-4 specific marketing actions)
  - contentPrompts: string[] (2-3 content ideas)
  - conversionActivity: string (the primary call to action for that week)`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            week: { type: Type.NUMBER },
            theme: { type: Type.STRING },
            actions: { type: Type.ARRAY, items: { type: Type.STRING } },
            contentPrompts: { type: Type.ARRAY, items: { type: Type.STRING } },
            conversionActivity: { type: Type.STRING },
          },
          required: ["week", "theme", "actions", "contentPrompts", "conversionActivity"],
        },
      },
    },
  });

  return JSON.parse(response.text || "[]");
};

export const generateContentDraft = async (params: {
  type: string;
  topic: string;
  goal: string;
  product: any;
}): Promise<string> => {
  const prompt = `Generate a ${params.type} draft for the following:
  Product: ${params.product.name}
  Product Description: ${params.product.description}
  Topic: ${params.topic}
  Goal: ${params.goal}

  Make it engaging, professional, and tailored for a solopreneur's audience. 
  If it's a LinkedIn post, include relevant emojis and hashtags.
  If it's an email, include a subject line.
  Return only the text content of the draft.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text || "";
};
