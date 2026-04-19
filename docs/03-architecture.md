# Architecture

## High-Level Components

```txt
Browser Client
  Next.js
  Tiptap
  Yjs
  Hocuspocus Provider

Server
  Express REST API
  Hocuspocus WebSocket Server
  Auth and Permissions
  Prisma Database Access

Storage
  PostgreSQL
  Redis later for scaling
```

## Repository Layout

```txt
collabpad/
  client/
    src/
      app/
      components/
      features/
      lib/
      styles/
    package.json

  server/
    src/
      index.ts
      api/
      auth/
      documents/
      collaboration/
      db/
      middleware/
      permissions/
    prisma/
      schema.prisma
    package.json

  package.json
  .env.example
  .gitignore
```

## Server Process

For the MVP, run Express and Hocuspocus in the same `server/` application. This keeps auth, permissions, and persistence logic close together.

Suggested structure:

```txt
server/src/
  index.ts
  api/
    routes.ts
  auth/
    auth.controller.ts
    auth.service.ts
  documents/
    documents.controller.ts
    documents.service.ts
  collaboration/
    hocuspocus.ts
    persistence.ts
  permissions/
    permissions.service.ts
  db/
    prisma.ts
```

## Client Responsibilities

- Authenticate users.
- Display document dashboard.
- Load document metadata from the API.
- Initialize Tiptap with Yjs.
- Connect to Hocuspocus using the document ID and user session.
- Render presence and cursor state.
- Respect viewer mode by disabling editing.

## Server Responsibilities

- Authenticate users.
- Manage documents and collaborators.
- Enforce roles on REST API routes.
- Enforce access on WebSocket connection.
- Load and persist Yjs document state.
- Track snapshots and activity logs in later phases.

