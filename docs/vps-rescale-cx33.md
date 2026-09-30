# Rescale de `pancho-automations-01`: CX23 a CX33

Fecha: 13 de agosto de 2026. Estado: decidido, pendiente de ejecutar.
Contexto: el servidor está apagado esperando el cambio de plan. Hermes VPS no responde
porque vive en esa misma máquina.

## Decisión

**CX33.** 4 vCPU, 8 GB RAM, 80 GB NVMe, 20 TB de tráfico.

Referencia de precio del ajuste Hetzner del 15 de junio de 2026: 8,49 EUR al mes en
Alemania y Finlandia, sin IVA y sin IPv4. Confirmar el monto final en la consola antes
de aceptar, porque varía por ubicación, moneda e IPv4 (cerca de 0,50 EUR al mes).

## Por qué CX33 y no lo que dijo Hermes

Hermes trabajó con datos viejos en tres puntos.

1. **El plan actual no es CX22, es CX23.** Está medido y escrito en
   `docs/PLAN-MIGRACION-HERMES-HOMELAB.md`, verificado por SSH el 12 de agosto de 2026.
   CX23 es de la generación Gen3, que Hetzner introdujo en octubre de 2025.
2. **CX32 ya no existe como opción.** Es Gen2, línea descontinuada. No aparece en la
   consola porque no se puede ordenar. El sucesor de 8 GB dentro de Gen3 es CX33.
3. **Los precios que citó son anteriores al 15 de junio de 2026.** Ese día Hetzner
   subió CX y CAX cerca de 33 a 38 por ciento, y CPX y CCX entre 144 y 176 por ciento.

## Por qué se descartan las otras opciones

**CAX21 (ARM Ampere).** No es un rescale. No se puede cambiar de tipo entre x86 y ARM:
hay que crear un servidor nuevo, migrar todo y reapuntar DNS. Con nueve servicios
systemd, ocho contenedores y credenciales cifradas de n8n en juego, el riesgo no lo
paga el ahorro de un euro.

**CPX31 y la línea CPX Gen2.** Subió entre 144 y 176 por ciento en junio. Dejó de ser
la opción de valor. La carga del VPS es de servicios en reposo y picos cortos, no de
CPU sostenida, así que el vCPU dedicado no compra nada aquí.

**CX43 (8 vCPU, 16 GB, 160 GB, cerca de 15,99 EUR).** Es lo correcto solo si el tier
premium de Hermes siempre encendido nace en el VPS. El plan de migración dice
explícitamente que ese tier no debería nacer ahí, sino en servidor propio tras el
levantamiento de capital. CX33 hoy, y CX43 más adelante si taskr o Cortex lo piden.
Escalar de CX33 a CX43 después es otro rescale simple: misma línea, misma arquitectura.

## Lo que hay que saber antes de apretar el botón

- **El rescale reprecia el servidor de forma permanente.** Cualquier cambio de tipo,
  para arriba o para abajo, mueve la máquina a las tarifas de junio de 2026. El precio
  heredado del CX23 se pierde y no vuelve.
- **El disco crece de 40 a 80 GB y ese cambio es de una sola vía.** Hetzner no encoge
  discos. Después de esto no se puede bajar a un plan de disco menor. Como el disco
  está al 72 por ciento, conviene tomarlo.
- **Con `--keep-disk` el disco no crece y el cambio sería reversible.** No es lo que
  queremos aquí, justamente por el 72 por ciento.

## Ejecución

El servidor ya está apagado.

```bash
hcloud server change-type pancho-automations-01 cx33
hcloud server poweron pancho-automations-01
```

Por consola web: proyecto, servidor, pestaña Rescale, elegir CX33, confirmar.

## Verificación después del arranque

### 1. Recursos

```bash
free -h                 # esperar cerca de 7,8 GB totales
df -h /                 # esperar cerca de 78 GB, no 38
nproc                   # esperar 4
swapon --show           # /swapfile de 2 GB sigue ahí
```

Si el disco no creció solo, cloud-init no corrió el growpart:

```bash
growpart /dev/sda 1 && resize2fs /dev/sda1
```

### 2. Red Docker antes que nada

gbrain está bindeado a `172.18.0.1:3131`. Si Docker recreó `n8n_n8n_net` con otro
gateway, gbrain no levanta y Caddy no lo alcanza.

```bash
docker network inspect n8n_n8n_net --format '{{(index .IPAM.Config 0).Gateway}}'
```

Tiene que decir `172.18.0.1`. Si cambió, hay que ajustar el bind de gbrain y la regla
de UFW antes de seguir.

### 3. Contenedores

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}'
```

Esperar ocho contenedores arriba, entre ellos `n8n-n8n-1`, `n8n-caddy-1`,
`gbrain-postgres` y los de taskr y mongo.

### 4. Servicios systemd

```bash
systemctl is-active gbrain hermes-gateway hermes-approval hermes-gateway-arazza \
  hermes-remote-backend cortex-bridge cortex-os arahermes-bridge arahermes-telegram
```

Todos deben decir `active`.

### 5. Endpoints públicos

```bash
curl -sSo /dev/null -w '%{http_code}\n' https://n8n.franciscoabad.com
curl -sSo /dev/null -w '%{http_code}\n' https://brain.franciscoabad.com/mcp
curl -sSo /dev/null -w '%{http_code}\n' https://app-cortex.franciscoabad.com
```

Referencia del 12 de agosto: A2A responde 200, el bridge responde 200, Cortex OS
responde 302.

### 6. Crons

```bash
crontab -l
```

Deben seguir los tres: limpieza de huérfanos de Hermes cada 2 horas, monitor del
HomeLab cada 10 minutos, sync de gstack-artifacts cada hora.

### 7. Tailscale

```bash
tailscale status | head -5
```

El VPS debe volver como `100.127.42.51` y ver a `pancho-homelab`.

## Después del rescale

Actualizar en `CLAUDE.md`, sección VPS Automations, la línea de specs: pasa de
2 vCPU y 3,7 GB a 4 vCPU y 7,8 GB, disco de 80 GB, plan CX33.

Con 8 GB el swap deja de ser el cuello de botella. La medición del 12 de agosto dejó
el VPS en 2081 MB usados y 1,27 GB de swap ocupado sobre 3,7 GB totales. En 8 GB eso
mismo cabe sin tocar swap, y el techo de tenants concurrentes sube de los 8 a 10 de
hoy a cerca del doble.
