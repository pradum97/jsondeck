import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { AppError } from "../../middleware/error-handler";
import { ensureBoolean, ensureObject, ensureOptionalString, ensureString } from "../validation";
import {
  createApiRequest,
  deleteApiRequest,
  getApiRequest,
  listApiRequests,
  updateApiRequest,
} from "../services/api-request-service";
import type { HttpMethod } from "../types";

const ensureHttpMethod = (value: unknown): HttpMethod => {
  const method = ensureString(value, "method").toUpperCase();
  const allowed = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as const;
  if (!allowed.includes(method as HttpMethod)) {
    throw new AppError("Invalid HTTP method", 400);
  }
  return method as HttpMethod;
};

const ensureHeaders = (value: unknown): Record<string, string> => {
  const obj = ensureObject(value, "headers");
  return Object.entries(obj).reduce<Record<string, string>>((acc, [key, val]) => {
    if (typeof val !== "string") {
      throw new AppError("Header values must be strings", 400);
    }
    acc[key] = val;
    return acc;
  }, {});
};

export const createApiRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const collectionId = ensureString(req.body?.collectionId, "collectionId");
  const name = ensureString(req.body?.name, "name");
  const method = ensureHttpMethod(req.body?.method);
  const url = ensureString(req.body?.url, "url");
  const headers = ensureHeaders(req.body?.headers ?? {});
  const body = ensureOptionalString(req.body?.body);
  const isJson = ensureBoolean(req.body?.isJson ?? true, "isJson");
  const request = await createApiRequest(
    {
      collectionId,
      name,
      method,
      url,
      headers,
      body,
      isJson,
    },
    req.auth?.subject ?? ""
  );
  res.status(201).json({ request });
});

export const listApiRequestsHandler = asyncHandler(async (req: Request, res: Response) => {
  const collectionId = ensureString(req.params.collectionId, "collectionId");
  const requests = await listApiRequests(collectionId, req.auth?.subject ?? "");
  res.status(200).json({ requests });
});

export const getApiRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const requestId = ensureString(req.params.requestId, "requestId");
  const request = await getApiRequest(requestId, req.auth?.subject ?? "");
  res.status(200).json({ request });
});

export const updateApiRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const requestId = ensureString(req.params.requestId, "requestId");
  const name = ensureOptionalString(req.body?.name);
  const method = req.body?.method ? ensureHttpMethod(req.body?.method) : undefined;
  const url = ensureOptionalString(req.body?.url);
  const headers = req.body?.headers ? ensureHeaders(req.body?.headers) : undefined;
  const body = ensureOptionalString(req.body?.body);
  const isJson = req.body?.isJson !== undefined ? ensureBoolean(req.body?.isJson, "isJson") : undefined;
  const request = await updateApiRequest(
    requestId,
    req.auth?.subject ?? "",
    {
      name: name ?? undefined,
      method,
      url: url ?? undefined,
      headers,
      body,
      isJson,
    }
  );
  res.status(200).json({ request });
});

export const deleteApiRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const requestId = ensureString(req.params.requestId, "requestId");
  await deleteApiRequest(requestId, req.auth?.subject ?? "");
  res.status(204).send();
});
