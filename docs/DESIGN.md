# Design Specification & Anti-AI Aesthetic Guide

## 1. Design Philosophy
- **Emotion & Tone**: Absolute clinical trust, calm reassurance, and rapid situational clarity.
- **Anti-AI Wrapper Aesthetic**: Strictly avoid stereotypical "AI wrapper" aesthetics: NO generic purple/violet gradients, NO glowing neon borders, NO floating robotic avatars, and NO generic sparkling emoji. The UI must look like an enterprise-grade medical workstation deployed in a world-class hospital.

## 2. Color Tokens & Palette

| Token Name | Hex Code | Purpose / Usage | Tailwind Class |
|---|---|---|---|
| **bg-canvas** | `#0B0F17` (Dark) / `#F8FAFC` (Light) | Application background canvas | `bg-slate-950` / `bg-slate-50` |
| **surface-card** | `#111827` (Dark) / `#FFFFFF` (Light) | Primary interactive cards & panels | `bg-slate-900` / `bg-white` |
| **surface-muted** | `#1E293B` (Dark) / `#F1F5F9` (Light) | Sub-panels, code blocks, borders | `bg-slate-800` / `bg-slate-100` |
| **text-primary** | `#F8FAFC` (Dark) / `#0F172A` (Light) | Main headings and high-contrast text | `text-slate-100` / `text-slate-900` |
| **text-secondary** | `#94A3B8` (Dark) / `#475569` (Light) | Subtitles, labels, timestamps | `text-slate-400` / `text-slate-600` |
| **trust-500** | `#0284C7` / `#2C5F7C` | Primary action buttons, active navigation tabs | `bg-sky-600` / `bg-[#2C5F7C]` |
| **emerald-500** | `#10B981` / `#3A8F5B` | Confirmed safe, approved safety audit, vitals normal | `bg-emerald-600` / `text-emerald-500` |
| **alert-500** | `#EF4444` / `#C24242` | **RESERVED STRICTLY** for drug conflicts, critical vitals | `bg-rose-600` / `text-rose-500` |
| **warning-500** | `#F59E0B` | Pending safety review, moderate warnings | `bg-amber-500` / `text-amber-500` |
| **mono-data** | `#38BDF8` / `#111827` | Clinical codes, ICD-10, RxNorm, FHIR payload | `font-mono text-sky-400` |

## 3. Typography Scale
- **UI Font**: Humanist, modern sans-serif (`Geist Sans` / `Inter`).
- **Clinical & Data Font**: Tabular monospace (`Geist Mono` / `JetBrains Mono`) for LOINC, ICD-10 codes, lab values, and FHIR JSON.

| Level | Size | Line Height | Weight | Tailwind Class |
|---|---|---|---|---|
| **Display / Title** | 24px (1.5rem) | 1.25 | SemiBold (600) | `text-2xl font-semibold tracking-tight` |
| **Heading 1 / Pane Title** | 18px (1.125rem) | 1.35 | Medium (500) | `text-lg font-medium` |
| **Heading 2 / Section** | 14px (0.875rem) | 1.4 | Medium (500) | `text-sm font-medium uppercase tracking-wider` |
| **Body UI** | 14px (0.875rem) | 1.5 | Normal (400) | `text-sm leading-normal` |
| **Patient Reading Level** | 15px (0.9375rem) | 1.65 | Normal (400) | `text-base leading-relaxed` |
| **Clinical Code / Mono** | 12px (0.75rem) | 1.5 | Mono (400/500) | `font-mono text-xs` |

## 4. Spacing & Radius System
- **Base Grid**: 4px / 8px incremental scale (`p-2`, `p-4`, `p-6`, `gap-3`, `gap-4`).
- **Border Radius**:
  - Small pills & badges: `rounded-full` or `rounded-md` (6px)
  - Cards & panels: `rounded-xl` (12px)
  - Modals & dialogs: `rounded-2xl` (16px)
- **Borders**: Crisp, hairline borders (`border border-slate-800` in dark mode, `border-slate-200` in light mode) without heavy drop-shadows.

## 5. Component Hierarchy
1. **TopBar**:
   - Platform brand badge, live connection status, Clinical Decision Support alert, Dual-Persona switcher, and FHIR export trigger.
2. **SplitScreenLayout**:
   - Responsive two-column container: Left 45% (Input/Controls), Right 55% (Agent Chain + Output Canvas).
3. **DemoPresetPills**:
   - 1-Click quick pills for Scenario A (ER Triage), Scenario B (Drug Conflict), Scenario C (Discharge Summary).
4. **InputCanvas**:
   - Ingestion mode selector (Text Notes, File Dropzone, Audio Transcript), editable text area, and patient demographics bar.
5. **ThoughtChainStepper**:
   - Animated glassbox step tracker showing real-time agent verification with micro-status indicators.
6. **DynamicOutputCanvas**:
   - Dual-Persona rendering: SOAP format in Clinician View vs. Simplified visual card schedule in Patient View.
7. **FhirExportModal**:
   - Accessible clinical dialog with JSON syntax styling, copy-to-clipboard, and download button.
8. **StatusBar**:
   - Bottom bar with LLM model info, inference latency, agent deliberation round, and compliance disclaimer.

## 6. Micro-Interactions Table
| Trigger | Animation | Duration | Easing |
|---|---|---|---|
| **Scenario Pill Click** | Scale down bounce + background tint pulse | 150ms | `ease-out` |
| **Pipeline Step Start** | Left-to-right fade slide (`x: -8px` to `0`) | 250ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| **Adversarial Conflict Detected** | Subtle red border pulse + risk score count-up | 400ms | `ease-in-out` |
| **Persona Toggle Switch** | Smooth tab slide transition with cross-fade | 200ms | `ease-out` |
| **FHIR Modal Open** | Backdrop blur fade-in + modal spring scale | 250ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` |

## 7. Anti-Patterns Checklist
- [x] **NO** purple-on-black AI gradients.
- [x] **NO** bouncing robot emojis or "magic sparkle" icons.
- [x] **NO** blocking spinners that hide the agent's reasoning process.
- [x] **NO** unformatted walls of text without clinical hierarchy.
- [x] **NO** alert red used for decorative purposes (red `#C24242` is reserved strictly for contraindications and severe drug interactions).
