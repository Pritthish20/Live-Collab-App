import { DocumentEditorPage } from "@/features/document-editor/components/document-editor-page";

type DocumentPageProps = {
  params: Promise<{
    documentId: string;
  }>;
};

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { documentId } = await params;

  return <DocumentEditorPage documentId={documentId} />;
}
