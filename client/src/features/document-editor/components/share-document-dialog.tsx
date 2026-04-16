"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CollaboratorRole } from "@/types";
import { useCollaborators } from "../api/use-collaborators";
import { useShareDocument } from "../api/use-share-document";
import { CollaboratorList } from "./collaborator-list";

type EditableRole = Exclude<CollaboratorRole, "owner">;

type ShareDocumentDialogProps = {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
};

export function ShareDocumentDialog({
  documentId,
  isOpen,
  onClose
}: ShareDocumentDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<EditableRole>("editor");
  const collaborators = useCollaborators(documentId, isOpen);
  const shareDocument = useShareDocument();
  const { reset } = shareDocument;

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setRole("editor");
      reset();
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextEmail = email.trim();
    if (!nextEmail) {
      return;
    }

    await shareDocument.mutateAsync({
      documentId,
      email: nextEmail,
      role
    });
    setEmail("");
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-modal="true"
        className="modal-panel share-dialog stack"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div className="page-heading">
            <p className="eyebrow">Collaborators</p>
            <h2>Share document</h2>
            <p className="muted">Invite registered users by email.</p>
          </div>
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        <form className="share-form" onSubmit={onSubmit}>
          <Input
            aria-label="Collaborator email"
            type="email"
            placeholder="teammate@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <select
            aria-label="Collaborator role"
            className="input role-select"
            value={role}
            onChange={(event) => setRole(event.target.value as EditableRole)}
          >
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <Button type="submit" disabled={shareDocument.isPending}>
            {shareDocument.isPending ? "Sharing..." : "Share"}
          </Button>
        </form>

        {shareDocument.error ? (
          <p className="error">{shareDocument.error.message}</p>
        ) : null}

        <div className="stack">
          <h3>People with access</h3>
          {collaborators.isLoading ? (
            <p className="muted">Loading collaborators...</p>
          ) : null}
          {collaborators.error ? (
            <p className="error">{collaborators.error.message}</p>
          ) : null}
          {collaborators.data ? (
            <CollaboratorList
              collaborators={collaborators.data}
              documentId={documentId}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
