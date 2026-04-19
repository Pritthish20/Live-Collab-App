# Data Model

## User

```ts
User {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}
```

## Document

```ts
Document {
  id: string
  title: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
}
```

## Collaborator

```ts
Collaborator {
  id: string
  documentId: string
  userId: string
  role: "owner" | "editor" | "viewer"
  createdAt: Date
  updatedAt: Date
}
```

## Yjs Document State

Use one of these MVP persistence options:

```ts
DocumentState {
  id: string
  documentId: string
  state: Buffer
  createdAt: Date
  updatedAt: Date
}
```

Or:

```ts
DocumentUpdate {
  id: string
  documentId: string
  update: Buffer
  createdAt: Date
}
```

Recommended MVP choice: store the latest binary Yjs state snapshot per document. Add update logs later only if needed for deeper history or auditability.

## Snapshot

```ts
Snapshot {
  id: string
  documentId: string
  createdById: string | null
  title: string | null
  state: Buffer
  createdAt: Date
}
```

## Activity Log

```ts
ActivityLog {
  id: string
  documentId: string
  actorId: string | null
  eventType:
    | "document_created"
    | "document_renamed"
    | "document_deleted"
    | "user_joined"
    | "user_left"
    | "document_edited"
    | "permission_changed"
  metadata: Json
  createdAt: Date
}
```

## Comment, Later Phase

```ts
Comment {
  id: string
  documentId: string
  authorId: string
  anchor: Json
  body: string
  status: "open" | "resolved"
  createdAt: Date
  updatedAt: Date
}
```

Comments should be delayed because text anchors must survive document edits.

