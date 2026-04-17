"use client";

import { Badge } from "@/components/ui/badge";
import { useActivityLogs } from "../api/use-activity-logs";
import { ActivityFeedPresenter } from "../utils/activity-feed";

type ActivityFeedProps = {
  documentId: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export function ActivityFeed({ documentId }: ActivityFeedProps) {
  const activityQuery = useActivityLogs(documentId);

  if (activityQuery.isLoading) {
    return <p className="muted">Loading activity...</p>;
  }

  if (activityQuery.isError) {
    return <p className="error">{activityQuery.error.message}</p>;
  }

  if (!activityQuery.data || activityQuery.data.length === 0) {
    return (
      <div className="empty-state">
        <strong>No activity yet</strong>
        <span className="muted">Changes, sharing updates, comments, and snapshots will appear here.</span>
      </div>
    );
  }

  return (
    <div className="activity-list">
      {activityQuery.data.map((entry) => (
        <div className="timeline-item" key={entry.id}>
          <div className="timeline-item-header">
            <strong>{ActivityFeedPresenter.getTitle(entry)}</strong>
            <Badge>{formatDate(entry.createdAt)}</Badge>
          </div>
          <p>{ActivityFeedPresenter.getSummary(entry)}</p>
        </div>
      ))}
    </div>
  );
}
