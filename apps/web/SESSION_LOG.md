# Bitácora de sesiones

## Sesión 1 — 3 de mayo de 2026

Duración: tarde y noche.

### Lo que se logró

- Sprint 0 completo (cleanup pre-Astro)
- Sprint 1 completo (Astro setup + 5 páginas migradas)
- Sprint 2 Fase 1 completo (blog técnico funcional)
- Sprint 4 completo (SEO técnico)
- Blog 01 sobre el IESS publicado en local con 3 imágenes optimizadas

### Decisiones tomadas

- Migración a Astro vs quedarse en Vite: migrar (SEO crítico)
- Stack final: Astro + Markdown collections + Vercel + Supabase
- Admin: apagado temporal, código preservado
- Service role key: rotación aplazada a próxima semana
- 3 blogs distintos vs 6: empezar con 1 sólido (IESS), agregar
  CODEIS y Antes de IA después
- Resend y Beehiiv: Sprint 3 mañana

### Bloqueadores encontrados

- Vercel deploy bloqueado por team Hobby plan (autor del commit no
  reconocido). Decisión pospuesta hasta hacer deploy real.
- Tailwind v4 vs v3: Astro 6 trae v4 nativo. Adaptado.
- Imágenes generadas pesaban 6.3 MB total. Optimizadas a 258 KB.

### Stats finales

- Commits en branch `feat/astro-migration`: ~32
- Reducción de bundle JS legacy: -49%
- Reducción peso de imágenes: -96%
- Páginas en Astro: 6 (incluido 1 blog)
- `dist/` final: ~3.6 MB

### Próxima sesión

- Sprint 3: backend de formularios (Resend, Beehiiv, quiz endpoint)
- Decisión Vercel: transferir o crear nuevo proyecto
- Rotación de service role key
- Recibir respuestas dictadas para blogs 02 y 04
