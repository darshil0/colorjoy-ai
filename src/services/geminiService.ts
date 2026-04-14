import { GoogleGenAI, Type } from "@google/genai";
import { SafetySettings } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function generatePagePrompts(theme: string, childName: string, safetySettings: SafetySettings) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a 5-page coloring book plan for a child named "${childName}" with the theme: "${theme}". 
    Include a cover page and 5 interior pages.
    Each page should have a title, a dominant subject, and a detailed description for image generation.
    Prompts must be optimized for children's coloring books: thick black lines, no shading, white background.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cover: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "description"]
          },
          pages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                dominant_subject: { type: Type.STRING },
                description: { type: Type.STRING },
                difficulty_level: { type: Type.STRING, enum: ["easy", "medium", "hard"] }
              },
              required: ["title", "dominant_subject", "description", "difficulty_level"]
            }
          }
        },
        required: ["cover", "pages"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function generateColoringImage(prompt: string, imageSize: "1K" | "2K" | "4K", apiKey: string, safetySettings: SafetySettings) {
  // Use the user-provided API key if available, otherwise fallback to environment
  const imageAi = new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY! });
  
  const fullPrompt = `${prompt}. Children's coloring book style, thick black lines, no shading, no gradients, pure white background, high contrast, simple bold shapes.`;
  
  const response = await imageAi.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: {
      parts: [{ text: fullPrompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: imageSize
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to generate image");
}

export async function chatWithGemini(messages: any[], useSearch: boolean, safetySettings: SafetySettings) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: messages,
    config: {
      systemInstruction: "You are the ColorJoy AI Agent, a creative assistant for children's coloring books. Help parents and kids brainstorm fun themes.",
      tools: useSearch ? [{ googleSearch: {} }] : undefined,
    }
  });

  return response.text || "I'm sorry, I couldn't think of anything. Try another theme!";
}
