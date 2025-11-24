import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // Ensure this is available in the environment
const ai = new GoogleGenAI({ apiKey });

export const generateProductDescription = async (productName: string, price: number): Promise<string> => {
  if (!apiKey) return "AI Description unavailable (No API Key)";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, catchy, TikTok-style sales description (max 15 words) for a product named "${productName}" that costs $${price}. Use emojis.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Check out this amazing product!";
  }
};

export const categorizeContent = async (text: string): Promise<string> => {
  if (!apiKey) return "General";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Categorize this video content into a single category word (e.g., Fashion, Tech, Beauty, Food, Comedy) based on this description: "${text}". Return only the word.`,
    });
    return response.text.trim();
  } catch (error) {
    return "General";
  }
};
