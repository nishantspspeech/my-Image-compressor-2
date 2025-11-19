import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeImageWithGemini = async (
  base64Data: string,
  mimeType: string
): Promise<AIAnalysisResult> => {
  const ai = getAI();
  
  // Use Flash for fast image analysis
  const modelId = 'gemini-2.5-flash'; 

  const prompt = `
    Analyze this image for SEO and file optimization purposes.
    1. Provide a concise alt text description (max 2 sentences).
    2. Generate 5-7 relevant keyword tags.
    3. Suggest a clean, SEO-friendly filename in kebab-case (e.g., "sunset-beach-california"), do not include file extension.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: {
            type: Type.STRING,
            description: "Alt text description of the image",
          },
          keywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of keywords related to the image",
          },
          suggestedFilename: {
            type: Type.STRING,
            description: "SEO optimized filename without extension",
          },
        },
        required: ["description", "keywords", "suggestedFilename"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini");
  }

  try {
    return JSON.parse(text) as AIAnalysisResult;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Invalid JSON response from AI");
  }
};