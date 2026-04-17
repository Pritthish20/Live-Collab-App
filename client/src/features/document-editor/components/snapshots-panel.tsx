"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateSnapshot } from "../api/use-create-snapshot";
import { useRestoreSnapshot } from "../api/use-restore-snapshot";
import { useSnapshots } from "../api/use-snapshots";

type SnapshotsPanelProps = {
  canCreate: boolean;
  canRestore: boolean;
  documentId: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export function SnapshotsPanel({
  canCreate,
  canRestore,
  documentId,
}: SnapshotsPanelProps) {
  const router = useRouter();
  const snapshotsQuery = useSnapshots(documentId);
  const createSnapshot = useCreateSnapshot();
  const restoreSnapshot = useRestoreSnapshot();
  const [title, setTitle] = useState("");

  function onCreateSnapshot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    createSnapshot.mutate(
      {
        documentId,
        title: title.trim() || undefined
      },
      {
        onSuccess: () => {
          setTitle("");
        }
      }
    );
  }

  return (
    <div className="stack sidebar-section">
      {canCreate ? (
        <form className="snapshot-form" onSubmit={onCreateSnapshot}>
          <Input
            aria-label="Snapshot title"
            placeholder="Snapshot name (optional)"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={createSnapshot.isPending}
          />
          <Button type="submit" disabled={createSnapshot.isPending}>
            Save snapshot
          </Button>
          {createSnapshot.error ? (
            <p className="error">{createSnapshot.error.message}</p>
          ) : null}
        </form>
      ) : (
        <p className="muted">
          You can review snapshots here, but only editors can save them.
        </p>
      )}

      {!canRestore ? (
        <p className="muted">
          Restoring a snapshot changes the shared document for everyone, so only
          the owner can restore one.
        </p>
      ) : null}

      {snapshotsQuery.isLoading ? <p className="muted">Loading snapshots...</p> : null}
      {snapshotsQuery.isError ? (
        <p className="error">{snapshotsQuery.error.message}</p>
      ) : null}

      {snapshotsQuery.data && snapshotsQuery.data.length > 0 ? (
        <div className="snapshot-list">
          {snapshotsQuery.data.map((snapshot) => (
            <div className="snapshot-item" key={snapshot.id}>
              <div className="snapshot-item-header">
                <strong>{snapshot.title ?? "Untitled snapshot"}</strong>
                <Badge>{formatDate(snapshot.createdAt)}</Badge>
              </div>
              <p className="muted">
                Saved by {snapshot.createdBy?.name ?? "Unknown user"}
              </p>
              {canRestore ? (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={restoreSnapshot.isPending}
                  onClick={() =>
                    restoreSnapshot.mutate(
                      {
                        documentId,
                        snapshotId: snapshot.id
                      },
                      {
                        onSuccess: () => {
                          router.refresh();
                          window.location.reload();
                        }
                      }
                    )
                  }
                >
                  Restore
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      ) : snapshotsQuery.data ? (
        <div className="empty-state">
          <strong>No snapshots yet</strong>
          <span className="muted">Save checkpoints before risky edits or review milestones later.</span>
        </div>
      ) : null}

      {restoreSnapshot.error ? (
        <p className="error">{restoreSnapshot.error.message}</p>
      ) : null}
    </div>
  );
}
