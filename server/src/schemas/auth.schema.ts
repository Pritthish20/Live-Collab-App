import { z } from "zod";

export class AuthSchema {
  static signup = z.object({
    name: z.string().trim().min(1),
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(8)
  });

  static login = z.object({
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(1)
  });
}

export type SignupInput = z.infer<typeof AuthSchema.signup>;
export type LoginInput = z.infer<typeof AuthSchema.login>;
