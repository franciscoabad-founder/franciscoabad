---
version: alpha
name: Ultramarine v5 · Stitch OS
description: System-driven design system for Francisco Abad's Growth OS — responsive PWA cockpit, dark-mode default, ultramarine + champagne two-accent rule.
colors:
  # Base palette
  ink: "#0E1738"
  royal: "#1A2B6B"
  ultramarine: "#3B4ED9"
  ultra-light: "#6B7AE8"
  champagne: "#B5985A"
  bronze: "#8A6F3D"
  linen: "#FAFAF7"
  slate-light: "#E8EAF0"
  slate-mid: "#6B7280"
  slate-dark: "#2D3748"
  charcoal: "#1A1A1A"
  white: "#FFFFFF"

  # Semantic mappings (Dark mode default)
  background: "#0E1738"
  bg-elevated: "#131F4A"
  bg-sunken: "#0A1029"
  surface-card: "#1A2B6B"
  surface-card-hover: "#21357E"
  text-primary: "#FFFFFF"
  text-secondary: "rgba(255, 255, 255, 0.64)"
  text-muted: "rgba(255, 255, 255, 0.40)"
  accent: "#3B4ED9"
  accent-hover: "#6B7AE8"
  metric: "#B5985A"
  metric-hover: "#8A6F3D"
  border-subtle: "rgba(255, 255, 255, 0.12)"
  border-strong: "rgba(255, 255, 255, 0.24)"
  border-accent: "#3B4ED9"

typography:
  display:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.02em
  h1:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.15
  h2:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.15
  h3:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.15
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  caption:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 300
    lineHeight: 1.5
  eyebrow:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.12em
  mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: 400
  metric:
    fontFamily: JetBrains Mono
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.0

rounded:
  button: 6px
  sm: 6px
  md: 10px
  card: 12px
  lg: 16px
  full: 999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  xxxl: 48px

components:
  button:
    borderRadius: "{rounded.button}"
    backgroundColor: "{colors.accent}"
    color: "{colors.white}"
    fontFamily: Montserrat
    fontWeight: 700
  card:
    borderRadius: "{rounded.card}"
    backgroundColor: "{colors.surface-card}"
    borderColor: "{colors.border-subtle}"
    borderWidth: 1px
  kpi-card:
    borderRadius: "{rounded.card}"
    backgroundColor: "{colors.bg-elevated}"
    borderColor: "{colors.border-subtle}"
    borderWidth: 1px
    metricColor: "{colors.metric}"
---

## Overview

Growth OS is a premium, system-driven operational space for Francisco Abad (Pancho), built under the **"Ultramarine v5 · Stitch"** design system. The system's purpose is to bring absolute clarity, focus, and tracking metrics to the founder's daily routines, pipeline, and knowledge base.

It ships as an **installable PWA** (manifest + service worker, scope `/os`) and is **responsive by design**: a phone-first cockpit with a fixed bottom navigation of 5 primary destinations (Hoy, Cerebro, CRM, Agenda, Finanzas) plus a "Mas" drawer for the full map, and a desktop/tablet cockpit with a command bar and left sidebar. The shared visual layer lives in `apps/web/src/styles/os.css` and is imported once by `OSLayout.astro`.

The interface prioritizes content substance, high contrast, and generous whitespace. **Dark mode is the default and standard** for the entire interface, creating an immersive cockpit environment with deliberate atmosphere: soft ultramarine glows, a faint grid field, a pulsing "mode" indicator, and selective glassmorphism on floating surfaces. 

The copy follows strict brand rules: written in first-person active Spanish, using precise data evidence, completely free of emojis, em dashes, and generic motivational clichés.

## Colors

The visual identity relies on a strict **Golden Two-Accent Rule (Regla de Oro)**:

1. **Ultramarine (`#3B4ED9`)**: The primary active accent color. Used for all general accents, active navigation states, call-to-actions (CTAs), links, primary buttons, borders, and input highlights. Hovers and active focused states lift to **Ultra-light (`#6B7AE8`)**.
2. **Champagne (`#B5985A`)**: The warm secondary accent color. Used **exclusively and solely for proof-numbers** (metrics, quantities, percentages, KPI values, and credential stats). It must never be used for buttons, links, or general highlights. Deeper/hover states use **Bronze (`#8A6F3D`)**.

### Color Tokens

- **Default Dark Theme**:
  - Background Ground (`--bg-base`): **Ink (`#0E1738`)**
  - Elevated Cards/Panels (`--surface-card`): **Royal (`#1A2B6B`)**
  - KPI Blocks (`--bg-elevated`): **`#131F4A`**
  - Sub-Sunken Areas (`--bg-sunken`): **`#0A1029`**
  - Footer & Muted Grounds: **Charcoal (`#1A1A1A`)**
  - Text Primary: **White (`#FFFFFF`)**
  - Text Secondary: Semi-transparent white (`rgba(255, 255, 255, 0.64)`)
  - Text Muted: Gray (`#6B7280` or `rgba(255, 255, 255, 0.40)`)
  - Border Subtle: Hairline 1px (`rgba(255, 255, 255, 0.12)`)
  - Border Strong: `rgba(255, 255, 255, 0.24)`

