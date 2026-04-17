"use client";

import { HocuspocusProvider } from "@hocuspocus/provider";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import * as Y from "yjs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { useCurrentUser } from "@/features/auth/session/api/use-current-user";
import { RoleAccess } from "@/features/documents/utils/role-access";
import { pickUserColor } from "@/utils/color";
import { Config } from "@/utils/config";
import { SessionStorage } from "@/utils/session";
import { useDeleteDocument } from "../api/use-delete-document";
import { useDocument } from "../api/use-document";
import { useUpdateDocument } from "../api/use-update-document";
import type { AwarenessIdentity, ConnectionStatus, PresenceUser } from "@/types";
import { AwarenessUtils } from "../utils/awareness";
import { RealtimeStatus } from "../utils/realtime-status";
import { PresenceList } from "./presence-list";
import { ShareDocumentDialog } from "./share-document-dialog";

type CollaborativeEditorProps = {
  documentId: string;
};

export function CollaborativeEditor({ documentId }: CollaborativeEditorProps) {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const documentQuery = useDocument(documentId);
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();
  const [title, setTitle] = useState("");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [isSynced, setIsSynced] = useState(false);
  const [unsyncedChanges, setUnsyncedChanges] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([]);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const currentUserIdRef = useRef<string | null>(null);
  const providerDestroyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const documentRole = documentQuery.data?.role ?? null;
  const canEdit = RoleAccess.canEdit(documentRole);
  const canManage = RoleAccess.canManage(documentRole);
  const canRename = RoleAccess.canRename(documentRole);
  const canShare = RoleAccess.canShare(documentRole);
  const isReadOnly = RoleAccess.isReadOnly(documentRole);
  const realtimeStatus = RealtimeStatus.getMeta(
    connectionStatus,
    isSynced,
    unsyncedChanges
  );
  const isRealtimeDisconnected = RealtimeStatus.isDisconnected(connectionStatus);
  const awarenessUser = useMemo<AwarenessIdentity>(
    () => ({
      id: currentUser.data?.id ?? "anonymous",
      name: currentUser.data?.name ?? "Current user",
      color: pickUserColor(currentUser.data?.id ?? "anonymous")
    }),
    [currentUser.data?.id, currentUser.data?.name]
  );
  const ydoc = useMemo(() => new Y.Doc(), []);

  useEffect(() => {
    currentUserIdRef.current = currentUser.data?.id ?? null;
  }, [currentUser.data?.id]);

  const provider = useMemo(
    () =>
      new HocuspocusProvider({
        url: Config.collabUrl,
        name: documentId,
        document: ydoc,
        token: () => SessionStorage.getToken() ?? "",
        onStatus: ({ status }) => setConnectionStatus(status),
        onSynced: ({ state }) => setIsSynced(state),
        onUnsyncedChanges: ({ number }) => setUnsyncedChanges(number),
        onAuthenticationFailed: ({ reason }) => {
          setAuthError(reason);

          if (reason.toLowerCase().includes("login")) {
            SessionStorage.clearToken();
          }
        },
        onAwarenessChange: ({ states }) => {
          setActiveUsers(
            AwarenessUtils.getPresenceUsers(states, currentUserIdRef.current)
          );
        }
      }),
    [documentId, ydoc]
  );

  useEffect(() => {
    if (providerDestroyTimerRef.current) {
      clearTimeout(providerDestroyTimerRef.current);
      providerDestroyTimerRef.current = null;
    }

    return () => {
      providerDestroyTimerRef.current = setTimeout(() => {
        provider.destroy();
        ydoc.destroy();
        providerDestroyTimerRef.current = null;
      }, 100);
    };
  }, [provider, ydoc]);

  useEffect(() => {
    if (documentQuery.data?.title) {
      setTitle(documentQuery.data.title);
    }
  }, [documentQuery.data?.title]);

  useEffect(() => {
    provider.setAwarenessField("user", awarenessUser);
  }, [awarenessUser, provider]);

  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [
      StarterKit.configure({
        undoRedo: false
      }),
      Collaboration.configure({
        document: ydoc
      }),
      CollaborationCaret.configure({
        provider,
        user: awarenessUser
      })
    ],
    editorProps: {
      attributes: {
        "aria-label": "Collaborative document editor"
      }
    }
  });

  useEffect(() => {
    editor?.setEditable(canEdit && !authError);
  }, [authError, canEdit, editor]);

  useEffect(() => {
    editor?.commands.updateUser(awarenessUser);
  }, [awarenessUser, editor]);

  function onRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    updateDocument.mutate({
      documentId,
      title
    });
  }

  async function onDelete() {
    if (
      documentQuery.data &&
      window.confirm(`Delete "${documentQuery.data.title}"? This cannot be undone.`)
    ) {
      await deleteDocument.mutateAsync(documentId);
      router.push("/dashboard");
    }
  }

  if (documentQuery.isError || authError) {
    return (
      <Panel className="stack">
        <h1>Document unavailable</h1>
        <p className="error">
          {authError ??
            documentQuery.error?.message ??
            "You cannot access this document."}
        </p>
        <Button type="button" onClick={() => router.push("/dashboard")}>
          Back to dashboard
        </Button>
      </Panel>
    );
  }

  return (
    <div className="stack">
      <Panel className="stack editor-toolbar">
        <form className="document-title-form" onSubmit={onRename}>
          <Input
            aria-label="Document title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={
              !canRename || documentQuery.isLoading || isRealtimeDisconnected
            }
          />
          {canRename ? (
            <Button
              type="submit"
              disabled={updateDocument.isPending || isRealtimeDisconnected}
            >
              Rename
            </Button>
          ) : null}
          {canManage ? (
            <Button
              type="button"
              variant="secondary"
              onClick={onDelete}
              disabled={deleteDocument.isPending || isRealtimeDisconnected}
            >
              Delete
            </Button>
          ) : null}
          {canShare ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsShareOpen(true)}
              disabled={isRealtimeDisconnected}
            >
              Share
            </Button>
          ) : null}
        </form>
        <div className="role-summary">
          {documentRole ? <Badge>{RoleAccess.label(documentRole)}</Badge> : null}
          <span className="muted">
            {documentRole
              ? RoleAccess.description(documentRole)
              : "Loading document access..."}
          </span>
        </div>
        <div
          className={`connection-banner ${realtimeStatus.tone} ${realtimeStatus.activity}`}
          role="status"
        >
          <span className="sync-dot" aria-hidden="true" />
          <strong>{realtimeStatus.shortLabel}</strong>
          <span>{realtimeStatus.message}</span>
        </div>
        <div className="editor-status-row">
          <Badge>Connection: {realtimeStatus.label}</Badge>
          <Badge>{realtimeStatus.syncLabel}</Badge>
          {isReadOnly ? <Badge>Read only</Badge> : null}
        </div>
        <PresenceList users={activeUsers} connectionStatus={connectionStatus} />
        {authError ? <p className="error">{authError}</p> : null}
        {updateDocument.error ? (
          <p className="error">{updateDocument.error.message}</p>
        ) : null}
        {deleteDocument.error ? (
          <p className="error">{deleteDocument.error.message}</p>
        ) : null}
      </Panel>
      <div className="editor-frame">
        <EditorContent editor={editor} />
      </div>
      {canShare ? (
        <ShareDocumentDialog
          documentId={documentId}
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
        />
      ) : null}
    </div>
  );
}
