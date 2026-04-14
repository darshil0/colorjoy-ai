# ColorJoy AI 🎨

ColorJoy AI is a personalized children's coloring book generator powered by Google Gemini. It allows parents and educators to create custom, high-quality coloring books tailored to a child's specific interests and imagination.

## Project Vision

> "I want to build a web app that lets parents create personalized coloring books for their kids using AI. A user should be able to enter their child's name and any creative theme they can think of, like 'dinosaurs exploring underwater cities'.
>
> The app needs to use Google Gemini to first plan out a 5-page book and then generate the actual black-and-white line art images. Make sure the art style is simple with thick lines, perfect for kids to color. I'd also like a small brainstorming assistant on the page to help users come up with ideas if they're stuck.
>
> Once the pages are generated, the app should bundle them all into a single, print-ready PDF. This PDF needs a custom cover with the kid's name, and for a fun touch, a professional-looking back cover with a fake barcode to feel like a real book. Please add a feature to save favorite themes for next time, and a confetti celebration effect when the book is ready to be downloaded."

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

## Tech Stack

- **Language**: TypeScript
- **Frontend Framework**: React 19
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **UI Primitives**: [Radix UI](https://www.radix-ui.com/) & [Base UI](https://base-ui.com/)
- **Icons**: Lucide React
- **Animations**: Motion
- **AI Models**: 
  - `gemini-3-flash-preview` (Planning & Chat)
  - `gemini-3-pro-image-preview` (Image Generation)
- **PDF & Barcodes**: 
  - jsPDF (PDF generation)
  - JsBarcode (Barcode generation)
- **Feedback & UX**: 
  - Sonner (Toast notifications)
  - Canvas Confetti (Celebration effects)
- **Persistence**: LocalStorage

## Getting Started

1. **API Key**: Ensure your Gemini API key is configured in the environment.
2. **Setup**:
   - Enter the child's name and a creative theme.
   - Use the **Idea Assistant** in the sidebar if you need inspiration.
3. **Generate**:
   - Click **"Generate Book Plan"** to create the scene descriptions.
   - Click **"Generate All Images"** to create the line art.
4. **Download**: Once all images are ready, click **"Download PDF"** to get your print-ready coloring book.

## Local Development

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```

## Project Structure

The project follows a modular architecture for better maintainability:

- **`src/services/`**: Core logic for Gemini AI and PDF generation.
- **`src/hooks/`**: Custom React hooks for state management (e.g., favorites).
- **`src/types/`**: Centralized TypeScript definitions.
- **`src/components/ui/`**: Reusable UI components built with Radix UI, Base UI, and Tailwind CSS.
- **`AGENTS.md`**: Defines the AI Agent's personality and instructions.
- **`GEMINI.md`**: Technical guidelines and prompt engineering rules for the AI models.

## Safety

This application implements Google's safety filters. You can adjust these in the "Advanced Settings" panel to suit your preferences.
