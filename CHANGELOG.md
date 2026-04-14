# Changelog

All notable changes to this project will be documented in this file.

## [1.5.2] - 2026-04-14

### Changed
- **README Reorganization**: Restructured `README.md` to follow a more logical flow (Vision -> Features -> Tech Stack -> Usage -> Setup -> Architecture).

## [1.5.1] - 2026-04-14

### Added
- **Enhanced PDF Service**: Implemented a professional back cover with dynamic barcode generation (using `jsbarcode`) and random ISBN assignment.
- **Page Numbering**: Added "Page X of Y" footers to all generated coloring pages in the PDF.

### Fixed
- **Documentation Consistency**: Updated `README.md` to accurately reflect the tech stack (Radix UI + Base UI) and implemented features. Added local development instructions and improved formatting.

## [1.5.0] - 2026-04-14

### Added
- **Complete UI Component Library**: Implemented and refined all necessary UI components including `Button`, `Input`, `Label`, `Card`, `Tabs`, `Badge`, `Slider`, `Switch`, `Progress`, `Accordion`, and more.
- **Service Layer Completion**: Fully implemented `pdfService.ts` for PDF generation and `useFavorites.ts` for local storage management.
- **Type Centralization**: Created `src/types/index.ts` to centralize all TypeScript interfaces and enums.

### Fixed
- **UI Component Refinement**: Updated `Badge`, `Slider`, and other components to use `forwardRef` to resolve TypeScript errors and improve compatibility.
- **Gemini SDK Integration**: Corrected the mapping of `tools` and `systemInstruction` in `geminiService.ts` to align with the latest `@google/genai` SDK requirements.
- **Safety Slider Mapping**: Fixed the mapping between slider values and `HarmBlockThreshold` enums for accurate parental controls.

### Changed
- **Build & Lint Verification**: Performed a full codebase audit using `lint_applet` and `compile_applet` to ensure production readiness.

## [1.4.3] - 2026-04-14

### Changed
- **Documentation Overhaul**: Updated `README.md` with a comprehensive tech stack, detailed project structure, and missing feature descriptions.

## [1.4.2] - 2026-04-14

### Fixed
- **Hydration & Nesting Errors**: Resolved React hydration warnings and "button cannot be a descendant of button" errors by correctly implementing the `render` prop pattern for Base UI components.
- **State Mutation Stability**: Fixed bugs in `App.tsx` where state was being mutated directly. Refactored image generation logic to use functional state updates for improved reliability.
- **Error Handling**: Improved error reporting in `geminiService.ts` to provide clearer feedback when API keys are missing or services are unavailable.

## [1.4.1] - 2026-04-14

### Added
- **AI Technical Guidelines**: Created `GEMINI.md` to provide structured technical instructions and prompt engineering rules for the AI models.
- **Enhanced Agent Persona**: Updated `AGENTS.md` with more detailed brainstorming examples and educational focus.

## [1.4.0] - 2026-04-14

### Added
- **AI Agent Persona**: Created `AGENTS.md` to establish a dedicated persona for the ColorJoy AI Agent.
- **Modular Architecture**: Reworked the project structure into `services`, `hooks`, and `types` directories.
- **Custom Hooks**: Extracted favorites logic into a reusable `useFavorites` hook.
- **Service Layer**: Decoupled AI and PDF logic into dedicated service files.

### Changed
- **Refactored App.tsx**: Significantly cleaned up the main application component by delegating logic to hooks and services.

## [1.3.0] - 2026-04-14

### Added
- **Favorites System**: Users can now save their favorite themes and child names to `localStorage`.
- **Saved Themes Dropdown**: A new history menu in the header allows for quick loading and management of saved configurations.

## [1.2.0] - 2026-04-14

### Added
- **Professional Back Cover**: Added a final page to the PDF with a "Thanks for Coloring" message.
- **Unique Barcode & ISBN**: Integrated `jsbarcode` to generate unique EAN-13 barcodes and valid mock ISBN-13 numbers for each book.

## [1.1.0] - 2026-04-14

### Added
- **Progress Stepper**: Visual workflow tracker showing Brainstorming, Sketching, Upscaling, and Binding stages.
- **Function Calling**: Implemented `create_page_metadata` for structured book planning.
- **Google Search Grounding**: Added a toggleable search feature to the Idea Assistant.
- **Safety Sliders**: Parental control panel for adjusting AI safety thresholds.
- **Page Numbering**: Added "Page X of Y" numbering to the bottom of all PDF pages.
- **Skeleton States**: Added loading skeletons for a smoother generation experience.
- **Toast Notifications**: Integrated `sonner` for real-time user feedback.
- **Documentation**: Added README.md and CHANGELOG.md.

### Changed
- **System Instructions**: Decoupled core coloring book rules from user prompts into model system instructions.
- **UI Refinement**: Updated to a more polished shadcn/ui based design with an orange accent theme.
- **PDF Layout**: Improved A4 formatting with consistent borders and titles.

## [1.0.0] - 2026-04-14

### Added
- Initial release of ColorJoy AI.
- Core theme and name input functionality.
- 5-page coloring book generation.
- Basic PDF export using jsPDF.
- Gemini 3 integration for text and image generation.
- Basic chat assistant for theme ideas.
