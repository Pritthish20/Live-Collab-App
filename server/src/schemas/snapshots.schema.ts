import { z } from "zod";

export class SnapshotsSchema {
  static create = z.object({
    title: z
      .string()
      .trim()
      .max(120)
      .optional()
      .transform((value) => (value && value.length > 0 ? value : undefined))
  });
}

export type SnapshotCreateInput = z.infer<typeof SnapshotsSchema.create>;
