import type { NextFunction, Request, Response } from "express";

type Schema<T> = {
  parse: (payload: unknown) => T;
};

export const validate = <T>(schema: Schema<T>) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      next({ status: 400, message: "Validation failed", details: error });
    }
  };
};

const BODY_METHODS = new Set(["POST", "PUT", "PATCH"]);

export const validationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!BODY_METHODS.has(req.method)) {
    next();
    return;
  }

  const contentType = req.headers["content-type"] ?? "";
  if (!contentType.toString().includes("application/json")) {
    next();
    return;
  }

  if (req.body === null || Array.isArray(req.body) || typeof req.body !== "object") {
    res.status(400).json({ message: "Request body must be a JSON object" });
    return;
  }

  next();
};
