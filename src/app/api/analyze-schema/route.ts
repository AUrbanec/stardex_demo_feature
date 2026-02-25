import OpenAI from "openai";

const IGNORE_FIELDS = new Set([
  "first name",
  "last name",
  "email",
  "phone",
  "mobile",
  "created at",
  "updated at",
  "id",
]);

type RawMapping = {
  target_field?: unknown;
  data_type?: unknown;
  source_fields?: unknown;
  reasoning?: unknown;
};

const ALLOWED_DATA_TYPES = new Set(["string", "boolean", "integer", "date"]);

function normalizeHeaders(headers: string[]) {
  return headers
    .map((header) => String(header || "").trim())
    .filter(Boolean)
    .filter((header) => !IGNORE_FIELDS.has(header.toLowerCase()));
}

function toSnakeCase(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function coerceMappings(input: unknown, headers: string[]) {
  const headerLookup = new Map(headers.map((header) => [header.toLowerCase(), header]));
  const payload = input as { mappings?: RawMapping[] };
  if (!Array.isArray(payload?.mappings)) return [];

  const normalizedMappings = payload.mappings
    .map((mapping) => {
      const targetField =
        typeof mapping.target_field === "string"
          ? toSnakeCase(mapping.target_field)
          : "";
      const dataType =
        typeof mapping.data_type === "string"
          ? mapping.data_type.trim().toLowerCase()
          : "";
      const sourceFields = Array.isArray(mapping.source_fields)
        ? mapping.source_fields
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .map((sourceField) => headerLookup.get(sourceField.toLowerCase()) || "")
          .filter(Boolean)
        : [];
      const reasoning =
        typeof mapping.reasoning === "string" ? mapping.reasoning.trim() : "";

      if (
        !targetField ||
        !ALLOWED_DATA_TYPES.has(dataType) ||
        sourceFields.length === 0
      ) {
        return null;
      }

      return {
        target_field: targetField,
        data_type: dataType as "string" | "boolean" | "integer" | "date",
        source_fields: sourceFields,
        reasoning,
      };
    })
    .filter((mapping): mapping is NonNullable<typeof mapping> => Boolean(mapping));

  const dedupedByTarget = new Map<
    string,
    {
      target_field: string;
      data_type: "string" | "boolean" | "integer" | "date";
      source_fields: string[];
      reasoning: string;
    }
  >();

  for (const mapping of normalizedMappings) {
    const existing = dedupedByTarget.get(mapping.target_field);
    if (!existing) {
      dedupedByTarget.set(mapping.target_field, {
        ...mapping,
        source_fields: [...new Set(mapping.source_fields)],
      });
      continue;
    }

    dedupedByTarget.set(mapping.target_field, {
      ...existing,
      source_fields: [...new Set([...existing.source_fields, ...mapping.source_fields])],
      reasoning: existing.reasoning || mapping.reasoning,
    });
  }

  return Array.from(dedupedByTarget.values());
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 500 },
    );
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body = (await request.json()) as { headers?: string[] };
    const incomingHeaders = Array.isArray(body.headers) ? body.headers : [];
    const headers = normalizeHeaders(incomingHeaders);

    if (headers.length === 0) {
      return Response.json({ mappings: [] });
    }

    const developerPrompt = `
You are an expert Data Engineer working for Stardex, a modern ATS/CRM for executive search firms.
Your job is to migrate messy, legacy ATS database exports into clean, modern relational schemas.

Users provide a JSON array of column headers. Your task:
1) Identify redundant or semantically identical custom fields.
2) Group them together.
3) Propose a clean snake_case target field name.
4) Determine the best SQL data type (string, boolean, integer, date).

Ignore standard system fields and only process custom/messy fields.

Return strict JSON in this shape:
{
  "mappings": [
    {
      "target_field": "snake_case_name",
      "data_type": "string|boolean|integer|date",
      "source_fields": ["original header", "another"],
      "reasoning": "brief explanation"
    }
  ]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      messages: [
        { role: "developer", content: developerPrompt },
        {
          role: "user",
          content: `Analyze these headers: ${JSON.stringify(headers)}`,
        },
      ],
      reasoning_effort: "high",
      response_format: { type: "json_object" },
    } as never);

    const content = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    const mappings = coerceMappings(parsed, headers);

    return Response.json({ mappings });
  } catch (error) {
    console.error("Schema analysis failed:", error);
    return Response.json({ error: "Failed to process schema." }, { status: 500 });
  }
}
