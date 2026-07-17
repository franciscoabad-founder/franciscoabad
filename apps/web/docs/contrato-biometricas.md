# Contrato: biometricas diarias via Google Health API (n8n / Hermes)

Puente entre el flujo n8n que lee la **Google Health API** y
`POST /api/os/biometricas` (endpoint en el sitio Astro), que persiste los datos en
`biometricas_dia`.

## Por que Google Health y no Fitbit

La **Fitbit Web API se apaga el 30 de septiembre de 2026**. Fitbit la reemplaza por la
**Google Health API**, que usa **Google OAuth 2.0** (no el OAuth legacy de Fitbit). Los
tokens de Fitbit existentes **no se transfieren**: el usuario debe re-autorizar desde cero
via Google OAuth. Ambas APIs conviven de mayo al 30 de septiembre de 2026, pero como este
puente se construye a partir de julio de 2026, se construye **directo sobre Google Health**,
sin pasar por la API legacy de Fitbit en ningun punto.

## Tabla destino

`biometricas_dia` (fila unica por `fecha`):

| Columna | Tipo | Contenido |
|---|---|---|
| `fecha` | `date` (PK) | Dia calendario (America/Guayaquil). |
| `pasos` | `int` | Pasos del dia. |
| `sueno_min` | `int` | Minutos de sueno total del dia. |
| `peso_kg` | `numeric(5,2)` | Peso en **kilogramos** (unidad canonica del OS). |
| `fc_reposo` | `int` | Frecuencia cardiaca en reposo (bpm). |
| `fuente` | `text` | Default `'google_health'`. |
| `raw` | `jsonb` | Respuesta cruda de Google Health para ese dia (auditoria/debug). |

`peso_kg` se guarda siempre en kilogramos. La conversion a libras (si el usuario prefiere
esa unidad) es responsabilidad del UI al momento de mostrar el dato, no de este endpoint ni
de n8n.

## Mapeo Google Health -> columnas

| Data type / scope de Google Health | Columna | Notas |
|---|---|---|
| `Steps` (conteo de pasos) | `pasos` | Suma diaria. |
| `Sleep Session` (duracion) | `sueno_min` | Convertir la duracion de la sesion a minutos antes de mandarla. |
| `Weight` (`BodyWeight`) | `peso_kg` | Google Health puede devolver en libras o kg segun el dispositivo de origen; n8n normaliza a **kg** antes de mandar. |
| `Resting Heart Rate` | `fc_reposo` | Entero, bpm. |

Scopes de Google OAuth necesarios (via Google Health API, alcance exacto a confirmar en la
consola de Google Cloud del proyecto): lectura de actividad (pasos), sueno, peso y
frecuencia cardiaca. n8n solicita solo lectura (`.readonly`), nunca escritura.

## Dependencia bloqueante

Para conectar este puente se necesita, de parte de Pancho:

1. Un proyecto en **Google Cloud Console** con la **Google Health API** habilitada.
2. **Client ID** y **Client Secret** de OAuth 2.0 de ese proyecto (tipo "Desktop" o "Web",
   segun lo que pida el flujo de n8n).

**Sin esto, el workflow de n8n no puede autorizarse contra Google y el puente no arranca.**
El endpoint del sitio (`/api/os/biometricas`) ya esta listo y no depende de este paso; el
paso pendiente es enteramente del lado de la credencial de Google.

## Lado n8n

1. Credencial **Google OAuth2** en n8n, autorizada **una sola vez** contra la cuenta de
   Google de Pancho (con los scopes de Google Health de arriba). n8n refresca el token
   solo, igual que las credenciales Google existentes (Gmail/Agenda).
2. Workflow `Biometricas Sync Diario` (cron, ej. 06:30 EC):
   - Lee de Google Health los datos del dia anterior (pasos, sueno, peso si hay medicion,
     frecuencia cardiaca en reposo).
   - Normaliza peso a kg y duracion de sueno a minutos.
   - `POST` al endpoint del sitio con `X-OS-Token`.
3. Para backfill (ej. primera carga historica, o recuperar un dia que fallo), el mismo
   workflow puede mandar varios dias en una sola llamada usando el formato batch (`dias`).

## Request al endpoint del sitio

`POST /api/os/biometricas`

Headers: `Content-Type: application/json` + cookie de sesion del OS **o**
`X-OS-Token: <OS_API_TOKEN>` (asi escribe n8n, sin sesion de navegador).

