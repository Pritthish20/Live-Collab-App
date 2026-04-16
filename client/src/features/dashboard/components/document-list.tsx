"use client";

import { useMemo, useState } from "react";
import { Panel } from "@/components/ui/panel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleAccess } from "@/features/documents/utils/role-access";
import type { DocumentSummary } from "@/types";
import { useDocuments } from "../api/use-documents";
import { DocumentRow } from "./document-row";

type DashboardFilter = "all" | "owned" | "shared";

type DashboardCount = {
  label: string;
  value: number;
};

export function DocumentList() {
  const [filter, setFilter] = useState<DashboardFilter>("all");
  const documentsQuery = useDocuments();
  const documents = documentsQuery.data ?? [];
  const counts = useMemo(() => getDashboardCounts(documents), [documents]);
  const filteredDocuments = useMemo(
    () => filterDocuments(documents, filter),
    [documents, filter]
  );

  return (
    <section className="stack" aria-labelledby="recent-documents">
      <div className="dashboard-list-header">
        <div className="page-heading">
          <p className="eyebrow">Recent documents</p>
          <h2 id="recent-documents">Work in progress</h2>
          <p className="muted">Open owned and shared documents from one place.</p>
        </div>
        <div className="dashboard-summary" aria-label="Document summary">
          {counts.map((count) => (
            <div className="dashboard-stat" key={count.label}>
              <strong>{count.value}</strong>
              <span className="muted">{count.label}</span>
            </div>
          ))}
        </div>
      </div>

      <Tabs>
        <TabsList aria-label="Document filters">
          <TabsTrigger
            type="button"
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All
          </TabsTrigger>
          <TabsTrigger
            type="button"
            aria-pressed={filter === "owned"}
            onClick={() => setFilter("owned")}
          >
            Owned
          </TabsTrigger>
          <TabsTrigger
            type="button"
            aria-pressed={filter === "shared"}
            onClick={() => setFilter("shared")}
          >
            Shared
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="document-list">
        {documentsQuery.isLoading ? (
          <Panel className="dashboard-empty">
            <p className="muted">Loading documents...</p>
          </Panel>
        ) : null}
        {documentsQuery.error ? (
          <p className="error">{documentsQuery.error.message}</p>
        ) : null}
        {!documentsQuery.isLoading &&
        !documentsQuery.error &&
        filteredDocuments.length === 0 ? (
          <Panel className="dashboard-empty">
            <h3>{getEmptyTitle(filter, documents.length)}</h3>
            <p className="muted">{getEmptyMessage(filter, documents.length)}</p>
          </Panel>
        ) : null}
        {filteredDocuments.map((document) => (
          <DocumentRow document={document} key={document.id} />
        ))}
      </div>
    </section>
  );
}

function filterDocuments(
  documents: DocumentSummary[],
  filter: DashboardFilter
) {
  if (filter === "owned") {
    return documents.filter((document) => RoleAccess.canManage(document.role));
  }

  if (filter === "shared") {
    return documents.filter((document) => !RoleAccess.canManage(document.role));
  }

  return documents;
}

function getDashboardCounts(documents: DocumentSummary[]): DashboardCount[] {
  const owned = documents.filter((document) =>
    RoleAccess.canManage(document.role)
  ).length;
  const editable = documents.filter((document) =>
    RoleAccess.canEdit(document.role)
  ).length;
  const shared = documents.length - owned;

  return [
    { label: "Total", value: documents.length },
    { label: "Owned", value: owned },
    { label: "Shared", value: shared },
    { label: "Editable", value: editable }
  ];
}

function getEmptyTitle(filter: DashboardFilter, totalCount: number) {
  if (totalCount === 0) {
    return "No documents yet";
  }

  if (filter === "owned") {
    return "No owned documents";
  }

  if (filter === "shared") {
    return "No shared documents";
  }

  return "No documents found";
}

function getEmptyMessage(filter: DashboardFilter, totalCount: number) {
  if (totalCount === 0) {
    return "Create a document to start writing.";
  }

  const messages: Record<Exclude<DashboardFilter, "all">, string> = {
    owned: "Documents you create will appear here.",
    shared: "Documents shared with you will appear here."
  };

  return filter === "all" ? "No documents match this view." : messages[filter];
}
