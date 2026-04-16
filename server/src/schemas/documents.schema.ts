import { z } from "zod";

export class DocumentsSchema {
  static document = z.object({
    title: z.string().trim().min(1).max(120)
  });

  static share = z.object({
    email: z.string().trim().email().toLowerCase(),
    role: z.enum(["editor", "viewer"])
  });
}

export type DocumentInput = z.infer<typeof DocumentsSchema.document>;
export type ShareInput = z.infer<typeof DocumentsSchema.share>;
