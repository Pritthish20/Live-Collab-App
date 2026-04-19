# Tech Stack

## Monorepo

- Root package manager workspaces.
- Two application directories only:
  - `client/`
  - `server/`

## Client

- Next.js with App Router for the web application.
- TypeScript for type safety.
- Tiptap for the editor UI.
- Yjs for CRDT document state.
- Hocuspocus provider for WebSocket sync.
- Tailwind CSS for styling.
- TanStack Query for API requests, caching, and mutation state.
- React Hook Form for form state.
- Zod for client-side schema validation shared in style with the backend.

## Server

- Node.js with TypeScript.
- Express for REST API routes.
- Hocuspocus for the Yjs WebSocket collaboration server.
- Prisma ORM for database access.
- PostgreSQL for application metadata and persisted collaboration state.
- Argon2id for password hashing.
- JWT or secure cookie-backed sessions for authentication.
- Zod for request validation.
- Helmet, CORS, and rate limiting for API hardening.

## Realtime

- Use Hocuspocus for Yjs sync.
- Use Hocuspocus awareness for active users, cursors, names, and colors.
- Avoid Socket.IO in the MVP unless a separate real-time feature needs it.

## Storage

- PostgreSQL stores users, documents, collaborators, snapshots, and activity logs.
- Yjs state should be stored as binary updates or snapshots, not as plain JSON.
- Redis is a later scaling dependency, not required for the first MVP.

## Later Additions

- Redis for pub/sub and horizontal Hocuspocus scaling.
- Playwright for end-to-end collaboration tests.
- Docker Compose for local PostgreSQL and Redis.
- Observability through structured logs and metrics.

