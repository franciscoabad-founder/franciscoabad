# Flujos n8n del OS

Workflows versionados aca para poder revisarlos en el repo. **No contienen credenciales**:
al importarlos en n8n hay que seleccionar a mano la credencial en cada nodo HTTP.

Instancia: `https://n8n.franciscoabad.com` (VPS `pancho-automations-01`).

| Archivo | Que hace | Cron |
|---|---|---|
| `biometricas-sync-diario.json` | Google Health -> `POST /api/os/biometricas`. Pasos, sueno, frecuencia cardiaca en reposo y peso del dia anterior. | 06:30 EC |
| `nutricion-out-sync.json` | Cola de `comidas_log` -> Google Health `nutrition-log`. Unica direccion de salida. | cada 30 min |

## Credenciales que hay que seleccionar al importar

- **Google OAuth2 API** (`Google Health (Pancho)`): en todos los nodos `GH *` y en
  `POST nutrition-log`.
- **Header Auth** (`OS API Token`, header `X-OS-Token`): en todos los nodos que apuntan a
  `franciscoabad.com/api/os/*`.

Ver `apps/web/docs/google-health-setup.md` para crearlas.

## Backfill de biometricas

`biometricas-sync-diario` acepta `{ "desde": "2026-07-01", "hasta": "2026-07-26" }` al
ejecutarlo a mano, o `{ "fecha": "2026-07-20" }` para un dia suelto. El endpoint hace upsert
por fecha, asi que solapar un backfill con datos ya cargados no duplica nada.

## Contratos

- Entrada: `apps/web/docs/contrato-biometricas.md`
- Salida: `apps/web/docs/contrato-nutricion-out.md`
