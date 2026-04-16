import { z } from "zod";

export class DocumentsSchema {
  static document = z.object({
    title: z.string().trim().min(1).max(120)
  });
}

export type DocumentInput = z.infer<typeof DocumentsSchema.document>;
