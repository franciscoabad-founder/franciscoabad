# Contrato: nutricion del OS hacia Google Health / Fitbit (n8n)

Direccion de salida del sync de salud. La entrada (sueno, pasos, peso, frecuencia cardiaca)
va por `contrato-biometricas.md` y no toca nada de aqui.

Endpoint: `GET`/`POST /api/os/salud/nutricion-out`. Tabla: `comidas_log`
(columnas `sync_*` agregadas en `supabase/migrations/20260727000000_nutricion_out_sync.sql`).
Mapeo puro y testeado en `apps/web/src/lib/salud/nutricionOut.ts`.

## Por que solo nutricion es 2-way

Sueno, pasos y actividad los mide el reloj. Escribirlos de vuelta produce doble conteo y
hace imposible distinguir lo medido de lo inferido. Nutricion es la unica categoria que se
origina en el OS, y por eso es la unica que sale.

Ademas hay una razon dura, verificada contra el discovery document de la API
(`https://health.googleapis.com/$discovery/rest?version=v4`, revision 20260722):

- **No existe** el scope `googlehealth.nutrition.readonly`. El unico scope de nutricion es
  `googlehealth.nutrition.writeonly`.
- `users.dataTypes.dataPoints.list` acepta scopes de `activity_and_fitness`,
  `health_metrics_and_measurements`, `location` y `sleep`. **Nutricion no esta.**

O sea: en la API v4, la nutricion es escritura pura. No hay lectura que devolver, asi que
tampoco hay bucle de realimentacion posible desde Google. La regla de procedencia se mantiene
igual (ver abajo), pero por higiene, no porque hoy exista el riesgo.

## Arquitectura: outbox, no escritura sincrona

El OS **nunca** llama a Google ni a Fitbit. La comida se guarda en Supabase y queda en estado
`pendiente`. Un flujo n8n drena la cola.

```
UI / Telegram -> POST /api/os/salud/comidas-log   (sync_estado = 'pendiente')
                                |
n8n (cron)  -> GET  /api/os/salud/nutricion-out   (toma pendientes ya mapeados)
            -> POST health.googleapis.com/v4/...  (empuja)
            -> POST /api/os/salud/nutricion-out   (acusa el resultado)
```

Escribir hacia afuera dentro del request del usuario haria que un fallo de Google rompa el
registro de la comida, que es lo unico que de verdad importa guardar.

## Idempotencia

El `name` del data point lo provee el OS y es el uuid de la fila de `comidas_log`:

```
users/{healthUserId}/dataTypes/nutrition-log/dataPoints/{id_de_comidas_log}
```

La API acepta ids de data point provistos por el cliente (4-63 caracteres, minusculas,
digitos y guiones; un uuid cumple). Reenviar la misma comida apunta al mismo data point, no
crea uno nuevo. Correr el flujo dos veces no duplica, y no hace falta consultar antes si ya
existe.

En Supabase, refuerzo adicional: indice unico parcial sobre `(sync_destino, sync_external_id)`.

Si Google responde `409 ALREADY_EXISTS`, el flujo lo trata como **enviado**, no como error.

## Regla de procedencia

Nunca se empuja hacia afuera un registro cuyo `source` sea `google`, `google_health` o
`fitbit`. El endpoint filtra por eso y marca esas filas como `omitido` para que no queden
girando en la cola. Hoy `comidas_log` solo acepta `manual`, `telegram` y `agente`, asi que la
regla es defensiva: protege contra un source externo que se agregue mas adelante.

## Estados de la cola (`comidas_log.sync_estado`)

| Estado | Significado |
|---|---|
| `pendiente` | Registrado en el OS, todavia no empujado. Estado por defecto de toda comida nueva. |
| `enviado` | Aceptado por el destino. `sync_external_id` y `sync_raw` poblados. |
| `error` | El destino lo rechazo. Suma `sync_intentos`. A los 5 intentos deja de aparecer en la cola. |
| `omitido` | No se empuja a proposito: origen externo, o historico anterior a la migracion. |

El historico anterior al 27 jul 2026 quedo en `omitido` por la propia migracion. Sin eso, el
primer run habria intentado subir todas las comidas registradas desde el 15 de julio.

## GET /api/os/salud/nutricion-out

Headers: cookie de sesion del OS **o** `X-OS-Token: <OS_API_TOKEN>`.

Query: `?destino=google_health|fitbit` (default `google_health`), `?limite=1..100` (default 25).

Devuelve los pendientes **ya mapeados al formato del destino**, para que el nodo de n8n solo
tenga que reenviar el `payload` tal cual:

