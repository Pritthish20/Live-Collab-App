export type User = {
  id: string;
  name: string;
  email: string;
};

export type DocumentSummary = {
  id: string;
  title: string;
  role: "owner" | "editor" | "viewer";
  createdAt: string;
  updatedAt: string;
};

export type DocumentDetail = DocumentSummary & {
  ownerId: string;
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
