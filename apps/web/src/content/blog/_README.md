# Cómo crear un blog nuevo

## Estructura de carpeta

Cada blog vive en este directorio (`apps/web/src/content/blog/`) como un
archivo `.mdx` único, junto con sus imágenes asociadas.

## Pasos para crear un blog nuevo

### 1. Crear el archivo del blog

Nombre del archivo: `blog_NN_slug.mdx` (ej: `blog_02_codeis.mdx`). El slug
del frontmatter es independiente del nombre del archivo.

Usar `.mdx` (no `.md`) para que las imágenes inline se procesen con el
componente `MarkdownImage` y generen srcset AVIF+WebP automáticamente.

### 2. Frontmatter obligatorio

Todo blog debe empezar con este bloque YAML:

```yaml
---
title: "Título del blog (máximo 52 caracteres)"
description: "Descripción para SEO (entre 80 y 160 caracteres)"
pubDate: 2026-MM-DD
category: "Systems Thinking" # o "Founder Systems" o "Liderazgo"
readTime: 9
slug: "url-amigable-del-blog"
draft: false
author: "Francisco Abad"
heroImage: "./nombre-de-la-imagen-hero.webp"
heroAlt: "Descripción alt text de la imagen hero"
---
```

Las categorías son fijas: solo se permiten `"Systems Thinking"`,
`"Founder Systems"` o `"Liderazgo"`. Si quieres una nueva, hay que
agregarla al schema en `src/content.config.ts` primero.

### 3. Imágenes del blog

#### Antes de subir imágenes

1. Optimizar a WebP con tamaño correcto:
   - Hero: ancho máximo 1600px, calidad 80
   - Imágenes inline: ancho máximo 1200px, calidad 80
   - Target: hero menor a 200KB, inline menor a 150KB

2. No subir PNGs o JPGs originales mayores a 500KB. Convertirlos primero
   con sharp o squoosh.app.

#### Cuando subas imágenes

1. Coloca todas las imágenes del blog EN LA MISMA CARPETA que el `.mdx`:

   ```
   apps/web/src/content/blog/blog_NN_slug.mdx
   apps/web/src/content/blog/imagen-hero.webp
   apps/web/src/content/blog/imagen-1.webp
   apps/web/src/content/blog/imagen-2.webp
   ```

2. En el frontmatter, referenciar la hero como path relativo:

   ```yaml
   heroImage: "./imagen-hero.webp"
   ```

   El `./` al inicio es obligatorio. Sin él, Astro no resuelve el path.

3. En el cuerpo del Markdown, insertar imágenes con sintaxis estándar:

   ```markdown
   ![Descripción alt text completa](./imagen-1.webp)
   ```

   Importante:
   - Path relativo con `./`
   - El alt text es obligatorio y debe describir la imagen, no solo repetir el título
   - No usar HTML `<img>`, solo Markdown

### 4. Antes de publicar (checklist)

- [ ] Frontmatter completo y validado
- [ ] Todas las imágenes referenciadas existen físicamente en la carpeta
- [ ] Todas las imágenes están optimizadas (menor a 200KB hero, menor a 150KB inline)
- [ ] Todos los alt texts presentes
- [ ] `readTime` calculado: contar palabras / 200, redondear a entero
- [ ] `description` entre 80 y 160 caracteres
- [ ] `title` máximo 52 caracteres
- [ ] `draft: false` (o `draft: true` si todavía no quieres publicar)

### 5. Verificar local antes de commit

```bash
cd apps/web
npm run dev
```

Abrir `http://localhost:4321/blog/[slug]` y verificar:
- Imagen hero carga
- Todas las imágenes inline cargan
- Espaciado entre párrafos se ve bien
- Headings tienen jerarquía clara
- Tiempo de carga rápido

### 6. Actualizar llms.txt

El archivo `apps/web/public/llms.txt` NO se actualiza automáticamente.
Después de publicar un blog nuevo, agregar manualmente la entrada en la
sección `## Artículos del blog`:

```
- Título del blog: https://franciscoabad.com/blog/[slug]/
  Descripción de una o dos líneas para crawlers de IA.
```

### 7. Commit

```bash
git add apps/web/src/content/blog/blog_NN_slug.mdx apps/web/src/content/blog/*.webp apps/web/public/llms.txt
git commit -m "content(blog): publish [título corto del blog]"
git push
```

## Errores comunes y cómo evitarlos

### Imagen no carga, solo se ve el alt text

Causas posibles:

1. El archivo no existe en la carpeta. Verificar con `ls apps/web/src/content/blog/`.
2. El path no tiene `./` al inicio.
3. El nombre tiene caracteres especiales o espacios. Usar solo `a-z`, `0-9`, guiones.
4. La extensión está mal escrita (ej. `.weep` en vez de `.webp`).
5. La imagen fue movida o archivada después de que el MDX ya la referenciaba.

### Espaciado raro o roto

Causa: usaste HTML `<img>` en lugar de Markdown `![]()`. Astro Content
Collections solo procesa la sintaxis Markdown estándar en archivos `.mdx`.

### El blog no aparece en /blog

Causas:
1. `draft: true` en el frontmatter. Cambiar a `false`.
2. `category` con un valor no permitido. Solo `"Systems Thinking"`,
   `"Founder Systems"` o `"Liderazgo"`.
3. Frontmatter mal formado (YAML inválido). Verificar comillas y dos puntos.

### El título o description aparecen mal en LinkedIn/Twitter al compartir

Causa: `og:title` se genera del frontmatter `title`. Si lo cambias, esperar
unos minutos a que el cache de LinkedIn/Twitter expire, o usar el debugger
de cada plataforma para forzar refresh.

## Workflow recomendado para escribir

1. Abrir Obsidian apuntado a la carpeta `apps/web/src/content/blog/`
2. Crear nuevo archivo siguiendo la convención de nombre
3. Pegar el template de frontmatter completo
4. Escribir el blog usando preview de Obsidian para ver cómo va
5. Cuando esté listo, generar/optimizar imágenes (separado, fuera de Obsidian)
6. Pegar las imágenes en la misma carpeta
7. Validar en `localhost:4321` antes de commit
