# Francisco Abad · Ultramarine v5 Design System

The personal-brand design system for **Francisco Abad**: emprendedor, innovador y builder-strategist ecuatoriano. The brand voice and proof: *"Vuelvo alcanzable lo imposible. Con resultados que se miden. Construyo desde adentro, codo a codo."*

This system powers his website, newsletter ("Desde Adentro"), decks, proposals and social. It sits **on top of** his three engines · **BrainTech** (AI-native business transformation), **CODEIS / ELAB** (entrepreneurship + social impact), and **taskr** (networking OS) · and integrates them under one editorial, premium identity.

> **Palette status:** This is **Ultramarine v5**. The previous **"Ember" / terracotta** system is *derogated* · never use terracotta. The attached codebase still ships Ember; we rebuilt against the v5 briefs.

---

## Sources used to build this system

Nothing below is bundled here; it is recorded so a future maintainer can go deeper if they have access.

- **Brand briefs** (source of truth, `uploads/`): `00_brief_de_marca.md`, `01_identidad_posicionamiento.md`, `02_marca_visual.md`, `03_voz_y_tono.md`, `04_audiencia_oferta_pruebas.md`, `05_contenido_canales.md`.
- **Live codebase** (read-only mount `franciscoabad/`): the React + Vite + Tailwind marketing site (still on Ember). Used for page structure, real copy, institutional logos and photography. Public repo: **github.com/franciscoabad-founder/franciscoabad** · explore it to mirror the real site structure and copy more faithfully.
- **Fonts:** licensed **Gotham** family (`uploads/Gotham*.ttf/.otf`), copied into `assets/fonts/`.
- **Photography & logos:** copied from the codebase `public/` into `assets/`.

---

## CONTENT FUNDAMENTALS · how the brand writes

**Language.** Spanish by default; English only when the material requires it. First person, active: *"construí", "diseñé", "negocié", "operé", "aprendí"*. Never impersonal or passive.

**Voice.** A practitioner who also thinks deeply, never the reverse. Direct and substantive, executive with warmth, confident without arrogance. Authority comes from real track record (IESS, CODEIS, BrainTech), not ego.

**Hard rules (non-negotiable):**
- **Never use em dashes.** Use a period, comma, colon, the middot "·", or rewrite.
- **Never the "no es X, es Y" pattern** (negation then affirmation). State it affirmatively.
- **No emoji.** Not part of the brand.
- **No motivational clichés, no buzzwords.** Banned words: "inteligente" / "organización inteligente", "sinergia", "disruptivo", "innovador" as filler.
- Lead with frameworks and systems thinking. Show the process, not only the polished result.

**Casing.** Sentence case for body and most headlines. UPPERCASE only for eyebrows, nav labels and small tags (with wide tracking). Numbers always use locale separators (`+18.000`, `$10.000M`).

**Signature lines (confirmed · do not invent new ones):**
- Hero: *Vuelvo alcanzable lo imposible.*
- Proof: *Con resultados que se miden.*
- Method: *Construyo desde adentro, codo a codo.*
- Thesis: *El cuello de botella de la IA es el diagnóstico operativo, no la tecnología.*
- *Pruébalo en ti primero.*

**Proof bank (use exactly, never inflate):** IESS · Director General jun–dic 2025, +32.000 empleados, +USD 10.000M, eficiencia operativa del 36 al 78 % en seis meses. CODEIS · fundador, +18.000 emprendedores en +15 países, red de 250–400 mentores. MPA por la LSE. (Full bank in `04_audiencia_oferta_pruebas.md`.)

---

## VISUAL FOUNDATIONS

**Direction.** Editorial, deep, premium. Ultramarine blue is the dominant *territory*; champagne is a reserved note of prestige. Geometric sans, intellectual and restrained. **Dark mode is the default** for everything public and premium.

**Color · the two-accent REGLA DE ORO.**
- **Ultramarine `#3B4ED9`** is *every* general accent: CTAs, links, accent titles, highlights, focus rings, hovers tinted from it. Hover lifts to **Ultra-light `#6B7AE8`**.
- **Champagne `#B5985A`** is **exclusively for numbers that prove something**: metrics, KPIs, academic/institutional credentials. Never a CTA, never a general accent. Hover/deeper = **Bronze `#8A6F3D`**.
- Grounds: **Ink `#0E1738`** (base, hero, slides), **Royal `#1A2B6B`** (elevated cards), Sunken `#0A1029`, Charcoal `#1A1A1A` (footer).
- Light mode: **Linen `#FAFAF7`** ground, white cards, slate text ramp (`#2D3748` / `#6B7280`), `#E8EAF0` borders. Accent stays Ultramarine.

**Typography.** **Gotham** (fallback Montserrat, then system sans). **Never serifs** · serifs change the archetype. Weight ladder: **Black 900** impact + hero numbers · **Bold 700** headlines · **Medium 500** labels/eyebrows · **Book 400** body · **Light 300** captions · **XLight 200 / Thin 100** reserved for the "FRANCISCO" whisper in the wordmark. Large display headings use tight tracking (`-0.02em`); eyebrows use `0.12em` uppercase. Body is 16px / 1.6.

**Logo / wordmark.** Typographic: **FRANCISCO** whispers (ExtraLight, wide tracking, muted) and **ABAD** dominates (Black). ABAD takes the accent color · Ultramarine on dark, Royal on light. Built from live Gotham type (see `Logo` component), so it recolors cleanly. ABAD is ~25 % larger horizontally, ~2.5× stacked. Never redraw it by hand at the wrong proportions.

**Backgrounds.** Solid deep-blue grounds, not gradients. The one permitted glow: a soft radial Ultramarine bloom behind the hero (low opacity, blurred). No textures, no patterns, no photographic full-bleed backgrounds. Imagery is editorial portrait photography (warm-lit, premium), framed in rounded cards with a thin offset accent rule.

