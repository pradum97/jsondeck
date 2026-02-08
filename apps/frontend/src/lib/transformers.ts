export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type TransformTarget =
  | "TypeScript"
  | "Java"
  | "C#"
  | "Dart"
  | "Python"
  | "YAML"
  | "CSV"
  | "XML"
  | "SQL"
  | "GraphQL";

export type TransformResult = {
  output: string;
  status: "valid" | "error";
  message: string;
};

type Descriptor =
  | { kind: "string" }
  | { kind: "number" }
  | { kind: "boolean" }
  | { kind: "null" }
  | { kind: "unknown" }
  | { kind: "array"; element: Descriptor }
  | { kind: "object"; fields: Record<string, Descriptor> };

const VALID_MESSAGE = "Transformation ready.";

export const TRANSFORM_TARGETS: Array<{
  id: TransformTarget;
  description: string;
}> = [
  { id: "TypeScript", description: "Generate interfaces with strong typing." },
  { id: "Java", description: "Create Java POJOs and lists." },
  { id: "C#", description: "Emit C# records and collections." },
  { id: "Dart", description: "Model Dart classes for Flutter." },
  { id: "Python", description: "Dataclasses with type hints." },
  { id: "YAML", description: "Human-friendly YAML output." },
  { id: "CSV", description: "Tabular export for spreadsheets." },
  { id: "XML", description: "Structured XML payloads." },
  { id: "SQL", description: "Schema and insert statements." },
  { id: "GraphQL", description: "GraphQL type definitions." },
];

export function transformJson(input: string, target: TransformTarget): TransformResult {
  let parsed: JsonValue;
  try {
    parsed = JSON.parse(input) as JsonValue;
  } catch (error) {
    return {
      output: input,
      status: "error",
      message: error instanceof Error ? error.message : "Invalid JSON.",
    };
  }

  const descriptor = describeValue(parsed);
  const output = renderTarget(descriptor, parsed, target);
  return { output, status: "valid", message: VALID_MESSAGE };
}

function describeValue(value: JsonValue): Descriptor {
  if (value === null) return { kind: "null" };
  if (typeof value === "string") return { kind: "string" };
  if (typeof value === "number") return { kind: "number" };
  if (typeof value === "boolean") return { kind: "boolean" };
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { kind: "array", element: { kind: "unknown" } };
    }
    const merged = mergeDescriptors(value.map((item) => describeValue(item)));
    return { kind: "array", element: merged };
  }
  const fields: Record<string, Descriptor> = {};
  for (const [key, fieldValue] of Object.entries(value)) {
    fields[key] = describeValue(fieldValue);
  }
  return { kind: "object", fields };
}

function mergeDescriptors(values: Descriptor[]): Descriptor {
  if (values.length === 0) return { kind: "unknown" };
  const [first] = values;
  if (values.every((item) => item.kind === first.kind)) {
    if (first.kind === "array") {
      const elements = values.map((item) => (item.kind === "array" ? item.element : { kind: "unknown" }));
      return { kind: "array", element: mergeDescriptors(elements) };
    }
    if (first.kind === "object") {
      const allKeys = new Set<string>();
      values.forEach((item) => {
        if (item.kind === "object") {
          Object.keys(item.fields).forEach((key) => allKeys.add(key));
        }
      });
      const fields: Record<string, Descriptor> = {};
      allKeys.forEach((key) => {
        const fieldValues = values
          .filter((item): item is { kind: "object"; fields: Record<string, Descriptor> } =>
            item.kind === "object"
          )
          .map((item) => item.fields[key] ?? { kind: "unknown" });
        fields[key] = mergeDescriptors(fieldValues);
      });
      return { kind: "object", fields };
    }
    return first;
  }
  return { kind: "unknown" };
}

