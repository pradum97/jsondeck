import { describe, expect, it } from "vitest";
import { formatJson, minifyJson, validateJson } from "../json-tools";

describe("json-tools", () => {
  it("formats JSON with indentation", () => {
    const result = formatJson('{"a":1}');
    expect(result.diagnostic.status).toBe("valid");
    expect(result.value).toContain("\n  \"a\": 1\n");
  });

  it("minifies JSON", () => {
    const result = minifyJson('{"a": 1, "b": 2}');
    expect(result.value).toBe('{"a":1,"b":2}');
  });

  it("validates JSON", () => {
    const result = validateJson("{invalid");
    expect(result.status).toBe("error");
  });
});
