import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { signupSchema, loginSchema, refreshTokenSchema } from "./auth.validation";
import { createResponse } from "../../shared/utils/response";
import { AuthRequest } from "./auth.middleware";
import { env } from "../../config/env";
import ms, { StringValue } from "ms";

const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

// Helper to set cookie
const setRefreshTokenCookie = (res: Response, token: string) => {
  const maxAge = ms(env.REFRESH_TOKEN_EXPIRES_IN as StringValue);
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge,
  });
};

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = signupSchema.parse(req.body);
      const result = await AuthService.signup(validatedData);
      
      setRefreshTokenCookie(res, result.refreshToken);

      res.status(201).json(
        createResponse(true, "Account created successfully", {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await AuthService.login(validatedData);

      setRefreshTokenCookie(res, result.refreshToken);

      res.status(200).json(
        createResponse(true, "Login successful", {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        await AuthService.logout(req.user.id);
      }
      
      res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
      
      res.status(200).json(createResponse(true, "Logged out successfully"));
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      // First check body, then check cookies
      const rawToken = req.body.refreshToken || req.cookies[REFRESH_TOKEN_COOKIE_NAME];
      const validatedData = refreshTokenSchema.parse({ refreshToken: rawToken });

      const result = await AuthService.refresh(validatedData.refreshToken);

      setRefreshTokenCookie(res, result.refreshToken);

      res.status(200).json(
        createResponse(true, "Token refreshed successfully", {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error("User not found in request");
      }

      const user = await AuthService.getMe(req.user.id);

      res.status(200).json(createResponse(true, "User fetched successfully", user));
    } catch (error) {
      next(error);
    }
  }
}
