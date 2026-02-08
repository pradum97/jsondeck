import { transformJson, TransformTarget, TransformResult } from "@/lib/transformers";

type TransformWorkerRequest = {
  input: string;
  target: TransformTarget;
};

type TransformWorkerResponse = TransformResult;

self.addEventListener("message", (event: MessageEvent<TransformWorkerRequest>) => {
  const { input, target } = event.data;
  const result = transformJson(input, target);
  self.postMessage(result satisfies TransformWorkerResponse);
});
