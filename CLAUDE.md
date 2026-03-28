# franciscoabad — Repo Web Personal

## REGLA CRÍTICA

Este directorio es el repositorio de código del sitio franciscoabad.com.

**NO modificar archivos de este repo directamente con herramientas de archivo (Read/Write/Edit de Cowork).**

Todo cambio de código, refactor, corrección, o generación de contenido debe hacerse a través de **Claude Code** en terminal, usando git correctamente.

## Por qué

- Los cambios directos saltean el flujo git (no quedan en historial)
- No se validan con ESLint ni con los tests de Playwright
- Pueden corromper el estado del repo si se editan archivos de `node_modules`, `.git`, o configs de build

## Cómo trabajar con este repo

```bash
# Desde terminal en Windows:
cd C:\Users\Francisco\franciscoabad

# O desde la ubicación en OneDrive:
cd "C:\Users\Francisco\OneDrive\Profesional\FRANCISCO ABAD\02_Web\franciscoabad"
```

Usar Claude Code para:
- Agregar páginas o componentes
- Actualizar copy del sitio
- Modificar estilos o configuraciones
- Hacer commits y push a GitHub

## Stack
- React + TypeScript + Tailwind + Vite
- Supabase (blog CMS)
- Bun (package manager)
- Playwright (tests)
- GitHub → Vercel (deploy)
