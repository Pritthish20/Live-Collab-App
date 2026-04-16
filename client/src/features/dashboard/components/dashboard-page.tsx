"use client";

import { Panel } from "@/components/ui/panel";
import { RequireAuth } from "@/features/auth/session/components/require-auth";
import { CreateDocumentForm } from "./create-document-form";
import { DocumentList } from "./document-list";

export function DashboardPage() {
  return (
    <RequireAuth>
      <section className="page stack">
        <Panel className="stack dashboard-hero">
          <div className="page-heading">
            <p className="eyebrow">Workspace</p>
            <h1>Dashboard</h1>
            <p className="muted">Create a document or reopen recent work.</p>
          </div>
          <CreateDocumentForm />
        </Panel>
        <DocumentList />
      </section>
    </RequireAuth>
  );
}
