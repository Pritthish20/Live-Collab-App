# Phases and Roadmap

## Phase 1: MVP Core Editor

Goal: prove real-time collaborative editing works end to end.

Scope:

- Monorepo setup with `client/` and `server/`.
- Next.js client.
- Express server.
- PostgreSQL and Prisma setup.
- Signup, login, logout, and current user endpoint.
- Create, list, open, rename, and delete documents.
- Tiptap editor.
- Yjs document state.
- Hocuspocus WebSocket sync.
- Presence and cursor awareness.
- Autosave through Yjs persistence.
- Owner-only document access or simple collaborator access.

Acceptance criteria:

- Two logged-in users can open the same document and see edits in real time.
- Refreshing the page restores the latest document state.
- Unauthorized users cannot open document metadata.
- Unauthorized users cannot connect to the document WebSocket.
- Presence updates when users join and leave.

## Phase 2: Sharing and Roles

Goal: support controlled collaboration across users.

Scope:

- Invite user by email.
- Share link flow if required.
- Owner, editor, viewer roles.
- Role update endpoint.
- Remove collaborator endpoint.
- Dashboard showing recent documents.
- Viewer read-only editor mode.
- Reconnect checks respecting updated permissions.

Acceptance criteria:

- Owner can invite a user.
- Editor can edit but cannot manage access.
- Viewer can open but cannot edit.
- Removed user cannot reconnect.

## Phase 3: History, Audit, and Comments

Goal: add traceability and collaboration features beyond live editing.

Scope:

- Manual or scheduled snapshots.
- Snapshot list.
- Restore from previous snapshot.
- Activity logs for important document actions.
- Comments with resolve flow.

Acceptance criteria:

- Snapshot can be created and restored.
- Permission changes are recorded.
- Comment threads can be created and resolved.

## Phase 4: Scaling, Deployment, and Polish

Goal: make the app production-ready.

Scope:

- Redis pub/sub for Hocuspocus scaling.
- Dockerized local stack for client, backend, PostgreSQL, Redis, and load balancing.
- Rate limits and stricter security headers.
- Structured logs.
- Basic metrics for sync latency, reconnect rate, and errors.
- Deployment setup.
- Playwright end-to-end collaboration tests.
- UI polish and accessibility pass.

Acceptance criteria:

- App can run with more than one server instance.
- Redis-backed collaboration sync works across instances.
- Full local stack can be started with Docker Compose.
- Deployment environment variables are documented.
- E2E tests cover login, document creation, collaboration, and permission denial.
