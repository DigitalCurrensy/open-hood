import { AGENT_FN_NAMES } from "@/lib/agent/types";

export const OPENAPI_SPEC = {
  openapi: "3.1.0",
  info: {
    title: "Open Hood advocate API",
    version: "1.0.0",
    summary: "Consumer advocate: quotes, codes, VIN, shops, recalls.",
    description:
      "POST /api/agent runs bay tools (VIN, DTC, quote, symptoms, fluids, guides, directory, recalls, EPA MPG, playbooks, RO terms, parts search URLs) then writes a Beginner or Expert brief. GET /api/agent reports desk status. GET /agent is the advocate desk. GET /agent/api renders this spec. This is not a shop booking API and not a substitute for a licensed inspection.",
  },
  servers: [{ url: "/", description: "Same origin as the bay" }],
  tags: [
    { name: "Advocate", description: "Advocate desk + bay tools" },
    { name: "Spec", description: "This OpenAPI document" },
  ],
  paths: {
    "/api/agent": {
      get: {
        tags: ["Advocate"],
        operationId: "getAgentStatus",
        summary: "Desk status and tool list",
        description:
          "Returns whether the optional photo connection is on, the callable tool names, and reading levels beginner | expert.",
        responses: {
          "200": {
            description: "Status",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AgentStatus" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Advocate"],
        operationId: "postAgent",
        summary: "Ask the advocate",
        description:
          "Send messages, optional vehicle context, beginner|expert, and an optional quote/leak/light image. The server runs tools from keywords (and an optional connection when a key is set). Reply includes facts, invocations, counter scripts, and next-desk links (/quote /guides /directory /obd /expert).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AgentRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "JSON brief, or SSE when Accept includes text/event-stream",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AgentReply" } },
              "text/event-stream": {
                schema: { type: "string" },
                description: "Events: tools, delta, done (done.reply is AgentReply)",
              },
            },
          },
          "400": { description: "Missing or invalid messages" },
          "413": { description: "Image too large" },
        },
      },
    },
    "/api/openapi": {
      get: {
        tags: ["Spec"],
        operationId: "getOpenApi",
        summary: "OpenAPI 3.1 document",
        parameters: [
          {
            name: "format",
            in: "query",
            schema: { type: "string", enum: ["yaml", "json"] },
            description: "yaml (default) or json",
          },
        ],
        responses: {
          "200": {
            description: "OpenAPI 3.1",
            content: {
              "application/yaml": { schema: { type: "string" } },
              "application/json": { schema: { type: "object" } },
            },
          },
        },
      },
    },
    "/agent": {
      get: {
        tags: ["Advocate"],
        operationId: "getAgentPage",
        summary: "Advocate desk",
        description: "Browser page. Beginner / Expert toggle. Not an API.",
        responses: { "200": { description: "HTML" } },
      },
    },
    "/agent/api": {
      get: {
        tags: ["Spec"],
        operationId: "getAgentApiDocs",
        summary: "Readable OpenAPI view",
        responses: { "200": { description: "HTML docs" } },
      },
    },
  },
  components: {
    schemas: {
      ReadingLevel: { type: "string", enum: ["beginner", "expert"] },
      AgentToolName: { type: "string", enum: [...AGENT_FN_NAMES] },
      AgentRequest: {
        type: "object",
        required: ["messages"],
        properties: {
          messages: {
            type: "array",
            items: { $ref: "#/components/schemas/AgentMessage" },
            description: "Last message must be role=user",
          },
          vehicle: { $ref: "#/components/schemas/VehicleContext" },
          readingLevel: { $ref: "#/components/schemas/ReadingLevel" },
          stream: { type: "boolean", description: "false forces JSON even if Accept prefers SSE" },
        },
      },
      AgentMessage: {
        type: "object",
        required: ["role", "content"],
        properties: {
          role: { type: "string", enum: ["user", "assistant"] },
          content: { type: "string" },
          image: { $ref: "#/components/schemas/AgentImage" },
        },
      },
      AgentImage: {
        type: "object",
        required: ["base64", "mimeType"],
        properties: {
          base64: { type: "string", description: "Compressed JPEG/PNG/WebP" },
          mimeType: { type: "string", enum: ["image/jpeg", "image/png", "image/webp"] },
          kind: { type: "string", enum: ["quote", "leak", "light"] },
        },
      },
      VehicleContext: {
        type: "object",
        properties: {
          vin: { type: "string" },
          year: { type: "string" },
          make: { type: "string" },
          model: { type: "string" },
          mileage: { type: "string" },
          concern: { type: "string" },
        },
      },
      AgentReply: {
        type: "object",
        properties: {
          text: { type: "string" },
          scripts: { type: "array", items: { type: "string" } },
          facts: { type: "array", items: { type: "string" } },
          invocations: {
            type: "array",
            items: { $ref: "#/components/schemas/AgentInvocation" },
          },
          tools: { type: "array", items: { $ref: "#/components/schemas/DeskLink" } },
          readingLevel: { $ref: "#/components/schemas/ReadingLevel" },
          engine: { type: "string", enum: ["rules", "gpt-4o"] },
          vision: { type: "string", enum: ["used", "unavailable", "none"] },
          verify: { type: "string" },
        },
      },
      AgentInvocation: {
        type: "object",
        properties: {
          name: { $ref: "#/components/schemas/AgentToolName" },
          ok: { type: "boolean" },
          summary: { type: "string" },
        },
      },
      DeskLink: {
        type: "object",
        properties: {
          href: {
            type: "string",
            enum: ["/quote", "/symptoms", "/guides", "/directory", "/obd", "/expert", "/garage", "/catalog", "/recalls"],
          },
          stamp: { type: "string" },
          title: { type: "string" },
          reason: { type: "string" },
        },
      },
      AgentStatus: {
        type: "object",
        properties: {
          engine: { type: "string", enum: ["rules", "gpt-4o"] },
          vision: { type: "boolean" },
          tools: { type: "array", items: { $ref: "#/components/schemas/AgentToolName" } },
          readingLevels: { type: "array", items: { $ref: "#/components/schemas/ReadingLevel" } },
        },
      },
    },
  },
  "x-openhood-tools": {
    decode_vin: "NHTSA vPIC. 17-character VIN.",
    lookup_dtc: "Local DTC book + generic SAE layout.",
    analyze_quote_text: "Local quote book. Flags flushes and padded lines.",
    diagnose_symptoms: "Noise + when → shop questions.",
    get_fluids_for_vehicle: "Catalog / heuristic fluids card.",
    search_guides: "Owner guide glossary.",
    search_directory: "ZIP + type → OSM rooftops. No booking.",
    get_recalls: "NHTSA year/make/model campaigns. Not VIN open/closed.",
    get_epa_mpg: "FuelEconomy.gov official MPG.",
    search_playbooks: "Named owner playbooks. Beginner script + Expert units. Not a stolen TSB.",
    lookup_ro_term: "Invoice slang (LOF, MPI, R&R). Not legal advice.",
    search_parts: "Outbound catalog search URLs. Not TecDoc. Not live stock.",
  },
} as const;

