export type JsonDiagnosticStatus = "idle" | "valid" | "error";

export type JsonDiagnostic = {
  status: JsonDiagnosticStatus;
  message: string;
};

export type JsonTransformResult = {
  value: string;
  diagnostic: JsonDiagnostic;
};

export type JsonDiffLine = {
  line: string;
  type: "same" | "added" | "removed";
};

const VALID_MESSAGE = "JSON is valid.";

export function formatJson(input: string): JsonTransformResult {
  try {
    const parsed = JSON.parse(input) as unknown;
    return {
      value: JSON.stringify(parsed, null, 2),
      diagnostic: { status: "valid", message: VALID_MESSAGE },
    };
  } catch (error) {
    return {
      value: input,
      diagnostic: {
        status: "error",
        message: error instanceof Error ? error.message : "Invalid JSON.",
      },
    };
  }
}

export function minifyJson(input: string): JsonTransformResult {
  try {
    const parsed = JSON.parse(input) as unknown;
    return {
      value: JSON.stringify(parsed),
      diagnostic: { status: "valid", message: VALID_MESSAGE },
    };
  } catch (error) {
    return {
      value: input,
      diagnostic: {
        status: "error",
        message: error instanceof Error ? error.message : "Invalid JSON.",
      },
    };
  }
}

export function validateJson(input: string): JsonDiagnostic {
  try {
    JSON.parse(input);
    return { status: "valid", message: VALID_MESSAGE };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Invalid JSON.",
    };
  }
}

export function buildLineDiff(before: string, after: string): JsonDiffLine[] {
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  const maxLines = Math.max(beforeLines.length, afterLines.length);
  const diff: JsonDiffLine[] = [];

  for (let index = 0; index < maxLines; index += 1) {
    const beforeLine = beforeLines[index];
    const afterLine = afterLines[index];

    if (beforeLine === afterLine) {
      if (beforeLine !== undefined) {
        diff.push({ line: beforeLine, type: "same" });
      }
      continue;
    }

    if (beforeLine !== undefined) {
      diff.push({ line: beforeLine, type: "removed" });
    }

    if (afterLine !== undefined) {
      diff.push({ line: afterLine, type: "added" });
    }
  }

  return diff;
}
