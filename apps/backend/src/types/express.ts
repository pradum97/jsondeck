import "express";
import type { AuthContext } from "../middleware/auth";

declare module "express" {
  interface Request {
    requestId?: string;
    auth?: AuthContext;
    rawBody?: Buffer;
  }
}

export {};
