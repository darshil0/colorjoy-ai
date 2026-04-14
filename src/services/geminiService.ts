import { GoogleGenAI, Type, FunctionDeclaration, HarmCategory } from "@google/genai";
import { ColoringPage, SafetySettings } from "../types";

const createPageMetadataFunction: FunctionDeclaration = {
  name: "create_page_metadata",
  description: "Define the metadata for the coloring book pages",
  parameters: {
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
            description: { type: Type.STRING },
            difficulty_level: { type: Type.STRING, enum: ["easy", "medium", "hard"] },
            dominant_subject: { type: Type.STRING }
          },
          required: ["title", "description", "difficulty_level", "dominant_subject"]
        }
      }
    },
    required: ["cover", "pages"]
  }
};

const getAiClient = (userApiKey?: string) => {
  const apiKey = userApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please provide it in the settings or environment.");
  }
  return new GoogleGenAI({ apiKey });
};

export async function generatePagePrompts(theme: string, childName: string, safetySettings?: SafetySettings) {
  const aiClient = getAiClient();
  const response = await aiClient.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Plan a 5-page coloring book for ${childName} with the theme: "${theme}". Use the create_page_metadata tool to provide the structured plan.`,
    config: {
      tools: [{ functionDeclarations: [createPageMetadataFunction] }],
      systemInstruction: "You are a professional children's book editor. Your goal is to create structured, engaging coloring book plans. Always use the provided tool to return the metadata.",
      safetySettings: safetySettings ? [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: safetySettings.harassment },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: safetySettings.hateSpeech },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: safetySettings.sexuallyExplicit },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: safetySettings.dangerousContent },
      ] : undefined
    }
  });

  const call = response.functionCalls?.find(c => c.name === "create_page_metadata");
  if (call) {
    return call.args;
  }
  
  try {
    return JSON.parse(response.text);
  } catch (e) {
    throw new Error("Failed to generate structured book plan");
  }
}

export async function generateColoringImage(
  prompt: string, 
  size: "1K" | "2K" | "4K", 
  userApiKey?: string,
  safetySettings?: SafetySettings
) {
  const aiClient = getAiClient(userApiKey);
  
  const response = await aiClient.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      systemInstruction: "You are a specialized coloring book artist. You only produce black and white line art. Rules: 1. Use thick, clean black lines. 2. No shading or gradients. 3. Pure white background. 4. High contrast. 5. Simple, bold shapes suitable for children.",
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      },
      safetySettings: safetySettings ? [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: safetySettings.harassment },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: safetySettings.hateSpeech },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: safetySettings.sexuallyExplicit },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: safetySettings.dangerousContent },
      ] : undefined
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data returned");
}

export async function chatWithGemini(
  messages: { role: 'user' | 'model', parts: { text: string }[] }[],
  useSearch: boolean = true,
  safetySettings?: SafetySettings
) {
  const aiClient = getAiClient();
  const response = await aiClient.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: messages,
    config: {
      tools: useSearch ? [{ googleSearch: {} }] : [],
      systemInstruction: "You are a helpful assistant for a children's coloring book generator. You help parents come up with creative themes and scene ideas for their kids. Keep your tone friendly, encouraging, and imaginative. Use Google Search to find interesting facts or real-world inspiration if requested.",
      safetySettings: safetySettings ? [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: safetySettings.harassment },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: safetySettings.hateSpeech },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: safetySettings.sexuallyExplicit },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: safetySettings.dangerousContent },
      ] : undefined
    }
  });
  return response.text;
}
