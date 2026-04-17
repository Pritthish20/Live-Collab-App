"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CommentAnchor, CommentThread } from "@/types";
import { useAddCommentReply } from "../api/use-add-comment-reply";
import { useComments } from "../api/use-comments";
import { useCreateCommentThread } from "../api/use-create-comment-thread";
import { useUpdateCommentThread } from "../api/use-update-comment-thread";

export type CommentDraft = {
  anchor?: CommentAnchor;
  quote?: string;
  token: number;
};

type CommentsPanelProps = {
  documentId: string;
  canComment: boolean;
  draft: CommentDraft | null;
  onConsumeDraft: () => void;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function ThreadComposer({
  documentId,
  canComment,
  draft,
  onConsumeDraft
}: Pick<
  CommentsPanelProps,
  "documentId" | "canComment" | "draft" | "onConsumeDraft"
>) {
  const createCommentThread = useCreateCommentThread();
  const [body, setBody] = useState("");

  useEffect(() => {
    if (draft?.token) {
      setBody("");
    }
  }, [draft?.token]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!body.trim()) {
      return;
    }

    createCommentThread.mutate(
      {
        documentId,
        body,
        quote: draft?.quote,
        anchor: draft?.anchor
      },
      {
        onSuccess: () => {
          setBody("");
          onConsumeDraft();
        }
      }
    );
  }

  if (!canComment) {
    return (
      <p className="muted">
        You can read comments here, but only editors can add or reply.
      </p>
    );
  }

  return (
    <form className="comment-composer" onSubmit={onSubmit}>
      {draft?.quote ? (
        <div className="comment-quote">
          <strong>Quoted selection</strong>
          <p>{draft.quote}</p>
          <Button type="button" variant="secondary" onClick={onConsumeDraft}>
            Clear selection
          </Button>
        </div>
      ) : null}
      <Textarea
        aria-label="Comment body"
        placeholder={
          draft?.quote ? "Add context for this selection" : "Start a comment thread"
        }
        rows={4}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        disabled={createCommentThread.isPending}
      />
      <div className="comment-composer-actions">
        <Button type="submit" disabled={createCommentThread.isPending}>
          Post comment
        </Button>
      </div>
      {createCommentThread.error ? (
        <p className="error">{createCommentThread.error.message}</p>
      ) : null}
    </form>
  );
}

