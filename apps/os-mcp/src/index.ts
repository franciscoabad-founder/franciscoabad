import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const API_URL = process.env.OS_API_URL || "http://localhost:4321";
const API_TOKEN = process.env.OS_API_TOKEN;

if (!API_TOKEN) {
  console.error("Warning: OS_API_TOKEN is not set.");
}

const server = new Server(
  {
    name: "os-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const OsApiRequestSchema = z.object({
  module: z.string().describe("The OS module to interact with, e.g., 'tareas', 'agenda', 'notas', 'system'."),
  method: z.enum(["GET", "POST", "PATCH", "DELETE"] as const).describe("The HTTP method to use."),
  query: z.record(z.string(), z.string()).optional().describe("Optional query parameters."),
  body: z.record(z.string(), z.any()).optional().describe("Optional request body for POST/PATCH methods."),
});

const modules = [
  "agenda", "aprobaciones", "bandeja", "biometricas", "capturar", "comidas",
  "contenido", "cortex-admin", "cortex-invitar", "cuentas", "deudas", "dia",
  "gastos", "gfit", "grabaciones", "habitos", "juego", "kpis", "leads",
  "lineas", "notas", "objetivos", "onboarding", "pendientes", "por-cobrar",
  "preguntar", "presupuestos", "priority-stack", "recordatorios",
  "redes-metricas", "revision", "salud", "semana", "system", "tareas", "taski"
];

const tools: Tool[] = [
  {
    name: "os_list_modules",
    description: "List all available OS modules that can be interacted with using os_api_request.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "os_api_request",
    description: "Make a request to the Pancho OS API modules. Use this to read or modify any data in the OS, such as tasks (tareas), events (agenda), notes (notas), etc. The API URL and token are automatically handled.",
    inputSchema: {
      type: "object",
      properties: {
        module: {
          type: "string",
          description: "The OS module to interact with, e.g., 'tareas', 'agenda', 'notas', 'system'.",
        },
        method: {
          type: "string",
          enum: ["GET", "POST", "PATCH", "DELETE"],
          description: "The HTTP method to use.",
        },
        query: {
          type: "object",
          additionalProperties: { type: "string" },
          description: "Optional query parameters as key-value pairs.",
        },
        body: {
          type: "object",
          additionalProperties: true,
          description: "Optional JSON body for POST/PATCH methods.",
        },
      },
      required: ["module", "method"],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "os_list_modules") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ modules }, null, 2),
        },
      ],
    };
  }

  if (name === "os_api_request") {
    const parsedArgs = OsApiRequestSchema.safeParse(args);
    if (!parsedArgs.success) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Invalid arguments: ${parsedArgs.error.message}`,
          },
        ],
      };
    }

    const { module, method, query, body } = parsedArgs.data;

    if (!modules.includes(module) && !modules.find(m => module.startsWith(m + '/'))) {
        return {
            isError: true,
            content: [{ type: "text", text: `Unknown module: ${module}. Use os_list_modules to see available modules.` }]
        };
    }

    try {
      const url = new URL(`/api/os/${module}`, API_URL);
      if (query) {
        for (const [key, value] of Object.entries(query)) {
          url.searchParams.append(key, value as string);
        }
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (API_TOKEN) {
        headers["Authorization"] = `Bearer ${API_TOKEN}`;
        // some endpoints might expect X-OS-Token
        headers["X-OS-Token"] = API_TOKEN;
      }

      const fetchOptions: RequestInit = {
        method,
        headers,
      };

      if (body && (method === "POST" || method === "PATCH")) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url.toString(), fetchOptions);

      const responseText = await response.text();
      let responseJson;
      try {
        responseJson = JSON.parse(responseText);
      } catch {
        // Not JSON
      }

      if (!response.ok) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `API Error (${response.status} ${response.statusText}):\n${
                responseJson ? JSON.stringify(responseJson, null, 2) : responseText
              }`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: responseJson ? JSON.stringify(responseJson, null, 2) : responseText,
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Network Error: ${error.message}`,
          },
        ],
      };
    }
  }

  return {
    isError: true,
    content: [
      {
        type: "text",
        text: `Unknown tool: ${name}`,
      },
    ],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Pancho OS MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
