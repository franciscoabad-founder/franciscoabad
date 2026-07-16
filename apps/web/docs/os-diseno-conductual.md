# OS Conductual: canon de diseño por módulo

Sistema de diseño del OS donde cada módulo usa color, tipografía y densidad para INDUCIR el
comportamiento que ese módulo persigue. No es un tema visual único: es diseño conductual.
Base científica: loss aversion (Kahneman), streak salience (Duolingo, 600+ experimentos),
recompensa inmediata visible (Fabulous/Fogg), fricción selectiva (Thaler).

Arquetipos del sistema (nunca mezclar dos arquetipos en un mismo módulo):
- **Clay cálido** (light, pastel): fondo lavanda claro, superficies blancas con doble sombra
  suave, texto tinta oscura, un acento vivo por módulo. Radios generosos, tipografía redondeada
  en sentence case, íconos con volumen. Sin monospace, sin mayúsculas gritando, sin ASCII.
- **Print Industrial Suizo** (light): papel #F4F4F0, tinta #0A0A0A, rojo aviación como único
  acento. Sans black gigante + mono para datos.

## Mapa conductual por módulo

| Módulo | Comportamiento a inducir | Arquetipo | Uso del color |
|---|---|---|---|
| Hábitos / Juego | EJECUTAR hoy, no romper la cadena | Clay cálido (acentos vivos) | Morado clay (`--m-accent` #7F77DD) como acento primario de acción; teal (`--m-ok` #1D9E75) SOLO para día perfecto / racha cumplida; ámbar (`--m-warn` #EF9F27) para atención suave (racha en riesgo, recordatorio), nunca rojo hazard. Coral suave (#E8709A / #D4537E) reservado para estados de error o eliminar, nunca como acento general. La urgencia se comunica con calidez, no con alarma. |
| Finanzas (futuro) | Honestidad con los números, fricción al gasto | Print Suizo (libro contable) | Rojo aviación exclusivo para deuda y sobregasto; tinta negra para todo lo demás. Ningún verde motivacional: los números buenos se muestran sobrios (la calma es la recompensa). |
| Entreno (futuro) | Intensidad, empezar YA | Clay cálido variante entreno | Mismo lenguaje clay, acento ámbar como energía de sesión activa. |
| Comidas (futuro) | Registro sin culpa, precisión | Clay cálido (acentos calmados) | Acentos teal/azul, sin colores de juicio moral sobre la comida. |
| Resto del OS | (marca personal) | Ultramarine v5 actual | Sin cambios. |

## Reglas de implementación

1. Tokens por módulo con scope de data-attribute: `[data-modulo="habitos"]` define
   `--m-bg, --m-surface, --m-fg, --m-muted, --m-accent, --m-ok, --m-warn, --m-font-rounded,
   --m-shadow, --m-shadow-sm` en un CSS propio (`src/styles/os-conductual.css`). Los
   componentes del módulo usan SOLO tokens --m-*. El shell del OS (nav, topbar) conserva
   Ultramarine: el módulo es una "zona" dentro del OS. La estructura de tokens por
   `[data-modulo]` está lista para que cada módulo futuro (Finanzas, Entreno, Comidas) herede
   la misma piel clay con su propio acento, sin duplicar reglas.
2. Tipografía: Nunito (`--m-font-rounded`) para todo el módulo, sentence case en toda la
   interfaz (nunca mayúsculas sostenidas), pesos medios/bold para jerarquía, sin monospace.
3. Geometría: radios generosos y consistentes: cards 20px, botones/links/controles 14px,
   chips y píldoras 999px. Profundidad con doble sombra suave (`--m-shadow` / `--m-shadow-sm`),
   nunca con gradientes.
4. Jerarquía conductual de la pantalla de hábitos (orden de atención):
   a) LA RACHA como número protagonista en una card clay (loss aversion sigue primero, pero
      comunicado con calidez, no con alarma),
   b) las diarias de HOY como lista de misiones con checkbox redondeado,
   c) XP/nivel como chip secundario (píldora clay, texto pequeño),
   d) recordatorio de racha en riesgo como card ámbar suave, nunca como banda de advertencia
      tipo hazard.
5. Celebración: al completar un check, feedback inmediato cálido y breve (texto sentence case,
   un ícono con volumen o, puntualmente, un emoji celebratorio; nunca copy tipo terminal).
   Día perfecto: única aparición destacada del teal.
6. Íconos: tiles redondeados con color de fondo (volumen, no plano), sin emojis decorativos
   regados por la interfaz; un emoji celebratorio puntual en feedback de logro está permitido.
7. Accesibilidad: contraste AA mínimo, área táctil >= 44px, la estética no sacrifica lectura
   (texto nunca bajo 13px en móvil).
8. Prohibido (anti AI-slop): monospace omnipresente, mayúsculas gritando (`text-transform:
   uppercase` como default de copy), copy o marcos ASCII (`>>>`, `///`, `[ ... ]`), rojo hazard
   como acento general, scanlines/efecto CRT, esquinas rectas (border-radius 0) dentro del
   módulo, gradientes tipo Web3, glassmorphism genérico, grises azulados genéricos sin
   propósito, animaciones flotantes gratuitas.

## Estado

- Rama `feat/habitos-clay`: hábitos + journeys + checklist del home reskineados a Clay cálido,
  reemplazando la exploración previa en Telemetría Táctica (rama `feat/habitos-brutal`,
  descartada).
- Versión B (motor XP transversal) se construye sobre esta rama.