function renderTarget(descriptor: Descriptor, value: JsonValue, target: TransformTarget): string {
  switch (target) {
    case "TypeScript":
      return renderTypeScript(descriptor, "Root");
    case "Java":
      return renderClassModel(descriptor, "Root", javaTypeMap, "class");
    case "C#":
      return renderClassModel(descriptor, "Root", csharpTypeMap, "record");
    case "Dart":
      return renderClassModel(descriptor, "Root", dartTypeMap, "class");
    case "Python":
      return renderPython(descriptor, "Root");
    case "YAML":
      return renderYaml(value, 0);
    case "CSV":
      return renderCsv(value);
    case "XML":
      return renderXml(value, "root");
    case "SQL":
      return renderSql(descriptor, value, "root");
    case "GraphQL":
      return renderGraphql(descriptor, "Root");
    default:
      return JSON.stringify(value, null, 2);
  }
}

function renderTypeScript(descriptor: Descriptor, name: string): string {
  const definitions: string[] = [];
  renderTypeScriptDescriptor(descriptor, name, definitions);
  return definitions.join("\n\n");
}

function renderTypeScriptDescriptor(
  descriptor: Descriptor,
  name: string,
  definitions: string[]
): string {
  if (descriptor.kind === "object") {
    const interfaceName = normalizeName(name);
    if (!definitions.some((entry) => entry.startsWith(`interface ${interfaceName}`))) {
      const fields = Object.entries(descriptor.fields).map(([key, fieldDescriptor]) => {
        const fieldName = sanitizeProperty(key);
        const fieldType = renderTypeScriptDescriptor(
          fieldDescriptor,
          `${interfaceName}${capitalize(fieldName)}`,
          definitions
        );
        return `  ${fieldName}: ${fieldType};`;
      });
      definitions.push(`interface ${interfaceName} {\n${fields.join("\n")}\n}`);
    }
    return interfaceName;
  }
  if (descriptor.kind === "array") {
    return `${renderTypeScriptDescriptor(descriptor.element, `${name}Item`, definitions)}[]`;
  }
  return mapPrimitive(descriptor, {
    string: "string",
    number: "number",
    boolean: "boolean",
    null: "null",
    unknown: "unknown",
  });
}

type TypeMap = {
  string: string;
  number: string;
  boolean: string;
  null: string;
  unknown: string;
  array: (inner: string) => string;
  object: (name: string) => string;
};

const javaTypeMap: TypeMap = {
  string: "String",
  number: "double",
  boolean: "boolean",
  null: "Object",
  unknown: "Object",
  array: (inner) => `List<${inner}>`,
  object: (name) => name,
};

const csharpTypeMap: TypeMap = {
  string: "string",
  number: "double",
  boolean: "bool",
  null: "object",
  unknown: "object",
  array: (inner) => `List<${inner}>`,
  object: (name) => name,
};

const dartTypeMap: TypeMap = {
  string: "String",
  number: "double",
  boolean: "bool",
  null: "dynamic",
  unknown: "dynamic",
  array: (inner) => `List<${inner}>`,
  object: (name) => name,
};

function renderClassModel(
  descriptor: Descriptor,
  name: string,
  map: TypeMap,
  keyword: "class" | "record"
): string {
  const definitions: string[] = [];
  renderClassDescriptor(descriptor, normalizeName(name), map, keyword, definitions);
  return definitions.join("\n\n");
}

function renderClassDescriptor(
  descriptor: Descriptor,
  name: string,
  map: TypeMap,
  keyword: "class" | "record",
  definitions: string[]
): string {
  if (descriptor.kind === "object") {
    const className = normalizeName(name);
    if (!definitions.some((entry) => entry.startsWith(`${keyword} ${className}`))) {
      const fields = Object.entries(descriptor.fields).map(([key, fieldDescriptor]) => {
        const fieldName = sanitizeProperty(key);
        const fieldType = renderClassDescriptor(
          fieldDescriptor,
          `${className}${capitalize(fieldName)}`,
          map,
          keyword,
          definitions
        );
        return `  ${fieldType} ${fieldName};`;
      });
      definitions.push(`${keyword} ${className} {\n${fields.join("\n")}\n}`);
    }
    return map.object(className);
  }
  if (descriptor.kind === "array") {
    return map.array(renderClassDescriptor(descriptor.element, `${name}Item`, map, keyword, definitions));
  }
  return mapPrimitive(descriptor, map);
}

