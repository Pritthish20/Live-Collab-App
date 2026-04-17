export type User = {
  id: string;
  name: string;
  email: string;
};

export type DocumentRole = "owner" | "editor" | "viewer";

export type DocumentSummary = {
  id: string;
  title: string;
  role: DocumentRole;
  createdAt: string;
  updatedAt: string;
};

export type DocumentDetail = DocumentSummary & {
  ownerId: string;
};

export type CollaboratorRole = DocumentRole;

export type Collaborator = {
  id: string;
  user: User;
  role: CollaboratorRole;
  createdAt: string;
  updatedAt: string;
};

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export type PresenceUser = {
  clientId: number;
  userId: string | null;
  name: string;
  color: string;
  isCurrentUser: boolean;
};

export type AwarenessIdentity = {
  id: string;
  name: string;
  color: string;
};

export type ActivityMetadata = Record<
  string,
  string | number | boolean | null
>;

export type ActivityLogEntry = {
  id: string;
  eventType: string;
  metadata: ActivityMetadata | null;
  actor: User | null;
  createdAt: string;
};

export type Snapshot = {
  id: string;
  title: string | null;
  createdAt: string;
  createdBy: User | null;
};

export type SnapshotRestoreResult = {
  ok: true;
  snapshotId: string;
  forcedReconnect: boolean;
};

export type CommentAnchor = {
  from?: number;
  to?: number;
  text?: string;
  [key: string]: unknown;
};

export type CommentStatus = "open" | "resolved";

export type CommentEntry = {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: User | null;
};

export type CommentThread = {
  id: string;
  status: CommentStatus;
  anchor: CommentAnchor | null;
  quote: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: User | null;
  resolvedBy: User | null;
  comments: CommentEntry[];
};
