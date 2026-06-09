import { prisma } from "../db/prisma.js";
import { env } from "../config/env.js";
import { AiSchema, type AiDocumentReport } from "../schemas/ai.schema.js";
import { HttpError } from "../utils/errors.js";
import { aiContentService, AiContentService } from "./ai-content.service.js";
import {
  aiProviderService,
  AiProviderService
} from "./ai-provider.service.js";
import { aiPdfService, AiPdfService } from "./ai-pdf.service.js";
import {
  PermissionsService,
  permissionsService
} from "./permissions.service.js";

export class AiService {
  constructor(
    private readonly permissions: PermissionsService = permissionsService,
    private readonly content: AiContentService = aiContentService,
    private readonly provider: AiProviderService = aiProviderService,
    private readonly pdf: AiPdfService = aiPdfService
  ) {}

  async generateDocumentReport(documentId: string, userId: string) {
    const document = await this.getReadableDocument(documentId, userId);
    const documentText = await this.content.getDocumentText(documentId);
    const response = await this.provider.generateJson({
      systemPrompt: this.getDocumentReportSystemPrompt(),
      userPrompt: this.getDocumentReportUserPrompt(document.title, documentText)
    });

    return AiSchema.documentReport.parse(response);
  }

  async summarizeComments(documentId: string, userId: string) {
    const document = await this.getReadableDocument(documentId, userId);
    const commentsText = await this.getCommentsText(documentId);
    const response = await this.provider.generateJson({
      systemPrompt: this.getCommentsSummarySystemPrompt(),
      userPrompt: this.getCommentsSummaryUserPrompt(document.title, commentsText)
    });

    return AiSchema.commentsSummary.parse(response);
  }

  async generateDocumentReportPdf(
    documentId: string,
    userId: string,
    report: AiDocumentReport
  ) {
    const document = await this.getReadableDocument(documentId, userId);
    const parsedReport = AiSchema.documentReport.parse(report);
    const buffer = await this.pdf.generateDocumentReportPdf(
      document.title,
      parsedReport
    );

    return {
      buffer,
      fileName: `${this.slugify(document.title)}-ai-report.pdf`
    };
  }

  private async getReadableDocument(documentId: string, userId: string) {
    const role = await this.permissions.getDocumentRole(documentId, userId);

    if (!role || !this.permissions.canRead(role)) {
      throw new HttpError(404, "DOCUMENT_NOT_FOUND", "Document not found.");
    }

    const document = await prisma.document.findUnique({
      where: {
        id: documentId
      },
      select: {
        id: true,
        title: true
      }
    });

    if (!document) {
      throw new HttpError(404, "DOCUMENT_NOT_FOUND", "Document not found.");
    }

    return document;
  }

  private getDocumentReportSystemPrompt() {
    return [
      "You generate structured intelligence reports for collaborative documents.",
      "Return only valid JSON.",
      "Do not include markdown, commentary, or code fences.",
      "Keep the output concise and useful for a team reviewing the document.",
      "The JSON shape must be:",
      "{",
      '  "summary": "string",',
      '  "keyPoints": ["string"],',
      '  "actionItems": ["string"],',
      '  "risks": ["string"]',
      "}"
    ].join("\n");
  }

  private getDocumentReportUserPrompt(title: string, documentText: string) {
    return [
      `Document title: ${title}`,
      "",
      "Create an intelligence report for the document below.",
      "Use these guidelines:",
      "- summary: 2 to 4 sentences.",
      "- keyPoints: up to 6 important ideas, each under 30 words.",
      "- actionItems: up to 6 concrete follow-up tasks, each under 30 words. Use an empty array if none are present.",
      "- risks: up to 6 risks, blockers, or open questions, each under 30 words. Use an empty array if none are present.",
      "",
      "Document content:",
      documentText
    ].join("\n");
  }

  private async getCommentsText(documentId: string) {
    const threads = await prisma.commentThread.findMany({
      where: {
        documentId
      },
      include: {
        createdBy: {
          select: {
            name: true
          }
        },
        resolvedBy: {
          select: {
            name: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: "asc"
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      },
      take: 100
    });

    if (threads.length === 0) {
      throw new HttpError(
        409,
        "COMMENTS_UNAVAILABLE",
        "This document does not have comments to summarize yet."
      );
    }

    const text = threads
      .map((thread, index) => {
        const comments = thread.comments
          .map((comment) => {
            const author = comment.author?.name ?? "Unknown user";
            return `- ${author}: ${comment.body}`;
          })
          .join("\n");

        return [
          `Thread ${index + 1}`,
          `Status: ${thread.status.toLowerCase()}`,
          `Created by: ${thread.createdBy?.name ?? "Unknown user"}`,
          thread.quote ? `Quoted text: ${thread.quote}` : null,
          thread.resolvedBy ? `Resolved by: ${thread.resolvedBy.name}` : null,
          "Messages:",
          comments
        ]
          .filter((line): line is string => Boolean(line))
          .join("\n");
      })
      .join("\n\n");

    return text.slice(0, env.AI_MAX_INPUT_CHARS).trim();
  }

  private getCommentsSummarySystemPrompt() {
    return [
      "You summarize collaboration discussions from document comment threads.",
      "Return only valid JSON.",
      "Do not include markdown, commentary, or code fences.",
      "Focus on what the team is discussing, deciding, and blocked on.",
      "The JSON shape must be:",
      "{",
      '  "activeDiscussions": ["string"],',
      '  "resolvedDecisions": ["string"],',
      '  "blockers": ["string"],',
      '  "followUps": ["string"]',
      "}"
    ].join("\n");
  }

  private getCommentsSummaryUserPrompt(title: string, commentsText: string) {
    return [
      `Document title: ${title}`,
      "",
      "Summarize the comment threads below.",
      "Use these guidelines:",
      "- activeDiscussions: open questions or unresolved discussion themes, each under 30 words.",
      "- resolvedDecisions: decisions or conclusions from resolved threads, each under 30 words.",
      "- blockers: blockers, risks, or disagreements mentioned in comments, each under 30 words.",
      "- followUps: concrete next steps from the discussion, each under 30 words.",
      "- Use empty arrays for sections with no relevant items.",
      "",
      "Comment threads:",
      commentsText
    ].join("\n");
  }

  private slugify(value: string) {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);

    return slug || "document";
  }
}

export const aiService = new AiService();
