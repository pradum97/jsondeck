export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type MergeRequest = {
  left: string;
  right: string;
};

type MergeResponse =
  | { status: "success"; output: string }
  | { status: "error"; message: string };

const isObject = (value: JsonValue): value is { [key: string]: JsonValue } =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const mergeValues = (left: JsonValue, right: JsonValue): JsonValue => {
  if (Array.isArray(left) && Array.isArray(right)) {
    return [...left, ...right];
  }
  if (isObject(left) && isObject(right)) {
    const merged: { [key: string]: JsonValue } = { ...left };
    Object.entries(right).forEach(([key, value]) => {
      if (key in merged) {
        merged[key] = mergeValues(merged[key], value);
      } else {
        merged[key] = value;
      }
    });
    return merged;
  }
  return right;
};

self.addEventListener("message", (event: MessageEvent<MergeRequest>) => {
  const { left, right } = event.data;
  try {
    const leftValue = JSON.parse(left) as JsonValue;
    const rightValue = JSON.parse(right) as JsonValue;
    const merged = mergeValues(leftValue, rightValue);
    const output = JSON.stringify(merged, null, 2);
    self.postMessage({ status: "success", output } satisfies MergeResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON input.";
    self.postMessage({ status: "error", message } satisfies MergeResponse);
  }
});
