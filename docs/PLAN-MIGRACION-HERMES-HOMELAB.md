# Plan de migración: Hermes de Nerio/Cortex al HomeLab

Fecha: 12 de agosto de 2026. Estado: propuesto, sin ejecutar.
Base: verificación en vivo por SSH en `pancho-automations-01` y en el VPS de Gustavo el
12 de agosto de 2026, más el canon de [[hermes-a2a-malla-3-nodos-2026-08-11]] y
[[os-hermes-reparacion-nocturna-2026-08-12]].

## 1. Diagnóstico verificado

### VPS `pancho-automations-01` (Hetzner CX23, 2 vCPU, 3.7 GB RAM, Tailscale 100.127.42.51)

Memoria al medir: 2.3 GB usados de 3.7 GB, y **1.6 GB de 2 GB de swap ocupados**.
El swap al 80% es la alarma real. El VPS no está apretado, está sin margen.

Consumo del ecosistema Hermes, cerca de 1.2 GB en reposo:

| Proceso | RAM | Para quién |
|---|---|---|
| `hermes serve --isolated` (2 procesos) | 279 MB + 172 MB | Backend del Desktop |
| Gateway perfil `arazza` | 239 MB | Arazza |
| Gateway perfil default | 175 MB | Pancho (Telegram, WhatsApp, correo) |
| MCP `arazza-admin` | 66 MB | Arazza |
| MCPs de n8n (4 procesos) | 128 MB | Compartido |
| Approval gate | 52 MB | Pancho |
| Bridges y pollers de Arazza | 43 MB | Arazza |
| Watchdogs de MCP | 61 MB | Compartido |

Resto del VPS: n8n 184 MB, Caddy 22 MB, gbrain 134 MB, gbrain-postgres 73 MB,
Pancho OS 105 MB, Cortex OS 46 MB, cortex-bridge 7 MB, taskr completo 170 MB.

### Hallazgo clave: los Hermes de tenant no son servicios

No hay demonios por tenant que mudar. Los tenants corren como **procesos efímeros**
lanzados bajo demanda, con `HERMES_HOME` aislado:

- `cortex-bridge/bridge.py` línea 269: `subprocess.run([HERMES_BIN, "-z", prompt], cwd=tdir, env=env)`
  con `HERMES_HOME=/root/cortex/tenants/<slug>/.hermes-home`. Se usa en onboarding y en `hermes kanban`.
- `cortex-os/src/pages/api/tools/briefing-tick.ts` línea 41: `execFile(...)` lanza Hermes por tenant.
  Lo dispara el cron del VPS cada 15 minutos contra `app-cortex.franciscoabad.com/api/tools/briefing-tick`.

La migración no consiste en mudar servicios, sino en cambiar **dónde se ejecuta el proceso**.
Son dos puntos de despacho, no veinte.

Tenants aprovisionados: 7 directorios (`carlos-cardenas`, `daniel-lee`, `javier-marcet`,
`juan-abad`, `mariana-priego`, `pancho-test`, `ricardo-asmat`), con tope `MAX_TENANTS=4`.
Homes de 42 MB los dos mayores y cerca de 300 KB los otros cinco. Los `cron/jobs.json`
por tenant están vacíos: toda la carga recurrente pasa por el tick de 15 minutos.

### HomeLab `desktop-7nlredr` (Tailscale 100.127.201.2)

i7-9700K de 8 núcleos, 32 GB de RAM, GTX 1660 Ti de 6 GB, Windows con Docker Desktop,
WSL2 y Ollama. **Al escribir este plan estaba offline, visto por última vez hace una hora.**
Sus procesos de Hermes arrancan por tareas programadas ONLOGON, o sea que dependen de
una sesión de Windows iniciada. Esa es la primera sospecha de por qué se cae.

La laptop (`pancho-windows`, Ryzen 9 6900HS, RTX 3060, 39 GB) sí estaba en línea, pero
es equipo móvil y no sirve como destino de carga de clientes.

## 2. Lo que ya está construido y cambia el diseño

La malla A2A de tres nodos existe, tiene tokens cruzados por par y está verificada de
punta a punta. El VPS ya tiene a `pancho-homelab` como peer de confianza y **ya puede
delegarle ejecución local**. No hay que inventar un canal de despacho: hay que usar el que
se armó el 11 de agosto.

Dos lecciones recientes que este plan respeta como reglas duras:

1. **El HomeLab solo habla A2A.** El 12 de agosto, tener credenciales de Telegram en el
   HomeLab hizo que dos gateways pelearan el mismo bot y los mensajes de Pancho se
   repartieran al azar contra un Hermes virgen. Ninguna credencial de mensajería baja a
   nodos secundarios.
