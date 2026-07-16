# Contrato: captura de comida por foto (n8n / Hermes)

Fase 5 del módulo Salud OS. Este documento describe el contrato entre
`POST /api/os/salud/foto-comida` (endpoint en el sitio Astro) y el flujo n8n que hace la
estimación multimodal (foto + descripción -> macros estimados).

## Principio: manual-first

El endpoint de foto **no registra nada** en `comidas_log` automáticamente. Solo reenvía la
foto al flujo n8n, valida la forma de la respuesta y la devuelve al frontend como una
`estimacion`. El usuario confirma o edita esa estimación en el UI y recién ahí el frontend
llama a `POST /api/os/salud/comidas-log` para guardarla, igual que una entrada manual.

## Variables de entorno (Vercel + `.env` local)

| Variable | Uso |
|---|---|
| `N8N_FOTO_COMIDA_URL` | URL del webhook n8n que recibe la foto y devuelve la estimación. Si falta, el endpoint responde `501` para que el UI muestre "próximamente". |
| `OS_API_TOKEN` | Token compartido. El endpoint lo reenvía al webhook n8n en el header `X-OS-Token`, y también acepta ese mismo header en la request entrante (escritura externa, igual que el resto de endpoints `salud/*`). |

## Request al endpoint del sitio

`POST /api/os/salud/foto-comida`

Headers: `Content-Type: application/json` + cookie de sesión del OS **o** `X-OS-Token: <OS_API_TOKEN>`.

```json
{
  "foto_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "descripcion": "plato de arroz con pollo y ensalada",
  "momento": "almuerzo"
}
```

- `foto_base64` (string, requerido): data URL (`data:image/...;base64,...`) o base64 puro.
  Límite: **~4MB decodificados**. Si se excede, el endpoint responde `413` antes de
  reenviar nada al webhook.
- `descripcion` (string, opcional): lo que el usuario escribió sobre el plato. Se manda
  junto a la foto al modelo multimodal; ayuda a desambiguar cantidades y preparaciones que
  la imagen sola no resuelve (ej. "sin arroz", "doble proteína").
- `momento` (string, opcional): `desayuno` | `almuerzo` | `cena` | `snack`. Informativo,
  no cambia el prompt del modelo salvo que n8n decida usarlo.

## Request que el sitio reenvía al webhook n8n

`POST <N8N_FOTO_COMIDA_URL>`

Headers: `Content-Type: application/json`, `X-OS-Token: <OS_API_TOKEN>`.

Body: el mismo JSON recibido (`foto_base64`, `descripcion`, `momento`), sin transformar.

Timeout: **25 segundos** (AbortController). Si el webhook no responde a tiempo, el sitio
responde `502` con mensaje "El flujo de foto no respondió a tiempo (25s)".

## Respuesta esperada del webhook n8n

```json
{
  "alimentos": [
    {
      "descripcion": "arroz blanco",
      "cantidad_g": 200,
      "kcal": 260,
      "proteina_g": 4.8,
      "carbos_g": 57,
      "grasa_g": 0.4
    },
    {
      "descripcion": "pechuga de pollo a la plancha",
      "cantidad_g": 150,
      "kcal": 248,
      "proteina_g": 46.5,
      "carbos_g": 0,
      "grasa_g": 5.4
    }
  ],
  "confianza": 0.72,
  "notas": "Porciones estimadas visualmente, sin referencia de escala en la foto."
}
```

- `alimentos` (array, requerido): al menos un ítem. Cada ítem requiere `descripcion`
  (string no vacío); `cantidad_g`, `kcal`, `proteina_g`, `carbos_g`, `grasa_g` son
  numéricos, pueden venir `null` si el modelo no pudo estimarlos.
- `confianza` (number, opcional, 0-1): qué tan segura está la estimación. El UI puede usarlo
  para avisar "revisa antes de guardar" si es baja.
- `notas` (string, opcional): aclaraciones del modelo (ej. supuestos de porción, ambigüedad).

Si la respuesta no tiene `alimentos` como array, o algún ítem no tiene `descripcion`, el
sitio responde `502` con "Respuesta del flujo de foto con formato inesperado" y no expone
la respuesta cruda al frontend.

## Respuesta del endpoint del sitio al frontend

Éxito (`200`):

```json
{
  "estimacion": {
    "alimentos": [ /* igual forma que arriba, con nulls normalizados */ ],
    "confianza": 0.72,
    "notas": "Porciones estimadas visualmente..."
  }
}
```

Errores:

| Código | Caso |
|---|---|
| `400` | JSON inválido o `foto_base64` ausente/vacío. |
| `401` | Sin cookie de sesión válida ni `X-OS-Token` correcto. |
| `413` | Foto decodificada supera ~4MB. |
| `501` | `N8N_FOTO_COMIDA_URL` no configurada (feature "próximamente"). |
| `502` | El webhook respondió con error, no respondió a tiempo, o la forma de su respuesta no cumple el contrato. |

## Guía de prompt para el flujo n8n (lado modelo multimodal)

- Mandar la foto y la `descripcion` del usuario **juntas** en el mismo prompt al modelo:
  la descripción desambigua lo que la imagen no puede (ingredientes ocultos, "sin sal",
  tamaño real del plato, etc.).
- Pedir al modelo que responda **solo el JSON** del contrato de arriba, sin texto
  adicional antes o después (facilita el parseo en n8n antes de reenviar al sitio).
- Si el modelo no puede estimar un macro para un alimento, usar `null` en ese campo en vez
  de inventar un número o omitir la clave.
- El sitio no persiste nada de esta llamada: n8n no necesita preocuparse por duplicados ni
  por limpiar registros de intentos fallidos.

## Ejemplo curl (para probar el webhook n8n directamente, sin pasar por el sitio)

```bash
curl -X POST "$N8N_FOTO_COMIDA_URL" \
  -H "Content-Type: application/json" \
  -H "X-OS-Token: $OS_API_TOKEN" \
  -d '{
    "foto_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
    "descripcion": "plato de arroz con pollo y ensalada",
    "momento": "almuerzo"
  }'
```

Ejemplo curl contra el endpoint del sitio (con token, como lo haría n8n/Hermes):

```bash
curl -X POST "https://franciscoabad.com/api/os/salud/foto-comida" \
  -H "Content-Type: application/json" \
  -H "X-OS-Token: $OS_API_TOKEN" \
  -d '{
    "foto_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
    "descripcion": "plato de arroz con pollo y ensalada",
    "momento": "almuerzo"
  }'
```
