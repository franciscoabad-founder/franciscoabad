# Plan de integraciones: Fitbit y redes sociales

Fecha: 16 de julio de 2026. Estado: plan aprobado para ejecutar por fases.

## Arquitectura general

Todo sigue el mismo patron que ya funciona en el OS:

- **n8n** (VPS pancho-automations-01) es el hub de integraciones. Ahi viven los tokens OAuth de cada plataforma como credentials de n8n, nunca en el repo ni en Vercel.
- **El OS** (franciscoabad.com) expone endpoints `/api/os/*` autorizados por Bearer token (`OS_API_TOKEN`). n8n escribe y lee del OS por ahi (credential "Bearer Auth account 3").
- **Supabase** guarda los datos normalizados. Cada fuente externa tiene su tabla `*_sync` o alimenta tablas existentes.
- Los insights y el coach (Telegram, workflow `OS Coach Insights Diario`) consumen esos datos sin saber de que plataforma vinieron.

Regla: ninguna llamada directa desde el frontend a APIs de terceros. Siempre plataforma -> n8n -> OS -> Supabase.

## 1. Fitbit (salud)

Objetivo: pasos, sueno, frecuencia cardiaca, peso y actividad diaria alimentando los insights de Salud.

### Como conectarlo (una sola vez, ~20 min)

1. Crear una app en https://dev.fitbit.com/apps (cuenta Fitbit propia).
   - OAuth 2.0 Application Type: **Personal** (da acceso a series intradia de tu propia cuenta sin revision de Fitbit).
   - Callback URL: `https://n8n.franciscoabad.com/rest/oauth2-credential/callback`.
   - Scopes: `activity heartrate sleep weight nutrition profile`.
2. En n8n: Credentials -> nueva credencial **OAuth2 API** con:
   - Authorization URL: `https://www.fitbit.com/oauth2/authorize`
   - Token URL: `https://api.fitbit.com/oauth2/token`
   - Client ID y Secret de la app creada, auth via header Basic.
   - Conectar y autorizar con la cuenta Fitbit. n8n refresca el token solo.
3. Workflow `Fitbit Sync Diario` (cron 06:30 EC):
   - `GET https://api.fitbit.com/1/user/-/activities/date/{ayer}.json` (pasos, kcal quemadas, minutos activos)
   - `GET https://api.fitbit.com/1.2/user/-/sleep/date/{ayer}.json` (duracion, eficiencia, fases)
   - `GET https://api.fitbit.com/1/user/-/body/log/weight/date/{ayer}.json` (peso si hay bascula)
   - POST al OS a un endpoint nuevo `/api/os/salud/biometricas` que upsertea en una tabla `biometricas_dia` (fecha unica, pasos, sueno_min, sueno_eficiencia, fc_reposo, kcal_quemadas, peso_kg).
4. Extender `/api/os/salud/insights` con 2 generadores nuevos: sueno < 6h promedio 3 dias (alerta) y pasos < 5000 promedio 3 dias (nudge).

Limite de la API: 150 requests/hora por usuario, sobra para un sync diario.

Pendiente de construir: migracion `biometricas_dia`, endpoint `/api/os/salud/biometricas`, workflow n8n, generadores de insights.

## 2. Redes sociales

Objetivo en dos fases: primero **leer metricas** (crecimiento, alcance, engagement por post) hacia un dashboard `/os/redes` con datos reales; despues **publicar** desde el OS/n8n (el Motor de Contenido ya genera borradores).

Nota: ya existen los workflows `Redes Sync Diario` y `Redes Analyst Grok Semanal` en n8n; este plan los formaliza y completa por red.

### Resumen por red

| Red | API | Costo | Lectura de metricas | Publicacion | Dificultad |
|---|---|---|---|---|---|
| YouTube | YouTube Data API v3 + Analytics API | Gratis (cuota 10k unidades/dia) | Si, completa | Si (upload) | Baja |
| Instagram | Instagram Graph API (Meta) | Gratis | Si (cuenta Business/Creator) | Si (feed, reels, stories con limites) | Media |
| Facebook | Graph API (Meta, misma app) | Gratis | Si (paginas) | Si | Media |
| Threads | Threads API (Meta) | Gratis | Si (basica) | Si | Media |
| LinkedIn | Marketing/Community Management API | Gratis pero con revision | Limitada (perfil propio: si con w_member_social + revision) | Si (posts propios) | Media-alta |
| TikTok | Display API + Content Posting API | Gratis, requiere app review | Si (videos propios, metricas basicas) | Si (tras review) | Alta |
| X | X API v2 | Free: solo escribir (1500 posts/mes). Basic: $200/mes para lectura | Solo pagando | Si (free alcanza) | Baja tecnica, cara |

### 2.1 Meta (Instagram + Facebook + Threads): una sola app

Meta cubre 3 de las 7 redes con una app. Es el mejor ratio esfuerzo/valor, empezar aqui.

1. Crear app en https://developers.facebook.com (tipo Business), agregar productos: Instagram Graph API, Facebook Login for Business, Threads API.
2. Requisitos previos: la cuenta de Instagram debe ser **Business o Creator** y estar vinculada a una pagina de Facebook.
3. Tokens: generar un token de usuario de larga duracion (60 dias) y en n8n un workflow `Meta Token Refresh` mensual que lo renueve solo.
4. Lectura (workflow `Redes Sync Diario`, extender):
   - IG: `GET /{ig-user-id}?fields=followers_count,media_count`, `GET /{ig-user-id}/media?fields=like_count,comments_count,reach,saved` (insights por post).
   - FB pagina: `GET /{page-id}/insights?metric=page_impressions,page_fans`.
   - Threads: `GET /me/threads?fields=id,text,timestamp` + `GET /{media-id}/insights` (views, likes, replies, reposts).
   - Guardar en tabla `redes_metricas_dia` (red, fecha, seguidores, alcance, posts jsonb).
