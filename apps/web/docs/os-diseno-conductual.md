# OS Conductual: canon de diseño por módulo

Sistema de diseño del OS donde cada módulo usa color, tipografía y densidad para INDUCIR el
comportamiento que ese módulo persigue. No es un tema visual único: es diseño conductual.
Base científica: loss aversion (Kahneman), streak salience (Duolingo, 600+ experimentos),
recompensa inmediata visible (Fabulous/Fogg), fricción selectiva (Thaler).

Arquetipos del sistema brutalista (nunca mezclar dos arquetipos en un mismo módulo):
- **Telemetría Táctica** (dark CRT): monospace dominante, fondo #0A0A0A, fósforo #EAEAEA,
  rojo hazard #FF2A2A, verde terminal #4AF626 para UN solo elemento. Sin border-radius,
  sin gradientes, sin sombras suaves. Marcos ASCII, líneas de 1px, scanlines sutiles.
- **Print Industrial Suizo** (light): papel #F4F4F0, tinta #0A0A0A, rojo aviación como único
  acento. Sans black gigante + mono para datos.

## Mapa conductual por módulo

| Módulo | Comportamiento a inducir | Arquetipo | Uso del color |
|---|---|---|---|
| Hábitos / Juego | EJECUTAR hoy, no romper la cadena | Telemetría Táctica | Rojo hazard SOLO para racha en riesgo y "no falles dos veces" (loss aversion visible); verde terminal SOLO para día perfecto; todo lo demás fósforo/gris. El rojo debe doler. |
| Finanzas (futuro) | Honestidad con los números, fricción al gasto | Print Suizo (libro contable) | Rojo aviación exclusivo para deuda y sobregasto; tinta negra para todo lo demás. Ningún verde motivacional: los números buenos se muestran sobrios (la calma es la recompensa). |
| Entreno (futuro) | Intensidad, empezar YA | Telemetría Táctica variante ámbar #FFB000 | Ámbar como energía de sesión activa; rojo solo para fallo de serie. |
| Comidas (futuro) | Registro sin culpa, precisión | Print Suizo claro | Datos en mono, sin colores de juicio moral sobre la comida. |
| Resto del OS | (marca personal) | Ultramarine v5 actual | Sin cambios. |

## Reglas de implementación

1. Tokens por módulo con scope de data-attribute: `[data-modulo="habitos"]` define
   `--m-bg, --m-fg, --m-accent, --m-ok, --m-line, --m-font-macro, --m-font-mono` en un CSS
   propio (`src/styles/os-conductual.css`). Los componentes del módulo usan SOLO tokens --m-*.
   El shell del OS (nav, topbar) conserva Ultramarine: el módulo es una "zona" dentro del OS.
2. Tipografía: macro = Archivo Black o Inter Black (uppercase, tracking -0.04em, clamp
   agresivo); datos = JetBrains Mono (ya en el OS) uppercase tracking 0.08em.
3. Geometría: border-radius 0 dentro del módulo. Compartimentos con bordes 1px visibles
   (grid con gap 1px y fondos contrastados). Crosshairs + en intersecciones clave.
4. Jerarquía conductual de la pantalla de hábitos (orden de atención):
   a) LA RACHA como HUD gigante (número macro, es lo que se pierde: loss aversion primero),
   b) las diarias de HOY como lista de misiones con checkbox industrial cuadrado,
   c) XP/nivel como telemetría secundaria (mono pequeño),
   d) alerta "NO SE FALLA DOS VECES" como banda de advertencia con stripes cuando aplica.
5. Celebración: al completar un check, feedback inmediato tipo terminal (`>>> +12 XP ///
   REGISTRADO`) con flash breve de 1 frame invertido. Día perfecto: única aparición del verde.
6. Accesibilidad: contraste AA mínimo, área táctil >= 44px, la estética no sacrifica lectura
   (mono nunca bajo 11px en móvil).
7. Prohibido (anti AI-slop): gradientes, glassmorphism, sombras difusas, esquinas redondeadas,
   emojis decorativos dentro del módulo (el 🔥 de racha se reemplaza por contador macro),
   grises azulados genéricos, animaciones flotantes gratuitas.

## Estado

- Rama `feat/habitos-brutal`: hábitos + journeys + checklist del home en Telemetría Táctica.
- Candidata 1 (Ultramarine, rama `feat/habitos-v1`) vs candidata 2 (esta): Pancho elige.
- Versión B (motor XP transversal) se construye sobre esta rama.
