import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const API_URL = process.env.OS_API_URL || 'http://localhost:4321';
const API_TOKEN = process.env.OS_API_TOKEN;

if (!API_TOKEN) console.error('Warning: OS_API_TOKEN is not set.');

const server = new Server({ name: 'os-mcp', version: '1.0.0' }, { capabilities: { tools: {} } });

const OsApiRequestSchema = z.object({
  module: z.string(),
  method: z.enum(['GET', 'POST', 'PATCH', 'DELETE']),
  query: z.record(z.string(), z.string()).optional(),
  body: z.record(z.string(), z.any()).optional(),
});

const modules = [
  'agenda', 'aprobaciones', 'bandeja', 'biometricas', 'capturar', 'comidas',
  'contenido', 'cortex-admin', 'cortex-invitar', 'cuentas', 'deudas', 'dia',
  'gastos', 'gfit', 'grabaciones', 'habitos', 'juego', 'kpis', 'leads',
  'lineas', 'notas', 'objetivos', 'onboarding', 'pendientes', 'por-cobrar',
  'preguntar', 'presupuestos', 'priority-stack', 'recordatorios',
  'redes-metricas', 'revision', 'salud', 'semana', 'system', 'tareas', 'taski',
];

const tools: Tool[] = [
  {
    name: 'os_list_modules',
    description: 'Lista los modulos disponibles del Pancho OS.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'os_api_request',
    description: 'Consulta o modifica datos del Pancho OS mediante su API autenticada.',
    inputSchema: {
      type: 'object',
      properties: {
        module: { type: 'string', description: 'Modulo o subruta del OS.' },
        method: { type: 'string', enum: ['GET', 'POST', 'PATCH', 'DELETE'] },
        query: { type: 'object', additionalProperties: { type: 'string' } },
        body: { type: 'object', additionalProperties: true },
      },
      required: ['module', 'method'],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (name === 'os_list_modules') {
    return { content: [{ type: 'text', text: JSON.stringify({ modules }, null, 2) }] };
  }
  if (name !== 'os_api_request') {
    return { isError: true, content: [{ type: 'text', text: `Unknown tool: ${name}` }] };
  }
  const parsed = OsApiRequestSchema.safeParse(args);
  if (!parsed.success) {
    return { isError: true, content: [{ type: 'text', text: `Invalid arguments: ${parsed.error.message}` }] };
  }
  const { module, method, query, body } = parsed.data;
  if (!modules.includes(module) && !modules.some((item) => module.startsWith(`${item}/`))) {
    return { isError: true, content: [{ type: 'text', text: `Unknown module: ${module}` }] };
  }
  try {
    const url = new URL(`/api/os/${module}`, API_URL);
    for (const [key, value] of Object.entries(query ?? {})) url.searchParams.append(key, value);
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (API_TOKEN) {
      headers.Authorization = `Bearer ${API_TOKEN}`;
      headers['X-OS-Token'] = API_TOKEN;
    }
    const response = await fetch(url, {
      method,
      headers,
      ...(body && (method === 'POST' || method === 'PATCH') ? { body: JSON.stringify(body) } : {}),
    });
    const responseText = await response.text();
    let payload: unknown = responseText;
    try { payload = JSON.parse(responseText); } catch { /* non-JSON response */ }
    if (!response.ok) {
      return { isError: true, content: [{ type: 'text', text: `API Error (${response.status}):\n${typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2)}` }] };
    }
    return { content: [{ type: 'text', text: typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2) }] };
  } catch (error) {
    return { isError: true, content: [{ type: 'text', text: `Network Error: ${error instanceof Error ? error.message : String(error)}` }] };
  }
});

async function main() {
  await server.connect(new StdioServerTransport());
  console.error('Pancho OS MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