2. **El HomeLab ya no corre modelo local.** El 11 de agosto se cambió a
   `deepseek/deepseek-v4-flash` por OpenRouter porque el modelo local crasheaba por contexto.
   El ahorro por GPU hoy es aspiracional, no real. No cuenta como justificación de la migración.

## 3. Arquitectura destino

Una capa de despacho compartida por los dos puntos de invocación, con respaldo automático:

```
Cortex OS (VPS, público)
  ├─ briefing-tick.ts ─┐
  └─ cortex-bridge.py ─┴─> despachador
                              ├─ HomeLab en línea  -> A2A a pancho-homelab (9900)
                              └─ HomeLab caído     -> subprocess local (igual que hoy)
```

Decisiones:

1. **El bridge y Cortex OS se quedan en el VPS.** Son la superficie pública. Moverlos agrega
   un salto de red a cada petición y los mata cuando el HomeLab se cae.
2. **El despacho va por A2A sobre Tailscale**, que ya existe, ya tiene autenticación por par
   y ya está probado. Nada de SSH ni de cola nueva en la fase inicial.
3. **Los homes de tenant siguen siendo canónicos en el VPS**, sincronizados al HomeLab antes
   de correr y de regreso al terminar. Con 300 KB a 42 MB, el costo es de segundos. La memoria
   del cliente nunca vive solo en Windows.
4. **El respaldo no es opcional.** Si el HomeLab no responde en pocos segundos, el trabajo corre
   en el VPS igual que hoy. Un HomeLab caído degrada el sistema, no lo rompe.

## 4. Fases

### Fase 0: volver confiable el HomeLab

Sin esto ninguna fase siguiente es segura.

1. **Arranque sin sesión.** Hoy el gateway y el backend arrancan con tareas ONLOGON, que
   requieren que alguien inicie sesión en Windows. Pasarlas a ONSTART o a servicio real, para
   que la máquina vuelva sola tras un reinicio.
2. **Entender la caída de hoy** antes de mitigar: corte de luz, suspensión, actualización de
   Windows o red. La causa cambia la solución.
3. **Alerta de nodo caído**: aviso a Telegram cuando el HomeLab desaparece de Tailscale por
   más de 10 minutos. Hoy no existe, por eso llevaba una hora fuera sin que nadie lo notara.

**Criterio de salida: 14 días seguidos en línea, sin caídas no anunciadas.**

### Fase 1: recuperar memoria del VPS sin tocar clientes ni mensajería

Esta fase no migra nada al HomeLab. Solo devuelve aire al VPS con lo que hoy sobra.

1. **Backend del Desktop bajo demanda.** `hermes-remote-backend` consume cerca de 451 MB
   permanentes para servir el Desktop, que es comodidad tuya, no producción. Encenderlo cuando
   se usa en vez de dejarlo siempre activo libera casi medio giga sin riesgo para nadie.
2. **Revisar el gateway del perfil `arazza` (239 MB) y el MCP `arazza-admin` (66 MB).**
   Según el canon del 11 de agosto, el perfil `arazza` es un cascarón sin skills ni sesiones,
   y el AraHermes real es un tenant de Cortex que corre one-shot con su propio home. Si ese
   gateway resulta vestigial, apagarlo libera otros 300 MB. Verificar antes de tocar, porque
   atiende a un cliente.
3. **La mensajería personal se queda en el VPS.** Telegram, WhatsApp y el correo de
   `alfred@franciscoabad.com` no bajan al HomeLab. Lo de hoy ya demostró el costo.

**Criterio de salida: VPS por debajo de 1.8 GB usados y swap por debajo de 500 MB.**

### Fase 2: mover los runs de tenant de Nerio con respaldo

Aquí recién entran los clientes, y entran de forma que una caída no los deje sin servicio.

1. Escribir el despachador compartido, un solo módulo usado por el bridge y por el tick,
   con A2A como destino y ejecución local como respaldo.
2. Sincronización de homes de tenant en las dos direcciones, con el VPS como fuente de verdad.
3. Migrar primero **un solo tenant de prueba** (`pancho-test`) durante una semana.
4. Luego los tenants internos (`juan-abad`, `carlos-cardenas`).
5. Al final los externos, de a uno.
6. Escalonar el tick de briefings en ventanas, para no crear picos simultáneos.

**Criterio de salida: 30 días sin que un cliente note diferencia, y al menos una caída real
del HomeLab absorbida por el respaldo sin incidente.**

### Fase 3: tier premium con Hermes siempre encendido

El producto que quieres: agente dedicado, siempre activo, con cron propio, kanban con despacho
y webhooks. Es el diferenciador que justifica el precio del plan Chief.

