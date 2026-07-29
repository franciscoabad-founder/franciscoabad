#!/usr/bin/env node
/**
 * TAREA 1: determinar empiricamente si la Google Health API v4 acepta escritura
 * de nutricion. No lee documentacion: hace la llamada real y reporta el codigo
 * y el cuerpo que devuelve Google.
 *
 * Contradiccion que resuelve: la documentacion dice que el food log de Fitbit
 * mapea a `nutrition-log` y que se crea/actualiza por API; la prueba de campo
 * del 24 jun 2026 dice que el scope existe pero el endpoint no acepta datos.
 *
 * Que hace, en orden:
 *   1. OAuth 2.0 authorization code + PKCE contra localhost (abre el navegador).
 *   2. GET users/me para resolver el health_user_id.
 *   3. POST de un nutrition-log de prueba ("PRUEBA OS - borrar").
 *   4. Reintento con `patch` si el `create` falla, para separar "no existe el
 *      metodo" de "no acepta este payload".
 *   5. Veredicto explicito: FUNCIONA o NO FUNCIONA, con el error crudo.
 *
 * Uso:
 *   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... \
 *     node apps/web/scripts/probar-google-health-nutricion.mjs
 *
 * Requiere que el cliente OAuth sea de tipo "Aplicacion de escritorio" (o Web
 * con http://localhost:8710/callback como URI de redireccion autorizada).
 *
 * El registro de prueba QUEDA en la cuenta si la escritura funciona. Hay que
 * borrarlo a mano desde la app de Fitbit / Google Health.
 */

import { createServer } from 'node:http';
import { createHash, randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const PUERTO = Number(process.env.PUERTO_CALLBACK || 8710);
const REDIRECT_URI = `http://localhost:${PUERTO}/callback`;
const API = 'https://health.googleapis.com/v4';

// Solo lo que la prueba necesita. Pedir de mas endurece la pantalla de consentimiento.
const SCOPES = [
  'https://www.googleapis.com/auth/googlehealth.nutrition.writeonly',
  'https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly',
].join(' ');

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Faltan GOOGLE_CLIENT_ID y/o GOOGLE_CLIENT_SECRET en el entorno.');
  process.exit(1);
}

const b64url = (buf) => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

function abrirNavegador(url) {
  const cmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  try {
    spawn(cmd, [url], { shell: process.platform === 'win32', stdio: 'ignore', detached: true }).unref();
  } catch {
    /* si no se puede abrir, el usuario copia la URL a mano */
  }
}

