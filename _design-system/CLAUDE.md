# Francisco Abad · Ultramarine v5 — reglas que SIEMPRE se aplican

Este proyecto es el design system de la marca personal de Francisco Abad. Antes de diseñar o escribir cualquier cosa, lee `readme.md` y `SKILL.md`. Estas reglas son obligatorias en todo output (web, slides, propuestas, mocks, copy).

## Voz y copy (no negociable)
- Español por defecto, primera persona activa (construí, diseñé, operé). Ejecutivo con calidez.
- **NUNCA em dashes (—). Jamás.** Usa punto, coma, dos puntos o el middot " · ". Reescribe si hace falta.
- **Nunca el patrón "no es X, es Y".** Dilo en afirmativo.
- Sin emoji. Sin buzzwords (sinergia, disruptivo, "innovador" de muletilla, "inteligente"). Sin clichés motivacionales. Sin voz pasiva.
- Lidera con pruebas y frameworks, no con adjetivos.

## Color (REGLA DE ORO)
- Ultramarine `#3B4ED9` para TODO acento general: CTAs, links, títulos de acento, hovers.
- Champagne `#B5985A` SOLO para números que prueban algo (métricas, KPIs, credenciales). Nunca en CTAs ni acentos.
- Dark (Ink `#0E1738` / Royal `#1A2B6B`) es el modo por defecto. Nunca terracotta ni colores Ember.

## Tipografía
- Gotham (fallback Montserrat). **Nunca serifas.** Black 900 impacto y números hero, Bold 700 títulos, Medium 500 labels, Book 400 cuerpo.

## Anti AI-slop (nunca hagas esto)
- Nada de eyebrows en píldora con borde flotando sobre títulos grandes. El titular manda; si necesitas etiqueta, úsala anclada a un filete fino en versalitas.
- Nada de glows radiales ni "luces" difusas detrás de heros o secciones.
- Nada de marcos decorativos ni bordes sin función ("lazy borders"). Sin gradientes morados.
- Los botones nunca parten en dos líneas (labels cortos, `white-space: nowrap`).
- Donde tientes una tagline decorativa, pon una credencial o métrica real (números en champagne).
- Una sola lógica de color en el titular: blanco editorial, o una palabra de acento deliberada. Nunca arcoíris.
- Números grandes como protagonistas, no flechas ni símbolos gigantes que parezcan dashes.

## Cómo trabajar aquí
- Construye con los tokens (`var(--...)`), nunca hex ni px crudos.
- Usa los componentes (`components/`) antes de inventar primitivas. `MetricStat` para cualquier número de prueba.
- Copia assets a HTML estático para artefactos; lee `ui_kits/website` para replicar patrones de la marca.