Recomendación honesta: **este tier no debería nacer en el HomeLab.** Un cliente que paga por
"siempre encendido" no puede depender de tu casa, menos con el historial de esta semana.
La secuencia sana es lanzarlo cuando haya servidor propio tras el rebranding y el
levantamiento de capital, usando el HomeLab mientras tanto solo para los runs efímeros de la
fase 2 y para desarrollar el tier.

Si aun así lo quieres antes: dos o tres clientes fundadores avisados de que es beta, con
respaldo al VPS y expectativa de disponibilidad puesta por escrito.

## 5. Capacidad real del HomeLab

Reservando 8 GB para Windows, Docker y Ollama, quedan cerca de 24 GB utilizables.

- **Runs efímeros de tenant** (300 a 500 MB cada uno, de vida corta): cerca de 48 simultáneos.
  Con briefings escalonados eso sostiene entre 100 y 200 tenants del modelo actual.
- **Hermes premium siempre encendido** (600 MB a 1 GB por tenant, medido sobre tu propio stack):
  entre 15 y 20 clientes con holgura, 24 en el límite.

Contra los 8 a 10 tenants que tolera hoy el VPS antes de morir en swap.

Sobre la GPU: la 1660 Ti sirve para extracción, visión y embeddings locales, pero el HomeLab
hoy razona con DeepSeek por OpenRouter porque el modelo local crasheaba. Mientras eso no se
resuelva, la migración compra RAM, no ahorro de API.

## 6. Qué NO se migra

- **taskr**: 170 MB en total, medido. Migrarlo no libera nada relevante y pondría un producto
  público con lanzamiento en septiembre detrás de internet residencial. Se queda en el VPS
  hasta el servidor nuevo.
- **Cortex OS y cortex-bridge**: superficie pública.
- **gbrain, Postgres, n8n y Caddy**: la verdad y el enrutamiento viven remotos por canon.
- **Mensajería personal**: Telegram, WhatsApp y correo se quedan en el VPS.
- **Nada del VPS de Gustavo.** Es infraestructura de Rafik, con sus llaves, y ya quedó decidido
  que no toca el HomeLab ni la GPU.

## 7. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| HomeLab se cae (pasó hoy) | Respaldo automático al VPS en cada despacho, más alerta a Telegram |
| Duplicar canales de mensajería rompe el primario (pasó hoy) | Ninguna credencial de mensajería en nodos secundarios, regla dura |
| Arranque ONLOGON no sobrevive reinicios | Pasar a ONSTART o servicio en la fase 0 |
| Se pierde el home de un tenant en Windows | VPS como fuente de verdad, sincronización de vuelta tras cada run |
| Internet residencial se cae | Igual que caída de HomeLab, cubierto por el respaldo |
| Latencia por sincronización de homes | Sincronización incremental, homes pequeños, solo aplica a runs, no a peticiones del OS |
| Crecimiento supera al HomeLab | Servidor propio tras el levantamiento de capital, migración limpia porque el despachador ya abstrae el destino |

## 8. Estado de ejecución (12 de agosto de 2026)

### Ejecutado y verificado

**Fase 1 completa, con un hallazgo mejor que el previsto.** La hipótesis inicial era liberar
memoria apagando el backend del Desktop y el gateway de Arazza. Al medir el árbol de procesos
resultó falsa en los dos casos, y apareció algo mejor:

- El backend del Desktop (`hermes-remote-backend`) pesa 104 MB con sus hijos, no 451 MB.
  Apagarlo cuesta tu Desktop y devuelve poco. **No se tocó.**
- El gateway de Arazza corre bajo `hermes-gateway-arazza.service` y su perfil tiene 70 skills
  y sesiones activas. No es vestigial, atiende a un cliente. **No se tocó.**
- Los 457 MB que se veían como backend del Desktop eran en realidad **dos procesos huérfanos**
  (`serve --isolated --ssh-session-token-file`) dejados por sesiones SSH del 10 de agosto,
  en `session-9246.scope` y `session-9432.scope`, escuchando en puertos de loopback aleatorios
  sin una sola conexión establecida. Basura pura de dos días atrás.

Resultado tras matarlos: **394 MB liberados**. Memoria usada de 2475 MB a 2081 MB, disponible
de 1339 MB a 1733 MB, swap de 1.6 GB a 1.27 GB. Todos los servicios verificados activos
después: `hermes-gateway`, `hermes-approval`, `hermes-remote-backend`, `cortex-bridge`,
`cortex-os`, `arahermes-bridge`, `arahermes-telegram`, `gbrain`. A2A responde 200, el bridge
responde 200, Cortex OS responde 302.

