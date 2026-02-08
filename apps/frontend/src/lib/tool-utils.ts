import type { JsonValue } from "@/lib/transformers";

export type JwtPayload = {
  header: Record<string, string>;
  payload: Record<string, string>;
  signature: string;
};

export function decodeJwt(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  const [headerPart, payloadPart, signature = ""] = parts;
  const header = parseBase64Json(headerPart);
  const payload = parseBase64Json(payloadPart);
  if (!header || !payload) return null;
  return { header, payload, signature };
}

export function base64Encode(value: string): string {
  if (typeof window === "undefined") return "";
  return window.btoa(unescape(encodeURIComponent(value)));
}

export function base64Decode(value: string): string {
  if (typeof window === "undefined") return "";
  try {
    return decodeURIComponent(escape(window.atob(value)));
  } catch {
    return "";
  }
}

export async function hashText(value: string, algorithm: "SHA-256" | "SHA-384" | "SHA-512") {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest(algorithm, encoder.encode(value));
  return bufferToHex(buffer);
}

export function generateUuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const segments = [
    bytes.slice(0, 4),
    bytes.slice(4, 6),
    bytes.slice(6, 8),
    bytes.slice(8, 10),
    bytes.slice(10, 16),
  ];
  return segments
    .map((segment) =>
      Array.from(segment)
        .map((value) => value.toString(16).padStart(2, "0"))
        .join("")
    )
    .join("-");
}

export function generateFakeProfile(seed: number) {
  const firstNames = ["Avery", "Jordan", "Quinn", "Riley", "Emerson"];
  const lastNames = ["Shaw", "Hughes", "Patel", "Reed", "Navarro"];
  const domains = ["jsondeck.dev", "stackcraft.io", "nodewave.app"];
  const roles = ["Platform Engineer", "API Architect", "Data Analyst", "DevOps Lead"];
  const companies = ["Vertex Labs", "Nova Systems", "Cobalt Flow", "Pulse Grid"];
  const random = mulberry32(seed);

  const first = pick(firstNames, random);
  const last = pick(lastNames, random);
  const company = pick(companies, random);
  const domain = pick(domains, random);
  const role = pick(roles, random);
  const handle = `${first}.${last}`.toLowerCase();

  return {
    id: generateUuid(),
    name: `${first} ${last}`,
    email: `${handle}@${domain}`,
    company,
    role,
  };
}

export function deepMerge(left: JsonValue, right: JsonValue): JsonValue {
  if (Array.isArray(left) && Array.isArray(right)) {
    return [...left, ...right];
  }
  if (isObject(left) && isObject(right)) {
    const merged: Record<string, JsonValue> = { ...left };
    for (const [key, value] of Object.entries(right)) {
      merged[key] = key in merged ? deepMerge(merged[key], value) : value;
    }
    return merged;
  }
  return right;
}

function parseBase64Json(value: string): Record<string, string> | null {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const decoded = base64Decode(padded);
  if (!decoded) return null;
  try {
    const parsed = JSON.parse(decoded) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).map(([key, val]) => [key, String(val)])
    );
  } catch {
    return null;
  }
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let next = t;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(values: string[], random: () => number) {
  return values[Math.floor(random() * values.length)];
}

function isObject(value: JsonValue): value is Record<string, JsonValue> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
