import PDFDocument from "pdfkit";
import type { AiDocumentReport } from "../schemas/ai.schema.js";

const colors = {
  background: "#f4f6f8",
  foreground: "#171717",
  muted: "#5f6673",
  line: "#d9dee6",
  panel: "#ffffff",
  panelSoft: "#f9fbfc",
  primary: "#087f5b",
  primaryDark: "#06684b",
  primarySoft: "#e8f6ef",
  accent: "#c2410c",
  accentSoft: "#fff0e8"
};

const margin = 48;

export class AiPdfService {
  generateDocumentReportPdf(title: string, report: AiDocumentReport) {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({
        size: "A4",
        margin,
        bufferPages: true,
        info: {
          Title: `${title} AI Report`,
          Author: "CollabPad"
        }
      });

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      this.drawReport(doc, title, report);
      this.drawPageNumbers(doc);
      doc.end();
    });
  }

  private drawReport(
    doc: PDFKit.PDFDocument,
    title: string,
    report: AiDocumentReport
  ) {
    this.drawHeader(doc, title);
    this.drawSummary(doc, report.summary);
    this.drawListSection(doc, "Key Points", report.keyPoints, colors.primary);
    this.drawListSection(
      doc,
      "Action Items",
      report.actionItems,
      colors.accent
    );
    this.drawListSection(
      doc,
      "Risks and Open Questions",
      report.risks,
      colors.primaryDark
    );
  }

  private drawHeader(doc: PDFKit.PDFDocument, title: string) {
    const pageWidth = doc.page.width;
    const headerHeight = 128;

    doc
      .roundedRect(margin, margin, pageWidth - margin * 2, headerHeight, 8)
      .fill(colors.primary);

    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(13)
      .text("CollabPad", margin + 24, margin + 22, {
        continued: false
      });

    doc
      .fontSize(28)
      .text("AI Document Report", margin + 24, margin + 46, {
        width: pageWidth - margin * 2 - 48,
        lineGap: 2
      });

    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#d8f3e8")
      .text(`Document: ${this.truncate(title, 92)}`, margin + 24, margin + 86, {
        width: pageWidth - margin * 2 - 48
      })
      .text(`Generated: ${this.formatDate(new Date())}`, margin + 24, margin + 104);

    doc.y = margin + headerHeight + 24;
  }

  private drawSummary(doc: PDFKit.PDFDocument, summary: string) {
    this.ensureSpace(doc, 120);
    this.drawSectionLabel(doc, "Summary", colors.primary);
    this.drawCard(doc, () => {
      doc
        .font("Helvetica")
        .fontSize(12)
        .fillColor(colors.foreground)
        .text(summary || "No summary generated.", {
          width: this.contentWidth(doc),
          lineGap: 5
        });
    });
  }

  private drawListSection(
    doc: PDFKit.PDFDocument,
    title: string,
    items: string[],
    accentColor: string
  ) {
    this.ensureSpace(doc, 120);
    this.drawSectionLabel(doc, title, accentColor);
    this.drawCard(doc, () => {
      if (items.length === 0) {
        doc
          .font("Helvetica")
          .fontSize(11)
          .fillColor(colors.muted)
          .text("No items found.", {
            width: this.contentWidth(doc)
          });
        return;
      }

      items.forEach((item, index) => {
        this.ensureSpace(doc, 34);

        const bulletY = doc.y + 5;
        doc.circle(margin + 28, bulletY, 3).fill(accentColor);
        doc
          .font("Helvetica")
          .fontSize(11)
          .fillColor(colors.foreground)
          .text(item, margin + 42, doc.y, {
            width: this.contentWidth(doc) - 28,
            lineGap: 3
          });

        if (index < items.length - 1) {
          doc.moveDown(0.55);
        }
      });
    });
  }

  private drawSectionLabel(
    doc: PDFKit.PDFDocument,
    label: string,
    accentColor: string
  ) {
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor(accentColor)
      .text(label, margin, doc.y, {
        width: this.contentWidth(doc)
      });
    doc.moveDown(0.55);
  }

  private drawCard(doc: PDFKit.PDFDocument, drawContent: () => void) {
    const startY = doc.y;
    const x = margin;
    const width = doc.page.width - margin * 2;
    const padding = 18;
    const contentX = x + padding;

    doc.x = contentX;
    doc.y = startY + padding;
    const contentStartY = doc.y;
    drawContent();

    const height = doc.y - contentStartY + padding * 2;

    doc
      .save()
      .roundedRect(x, startY, width, Math.max(height, 58), 8)
      .fillAndStroke(colors.panelSoft, colors.line)
      .restore();

    doc.x = contentX;
    doc.y = startY + padding;
    drawContent();
    doc.y = startY + Math.max(height, 58) + 18;
    doc.x = margin;
  }

  private drawPageNumbers(doc: PDFKit.PDFDocument) {
    const range = doc.bufferedPageRange();

    for (let index = 0; index < range.count; index += 1) {
      doc.switchToPage(index);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(colors.muted)
        .text(
          `Page ${index + 1} of ${range.count}`,
          margin,
          doc.page.height - 34,
          {
            width: doc.page.width - margin * 2,
            align: "right"
          }
        );
    }
  }

  private ensureSpace(doc: PDFKit.PDFDocument, neededHeight: number) {
    if (doc.y + neededHeight > doc.page.height - margin - 28) {
      doc.addPage();
    }
  }

  private contentWidth(doc: PDFKit.PDFDocument) {
    return doc.page.width - margin * 2 - 36;
  }

  private formatDate(date: Date) {
    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  private truncate(value: string, maxLength: number) {
    return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
  }
}

export const aiPdfService = new AiPdfService();
