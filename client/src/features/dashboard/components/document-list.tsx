"use client";

import { Panel } from "@/components/ui/panel";
import { useDocuments } from "../api/use-documents";
import { DocumentRow } from "./document-row";

export function DocumentList() {
  const documentsQuery = useDocuments();

  return (
    <div className="document-list">
      {documentsQuery.isLoading ? <p>Loading documents...</p> : null}
      {documentsQuery.error ? (
        <p className="error">{documentsQuery.error.message}</p>
      ) : null}
      {documentsQuery.data?.length === 0 ? (
        <Panel>
          <p className="muted">No documents yet. Create one to start writing.</p>
        </Panel>
      ) : null}
      {documentsQuery.data?.map((document) => (
        <DocumentRow document={document} key={document.id} />
      ))}
    </div>
  );
}
