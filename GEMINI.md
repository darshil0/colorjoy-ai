# ColorJoy AI Technical Guidelines

This file provides technical instructions for the Gemini models powering ColorJoy AI.

## Model Selection
- **Planning & Chat**: Use `gemini-3-flash-preview` for fast, structured responses and interactive brainstorming.
- **Image Generation**: Use `gemini-3-pro-image-preview` for high-quality line art generation.

## Prompt Engineering for Line Art
When generating coloring pages, always include these keywords in the prompt:
- "thick black lines"
- "no shading"
- "no gradients"
- "pure white background"
- "high contrast"
- "simple bold shapes"
- "suitable for children's coloring book"

## Structured Planning (JSON Schema)
When planning a book, use the following response schema:
- `cover`: { `title`: string, `description`: string }
- `pages`: Array<{ `title`: string, `dominant_subject`: string, `description`: string, `difficulty_level`: "easy" | "medium" | "hard" }>

## Image Generation Parameters
- **Model**: `gemini-3-pro-image-preview`
- **Aspect Ratio**: `1:1`
- **Output**: Base64 inline data
- **Style Enforcement**: Always append "Children's coloring book style, thick black lines, no shading, no gradients, pure white background, high contrast, simple bold shapes" to the user's prompt.

## Grounding & Search
- Use `googleSearch` tool for the Idea Assistant to provide accurate real-world context for themes.

## Safety
- Adhere to `BLOCK_LOW_AND_ABOVE` for all safety categories by default.
- Allow users to adjust thresholds via the "Advanced Settings" panel (mapped 0-3 to `HarmBlockThreshold`).
