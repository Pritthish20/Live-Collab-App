"use client";

import { Panel } from "@/components/ui/panel";
import { RequireAuth } from "@/features/auth/session/components/require-auth";
import { CreateDocumentForm } from "./create-document-form";
import { DocumentList } from "./document-list";

export function DashboardPage() {
  return (
    <RequireAuth>
      <section className="page stack">
        <Panel className="stack">
          <h1>Dashboard</h1>
          <CreateDocumentForm />
        </Panel>
        <DocumentList />
      </section>
    </RequireAuth>
  );
}
