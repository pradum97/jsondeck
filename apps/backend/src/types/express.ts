import "express-serve-static-core";
import type { AuthContext } from "../middleware/auth";

declare module "express-serve-static-core" {
  interface Request {
    requestId: string;
    auth?: AuthContext;
  }
}

export {};
