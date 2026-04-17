import type { ActivityLogEntry } from "@/types";

export class ActivityFeedPresenter {
  static getTitle(entry: ActivityLogEntry) {
    switch (entry.eventType) {
      case "document_created":
        return "Document created";
      case "document_renamed":
        return "Title changed";
      case "collaborator_added":
        return "Collaborator added";
      case "collaborator_role_changed":
        return "Access updated";
      case "collaborator_removed":
        return "Collaborator removed";
      case "snapshot_created":
        return "Snapshot saved";
      case "snapshot_restored":
        return "Snapshot restored";
      case "comment_thread_created":
        return "Comment started";
      case "comment_reply_added":
        return "Reply added";
      case "comment_thread_resolved":
        return "Comment resolved";
      case "comment_thread_reopened":
        return "Comment reopened";
      default:
        return "Activity";
    }
  }

  static getSummary(entry: ActivityLogEntry) {
    const metadata = entry.metadata ?? {};

    switch (entry.eventType) {
      case "document_created":
        return this.withActor(entry, `created "${String(metadata.title ?? "Untitled")}"`);
      case "document_renamed":
        return this.withActor(
          entry,
          `renamed this from "${String(metadata.previousTitle ?? "Untitled")}" to "${String(
            metadata.nextTitle ?? "Untitled"
          )}"`
        );
      case "collaborator_added":
        return this.withActor(
          entry,
          `gave ${String(metadata.collaboratorEmail ?? "a collaborator")} ${String(
            metadata.role ?? "viewer"
          )} access`
        );
      case "collaborator_role_changed":
        return this.withActor(
          entry,
          `changed ${String(metadata.collaboratorEmail ?? "a collaborator")} from ${String(
            metadata.previousRole ?? "viewer"
          )} to ${String(metadata.nextRole ?? "viewer")}`
        );
      case "collaborator_removed":
        return this.withActor(
          entry,
          `removed ${String(metadata.collaboratorEmail ?? "a collaborator")}`
        );
      case "snapshot_created":
        return this.withActor(
          entry,
          `saved ${metadata.title ? `"${String(metadata.title)}"` : "a snapshot"}`
        );
      case "snapshot_restored":
        return this.withActor(
          entry,
          `restored ${metadata.title ? `"${String(metadata.title)}"` : "a snapshot"}`
        );
      case "comment_thread_created":
        return this.withActor(entry, "started a comment thread");
      case "comment_reply_added":
        return this.withActor(entry, "replied to a comment");
      case "comment_thread_resolved":
        return this.withActor(entry, "resolved a comment");
      case "comment_thread_reopened":
        return this.withActor(entry, "reopened a comment");
      default:
        return this.withActor(entry, "updated this document");
    }
  }

  private static withActor(entry: ActivityLogEntry, action: string) {
    return `${entry.actor?.name ?? "Someone"} ${action}.`;
  }
}
