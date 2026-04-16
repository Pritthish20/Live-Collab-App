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
