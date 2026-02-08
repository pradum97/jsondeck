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
