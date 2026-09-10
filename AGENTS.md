<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Hackathon Agent Operating Instructions
- Always read `/docs/PRD.md` before implementing a feature — do not invent requirements.
- Follow `/docs/DESIGN.md` tokens exactly. Never introduce a new color or font not listed there.
- Use `src/data/mockData.ts` as fallback data if any live API call fails during a demo — NEVER show a raw error screen.
- The 5 Must-Win Features are strictly maintained:
  1. Universal Split-Screen Layout
  2. Live Agent Thought-Chain Stepper
  3. Dual-Persona View Toggle (Clinician vs. Patient)
  4. FHIR R4 JSON Export Modal
  5. 1-Click Preset Scenario Buttons