function yamlScalar(value: string): string {
  if (value === "") return '""';
  if (/[:#{}[\],&*?|<>=!%@`]/.test(value) || /\n/.test(value) || /^(true|false|null|\d)/i.test(value)) {
    if (value.includes("\n")) {
      return `|\n${value
        .split("\n")
        .map((line) => `  ${line}`)
        .join("\n")}`;
    }
    return JSON.stringify(value);
  }
  return value;
}

function toYaml(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (typeof value === "string") return yamlScalar(value);
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return value
      .map((item) => {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          const inner = toYaml(item, indent + 1);
          const lines = inner.split("\n");
          return `${pad}- ${lines[0].trimStart()}${lines.length > 1 ? `\n${lines.slice(1).join("\n")}` : ""}`;
        }
        return `${pad}- ${toYaml(item, 0)}`;
      })
      .join("\n");
  }
  const entries = Object.entries(value as Record<string, unknown>);
  if (!entries.length) return "{}";
  return entries
    .map(([key, child]) => {
      if (child && typeof child === "object") {
        const inner = toYaml(child, indent + 1);
        if (inner === "[]" || inner === "{}") return `${pad}${key}: ${inner}`;
        return `${pad}${key}:\n${inner}`;
      }
      const rendered = toYaml(child, 0);
      if (typeof child === "string" && child.includes("\n") && rendered.startsWith("|")) {
        const body = rendered.slice(2);
        const nested = body
          .split("\n")
          .map((line) => `${"  ".repeat(indent + 1)}${line.replace(/^  /, "")}`)
          .join("\n");
        return `${pad}${key}: |\n${nested}`;
      }
      return `${pad}${key}: ${rendered}`;
    })
    .join("\n");
}

export function renderOpenApiYaml(): string {
  return `${toYaml(OPENAPI_SPEC)}\n`;
}