### Dia unico

```json
{
  "fecha": "2026-07-16",
  "pasos": 8342,
  "sueno_min": 412,
  "peso_kg": 78.4,
  "fc_reposo": 58,
  "fuente": "google_health",
  "raw": { "...": "respuesta cruda de Google Health, opcional" }
}
```

- `fecha` (string `YYYY-MM-DD`, opcional): default hoy (America/Guayaquil).
- `pasos`, `sueno_min`, `fc_reposo` (enteros, opcionales): deben ser **no negativos**. Si
  vienen con decimales o negativos, `400`.
- `peso_kg` (numero, opcional): debe ser **mayor a 0**. En kilogramos.
- `fuente` (string, opcional): default `'google_health'`. Se acepta otro valor si en algun
  momento se registra desde otra fuente (ej. `'manual'`).
- `raw` (objeto, opcional): payload crudo de Google Health, para debug.
- Al menos **una metrica** (`pasos`, `sueno_min`, `peso_kg` o `fc_reposo`) es obligatoria;
  si ninguna viene, `400` con "se requiere al menos una metrica".

### Batch (backfill de varios dias)

```json
{
  "dias": [
    { "fecha": "2026-07-14", "pasos": 6120, "sueno_min": 390 },
    { "fecha": "2026-07-15", "pasos": 9840, "sueno_min": 405, "peso_kg": 78.6 }
  ]
}
```

Cada elemento de `dias` sigue las mismas reglas de validacion que el dia unico. Si un solo
elemento falla la validacion, el endpoint responde `400` y no guarda nada del batch.

## Idempotencia

El endpoint hace **upsert por `fecha`** (`onConflict: 'fecha'`). Si n8n reenvia el mismo dia
(reintento, cron que corre dos veces, backfill que se solapa con datos ya cargados), el
resultado es el mismo registro actualizado, nunca un duplicado. Es seguro que n8n reintente
sin cuidarse de duplicar filas.

## Respuesta del endpoint

Dia unico, exito (`200`):

```json
{ "biometrica": { "fecha": "2026-07-16", "pasos": 8342, "sueno_min": 412, "peso_kg": 78.4, "fc_reposo": 58, "fuente": "google_health", "raw": null, "created_at": "...", "updated_at": "..." } }
```

Batch, exito (`200`):

```json
{ "biometricas": [ /* filas upserteadas */ ], "n": 2 }
```

`GET /api/os/biometricas?desde=2026-06-17&hasta=2026-07-16` (default: ultimos 30 dias hasta
hoy si no se pasan `desde`/`hasta`):

```json
{ "biometricas": [ /* ordenado fecha desc */ ] }
```

`GET /api/os/biometricas?fecha=2026-07-16` (un dia puntual):

```json
{ "biometrica": { /* ... */ } | null }
```

## Errores

| Codigo | Caso |
|---|---|
| `400` | JSON invalido, ninguna metrica presente, o algun valor no cumple la validacion (entero negativo, `peso_kg` <= 0, etc.). |
| `401` | Sin cookie de sesion valida ni `X-OS-Token` correcto (GET solo acepta cookie/Bearer del OS; POST acepta ademas `X-OS-Token`). |
| `502` | Error de Supabase u otro error inesperado al leer/escribir. |

## Ejemplo curl (como lo haria n8n)

```bash
curl -X POST "https://franciscoabad.com/api/os/biometricas" \
  -H "Content-Type: application/json" \
  -H "X-OS-Token: $OS_API_TOKEN" \
  -d '{
    "fecha": "2026-07-16",
    "pasos": 8342,
    "sueno_min": 412,
    "peso_kg": 78.4,
    "fc_reposo": 58
  }'
```

Batch:

```bash
curl -X POST "https://franciscoabad.com/api/os/biometricas" \
  -H "Content-Type: application/json" \
  -H "X-OS-Token: $OS_API_TOKEN" \
  -d '{
    "dias": [
      { "fecha": "2026-07-14", "pasos": 6120, "sueno_min": 390 },
      { "fecha": "2026-07-15", "pasos": 9840, "sueno_min": 405, "peso_kg": 78.6 }
    ]
  }'
```

Lectura (con cookie de sesion del OS, desde el navegador, no requiere `X-OS-Token`):

```bash
curl "https://franciscoabad.com/api/os/biometricas?desde=2026-06-17&hasta=2026-07-16" \
  -H "Cookie: <cookie de sesion del OS>"
```