- **Light Theme** (used for document/proposal renders):
  - Background Ground (`--bg-base`): **Linen (`#FAFAF7`)**
  - Elevated Surfaces: **White (`#FFFFFF`)**
  - Text Primary: **Slate Dark (`#2D3748`)**
  - Text Secondary / Muted: **Slate Mid (`#6B7280`)**
  - Borders: **Slate Light (`#E8EAF0`)**
  - Primary Accent remains **Ultramarine (`#3B4ED9`)**; numbers stay **Bronze (`#8A6F3D`)** for readability on light.

## Typography

The typography system is structured, bold, and strictly sans-serif:
- **Headings & Display**: Montserrat (`"Montserrat", sans-serif`) is the primary display face (as the licensed Gotham font falls back to Montserrat). Weights range from Bold (700) to Black (900). Display headings use tight tracking (`-0.02em`).
- **Body & Controls**: Inter (`"Inter", sans-serif`) is the default sans-serif font. Set to Book (400) or Medium (500). Line height is relaxed (`1.6`) for optimal readability.
- **Data & Mono Elements**: JetBrains Mono (`"JetBrains Mono", monospace`) is used for metrics, tags, numbers, time readouts, checklist statuses, and developer components.

### Rules
- **No serif fonts** are permitted in the interface under any circumstances.
- **Eyebrow tags** must be uppercase, using Montserrat with wide letter-spacing (`0.12em`).
- **Sentence case** is the standard for all UI headings and copy. Avoid title-casing.

## Layout

The Growth OS layout is designed as a structured grid that gives priority to critical tasks first:
- **Container**: Max width of 1200px. Gutters are 24px (`1.5rem`) on mobile and 32px (`2rem`) on desktop.
- **Grid Systems**:
  - The dashboard uses a 2-column layout on desktop: priorities/wins in the left column, daily checklist/principles/habits in the right.
  - KPI metrics and cerebro nodes use a responsive CSS Grid with `repeat(auto-fill, minmax(195px, 1fr))` for a clean tile alignment.
- **Vertical spacing** is built on a 4px scale. Sections have generous padding to create breathing room, avoiding crowded boxes.

## Elevation & Depth

Growth OS layers flat editorial surfaces with deliberate, restrained atmosphere. Depth comes from tinted shadows, hairline borders, soft glows, and selective glass:
- **Surfaces**: Royal cards (`#1A2B6B`) overlay the Ink base (`#071132`); KPI/elevated blocks sit on `#131F4A`.
- **Outlines**: A 1px hairline border in `rgba(255, 255, 255, 0.12)` separates panels.
- **Atmosphere (Stitch)**: a single radial ultramarine glow at the top of the main canvas, a faint 36px grid field behind content, and a pulsing "mode" indicator. Used sparingly so they read as ambient light, not noise.
- **Glass**: floating surfaces (chat-with-brain panel, search bar, transaction rows, login card) may use `rgba(26,43,107,0.40)` + `backdrop-filter: blur(12px)` + a 1px hairline border.
- **Shadows**: Soft, smooth, and tinted with deep blue (never neutral gray):
  - Subtle components: `0 1px 2px rgba(14, 23, 56, 0.18)`
  - Cards & Main Panels: `0 6px 20px rgba(14, 23, 56, 0.28)`
  - Modals & Active Overlays: `0 18px 48px rgba(14, 23, 56, 0.40)`
  - Accent Shadows (CTAs/Active Items/FAB only): `0 8px 28px rgba(59, 78, 217, 0.36)`

## Motion & Atmosphere

Motion is purposeful and always low-amplitude:
- **Mode pulse**: the "OS / Maker Mode" indicator pulses opacity on a ~2.4s ease loop to signal the system is live.
- **Graph nodes**: cerebro nodes breathe with a slow `pulse-soft` (scale + opacity) loop.
- **Enter**: panels and pages use a short `fade-up` (14px, 0.5s) on mount.
- **Press**: interactive cards and the bottom-nav items scale to ~0.9 on `:active` for tactile feedback.
- **Icons**: Material Symbols Outlined is the icon system across nav, command bar, and content. Active bottom-nav items switch to the filled axis.

## Shapes

Shapes are restrained, geometric, and sharp to communicate executive seriousness:
- **Buttons & Input elements**: 6px corner radius (`--radius-button`).
- **Control elements (Checkboxes, inputs)**: 4px to 6px corner radius.
- **Card surfaces**: 12px corner radius (`--radius-card`).
- **KPI/metric blocks**: 10px or 12px corner radius.
- **Status pills**: 999px (pill shape), strictly reserved for small category tags.

## Components

The specific UI components of Growth OS are defined below:

### 1. Command Bar (Sticky Header)
- Height: 44px. Background: `#060C1E` (sunken).
- Border-bottom: 1px solid `rgba(59, 78, 217, 0.15)`.
- Left: Brand title `OS | Pancho` (uppercase, Montserrat, wide spacing).
- Center: Active day status pill (Maker/Manager/Off) and "One Domino" description.
- Right: Quick capture inputs ("Preguntar al cerebro...", "Capturar idea...") and active status dot (green glow).

