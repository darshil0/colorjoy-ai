# ColorJoy AI 🎨

ColorJoy AI is a personalized children's coloring book generator powered by Google Gemini. It allows parents and educators to create custom, high-quality coloring books tailored to a child's specific interests and imagination.

## Features

- **AI Agent Persona**: Integrated `AGENTS.md` to define a friendly, imaginative assistant persona for brainstorming and guidance.
- **Personalized Themes**: Generate coloring pages based on any theme (e.g., "Space Dinosaurs", "Underwater Robots").
- **Custom Cover**: Every book includes a custom cover featuring the child's name.
- **AI-Powered Art**: Uses `gemini-3-pro-image-preview` for professional-grade, thick-line art designed specifically for coloring.
- **Structured Planning**: Uses Gemini Function Calling to create a cohesive 5-page book plan with varying difficulty levels.
- **Idea Assistant**: A built-in chatbot with Google Search grounding to help brainstorm creative themes.
- **Print-Ready PDF**: Compiles all pages into an A4-formatted, numbered PDF ready for printing.
- **Professional Back Cover**: Includes a unique barcode, mock ISBN, and publishing details for a realistic book feel.
- **Favorites & History**: Save favorite themes and child name combinations for quick reuse.
- **Parental Controls**: Granular safety filters to ensure all content is child-appropriate.
- **Celebration Effects**: Interactive confetti celebration upon successful book generation.

## Project Structure

The project follows a modular architecture for better maintainability:

- **`src/services/`**: Core logic for Gemini AI and PDF generation.
- **`src/hooks/`**: Custom React hooks for state management (e.g., favorites).
- **`src/types/`**: Centralized TypeScript definitions.
- **`src/components/ui/`**: Reusable UI components built with Base UI and Tailwind CSS.
- **`AGENTS.md`**: Defines the AI Agent's personality and instructions.
- **`GEMINI.md`**: Technical guidelines and prompt engineering rules for the AI models.

## Tech Stack

- **Language**: TypeScript
- **Frontend Framework**: React 19
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **UI Primitives**: [Radix UI](https://www.radix-ui.com/) & [Base UI](https://base-ui.com/) (for accessible components)
- **Icons**: Lucide React
- **Animations**: Motion (formerly framer-motion)
- **AI Models**: 
  - `gemini-3-flash-preview` (Planning & Chat)
  - `gemini-3-pro-image-preview` (High-quality Image Generation)
- **PDF & Barcodes**: 
  - jsPDF (PDF generation)
  - jsBarcode (EAN-13 barcode generation)
- **Feedback & UX**: 
  - Sonner (Toast notifications)
  - Canvas Confetti (Celebration effects)
- **Persistence**: LocalStorage (for favorites and history)

## Getting Started

1. **API Key**: You will need a Google Gemini API key.
2. **Setup**:
   - Enter the child's name and a theme.
   - Use the Idea Assistant if you need inspiration.
3. **Generate**:
   - Click "Generate Book Plan" to create the scene descriptions.
   - Click "Generate All Images" to create the line art (requires your API key).
4. **Download**: Once all images are ready, click "Download PDF".

## Safety

This application implements Google's safety filters. You can adjust these in the "Advanced Settings" panel to suit your preferences.
