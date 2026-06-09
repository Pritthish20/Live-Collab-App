import * as Y from "yjs";
import { collaborationRuntime } from "../collaboration/runtime.js";
import { env } from "../config/env.js";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../utils/errors.js";

export class AiContentService {
  async getDocumentText(documentId: string) {
    await collaborationRuntime.persistDocumentState(documentId);

    const documentState = await prisma.documentState.findUnique({
      where: {
        documentId
      },
      select: {
        state: true
      }
    });

    if (!documentState) {
      throw new HttpError(
        409,
        "DOCUMENT_STATE_UNAVAILABLE",
        "Document content is not available yet."
      );
    }

    const text = this.extractTextFromState(documentState.state);
    const trimmedText = this.trimForAi(text);

    if (!trimmedText) {
      throw new HttpError(
        409,
        "DOCUMENT_TEXT_UNAVAILABLE",
        "Document does not contain text that can be summarized yet."
      );
    }

    return trimmedText;
  }

  private extractTextFromState(state: Uint8Array) {
    const ydoc = new Y.Doc();

    try {
      Y.applyUpdate(ydoc, new Uint8Array(state));
      return this.extractTextFromDocument(ydoc);
    } finally {
      ydoc.destroy();
    }
  }

  private extractTextFromDocument(ydoc: Y.Doc) {
    const preferredFragments = ["default", "prosemirror", "content"];

    for (const fragmentName of preferredFragments) {
      const fragment = ydoc.getXmlFragment(fragmentName);
      const text = this.extractTextFromXmlNode(fragment);

      if (text.trim().length > 0) {
        return this.normalizeWhitespace(text);
      }
    }

    const sharedTexts = Array.from(ydoc.share.values())
      .map((sharedType) => this.extractTextFromSharedType(sharedType))
      .filter((text) => text.trim().length > 0);

    return this.normalizeWhitespace(sharedTexts.join("\n\n"));
  }

  private extractTextFromSharedType(sharedType: unknown) {
    if (sharedType instanceof Y.XmlFragment) {
      return this.extractTextFromXmlNode(sharedType);
    }

    if (sharedType instanceof Y.XmlElement) {
      return this.extractTextFromXmlNode(sharedType);
    }

    if (sharedType instanceof Y.XmlText) {
      return sharedType.toString();
    }

    if (sharedType instanceof Y.Text) {
      return sharedType.toString();
    }

    return "";
  }

  private extractTextFromXmlNode(
    node: Y.XmlFragment | Y.XmlElement | Y.XmlText
  ): string {
    if (node instanceof Y.XmlText) {
      return node.toString();
    }

    return node
      .toArray()
      .map((child) => {
        if (
          child instanceof Y.XmlText ||
          child instanceof Y.XmlElement ||
          child instanceof Y.XmlFragment
        ) {
          return this.extractTextFromXmlNode(child);
        }

        return "";
      })
      .join("\n");
  }

  private normalizeWhitespace(text: string) {
    return text
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  private trimForAi(text: string) {
    const normalized = this.normalizeWhitespace(text);

    if (normalized.length <= env.AI_MAX_INPUT_CHARS) {
      return normalized;
    }

    return normalized.slice(0, env.AI_MAX_INPUT_CHARS).trim();
  }
}

export const aiContentService = new AiContentService();
