# Contrato: insights de coaching de Salud (`/api/os/salud/insights`)

Endpoint de solo lectura que computa observaciones tipo "coach" sobre el estado real de
Salud (nutrición, ayuno, entrenamiento, hábitos, targets). Pensado para dos consumidores:
el propio OS (tarjeta de insights en el dashboard de Salud) y el cron diario de
n8n/Hermes que arma el brief de Telegram.

## Autenticación

Igual patrón que `api/os/habitos/brief.ts`: cookie de sesión del OS (`os_auth`) **o**
header `X-OS-Token: <OS_API_TOKEN>` (integración externa, n8n/Hermes).

## Request

```
GET /api/os/salud/insights
```

Sin parámetros ni body.

## Respuesta (200)

```json
{
  "generado_at": "2026-07-20T23:10:00.000Z",
  "insights": [
    {
      "tipo": "targets",
      "severidad": "alerta",
      "mensaje": "Tu promedio reciente (980 kcal) esta muy por debajo de tu objetivo (2400 kcal). Probablemente estes subregistrando comidas, no comiendo tan poco.",
      "data": { "promedio_kcal": 980, "target_kcal": 2400, "dias_con_datos": 5 }
    },
    {
      "tipo": "habitos",
      "severidad": "nudge",
      "mensaje": "Ayer fallaste Meditar, Leer 10 min. Hoy no se falla dos veces.",
      "data": { "habitos": ["Meditar", "Leer 10 min"] }
    },
    {
      "tipo": "entreno",
      "severidad": "info",
      "mensaje": "Llevas 2 semanas sin entrenar pierna, gluteos.",
      "data": { "grupos": ["upper-leg", "glutes"] }
    }
  ]
}
```

- `insights` es un **array de máximo 6 elementos**, ordenado por severidad:
  `alerta` &gt; `nudge` &gt; `info`. Puede venir vacío (`[]`) si no hay nada que señalar.
- `severidad`:
  - `alerta`: algo que probablemente esté distorsionando los datos o el plan (ej.
    subregistro sistemático de comidas).
  - `nudge`: un empujón directo y accionable hoy mismo (ej. racha en riesgo, ayuno sin
    tocar, comidas sin registrar).
  - `info`: contexto útil sin urgencia (ej. grupo muscular descuidado hace 2 semanas).
- `mensaje` viene en español, tono de coach directo (segunda persona, sin rodeos, sin
  em dash), listo para mostrarse tal cual o reenviarse a Telegram.
- `data` es específico de cada `tipo` (ver ejemplos arriba) y pensado para que el
  consumidor arme su propio copy si no quiere usar `mensaje` tal cual.

### Tipos de insight y su lógica

| `tipo` | Cuándo dispara | Severidad |
|---|---|---|
| `comidas` | Alguno de los últimos 3 días (incluido hoy) no tiene ningún registro en `comidas_log`. | `nudge` |
| `ayuno` | Existe al menos un registro histórico en `ayunos` (señal de que la persona ya practica ayuno; `salud_config.protocolo_ayuno_default` trae un default `NOT NULL` para todos, así que no sirve por sí solo para distinguir "quiere ayunar" de "nunca lo ha usado") y hoy todavía no existe ningún registro en `ayunos` con `inicio` en el día de hoy. El timer es manual-first: nunca arranca solo. | `nudge` |
| `entreno` (racha) | Han pasado más de 3 días desde la última sesión con `tipo = 'gym'` en `sesiones`. Si nunca hay ninguna sesión registrada, dispara igual. | `nudge` |
| `entreno` (volumen) | Hubo al menos una sesión de gym en los últimos 14 días, pero algún grupo muscular (de `gfit_taxonomia` tipo `grupo_muscular`, excluyendo `cardio`) no aparece en ningún `musculos_primarios` de los ejercicios entrenados en esa ventana (via `gfit_sesion_series`). | `info` |
| `habitos` | Alguna diaria activa que existía ayer y estaba programada ayer (`dias_semana`) no tiene check `+` para ayer. Mismo cálculo que `en_riesgo` en `api/os/habitos/brief.ts`, reimplementado aquí sin importar UI. | `nudge` |
| `targets` | `salud_config.kcal_objetivo` está configurado y el promedio de kcal de los días con al menos un registro en los últimos 7 días es menor al 60% del objetivo. Lectura: subregistro, no déficit real. | `alerta` |

Todas las consultas son defensivas: si una tabla o columna todavía no existe en la base
contra la que corre el endpoint (por ejemplo las tablas de GFIT en el insight de
volumen por grupo muscular), ese generador de insights simplemente no aporta nada, no
rompe la respuesta completa.

## Errores

| Código | Caso |
|---|---|
| `401` | Sin cookie de sesión válida ni `X-OS-Token` correcto. |
| `502` | Error inesperado leyendo Supabase (fuera de los casos defensivos ya cubiertos arriba). |

## Ejemplo curl

```bash
curl -s "https://franciscoabad.com/api/os/salud/insights" \
  -H "X-OS-Token: $OS_API_TOKEN" | jq
```

## Guía para el flujo n8n (cron diario → Telegram)

- Programar un cron diario a las **18:00 America/Guayaquil** (fin de la jornada, con
  tiempo todavía para actuar hoy: registrar la cena, tocar el ayuno, cerrar un hábito).
- `GET` este endpoint con `X-OS-Token`. Si `insights` viene vacío, no enviar mensaje ese
  día (evita ruido "todo bien" repetido).
- Si viene con elementos, formatear un mensaje corto a Telegram: un emoji simple por
  severidad (🔴 alerta, 🟡 nudge, ⚪️ info) + `mensaje` tal cual, uno por línea, en el
  orden que ya viene (alerta primero).
- No reescribir `mensaje` con otro modelo: ya viene en tono coach, listo para reenviar.
  Si se necesita más contexto, usar `data` para armar un segundo mensaje o un botón de
  acción (ej. deep link a `/os/salud/ayuno` cuando `tipo = 'ayuno'`).
- Este endpoint es de **solo lectura**: no marca nada como "visto" ni desactiva el
  insight del día siguiente. La idempotencia del envío (no mandar dos veces el mismo
  mensaje) es responsabilidad del workflow de n8n, no de este endpoint.
