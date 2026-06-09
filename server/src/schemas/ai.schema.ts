import { z } from "zod";

const maxSectionTextLength = 4000;
const maxListItemLength = 500;
const maxListItems = 12;

const aiText = z
  .string()
  .trim()
  .max(maxSectionTextLength)
  .catch("");

const aiList = z
  .preprocess(
    (value) => (typeof value === "string" ? [value] : value),
    z.array(z.string().trim().max(maxListItemLength)).max(maxListItems)
  )
  .catch([])
  .transform((items) => items.filter((item) => item.length > 0));

export class AiSchema {
  static documentReport = z.object({
    summary: aiText,
    keyPoints: aiList,
    actionItems: aiList,
    risks: aiList
  });

  static commentsSummary = z.object({
    activeDiscussions: aiList,
    resolvedDecisions: aiList,
    blockers: aiList,
    followUps: aiList
  });
}

export type AiDocumentReport = z.infer<typeof AiSchema.documentReport>;
export type AiCommentsSummary = z.infer<typeof AiSchema.commentsSummary>;