**Corner radii.** Restrained, not playful. Buttons **6px** (brand spec). Cards **12px**. Large surfaces / images 16px. Pills 999px for small tag chips only.

**Borders.** Hairline 1px. On dark: `rgba(255,255,255,0.12)`; accent borders in Ultramarine. On light: `#E8EAF0`. Cards default to a subtle border and lift to an Ultramarine border on hover.

**Shadows.** Soft and **deep-blue tinted** (never neutral gray): `sm` for subtle lift, `md` for cards, `lg` for modals and the hero image. CTAs carry a dedicated Ultramarine glow (`--shadow-accent`) · the only colored shadow.

**Motion.** Editorial and calm. Reveal on scroll = fade + 30px rise over ~600ms with `cubic-bezier(0.16,1,0.3,1)`. Interaction transitions are 160ms. No bounces, no springy overshoot, no infinite decorative loops.

**Hover / press.** Primary buttons darken-to-lighten (Ultramarine → Ultra-light). Secondary/ghost fill with an Ultramarine tint or brighten text. Links go Ultra-light → white on dark. Cards lift 2px. Press states stay subtle (no aggressive shrink).

**Transparency & blur.** Used sparingly: the sticky nav blurs to `rgba(10,16,41,0.82)` after scroll; tints (`--ultramarine-12/24`) for chips, focus rings and ghost-button fills. No glassmorphism elsewhere.

**Layout.** 1200px max container, 24/32px gutters, generous section padding (`clamp(3rem,8vw,7.5rem)`). 4px spacing base. Whitespace is part of the premium feel · do not crowd.

**Anti-slop guardrails (hard rules, learned from review).** Editorial and substantive, so decoration that screams "AI generated" is banned:
- **No floating eyebrow pills.** Do not stack a small uppercase bordered-pill label above a big headline. Lead with the headline. If a label is truly needed, anchor it to a 1px hairline in small caps, never a capsule.
- **No decorative glows or "random lights."** No radial blooms or blurred light blobs behind heroes/sections. The only light is real photography. (The hero originally shipped a glow; it was removed.)
- **No decorative frames or function-less ("lazy") borders.** No offset diagonal rule behind the photo.
- **Buttons never wrap to two lines.** Short labels, `white-space: nowrap`.
- **Proof over ornament.** Replace decorative taglines with a real credential or metric. The approved hero direction is **"Editorial puro"**: headline first, then a single credential line (`Ex Director General del IESS · +32.000 personas · $10.000M administrados · Fundador de CODEIS`) with numbers in champagne.
- **One headline color logic.** Fully white headline (editorial) or a single deliberate accent word, never a rainbow. No purple gradients ever.

---

## ICONOGRAPHY

The codebase uses **Lucide** (`lucide-react`) · thin, consistent 1.5–2px stroke line icons (e.g. `Menu`, `X`, `Linkedin`, `Instagram`, `Youtube`, `Mail`). That is the brand's icon system.

- **For HTML/static artifacts**, load Lucide from CDN: `<script src="https://unpkg.com/lucide@latest"></script>` then `lucide.createIcons()`, or use the SVG sprite. Keep stroke width consistent and color icons with `currentColor` so they pick up Ultramarine or text tokens.
- **No emoji**, ever. **No unicode glyphs as icons.** Inline list bullets use a small middot "·" in the accent color (matching the no-em-dash voice rule), not custom SVG marks.
- Institutional/partner logos (LSE, Georgetown, UPenn, IESS, CODEIS, BID Lab, Hult Prize, One Young World) live in `assets/logos-institucionales/` and render at near-full color on the light "Trayectoria" band. Do not recolor third-party logos.
- Icons are functional, not decorative. Don't add icon-laden "feature cards" · it reads as slop and is off-brand.

---

## INDEX · what's in this system

**Foundations**
- `styles.css` · the single entry point consumers link. `@import`s only.
- `tokens/colors.css` · `tokens/typography.css` · `tokens/spacing.css` · `tokens/fonts.css` (Gotham `@font-face`).
- `guidelines/*.card.html` · foundation specimen cards (Colors, Type, Spacing, Brand) shown in the Design System tab.

**Components** (`components/`, exposed on `window.FranciscoAbadUltramarineDesignSystem_a2998e`)
- `core/` · **Button**, **Badge**, **Card**, **Logo** (wordmark), **SectionHeading**
- `data/` · **MetricStat** (the champagne proof-number · the signature data element)
- `forms/` · **Input**
- Each has `.jsx` + `.d.ts` + `.prompt.md`; each directory has one `@dsCard` card HTML.

**UI kits** (`ui_kits/`)
- `website/` · `franciscoabad.com` recreation in Ultramarine v5. Four clickable views (Home, Sobre mí, Trabaja conmigo, Contacto) composed from the primitives. Entry: `ui_kits/website/index.html`.

**Assets** (`assets/`)
- `fonts/` Gotham · `images/` portraits · `logos/` wordmark + favicon · `logos-institucionales/` partner logos.

**`SKILL.md`** · Agent-Skill-compatible entry so this system can be downloaded and used in Claude Code.

---

## Quickstart for designers

1. Link the tokens: `<link rel="stylesheet" href="styles.css">`. Dark mode is default; add `class="theme-light"` to a container for light surfaces.
2. Build with the CSS variables (`var(--accent)`, `var(--surface-card)`, `var(--fs-h2)`…), never hardcoded hex.
3. Reach for the components before hand-rolling. Use `MetricStat` for any number that proves something · and keep champagne **only** there.
4. Write in the brand voice: Spanish, first person, no em dashes, no "no es X, es Y", no emoji.
