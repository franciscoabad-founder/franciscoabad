# Conectar el OS con Google Health: pasos manuales

Guia de los clics que hace Pancho. Todo lo demas (endpoints, tablas, mapeo, flujos n8n) ya
esta en el repo. Ver `contrato-biometricas.md` (entrada) y `contrato-nutricion-out.md` (salida).

Orden: **Paso A y B primero**, porque el resultado de la Tarea 1 decide si hace falta el Paso D.

---

## Paso A. Cliente OAuth en Google Cloud

Consola: https://console.cloud.google.com

1. Seleccionar el proyecto donde ya esta habilitada la Google Health API.
   Verificar en **APIs y servicios > APIs habilitadas** que aparece *Google Health API*.
   Si no aparece: **Biblioteca**, buscar "Google Health API", **Habilitar**.
2. **APIs y servicios > Pantalla de consentimiento de OAuth**.
   - Tipo de usuario: **Externo**. (Interno solo existe con Workspace; con una cuenta
     personal de Gmail la unica opcion es Externo, y esta bien.)
   - Nombre de la app: `OS Salud`. Correo de asistencia y de contacto: el propio.
3. **Permisos / Scopes**: agregar estos cuatro y **ninguno mas**. Cada scope de mas endurece
   cualquier revision futura.

   ```
   https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly
   https://www.googleapis.com/auth/googlehealth.sleep.readonly
   https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly
   https://www.googleapis.com/auth/googlehealth.nutrition.writeonly
   ```

   No existe `googlehealth.nutrition.readonly`: en la API v4 la nutricion es escritura pura.
   No buscarlo en la lista, no esta.
4. **Usuarios de prueba**: agregar el correo propio.
5. **Credenciales > Crear credenciales > ID de cliente de OAuth**.
   - Tipo: **Aplicacion de escritorio**. Nombre: `OS Salud CLI`.
   - Guardar el **Client ID** y el **Client Secret**.

   Si la consola no ofrece "Aplicacion de escritorio", crear tipo **Aplicacion web** y agregar
   `http://localhost:8710/callback` como URI de redireccion autorizada.

### Publicar a produccion (no es opcional)

En la **Pantalla de consentimiento de OAuth**, boton **PUBLICAR APP**, confirmar el paso a
**In production**.

En modo *Testing* el refresh token **expira cada 7 dias** y el sync se muere solo. Publicando,
deja de expirar. No hace falta verificacion CASA: es uso personal, un usuario, muy por debajo
del tope de 100. Google va a mostrar una pantalla de "app no verificada" al autorizar; se
acepta con **Configuracion avanzada > Ir a OS Salud**.

---

## Paso B. Tarea 1: probar la escritura de nutricion

Esto decide si hace falta Fitbit. Se corre una sola vez, desde la maquina local.

```bash
cd apps/web
GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... \
  node scripts/probar-google-health-nutricion.mjs
```

Abre el navegador, pide consentimiento, y hace la llamada real. Al final imprime
`VEREDICTO: FUNCIONA` o `VEREDICTO: NO FUNCIONA` con el error crudo de Google.

Tambien imprime el **refresh token**: guardarlo, sirve para la credencial de n8n.

Si funciona, queda un registro `PRUEBA OS - borrar` en la cuenta. Borrarlo a mano desde la app.

**Lo que ya sabemos sin correrlo** (contra el discovery document de la API, revision 20260722,
que describe la API desplegada, no la documentacion): el metodo
`users.dataTypes.dataPoints.create` existe, acepta el scope `googlehealth.nutrition.writeonly`,
y el union `DataPoint` incluye el campo `nutritionLog` con su esquema completo
(`interval`, `foodDisplayName`, `mealType`, `energy`, `totalCarbohydrate`, `totalFat`,
`nutrients`). La superficie esta desplegada. Lo que la prueba resuelve es si el backend detras
acepta los datos, que es justo donde fallo el 24 de junio.

**Segun el resultado:**

- **FUNCIONA**: la escritura va directo a Google Health. Saltarse el Paso D por completo.
  No se toca `dev.fitbit.com`. Desaparece el fusible de septiembre.
- **NO FUNCIONA**: hacer el Paso D. La escritura sale por Fitbit Web API hasta que Google
  libere la suya.

---

## Paso C. Credencial y flujos en n8n

En n8n (`https://n8n.franciscoabad.com`):

1. **Credentials > New > Google OAuth2 API**.
   - Client ID y Client Secret del Paso A.
   - Scope: los cuatro del Paso A, separados por espacio.
   - Copiar la **OAuth Redirect URL** que muestra n8n y agregarla como URI de redireccion
     autorizada en el cliente OAuth de Google Cloud (tipo Aplicacion web).
   - **Connect my account**, autorizar con la cuenta de Google de Pancho.
   - Nombre: `Google Health (Pancho)`.
2. **Credentials > New > Header Auth** (si no existe ya la de Bearer del OS).
   - Nombre del header: `X-OS-Token`. Valor: el `OS_API_TOKEN` de Vercel.
   - Nombre: `OS API Token`.
3. Importar los dos workflows de `apps/web/n8n/`:
   - `biometricas-sync-diario.json` (entrada, cron 06:30 EC).
   - `nutricion-out-sync.json` (salida, cron cada 30 min).
   En cada nodo HTTP, seleccionar las credenciales creadas arriba (n8n no importa credenciales
   dentro del JSON, a proposito).
4. Activar los dos workflows.

---

## Paso D. Fitbit legacy (SOLO si la Tarea 1 fallo)

Consola: https://dev.fitbit.com/apps/new

1. Tipo de aplicacion: **Personal**. Da acceso automatico a los datos intraday propios sin
   revision.
2. Tipo de acceso OAuth 2.0: **Read & Write**. Sin esto no se puede escribir comida.
3. Callback URL: la OAuth Redirect URL de n8n.
4. Guardar el **Client ID** y el **Client Secret** de Fitbit (son distintos de los de Google).
5. En n8n: credencial **Fitbit OAuth2 API** con esos datos, scope `nutrition`.
6. En el workflow `nutricion-out-sync`, cambiar `?destino=google_health` por
   `?destino=fitbit` en el nodo de la cola, y apuntar el nodo de empuje a
   `https://api.fitbit.com/1/user/-/foods/log.json` (form-urlencoded).

**Fecha de muerte: 30 de septiembre de 2026.** Todo lo que se construya aca es temporal por
diseno. Cuando Google libere la escritura, se cambia solo ese nodo y la lectura no se toca.

---

## Paso E. Verificacion final

1. Registrar una comida en `/os/salud/nutricion`.
2. Correr el workflow `nutricion-out-sync` a mano (**Execute Workflow**).
3. Confirmar que aparece en la app de Fitbit / Google Health.
4. **Correrlo otra vez.** Debe devolver `n: 0` y la app externa debe seguir mostrando **un
   solo** registro.
5. Correr `biometricas-sync-diario` a mano y confirmar en `/os/salud` que aparecen pasos y
   sueno. Correrlo otra vez: el upsert por fecha actualiza la misma fila, no crea otra.
