import { RequireAuth } from "@/features/auth/session/components/require-auth";
import { CollaborativeEditor } from "./collaborative-editor";

type DocumentEditorPageProps = {
  documentId: string;
};

export function DocumentEditorPage({ documentId }: DocumentEditorPageProps) {
  return (
    <RequireAuth>
      <section className="page stack">
        <CollaborativeEditor documentId={documentId} />
      </section>
    </RequireAuth>
  );
}
