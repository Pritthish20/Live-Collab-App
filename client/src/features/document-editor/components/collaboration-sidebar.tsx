"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Panel } from "@/components/ui/panel";
import { AiPanel } from "./ai-panel";
import { ActivityFeed } from "./activity-feed";
import { CommentsPanel, type CommentDraft } from "./comments-panel";
import { SnapshotsPanel } from "./snapshots-panel";

export type CollaborationTab = "comments" | "snapshots" | "activity" | "ai";

type CollaborationSidebarProps = {
  activeTab: CollaborationTab;
  canComment: boolean;
  canEdit: boolean;
  canManage: boolean;
  commentDraft: CommentDraft | null;
  documentId: string;
  onActiveTabChange: (tab: CollaborationTab) => void;
  onConsumeCommentDraft: () => void;
};

export function CollaborationSidebar({
  activeTab,
  canComment,
  canEdit,
  canManage,
  commentDraft,
  documentId,
  onActiveTabChange,
  onConsumeCommentDraft
}: CollaborationSidebarProps) {
  return (
    <Panel className="collaboration-sidebar">
      <Tabs>
        <TabsList>
          <TabsTrigger
            type="button"
            aria-pressed={activeTab === "comments"}
            onClick={() => onActiveTabChange("comments")}
          >
            Comments
          </TabsTrigger>
          <TabsTrigger
            type="button"
            aria-pressed={activeTab === "snapshots"}
            onClick={() => onActiveTabChange("snapshots")}
          >
            Snapshots
          </TabsTrigger>
          <TabsTrigger
            type="button"
            aria-pressed={activeTab === "activity"}
            onClick={() => onActiveTabChange("activity")}
          >
            Activity
          </TabsTrigger>
          <TabsTrigger
            type="button"
            aria-pressed={activeTab === "ai"}
            onClick={() => onActiveTabChange("ai")}
          >
            AI
          </TabsTrigger>
        </TabsList>

        <div className="sidebar-content">
          {activeTab === "comments" ? (
            <CommentsPanel
              documentId={documentId}
              canComment={canComment}
              draft={commentDraft}
              onConsumeDraft={onConsumeCommentDraft}
            />
          ) : null}
          {activeTab === "snapshots" ? (
            <SnapshotsPanel
              canCreate={canEdit}
              canRestore={canManage}
              documentId={documentId}
            />
          ) : null}
          {activeTab === "activity" ? (
            <ActivityFeed documentId={documentId} />
          ) : null}
          {activeTab === "ai" ? <AiPanel documentId={documentId} /> : null}
        </div>
      </Tabs>
    </Panel>
  );
}
