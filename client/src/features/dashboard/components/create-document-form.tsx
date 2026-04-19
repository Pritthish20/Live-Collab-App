"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateDocument } from "../api/use-create-document";

export function CreateDocumentForm() {
  const router = useRouter();
  const [title, setTitle] = useState("Untitled document");
  const createDocument = useCreateDocument();

  function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createDocument.mutate(title, {
      onSuccess: (document) => {
        setTitle("Untitled document");
        router.push(`/documents/${document.id}`);
      }
    });
  }

  return (
    <form
      className="create-document-form"
      onSubmit={onCreate}
      data-testid="create-document-form"
    >
      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        aria-label="Document title"
        data-testid="create-document-title"
      />
      <Button
        type="submit"
        disabled={createDocument.isPending}
        data-testid="create-document-submit"
      >
        Create
      </Button>
      {createDocument.error ? (
        <p className="error">{createDocument.error.message}</p>
      ) : null}
    </form>
  );
}
