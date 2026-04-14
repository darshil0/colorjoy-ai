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

## Function Calling
- Use the `create_page_metadata` function to return structured plans for the 5-page coloring books.
- Ensure the `difficulty_level` is varied across the 5 pages (e.g., 2 easy, 2 medium, 1 hard).

## Safety
- Adhere to `BLOCK_LOW_AND_ABOVE` for all safety categories by default.
- Always validate that generated themes are child-appropriate.