### 2. Sidebar Navigation
- Width: 196px. Background: `#060C1E`.
- Nav items: Montserrat/Inter, 12.5px size. Left-aligned icons with 2px stroke width (using Lucide style).
- Active item state: Background `rgba(59,78,217,0.13)`, text `#E8EAF0`, left border `2px solid #3B4ED9`, icon color `#6B7AE8`.

### 3. One Domino Card
- The primary highlight of the screen. Background `#131F4A`.
- Features a thick 4px vertical border on the left side in Ultramarine (`#3B4ED9`) to draw immediate focus to the most critical task of the day.

### 4. KPI Metrics Grid (`OSKPIGrid`)
- Card backgrounds: `#131F4A` with 12px rounding and `rgba(232, 234, 240, 0.09)` borders.
- Eyebrows: Montserrat, 10px uppercase, muted text (`#6B7280`).
- Value readouts: Large display size in Montserrat (1.625rem), bold (700), in **Champagne (`#B5985A`)**.
- Trend arrows: Custom SVG lines indicating "up" (green/ultramarine) or "down" (red/champagne).

### 5. Task Checklist (`OSChecklist`)
- Task list items wrapped in individual clean buttons with 6px rounding.
- Uncompleted items: Background `rgba(232,234,240,0.04)`, text `#F4F6F8`, custom checkbox with 2px semi-transparent border.
- Completed items: Background `rgba(59,78,217,0.10)` (ultramarine tint), text `#6B7280` (muted with line-through), checkbox filled with `#3B4ED9` and a white check icon.

### 6. Maker/Manager Weekly Calendar
- A grid of 7 compact blocks showing the week days.
- Maker days have an active ultramarine tint background (`rgba(59,78,217,0.15)`) and bold ultramarine label. Manager days are muted with lower opacity.

### 7. Brain Graph Network (`OSGraphBrain`)
- An interactive knowledge visualizer using D3.js.
- Graph nodes represent notes or thoughts. Category node circles are color-coded based on knowledge tags (using a clean range of blues and golds), connected by thin, low-contrast linking lines on the dark blue canvas.

### 8. Bottom Navigation (mobile / PWA)
- Fixed bar, height 72px + safe-area inset, background `#060C1E`, 1px top border, blue-tinted top shadow.
- Five primary destinations with Material Symbols icons and 9px Montserrat labels: Hoy, Cerebro, CRM, Agenda, Finanzas. A sixth "Mas" button opens the full-map drawer.
- Active item: ultra-light (`#6B7AE8`) with the icon switched to the filled axis. Press scales to 0.9.

### 9. Floating Action Button (FAB)
- 56px circle, Ultramarine fill, white Material Symbol, accent shadow `0 8px 28px rgba(59,78,217,0.36)`.
- Sits above the bottom-nav on mobile (`bottom: 72px + 1rem + safe-area`) and bottom-right on desktop. Reserved for the primary create action on a screen (e.g. add lead).

### 10. Glass Panel (`.os-glass`)
- `rgba(26,43,107,0.40)` + `backdrop-filter: blur(12px)` + 1px hairline border, 12px radius. For floating/overlay surfaces only, never for the base content grid.

### 11. MAKER MODE Indicator
- A small inline cluster: a pulsing `bolt` Material Symbol + an uppercase Montserrat label (`OS`, `Maker Mode`, `Manager Mode`) in ultra-light. Lives in the command bar (desktop) and mobile top bar. This is the one sanctioned "live status" flourish.

## Do's and Don'ts

### Do's
- **Do** write in first-person active Spanish: *"revisé", "completé", "planifiqué"*.
- **Do** keep the dominant background dark blue (`#0E1738`) and cards deep royal blue (`#1A2B6B`).
- **Do** use Ultramarine (`#3B4ED9`) for buttons, active items, links, and borders.
- **Do** restrict Champagne (`#B5985A`) strictly to numbers and metrics.
- **Do** separate items in lists or inline text using middots "·" instead of em dashes.
- **Do** format numbers with Ecuadorian/European separators (`+32.000`, `$10.000M`).

### Don'ts
- **Don't** use emojis anywhere in the interface.
- **Don't** use em dashes.
- **Don't** use any terracotta, brick-red, or "Ember" colors (the old system is deprecated).
- **Don't** use serifs or scripts.
- **Don't** overuse atmosphere: glows, grid field, and glass are ambient accents, not the main surface. One glow per canvas, glass only on floating surfaces, never colored light spots competing with content.
- **Don't** wrap button labels into multiple lines; keep text short and single-line.
- **Don't** use vague motivational text or buzzwords (e.g., "organización inteligente", "sinergia", "disruptivo").
- **Don't** scatter multiple floating capsule pills above a headline. The single MAKER MODE indicator is the only sanctioned status flourish.
- **Don't** use champagne for anything but numbers, metrics, and credentials. Accents and CTAs stay ultramarine.
