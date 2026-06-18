import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "./jwt.util";
import { UnauthorizedError } from "../../shared/utils/errors";
import { User } from "@imagepipeline/db";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export const authenticate = async (
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