**Prevención instalada.** Cada sesión SSH que corre Hermes puede dejar uno de estos huérfanos,
así que sin limpieza vuelven a acumularse. Script `/root/cortex/bin/limpiar-hermes-huerfanos.sh`,
cron cada 2 horas, log en `/var/log/hermes-huerfanos.log`. Mata solo procesos que cumplan las
tres condiciones a la vez: `ppid == 1`, argumentos con `serve --isolated` y
`--ssh-session-token-file`, y más de 2 horas de vida. Probado en seco antes de activarlo.

**Alerta de nodo caído (Fase 0, punto 3).** Script `/root/cortex/bin/monitor-homelab.sh`,
cron cada 10 minutos, estado en `/var/lib/homelab-monitor/estado`, log en
`/var/log/homelab-monitor.log`. Avisa a Telegram solo en el cambio de estado, nunca repite.
Camino de entrega probado con un mensaje real.

### Bloqueado por el HomeLab caído

El HomeLab lleva más de dos horas fuera de Tailscale. No se puede ejecutar en remoto lo que
exige la máquina encendida:

- El resto de la Fase 0 (pasar el arranque de ONLOGON a ONSTART, entender la causa de la caída).
- Toda la Fase 2, porque además falta un prerrequisito que no estaba en el plan original:
  **el VPS no tiene acceso SSH al HomeLab.** Hoy solo existe laptop a HomeLab. Sin esa llave
  no hay despacho determinista posible.

Corrección de diseño respecto a la sección 3: A2A sirve para que un agente le pida cosas a otro,
pero no para ejecutar el `HERMES_HOME` de un tenant específico en la otra máquina. Los runs de
tenant necesitan ejecución determinista, o sea SSH del VPS al HomeLab, no A2A.

## 9. Runbook para cuando el HomeLab vuelva

Ejecutar en este orden. Los tres primeros pasos cierran la Fase 0.

1. **Diagnosticar la caída.** Desde la laptop: `ssh homelab` y revisar eventos de apagado
   inesperado y de actualizaciones de Windows. La causa decide la mitigación.
2. **Arranque sin sesión.** Las tareas `PanchoAtlas-HermesA2A` y `PanchoAtlas-HermesServe` son
   ONLOGON, así que no vuelven solas tras un reinicio sin que alguien inicie sesión. Cambiarlas
   a ONSTART con la opción de correr aunque el usuario no esté conectado. Verificar reiniciando
   la máquina y confirmando que vuelve sola a Tailscale y a los puertos 9900 y 9120.
3. **Confirmar la alerta.** Con el monitor ya instalado, la vuelta debe producir un mensaje de
   Telegram automático. Si no llega, revisar `/var/log/homelab-monitor.log`.
4. **Dar SSH del VPS al HomeLab.** Copiar la clave pública del VPS a
   `C:\ProgramData\ssh\administrators_authorized_keys` del HomeLab, **no** a `~/.ssh/authorized_keys`,
   porque `Francisco` es administrador y `sshd` aplica `Match Group administrators`. Los permisos
   se dan por SID en un Windows en español: `*S-1-5-32-544` y `*S-1-5-18`. Requiere PowerShell
   elevada en el propio HomeLab. Las tres trampas están documentadas en [[acceso-homelab-ssh-rdp]].
5. **Probar ejecución remota de un tenant** con `pancho-test`, a mano y sin tocar código:
   sincronizar su home al HomeLab, correr `hermes -z` allá con `HERMES_HOME` apuntando a la copia,
   y sincronizar de vuelta. Recién cuando eso funcione a mano tiene sentido escribirlo en código.
6. **Escribir el despachador** con el resultado real del paso 5, no antes. Un solo módulo usado
   por `cortex-bridge/bridge.py` y por `briefing-tick.ts`, con chequeo de salud de pocos segundos
   y caída automática a ejecución local. Se despliega apagado por variable de entorno, se prende
   primero solo para `pancho-test`.
7. **Escalonar el tick de briefings** antes de sumar tenants externos.

Nada de tenants de clientes hasta tener 14 días de HomeLab en línea sin caídas.

## 10. Nota sobre el modelo local

Queda como intención volver al modelo local del HomeLab cuando se estabilice, que era el
objetivo original del nodo. Hoy razona con DeepSeek por OpenRouter porque el modelo local
crasheaba por contexto y se bajó el techo a 32768 tokens. Mientras eso siga así, esta
migración compra RAM, no ahorro de API. Conviene reintentarlo recién después de la Fase 0,
con la máquina estable, y midiendo antes y después.

Relacionado: [[panchoatlas-canon]] [[cortex-canon]] [[hermes-a2a-malla-3-nodos-2026-08-11]] [[acceso-homelab-ssh-rdp]]
