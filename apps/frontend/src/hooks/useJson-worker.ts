"use client";

import { useCallback, useEffect, useRef } from "react";
import type { JsonDiffLine, JsonDiagnostic, JsonTransformResult } from "@/lib/json-tools";

type WorkerRequest =
  | { id: string; type: "format"; input: string }
  | { id: string; type: "minify"; input: string }
  | { id: string; type: "validate"; input: string }
  | { id: string; type: "diff"; before: string; after: string };

type WorkerResponse =
  | { id: string; type: "format" | "minify"; payload: JsonTransformResult }
  | { id: string; type: "validate"; payload: JsonDiagnostic }
  | { id: string; type: "diff"; payload: JsonDiffLine[] };

type Resolver = (value: WorkerResponse["payload"]) => void;

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function useJsonWorker() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, Resolver>>(new Map());

  useEffect(() => {
    const worker = new Worker(new URL("../workers/json-ops.worker.ts", import.meta.url));
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { id, payload } = event.data;
      const resolve = pendingRef.current.get(id);
      if (!resolve) {
        return;
      }
      pendingRef.current.delete(id);
      resolve(payload);
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
      pendingRef.current.clear();
    };
  }, []);

  const send = useCallback(<T extends WorkerRequest>(request: T) => {
    return new Promise<WorkerResponse["payload"]>((resolve) => {
      const worker = workerRef.current;
      if (!worker) {
        resolve(
          request.type === "validate"
            ? { status: "error", message: "Worker unavailable." }
            : request.type === "diff"
            ? []
            : {
                value: "input" in request ? request.input : "",
                diagnostic: { status: "error", message: "Worker unavailable." },
              }
        );
        return;
      }
      pendingRef.current.set(request.id, resolve);
      worker.postMessage(request);
    });
  }, []);

  const format = useCallback(async (input: string) => {
    return (await send({ id: createId(), type: "format", input })) as JsonTransformResult;
  }, [send]);

  const minify = useCallback(async (input: string) => {
    return (await send({ id: createId(), type: "minify", input })) as JsonTransformResult;
  }, [send]);

  const validate = useCallback(async (input: string) => {
    return (await send({ id: createId(), type: "validate", input })) as JsonDiagnostic;
  }, [send]);

  const buildDiff = useCallback(async (before: string, after: string) => {
    return (await send({ id: createId(), type: "diff", before, after })) as JsonDiffLine[];
  }, [send]);

  return { format, minify, validate, buildDiff };
}
