import type { NextFunction, Request, Response } from "express";
import { gzip } from "node:zlib";

const MIN_COMPRESSION_BYTES = 1024;

const gzipAsync = (input: string | Buffer): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    gzip(input, { level: 6 }, (error, compressed) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(compressed);
    });
  });

const shouldCompress = (req: Request, body: string | Buffer): boolean => {
  if (req.method === "HEAD") {
    return false;
  }
  if (body.length < MIN_COMPRESSION_BYTES) {
    return false;
  }
  const acceptsEncoding = req.header("accept-encoding") ?? "";
  return acceptsEncoding.includes("gzip");
};

export const gzipCompression = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send.bind(res);
  const originalJson = res.json.bind(res);

  res.send = function sendWithCompression(body?: unknown): Response {
    const payload = body === undefined ? "" : body;

    if (Buffer.isBuffer(payload)) {
      void (async () => {
        if (!shouldCompress(req, payload)) {
          originalSend(payload);
          return;
        }
        const compressed = await gzipAsync(payload);
        res.setHeader("Content-Encoding", "gzip");
        res.setHeader("Vary", "Accept-Encoding");
        res.setHeader("Content-Length", String(compressed.length));
        originalSend(compressed);
      })();
      return res;
    }

    const serialized = typeof payload === "string" ? payload : String(payload);

    void (async () => {
      if (!shouldCompress(req, serialized)) {
        originalSend(serialized);
        return;
      }
      const compressed = await gzipAsync(serialized);
      res.setHeader("Content-Encoding", "gzip");
      res.setHeader("Vary", "Accept-Encoding");
      res.setHeader("Content-Length", String(compressed.length));
      originalSend(compressed);
    })().catch(() => {
      originalSend(serialized);
    });

    return res;
  };

  res.json = function jsonWithCompression(body?: unknown): Response {
    const serialized = JSON.stringify(body ?? null);
    res.type("application/json; charset=utf-8");
    return res.send(serialized);
  };

  next();
};
