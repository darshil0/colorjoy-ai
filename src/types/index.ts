import { HarmBlockThreshold } from "@google/genai";

export interface ColoringPage {
  id: string;
  title: string;
  prompt: string;
  imageUrl?: string;
  status: 'idle' | 'generating' | 'completed' | 'error';
  difficulty?: string;
  subject?: string;
}

export interface SafetySettings {
  harassment: HarmBlockThreshold;
  hateSpeech: HarmBlockThreshold;
  sexuallyExplicit: HarmBlockThreshold;
  dangerousContent: HarmBlockThreshold;
}

export interface SavedConfig {
  id: string;
  childName: string;
  theme: string;
  timestamp: number;
}

export type GenerationStep = 'idle' | 'brainstorming' | 'sketching' | 'upscaling' | 'binding';
