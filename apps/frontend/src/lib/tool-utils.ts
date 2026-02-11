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
  const webCrypto = globalThis.crypto;
  if (!webCrypto) {
    return "";
  }
  const encoder = new TextEncoder();
  const buffer = await webCrypto.subtle.digest(algorithm, encoder.encode(value));
  return bufferToHex(buffer);
}

export function generateUuid(): string {
  const webCrypto = globalThis.crypto;
  if (!webCrypto) {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
  if (typeof webCrypto.randomUUID === "function") {
    return webCrypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  webCrypto.getRandomValues(bytes);
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

function isObject(value: JsonValue): value is Record<string, JsonValue> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
