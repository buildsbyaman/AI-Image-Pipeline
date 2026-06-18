import { User } from "@imagepipeline/db";
import { hashPassword, comparePassword } from "./bcrypt.util";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "./jwt.util";
import { BadRequestError, UnauthorizedError, ConflictError } from "../../shared/utils/errors";
import { SignupInput, LoginInput } from "./auth.validation";
import { AuthResponse, RefreshResponse } from "./auth.types";
import crypto from "crypto";

export class AuthService {
  static async signup(data: SignupInput): Promise<AuthResponse> {
    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await User.create({
      email: data.email,
      passwordHash: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    user.refreshTokenHash = refreshTokenHash;
    await user.save();

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
    const user = await User.findOne({ email: data.email });

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

    user.refreshTokenHash = refreshTokenHash;
    await user.save();

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
    await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
  }

  static async refresh(token: string): Promise<RefreshResponse> {
    try {
      const payload = verifyRefreshToken(token);
      
      const user = await User.findById(payload.userId);

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

      user.refreshTokenHash = newRefreshTokenHash;
      await user.save();

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
  }

  static async getMe(userId: string) {
    const user = await User.findById(userId).select("email firstName lastName");

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