```json
{
  "destino": "google_health",
  "n": 1,
  "omitidas": 0,
  "pendientes": [
    {
      "id": "a1b2c3d4-e5f6-4890-9234-567890abcdef",
      "fecha": "2026-07-27",
      "momento": "almuerzo",
      "intentos": 0,
      "payload": {
        "name": "users/me/dataTypes/nutrition-log/dataPoints/a1b2c3d4-e5f6-4890-9234-567890abcdef",
        "nutritionLog": {
          "interval": {
            "startTime": "2026-07-27T18:00:00.000Z",
            "endTime": "2026-07-27T18:20:00.000Z",
            "startUtcOffset": "-18000s",
            "endUtcOffset": "-18000s"
          },
          "foodDisplayName": "Arroz con menestra (350 g)",
          "mealType": "LUNCH",
          "energy": { "kcal": 620 },
          "totalCarbohydrate": { "grams": 88 },
          "totalFat": { "grams": 18 },
          "nutrients": [
            { "nutrient": "PROTEIN", "quantity": { "grams": 24 } },
            { "nutrient": "DIETARY_FIBER", "quantity": { "grams": 9 } },
            { "nutrient": "SODIUM", "quantity": { "grams": 0.48 } }
          ]
        }
      }
    }
  ]
}
```

Notas del mapeo:

- **Food anonimo**, no identificado. El catalogo de alimentos del OS es propio y no tiene
  equivalencia en el catalogo de Google. Consecuencia documentada por Google: los logs
  anonimos no son editables despues de creados. Por eso el flujo usa `create`, no `patch`.
- `sodio_mg` y `colesterol_mg` se convierten de miligramos a gramos: la API los pide en gramos.
- Los nutrientes ausentes **no se mandan como cero**. Un cero inventado no se distingue de un
  dato medido.
- El intervalo usa `created_at` si cae el mismo dia calendario que `fecha` en Guayaquil; si no
  (backfill, comida registrada al dia siguiente), una hora canonica por momento: desayuno
  08:00, almuerzo 13:00, snack 16:00, cena 20:00. Duracion asumida: 20 minutos.
- Offset fijo `-18000s`: Ecuador continental no aplica horario de verano.

Con `?destino=fitbit` el `payload` sale en la forma del food log de la Fitbit Web API legacy
(`foodName`, `mealTypeId`, `unitId: 147`, etc.) para `POST /1/user/-/foods/log.json`.

## POST /api/os/salud/nutricion-out

Acuse de recibo. Acepta un item o `{ "acuses": [...] }`.

```json
{
  "id": "a1b2c3d4-e5f6-4890-9234-567890abcdef",
  "estado": "enviado",
  "destino": "google_health",
  "external_id": "users/me/dataTypes/nutrition-log/dataPoints/a1b2c3d4-...",
  "raw": { "...": "respuesta cruda de Google" }
}
```

- `estado`: `enviado` | `error` | `omitido`.
- `external_id`: obligatorio cuando `estado` es `enviado`.
- `error`: texto del fallo cuando `estado` es `error`. Suma un intento.
- `raw`: respuesta cruda del destino. Se guarda en `sync_raw`. La documentacion de Google
  advierte que la API v4 esta evolucionando; el crudo permite reprocesar sin haber perdido nada.

Respuesta: `{ "acuses": [ { "id", "sync_estado", "sync_external_id", "sync_intentos" } ], "n": 1 }`.

## Errores

| Codigo | Caso |
|---|---|
| `400` | `destino` o `estado` invalido, `id` ausente, `external_id` ausente con `estado: enviado`. |
| `401` | Sin cookie de sesion valida ni `X-OS-Token` correcto. |
| `502` | Error de Supabase u otro error inesperado. |

## Verificacion

```bash
# 1. Registrar una comida de prueba
curl -X POST "https://franciscoabad.com/api/os/salud/comidas-log" \
  -H "Content-Type: application/json" -H "X-OS-Token: $OS_API_TOKEN" \
  -d '{"descripcion_libre":"Prueba sync","momento":"snack","kcal":100,"proteina_g":8,"carbos_g":10,"grasa_g":3}'

# 2. Ver que aparece en la cola
curl "https://franciscoabad.com/api/os/salud/nutricion-out" -H "X-OS-Token: $OS_API_TOKEN"

# 3. Correr el flujo de n8n dos veces. La segunda debe devolver n: 0 y la app
#    externa debe mostrar UN solo registro, no dos.
```
