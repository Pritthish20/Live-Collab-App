import { prisma } from "../db/prisma.js";
import type { LoginInput, SignupInput } from "../schemas/auth.schema.js";
import { HttpError } from "../utils/errors.js";
import { PasswordUtils } from "../utils/password.js";
import { SessionUtils } from "../utils/session.js";

export class AuthService {
  async signup(input: SignupInput) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: input.email
      }
    });

    if (existingUser) {
      throw new HttpError(409, "EMAIL_IN_USE", "Email is already registered.");
    }

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: await PasswordUtils.hash(input.password)
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    return {
      user,
      token: SessionUtils.createToken({
        userId: user.id,
        email: user.email
      })
    };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: {
        email: input.email
      }
    });

    if (!user || !(await PasswordUtils.verify(user.passwordHash, input.password))) {
      throw new HttpError(
        401,
        "INVALID_CREDENTIALS",
        "Invalid email or password."
      );
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token: SessionUtils.createToken({
        userId: user.id,
        email: user.email
      })
    };
  }
}

export const authService = new AuthService();