function renderPython(descriptor: Descriptor, name: string): string {
  const definitions: string[] = [
    "from dataclasses import dataclass",
    "from typing import List, Optional, Any",
    "",
  ];
  renderPythonDescriptor(descriptor, normalizeName(name), definitions);
  return definitions.join("\n");
}

function renderPythonDescriptor(
  descriptor: Descriptor,
  name: string,
  definitions: string[]
): string {
  if (descriptor.kind === "object") {
    const className = normalizeName(name);
    if (!definitions.some((entry) => entry === `@dataclass\nclass ${className}:`)) {
      const fields = Object.entries(descriptor.fields).map(([key, fieldDescriptor]) => {
        const fieldName = sanitizeProperty(key);
        const fieldType = renderPythonDescriptor(
          fieldDescriptor,
          `${className}${capitalize(fieldName)}`,
          definitions
        );
        return `    ${fieldName}: ${fieldType}`;
      });
      definitions.push(`@dataclass\nclass ${className}:`);
      definitions.push(fields.length ? fields.join("\n") : "    pass");
      definitions.push("");
    }
    return className;
  }
  if (descriptor.kind === "array") {
    return `List[${renderPythonDescriptor(descriptor.element, `${name}Item`, definitions)}]`;
  }
  return mapPrimitive(descriptor, {
    string: "str",
    number: "float",
    boolean: "bool",
    null: "Optional[Any]",
    unknown: "Any",
  });
}

function renderYaml(value: JsonValue, depth: number): string {
  const indent = "  ".repeat(depth);
  if (Array.isArray(value)) {
    if (value.length === 0) return `${indent}[]`;
    return value
      .map((item) => {
        const child = renderYaml(item, depth + 1);
        const prefix = `${indent}- `;
        if (child.startsWith("  ")) {
          return `${prefix}${child.trimStart()}`;
        }
        return `${prefix}${child}`;
      })
      .join("\n");
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value)
      .map(([key, child]) => {
        const rendered = renderYaml(child, depth + 1);
        if (rendered.includes("\n")) {
          return `${indent}${key}:\n${rendered}`;
        }
        return `${indent}${key}: ${rendered.trim()}`;
      })
      .join("\n");
  }
  return `${indent}${formatScalar(value)}`;
}

function renderCsv(value: JsonValue): string {
  if (Array.isArray(value)) {
    const rows = value.filter((item) => item !== null && typeof item === "object" && !Array.isArray(item));
    if (rows.length === 0) {
      return value.map((item) => formatCsvCell(item)).join("\n");
    }
    const keys = Array.from(
      new Set(
        rows.flatMap((row) => Object.keys(row as Record<string, JsonValue>))
      )
    );
    const header = keys.join(",");
    const dataRows = rows.map((row) =>
      keys
        .map((key) => formatCsvCell((row as Record<string, JsonValue>)[key]))
        .join(",")
    );
    return [header, ...dataRows].join("\n");
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value)
      .map(([key, cell]) => `${formatCsvCell(key)},${formatCsvCell(cell)}`)
      .join("\n");
  }
  return formatCsvCell(value);
}

function renderXml(value: JsonValue, tagName: string): string {
  const safeTag = normalizeTag(tagName);
  if (Array.isArray(value)) {
    return value.map((item) => renderXml(item, safeTag)).join("");
  }
  if (value !== null && typeof value === "object") {
    const children = Object.entries(value)
      .map(([key, child]) => renderXml(child, key))
      .join("");
    return `<${safeTag}>${children}</${safeTag}>`;
  }
  return `<${safeTag}>${escapeXml(String(value ?? ""))}</${safeTag}>`;
}

