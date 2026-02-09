import { publicEnv } from "@/lib/public-env";

export type TransformOperation = "format" | "minify" | "validate";

export type TransformServiceResult = {
  status: "valid" | "invalid";
  output: string;
  message: string;
};

export const requestTransform = async (
  input: string,
  operation: TransformOperation
): Promise<TransformServiceResult> => {
  const response = await fetch(`${publicEnv.apiUrl}/transform`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input, operation }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error ?? "Transform request failed");
  }

  const data = (await response.json()) as { result?: TransformServiceResult };
  if (!data.result) {
    throw new Error("Transform response missing result");
  }
  return data.result;
};
