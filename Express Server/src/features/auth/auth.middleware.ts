import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "./auth.helpers";
import { UnauthorizedError } from "../../shared/errors";
import { User } from "../../database";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

// General middleware: only accepts Bearer token from the Authorization header.
// Tokens in query strings would appear in server logs, browser history, and
// Referrer headers — this middleware never reads from req.query.
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authentication token is missing or invalid");
    }

    const token = authHeader.split(" ")[1];

    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.userId).select("email firstName lastName");

    if (!user) {
      throw new UnauthorizedError("User no longer exists");
    }

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    next();
  } catch (error) {
    next(new UnauthorizedError("Invalid or expired token"));
  }
};

// SSE-specific middleware: accepts the token from the Authorization header first,
// then falls back to ?token= in the query string.
// The native browser EventSource API cannot set custom headers, so query-string
// token passing is unavoidable for this single endpoint only.
export const sseAuthenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = "";
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.query.token && typeof req.query.token === "string") {
      token = req.query.token;
    }

    if (!token) {
      throw new UnauthorizedError("Authentication token is missing or invalid");
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId).select("email firstName lastName");

    if (!user) {
      throw new UnauthorizedError("User no longer exists");
    }

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    next();
  } catch (error) {
    next(new UnauthorizedError("Invalid or expired token"));
  }
};

