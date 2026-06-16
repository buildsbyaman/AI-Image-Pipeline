import { prisma } from "../../utils/prisma";
import { hashPassword, comparePassword } from "../../utils/bcrypt";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { BadRequestError, UnauthorizedError, ConflictError } from "../../utils/errors";
import { SignupInput, LoginInput } from "./auth.validation";
import { AuthResponse, RefreshResponse } from "./auth.types";
import crypto from "crypto";

export class AuthService {
  static async signup(data: SignupInput): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });

    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
      refreshToken,
    };
  }

  static async login(data: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid = await comparePassword(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
      refreshToken,
    };
  }

  static async logout(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }

  static async refresh(token: string): Promise<RefreshResponse> {
    try {
      const payload = verifyRefreshToken(token);
      
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedError("Invalid refresh token");
      }

      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      if (tokenHash !== user.refreshTokenHash) {
        throw new UnauthorizedError("Invalid refresh token");
      }

      const newAccessToken = generateAccessToken({ userId: user.id });
      const newRefreshToken = generateRefreshToken({ userId: user.id });
      const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshTokenHash: newRefreshTokenHash },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    return user;
  }
}