/** Levanta el servidor de callback y devuelve el authorization code. */
function esperarCodigo(state) {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url, `http://localhost:${PUERTO}`);
      if (url.pathname !== '/callback') { res.writeHead(404).end(); return; }
      const code = url.searchParams.get('code');
      const err = url.searchParams.get('error');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h2>${code ? 'Listo. Volvé a la terminal.' : 'Error: ' + err}</h2>`);
      server.close();
      if (url.searchParams.get('state') !== state) return reject(new Error('state no coincide'));
      code ? resolve(code) : reject(new Error(`consentimiento rechazado: ${err}`));
    });
    server.listen(PUERTO);
    setTimeout(() => { server.close(); reject(new Error('timeout de 5 min esperando el consentimiento')); }, 300_000);
  });
}

async function obtenerToken() {
  const verifier = b64url(randomBytes(48));
  const challenge = b64url(createHash('sha256').update(verifier).digest());
  const state = b64url(randomBytes(16));

  const auth = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  auth.searchParams.set('client_id', CLIENT_ID);
  auth.searchParams.set('redirect_uri', REDIRECT_URI);
  auth.searchParams.set('response_type', 'code');
  auth.searchParams.set('scope', SCOPES);
  auth.searchParams.set('code_challenge', challenge);
  auth.searchParams.set('code_challenge_method', 'S256');
  auth.searchParams.set('access_type', 'offline');
  auth.searchParams.set('prompt', 'consent');
  auth.searchParams.set('state', state);

  console.log('\nAbriendo el navegador para autorizar. Si no se abre, pegá esta URL:\n');
  console.log(auth.toString() + '\n');
  abrirNavegador(auth.toString());

  const code = await esperarCodigo(state);

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      code_verifier: verifier,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
    }),
  });
  const tok = await res.json();
  if (!res.ok) throw new Error(`token: ${res.status} ${JSON.stringify(tok)}`);
  if (tok.refresh_token) {
    console.log('\nRefresh token obtenido (guardalo en la credencial de n8n):');
    console.log(tok.refresh_token + '\n');
  }
  return tok.access_token;
}

async function llamar(metodo, ruta, token, body) {
  const res = await fetch(`${API}/${ruta}`, {
    method: metodo,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const texto = await res.text();
  let json = null;
  try { json = JSON.parse(texto); } catch { /* respuesta no JSON */ }
  return { ok: res.ok, status: res.status, json, texto };
}

function ahoraIntervalo() {
  const fin = new Date();
  const ini = new Date(fin.getTime() - 20 * 60_000);
  return {
    startTime: ini.toISOString(),
    endTime: fin.toISOString(),
    startUtcOffset: '-18000s',
    endUtcOffset: '-18000s',
  };
}

const linea = () => console.log('-'.repeat(72));

(async () => {
  const token = await obtenerToken();

  linea();
  console.log('1. Resolviendo el health_user_id (GET users/me)');
  const ident = await llamar('GET', 'users/me', token);
  console.log(`   HTTP ${ident.status}`, ident.texto.slice(0, 400));
  const userId = ident.json?.healthUserId || 'me';
  console.log(`   usando user: ${userId}`);

  // Id de data point provisto por el cliente: 4-63 chars, minusculas/digitos/guiones.
  const dpId = `prueba-os-${Date.now()}`;
  const payload = {
    name: `users/${userId}/dataTypes/nutrition-log/dataPoints/${dpId}`,
    nutritionLog: {
      interval: ahoraIntervalo(),
      foodDisplayName: 'PRUEBA OS - borrar',
      mealType: 'SNACK',
      energy: { kcal: 100 },
      totalCarbohydrate: { grams: 10 },
      totalFat: { grams: 3 },
      nutrients: [{ nutrient: 'PROTEIN', quantity: { grams: 8 } }],
    },
  };

  linea();
  console.log('2. CREATE nutrition-log');
  console.log(JSON.stringify(payload, null, 2));
  const create = await llamar(
    'POST', `users/${userId}/dataTypes/nutrition-log/dataPoints`, token, payload,
  );
  console.log(`   HTTP ${create.status}`, create.texto.slice(0, 1500));

  let patch = null;
  if (!create.ok) {
    linea();
    console.log('3. El create fallo. Probando PATCH sobre el mismo data point');
    patch = await llamar(
      'PATCH',
      `users/${userId}/dataTypes/nutrition-log/dataPoints/${dpId}?updateMask=nutritionLog`,
      token,
      payload,
    );
    console.log(`   HTTP ${patch.status}`, patch.texto.slice(0, 1500));
  }

  linea();
  const funciona = create.ok || patch?.ok;
  console.log(funciona ? 'VEREDICTO: FUNCIONA' : 'VEREDICTO: NO FUNCIONA');
  if (funciona) {
    console.log('La escritura de nutricion va directo a Google Health.');
    console.log('NO hace falta registrar nada en dev.fitbit.com.');
    console.log(`Verificá en la app de Fitbit / Google Health que aparece "PRUEBA OS - borrar" y borralo.`);
    console.log(`Data point: ${payload.name}`);
  } else {
    console.log('La escritura por Google Health no esta disponible todavia.');
    console.log('Plan B: Fitbit Web API (app "Personal" read-write en dev.fitbit.com).');
    console.log('Recordá que esa API se apaga el 30 de septiembre de 2026.');
    console.log(`Error crudo del create: ${create.texto.slice(0, 800)}`);
  }
  linea();
  process.exit(funciona ? 0 : 2);
})().catch((err) => {
  console.error('\nLa prueba no llego a correr:', err.message);
  process.exit(1);
});
