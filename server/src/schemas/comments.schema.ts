import { z } from "zod";

export class CommentsSchema {
  static body = z.string().trim().min(1).max(2000);

  static anchor = z
    .object({
      from: z.number().int().nonnegative().optional(),
      to: z.number().int().nonnegative().optional(),
      text: z.string().trim().max(500).optional()
    })
    .passthrough()
    .optional();

  static createThread = z.object({
    body: CommentsSchema.body,
    quote: z
      .string()
      .trim()
      .max(500)
      .optional()
      .transform((value) => (value && value.length > 0 ? value : undefined)),
    anchor: CommentsSchema.anchor
  });

  static reply = z.object({
    body: CommentsSchema.body
  });

  static updateThread = z.object({
    status: z.enum(["open", "resolved"])
  });
}

export type CreateCommentThreadInput = z.infer<
  typeof CommentsSchema.createThread
>;
export type CommentReplyInput = z.infer<typeof CommentsSchema.reply>;
export type UpdateCommentThreadInput = z.infer<
  typeof CommentsSchema.updateThread
>;