function renderSql(descriptor: Descriptor, value: JsonValue, table: string): string {
  if (descriptor.kind !== "object" && descriptor.kind !== "array") {
    return "-- SQL output requires an object or array of objects.";
  }
  const tableName = normalizeTag(table);
  const objectDescriptor = descriptor.kind === "array" && descriptor.element.kind === "object"
    ? descriptor.element
    : descriptor.kind === "object"
    ? descriptor
    : { kind: "object", fields: {} };

  const columns = Object.entries(objectDescriptor.fields).map(([key, fieldDescriptor]) => {
    const columnType = mapSqlType(fieldDescriptor);
    return `  ${normalizeTag(key)} ${columnType}`;
  });
  const createStatement = `CREATE TABLE ${tableName} (\n${columns.join(",\n")}\n);`;

  const rows = Array.isArray(value) ? value : [value];
  const inserts = rows
    .filter((row) => row !== null && typeof row === "object" && !Array.isArray(row))
    .map((row) => {
      const record = row as Record<string, JsonValue>;
      const keys = Object.keys(objectDescriptor.fields);
      const values = keys.map((key) => formatSqlValue(record[key]));
      return `INSERT INTO ${tableName} (${keys.join(", ")}) VALUES (${values.join(", ")});`;
    })
    .join("\n");

  return [createStatement, inserts].filter(Boolean).join("\n\n");
}

function renderGraphql(descriptor: Descriptor, name: string): string {
  const definitions: string[] = [];
  renderGraphqlDescriptor(descriptor, normalizeName(name), definitions);
  return definitions.join("\n\n");
}

function renderGraphqlDescriptor(
  descriptor: Descriptor,
  name: string,
  definitions: string[]
): string {
  if (descriptor.kind === "object") {
    const typeName = normalizeName(name);
    if (!definitions.some((entry) => entry.startsWith(`type ${typeName}`))) {
      const fields = Object.entries(descriptor.fields).map(([key, fieldDescriptor]) => {
        const fieldType = renderGraphqlDescriptor(
          fieldDescriptor,
          `${typeName}${capitalize(key)}`,
          definitions
        );
        return `  ${sanitizeProperty(key)}: ${fieldType}`;
      });
      definitions.push(`type ${typeName} {\n${fields.join("\n")}\n}`);
    }
    return typeName;
  }
  if (descriptor.kind === "array") {
    return `[${renderGraphqlDescriptor(descriptor.element, `${name}Item`, definitions)}]`;
  }
  return mapPrimitive(descriptor, {
    string: "String",
    number: "Float",
    boolean: "Boolean",
    null: "String",
    unknown: "JSON",
  });
}

function mapPrimitive<T extends { string: string; number: string; boolean: string; null: string; unknown: string }>(
  descriptor: Descriptor,
  map: T
): string {
  switch (descriptor.kind) {
    case "string":
      return map.string;
    case "number":
      return map.number;
    case "boolean":
      return map.boolean;
    case "null":
      return map.null;
    default:
      return map.unknown;
  }
}

function sanitizeProperty(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9_]/g, "_");
  const normalized = cleaned.length ? cleaned : "field";
  return normalized.match(/^[a-zA-Z_]/) ? normalized : `_${normalized}`;
}

function normalizeName(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9_]/g, " ");
  const parts = cleaned
    .split(" ")
    .filter(Boolean)
    .map((part) => capitalize(part));
  return parts.length ? parts.join("") : "Root";
}

function normalizeTag(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9_]/g, "_");
  return cleaned.length ? cleaned : "root";
}

function capitalize(value: string): string {
  return value.length ? value[0].toUpperCase() + value.slice(1) : value;
}

function formatScalar(value: JsonValue): string {
  if (value === null) return "null";
  if (typeof value === "string") return value.includes(":") ? `"${value}"` : value;
  return String(value);
}

function formatCsvCell(value: JsonValue): string {
  if (value === null || value === undefined) return "";
  const raw = typeof value === "string" ? value : JSON.stringify(value);
  if (raw.includes(",") || raw.includes("\n") || raw.includes("\"")) {
    return `"${raw.replace(/\"/g, '""')}"`;
  }
  return raw;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function mapSqlType(descriptor: Descriptor): string {
  switch (descriptor.kind) {
    case "string":
      return "VARCHAR(255)";
    case "number":
      return "DOUBLE";
    case "boolean":
      return "BOOLEAN";
    case "array":
      return "JSON";
    case "object":
      return "JSON";
    default:
      return "TEXT";
  }
}

function formatSqlValue(value: JsonValue): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return value.toString();
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "string") return `'${value.replace(/'/g, "''")}'`;
  return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
}