function CommentThreadCard({
  expanded,
  documentId,
  canComment,
  onToggle,
  thread
}: {
  expanded: boolean;
  documentId: string;
  canComment: boolean;
  onToggle: () => void;
  thread: CommentThread;
}) {
  const addReply = useAddCommentReply();
  const updateThread = useUpdateCommentThread();
  const [reply, setReply] = useState("");

  const isResolved = thread.status === "resolved";
  const resolveLabel = isResolved ? "Reopen" : "Resolve";
  const nextStatus = isResolved ? "open" : "resolved";
  const latestComment = thread.comments[thread.comments.length - 1];
  const preview =
    thread.quote ?? latestComment?.body ?? "Open this thread to view details.";

  function onSubmitReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!reply.trim()) {
      return;
    }

    addReply.mutate(
      {
        documentId,
        threadId: thread.id,
        body: reply
      },
      {
        onSuccess: () => setReply("")
      }
    );
  }

  return (
    <div className={`comment-thread ${isResolved ? "resolved" : ""} ${expanded ? "expanded" : ""}`}>
      <button
        type="button"
        className="comment-thread-toggle"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <div className="comment-thread-header">
          <div className="comment-thread-title">
            <strong>{thread.createdBy?.name ?? "Unknown user"}</strong>
            <Badge>{isResolved ? "Resolved" : "Open"}</Badge>
            <Badge>{thread.comments.length} message{thread.comments.length === 1 ? "" : "s"}</Badge>
          </div>
          <div className="comment-thread-meta">
            <span className="muted">{formatDate(thread.createdAt)}</span>
            <span className={`comment-thread-chevron ${expanded ? "open" : ""}`} aria-hidden="true">
              ▾
            </span>
          </div>
        </div>
        <p className="comment-thread-preview">{preview}</p>
        <span className="comment-thread-toggle-label">
          <span className="comment-thread-toggle-icon" aria-hidden="true">
            <span className={`comment-thread-chevron ${expanded ? "open" : ""}`}>
              ▾
            </span>
          </span>
          <span>{expanded ? "Hide thread" : "Open thread"}</span>
        </span>
      </button>

      {expanded ? (
        <>
          {thread.quote ? (
            <blockquote className="comment-thread-quote">{thread.quote}</blockquote>
          ) : null}

          <div className="comment-list">
            {thread.comments.map((comment) => (
              <div className="comment-item" key={comment.id}>
                <div className="comment-item-header">
                  <strong>{comment.author?.name ?? "Unknown user"}</strong>
                  <span className="muted">{formatDate(comment.createdAt)}</span>
                </div>
                <p>{comment.body}</p>
              </div>
            ))}
          </div>

          <div className="comment-thread-actions">
            {canComment ? (
              <Button
                type="button"
                variant="secondary"
                disabled={updateThread.isPending}
                onClick={() =>
                  updateThread.mutate({
                    documentId,
                    threadId: thread.id,
                    status: nextStatus
                  })
                }
              >
                {resolveLabel}
              </Button>
            ) : null}
            {isResolved && thread.resolvedAt ? (
              <span className="muted">Resolved {formatDate(thread.resolvedAt)}</span>
            ) : null}
          </div>

          {canComment ? (
            <form className="comment-reply-form" onSubmit={onSubmitReply}>
              <Textarea
                aria-label="Reply body"
                placeholder="Reply to this comment"
                rows={3}
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                disabled={addReply.isPending}
              />
              <Button type="submit" disabled={addReply.isPending}>
                Reply
              </Button>
            </form>
          ) : null}

          {addReply.error ? <p className="error">{addReply.error.message}</p> : null}
          {updateThread.error ? (
            <p className="error">{updateThread.error.message}</p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export function CommentsPanel({
  documentId,
  canComment,
  draft,
  onConsumeDraft
}: CommentsPanelProps) {
  const commentsQuery = useComments(documentId);
  const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null);

  const orderedThreads = useMemo(() => {
    if (!commentsQuery.data) {
      return [];
    }

    return [...commentsQuery.data].sort((left, right) => {
      if (left.status !== right.status) {
        return left.status === "open" ? -1 : 1;
      }

      return (
        new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime()
      );
    });
  }, [commentsQuery.data]);

  useEffect(() => {
    if (
      expandedThreadId &&
      !orderedThreads.some((thread) => thread.id === expandedThreadId)
    ) {
      setExpandedThreadId(null);
    }
  }, [expandedThreadId, orderedThreads]);

  return (
    <div className="stack sidebar-section">
      <ThreadComposer
        documentId={documentId}
        canComment={canComment}
        draft={draft}
        onConsumeDraft={onConsumeDraft}
      />

      {commentsQuery.isLoading ? (
        <p className="muted">Loading comments...</p>
      ) : null}
      {commentsQuery.isError ? (
        <p className="error">{commentsQuery.error.message}</p>
      ) : null}

      {orderedThreads.length > 0 ? (
        <div className="comment-thread-list">
          {orderedThreads.map((thread) => (
            <CommentThreadCard
              expanded={expandedThreadId === thread.id}
              key={thread.id}
              documentId={documentId}
              canComment={canComment}
              onToggle={() =>
                setExpandedThreadId((current) =>
                  current === thread.id ? null : thread.id
                )
              }
              thread={thread}
            />
          ))}
        </div>
      ) : commentsQuery.data ? (
        <div className="empty-state">
          <strong>No comments yet</strong>
          <span className="muted">
            Use comments to leave context on a selection or discuss edits
            without changing the document.
          </span>
        </div>
      ) : null}
    </div>
  );
}
