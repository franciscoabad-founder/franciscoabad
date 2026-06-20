---
name: franciscoabad-design
description: Use this skill to generate well-branded interfaces and assets for Francisco Abad (personal brand, "Ultramarine v5"), either for production or throwaway prototypes/mocks/decks. Contains essential design guidelines, colors, type, Gotham fonts, assets, and UI kit components for prototyping. Editorial, premium, dark-by-default, ultramarine blue with champagne reserved for numbers.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files (tokens, components, ui_kits, guidelines, assets).

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out and create static HTML files for the user to view. If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without other guidance, ask what they want to build, ask a few questions, and act as an expert designer who outputs HTML artifacts **or** production code depending on the need.

## Non-negotiables for this brand
- **Two-accent rule:** Ultramarine `#3B4ED9` for every general accent (CTAs, links, accent titles). Champagne `#B5985A` **only** for numbers that prove something (metrics, KPIs, credentials). Never terracotta/Ember.
- **Dark mode is the default.** Ink `#0E1738` ground, Royal `#1A2B6B` cards.
- **Type:** Gotham (fallback Montserrat). **Never serifs.** Black 900 impact, Bold 700 titles, Medium 500 labels, Book 400 body.
- **Voice:** Spanish, first person, executive with warmth. **Never em dashes. Never "no es X, es Y". No emoji. No buzzwords.**
- **Logo:** "ABAD" Black protagonist + "FRANCISCO" ExtraLight whisper. Buttons radius 6px.

## Anti-slop (never)
- No floating eyebrow pills above big titles. Lead with the headline; if a label is needed, use a hairline + small caps, never a bordered capsule.
- No decorative glows / "random lights", no blurred light blobs behind heroes.
- No decorative offset frames or function-less borders. No purple gradients.
- Buttons never wrap to two lines (`white-space: nowrap`, short labels).
- Replace decorative taglines with real proof: a credential line or champagne metric.

## Files
- `styles.css` · link this; it pulls all tokens + Gotham `@font-face`.
- `tokens/` · color, type, spacing CSS variables.
- `components/` · React primitives (Button, Badge, Card, Logo, SectionHeading, MetricStat, Input).
- `ui_kits/website/` · full personal-brand site recreation to copy patterns from.
- `guidelines/` · specimen cards.
- `assets/` · Gotham fonts, portraits, logos, partner logos.
