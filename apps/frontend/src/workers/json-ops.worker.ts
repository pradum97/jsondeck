import {
  buildLineDiff,
  formatJson,
  minifyJson,
  validateJson,
  type JsonDiffLine,
  type JsonDiagnostic,
  type JsonTransformResult,
} from "@/lib/json-tools";

type WorkerRequest =
  | { id: string; type: "format"; input: string }
  | { id: string; type: "minify"; input: string }
  | { id: string; type: "validate"; input: string }
  | { id: string; type: "diff"; before: string; after: string };

type WorkerResponse =
  | { id: string; type: "format" | "minify"; payload: JsonTransformResult }
  | { id: string; type: "validate"; payload: JsonDiagnostic }
  | { id: string; type: "diff"; payload: JsonDiffLine[] };

self.addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;

  switch (message.type) {
    case "format": {
      self.postMessage({
        id: message.id,
        type: message.type,
        payload: formatJson(message.input),
      } satisfies WorkerResponse);
      return;
    }
    case "minify": {
      self.postMessage({
        id: message.id,
        type: message.type,
        payload: minifyJson(message.input),
      } satisfies WorkerResponse);
      return;
    }
    case "validate": {
      self.postMessage({
        id: message.id,
        type: message.type,
        payload: validateJson(message.input),
      } satisfies WorkerResponse);
      return;
    }
    case "diff": {
      self.postMessage({
        id: message.id,
        type: message.type,
        payload: buildLineDiff(message.before, message.after),
      } satisfies WorkerResponse);
      return;
    }
  }
});
