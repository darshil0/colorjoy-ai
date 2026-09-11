import { describe, it, expect, vi } from "vitest";
import { generatePagePrompts } from "./geminiService";
import { HarmBlockThreshold } from "@google/genai";

vi.mock("@google/genai", () => {
  function MockGoogleGenAI() {
    return {
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify({
            cover: { title: "Test Cover", description: "Cover Description" },
            pages: [
              {
                title: "Page 1",
                dominant_subject: "Dinosaur",
                description: "A dinosaur coloring page",
                difficulty_level: "easy",
              },
            ],
          }),
        }),
      },
    };
  }

  return {
    GoogleGenAI: MockGoogleGenAI,
    Type: {
      OBJECT: "OBJECT",
      ARRAY: "ARRAY",
      STRING: "STRING",
    },
    HarmCategory: {
      HARM_CATEGORY_HARASSMENT: "HARM_CATEGORY_HARASSMENT",
      HARM_CATEGORY_HATE_SPEECH: "HARM_CATEGORY_HATE_SPEECH",
      HARM_CATEGORY_SEXUALLY_EXPLICIT: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      HARM_CATEGORY_DANGEROUS_CONTENT: "HARM_CATEGORY_DANGEROUS_CONTENT",
    },
    HarmBlockThreshold: {
      BLOCK_LOW_AND_ABOVE: "BLOCK_LOW_AND_ABOVE",
      BLOCK_MEDIUM_AND_ABOVE: "BLOCK_MEDIUM_AND_ABOVE",
      BLOCK_ONLY_HIGH: "BLOCK_ONLY_HIGH",
      BLOCK_NONE: "BLOCK_NONE",
    },
  };
});

const mockSafetySettings = {
  harassment: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  hateSpeech: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  sexuallyExplicit: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  dangerousContent: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
};

describe("geminiService", () => {
  it("generatePagePrompts parses structured book plan correctly", async () => {
    const result = await generatePagePrompts("Space Dinosaurs", "Leo", mockSafetySettings, "mock-api-key");
    expect(result).toHaveProperty("cover");
    expect(result.cover.title).toBe("Test Cover");
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0].dominant_subject).toBe("Dinosaur");
  });
});