5. Publicacion (fase 2): IG via container (`POST /{ig-user-id}/media` + `/media_publish`), Threads igual (`POST /me/threads` + `/threads_publish`), FB con `POST /{page-id}/feed`. Para pasar de desarrollo a produccion Meta pide App Review de los permisos (`instagram_content_publish`, etc.): preparar screencast del flujo. Con la app en modo desarrollo funciona igual para cuentas propias con rol en la app, que es nuestro caso; el review solo hace falta si se quiere robustez a largo plazo.

### 2.2 YouTube

1. Proyecto en Google Cloud Console, habilitar YouTube Data API v3 y YouTube Analytics API.
2. Credencial OAuth2 en n8n (n8n tiene nodo nativo de YouTube y de Google OAuth2 generico; ya hay credenciales Google en n8n para Gmail/Agenda, se puede ampliar scopes o crear otra).
3. Lectura: suscriptores y vistas del canal (`channels?part=statistics`), metricas por video (Analytics API: `views,estimatedMinutesWatched,averageViewDuration,subscribersGained`).
4. Publicacion: `videos.insert` (upload consume 1600 unidades de cuota, sin problema para el volumen actual).

### 2.3 LinkedIn

La red mas valiosa para la marca y la API mas restrictiva.

1. App en https://developer.linkedin.com, producto "Share on LinkedIn" + "Sign In with LinkedIn using OpenID Connect" (aprobacion casi inmediata) para publicar en el perfil propio con scope `w_member_social`.
2. Publicacion: `POST /rest/posts` (texto, imagen, articulo). Esto cubre el caso Motor de Contenido -> borrador aprobado -> publicar.
3. Metricas del perfil personal: la API no las da (solo para paginas de empresa via Community Management API, que requiere revision mas dura). Plan B para metricas personales: export manual mensual del CSV de LinkedIn Analytics a un webhook de n8n, o scraping ligero asistido (evaluar costo/beneficio; no bloquear la fase de publicacion por esto).
4. Ojo: tokens de LinkedIn duran 60 dias y el refresh requiere programa de partner; asumir re-autorizacion manual cada 2 meses (recordatorio en OS Recordatorios).

### 2.4 TikTok

1. App en https://developers.tiktok.com, productos Login Kit + Display API (lectura) y Content Posting API (publicar).
2. Requiere revision de la app incluso para cuenta propia (modo sandbox permite probar con la cuenta del developer: suficiente para arrancar).
3. Lectura: `GET /v2/user/info/` (seguidores), `GET /v2/video/list/` + `query` (views, likes, comments, shares por video).
4. Publicacion: Content Posting API en modo direct post (tras review) o modo draft (el video queda en borradores de la app, menos friccion de aprobacion; empezar por draft).

### 2.5 X

- Free tier: permite publicar (hasta 1500 posts/mes) y casi nada de lectura. Suficiente para la fase de publicacion.
- Leer metricas (impresiones, seguidores, engagement) exige Basic a $200/mes. Decision pendiente de Pancho: no pagar hasta que el volumen en X lo justifique. Mientras tanto, registrar metricas de X a mano una vez por semana en `redes_metricas_dia` via un formulario del OS o un mensaje a Telegram que n8n parsee.
- Setup tecnico: app en https://developer.x.com, OAuth2 con PKCE, scopes `tweet.read tweet.write users.read offline.access`. n8n tiene nodo nativo de X.

## 3. Piezas comunes a construir en el OS

1. Migracion `redes_metricas_dia` (red, fecha, seguidores, alcance, engagement, detalle jsonb; unique red+fecha) y `biometricas_dia`.
2. Endpoints `/api/os/redes/metricas` y `/api/os/salud/biometricas` (GET + POST upsert, mismo molde que los existentes).
3. Dashboard `/os/redes` con datos reales (hoy es maqueta): curva de seguidores por red, top posts de la semana, alertas de caida.
4. Cola de publicacion: tabla `redes_cola` (red, contenido, media_url, estado borrador/aprobado/publicado, programado_at). El Motor de Contenido escribe borradores, Pancho aprueba desde el OS o Telegram (ya existe OS Approval Gate), n8n publica.
5. Insights de redes en el coach diario: "IG crecio X esta semana", "llevas N dias sin publicar en LinkedIn".

## 4. Orden de ejecucion sugerido

| Fase | Que | Esfuerzo |
|---|---|---|
| 1 | Fitbit completo (app, credencial, sync, insights de sueno y pasos) | 1 sesion |
| 2 | App de Meta + lectura IG/FB/Threads + tablas y endpoint de metricas | 1-2 sesiones |
| 3 | YouTube lectura + LinkedIn publicacion (`w_member_social`) | 1 sesion |
| 4 | Cola de publicacion + publicar en IG/Threads/FB/X desde el OS | 2 sesiones |
| 5 | TikTok (review de app) y decision sobre X Basic | cuando el volumen lo pida |

Criterio: primero lo que alimenta decisiones diarias (salud, metricas), despues lo que automatiza publicacion, al final lo que depende de reviews externos.
