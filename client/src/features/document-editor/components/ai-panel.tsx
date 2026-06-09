"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AiCommentsSummary, AiDocumentReport } from "@/types";
import { useDownloadAiReportPdf } from "../api/use-download-ai-report-pdf";
import { useGenerateAiReport } from "../api/use-generate-ai-report";
import { useSummarizeComments } from "../api/use-summarize-comments";

type AiPanelProps = {
  documentId: string;
};

type ListSectionProps = {
  title: string;
  items: string[];
  emptyLabel?: string;
};

export function AiPanel({ documentId }: AiPanelProps) {
  const generateReport = useGenerateAiReport();
  const summarizeComments = useSummarizeComments();
  const downloadReportPdf = useDownloadAiReportPdf();
  const [report, setReport] = useState<AiDocumentReport | null>(null);
  const [commentsSummary, setCommentsSummary] =
    useState<AiCommentsSummary | null>(null);

  function onGenerateReport() {
    generateReport.mutate(
      {
        documentId
      },
      {
        onSuccess: setReport
      }
    );
  }

  function onSummarizeComments() {
    summarizeComments.mutate(
      {
        documentId
      },
      {
        onSuccess: setCommentsSummary
      }
    );
  }

  function onDownloadReport() {
    if (!report) {
      return;
    }

    downloadReportPdf.mutate({
      documentId,
      report
    });
  }

  return (
    <div className="stack sidebar-section ai-panel">
      <section className="ai-card stack">
        <div className="ai-card-header">
          <div>
            <strong>Document report</strong>
            <p className="muted">
              Generate a summary, key points, action items, and risks.
            </p>
          </div>
        </div>
        <div className="ai-actions">
          <Button
            type="button"
            onClick={onGenerateReport}
            disabled={generateReport.isPending}
          >
            {generateReport.isPending ? "Generating..." : "Generate report"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onDownloadReport}
            disabled={!report || downloadReportPdf.isPending}
          >
            {downloadReportPdf.isPending ? "Preparing..." : "Download PDF"}
          </Button>
        </div>
        {generateReport.error ? (
          <p className="error">{generateReport.error.message}</p>
        ) : null}
        {downloadReportPdf.error ? (
          <p className="error">{downloadReportPdf.error.message}</p>
        ) : null}
        {report ? <DocumentReport report={report} /> : null}
      </section>

      <section className="ai-card stack">
        <div className="ai-card-header">
          <div>
            <strong>Comment summary</strong>
            <p className="muted">
              Summarize active discussions, decisions, blockers, and follow-ups.
            </p>
          </div>
        </div>
        <div className="ai-actions">
          <Button
            type="button"
            onClick={onSummarizeComments}
            disabled={summarizeComments.isPending}
          >
            {summarizeComments.isPending
              ? "Summarizing..."
              : "Summarize comments"}
          </Button>
        </div>
        {summarizeComments.error ? (
          <p className="error">{summarizeComments.error.message}</p>
        ) : null}
        {commentsSummary ? (
          <CommentsSummary summary={commentsSummary} />
        ) : null}
      </section>
    </div>
  );
}

function DocumentReport({ report }: { report: AiDocumentReport }) {
  return (
    <div className="stack ai-output">
      <section className="ai-output-section">
        <strong>Summary</strong>
        <p>{report.summary || "No summary generated."}</p>
      </section>
      <ListSection title="Key points" items={report.keyPoints} />
      <ListSection title="Action items" items={report.actionItems} />
      <ListSection
        title="Risks and open questions"
        items={report.risks}
        emptyLabel="No risks or open questions found."
      />
    </div>
  );
}

function CommentsSummary({ summary }: { summary: AiCommentsSummary }) {
  return (
    <div className="stack ai-output">
      <ListSection
        title="Active discussions"
        items={summary.activeDiscussions}
        emptyLabel="No active discussions found."
      />
      <ListSection
        title="Resolved decisions"
        items={summary.resolvedDecisions}
        emptyLabel="No resolved decisions found."
      />
      <ListSection
        title="Blockers"
        items={summary.blockers}
        emptyLabel="No blockers found."
      />
      <ListSection
        title="Follow-ups"
        items={summary.followUps}
        emptyLabel="No follow-ups found."
      />
    </div>
  );
}

function ListSection({
  title,
  items,
  emptyLabel = "No items found."
}: ListSectionProps) {
  return (
    <section className="ai-output-section">
      <strong>{title}</strong>
      {items.length > 0 ? (
        <ul>
          {items.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">{emptyLabel}</p>
      )}
    </section>
  );
}
