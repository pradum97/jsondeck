import axios from "axios";
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
  const response = await axios.post(
    `${publicEnv.apiUrl}/transform`,
    { input, operation },
    {
      headers: { "Content-Type": "application/json" },
      validateStatus: () => true,
    }
  );

  if (response.status >= 400) {
    const errorBody = response.data as { error?: string } | undefined;
    throw new Error(errorBody?.error ?? "Transform request failed");
  }

  const data = response.data as { result?: TransformServiceResult };
  if (!data.result) {
    throw new Error("Transform response missing result");
  }
  return data.result;
};
