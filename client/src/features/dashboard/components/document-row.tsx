"use client";

import { FormEvent, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { RoleAccess } from "@/features/documents/utils/role-access";
import type { DocumentSummary } from "@/types";
import { useDeleteDocument } from "../api/use-delete-document";
import { useUpdateDocument } from "../api/use-update-document";

type DocumentRowProps = {
  document: DocumentSummary;
};

export function DocumentRow({ document }: DocumentRowProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [title, setTitle] = useState(document.title);
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();
  const canRename = RoleAccess.canRename(document.role);
  const canDelete = RoleAccess.canDelete(document.role);
  const roleDescription = RoleAccess.description(document.role);
  const updatedAt = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(document.updatedAt));

  useEffect(() => {
    setTitle(document.title);
  }, [document.title]);

  function onRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextTitle = title.trim();
    if (!nextTitle || nextTitle === document.title) {
      setTitle(document.title);
      setIsRenaming(false);
      return;
    }

    updateDocument.mutate(
      {
        documentId: document.id,
        title: nextTitle
      },
      {
        onSuccess: () => setIsRenaming(false)
      }
    );
  }

  function onDelete() {
    if (window.confirm(`Delete "${document.title}"? This cannot be undone.`)) {
      deleteDocument.mutate(document.id);
    }
  }

  return (
    <article className="document-row">
      <div className="document-main">
        {isRenaming ? (
          <form className="document-inline-form" onSubmit={onRename}>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-label="Document title"
              autoFocus
            />
            <Button type="submit" disabled={updateDocument.isPending}>
              Save
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setTitle(document.title);
                setIsRenaming(false);
              }}
            >
              Cancel
            </Button>
          </form>
        ) : (
          <>
            <strong className="document-title">{document.title}</strong>
            <p className="document-meta muted">
              <Badge>{RoleAccess.label(document.role)}</Badge>
              <span>{roleDescription}</span>
              <span>Updated {updatedAt}</span>
            </p>
          </>
        )}
        {updateDocument.error ? (
          <p className="error">{updateDocument.error.message}</p>
        ) : null}
        {deleteDocument.error ? (
          <p className="error">{deleteDocument.error.message}</p>
        ) : null}
      </div>
      <div className="document-actions">
        <LinkButton href={`/documents/${document.id}`} variant="secondary">
          Open
        </LinkButton>
        {canRename && !isRenaming ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsRenaming(true)}
          >
            Rename
          </Button>
        ) : null}
        {canDelete ? (
          <Button
            type="button"
            variant="secondary"
            onClick={onDelete}
            disabled={deleteDocument.isPending}
          >
            Delete
          </Button>
        ) : null}
      </div>
    </article>
  );
}
