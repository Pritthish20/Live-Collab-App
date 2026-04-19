# CollabPad

CollabPad is a real-time collaborative document editor built to demonstrate
multi-user text editing, CRDT-based synchronization, role-based access control,
document history, comments, and a scalable WebSocket backend.

## What It Covers

- Real-time collaborative editing with Yjs and Hocuspocus
- Presence and awareness for active collaborators
- Signup, login, and session-based access flow
- Document creation, rename, delete, and dashboard listing
- Owner, editor, and viewer permission model
- Snapshot creation and restore
- Activity logs for document actions
- Comment threads with reply, resolve, and reopen flow
- Redis-backed scaling support for multi-instance collaboration
- Playwright browser smoke testing

## Stack

### Client

- Next.js
- React
- Tiptap
- Yjs
- Hocuspocus Provider
- TanStack Query

### Server

- Node.js
- Express
- Hocuspocus
- Prisma
- PostgreSQL
- Redis

### Tooling

- TypeScript
- Docker Compose
- Playwright

## Architecture

```txt
client/  Next.js app, feature modules, editor UI, hooks, shared components
server/  Express API, Hocuspocus server, Prisma data layer, services/controllers
docs/    product, architecture, API, collaboration, security, roadmap, testing
```

Key design choices:

- CRDT sync is handled through Yjs instead of custom merge logic.
- Realtime transport is handled through Hocuspocus over WebSockets.
- Durable document state is stored in PostgreSQL.
- Redis is used for multi-instance collaboration coordination.
- The monorepo keeps the frontend and backend close without introducing extra workspace complexity.

## Feature Summary

### Phase 1

- Authentication
- Document CRUD
- Realtime editor
- Presence
- Autosave through Yjs state persistence

### Phase 2

- Sharing by user email
- Owner, editor, viewer roles
- Role-aware dashboard and editor behavior
- Reconnect-safe permission enforcement

### Phase 3

- Snapshots
- Snapshot restore
- Activity logs
- Comment threads

### Phase 4

- Redis-backed collaboration scaling
- Dockerized runtime modes
- Structured logging
- Playwright E2E setup
- UI and workflow polish

## Documentation

Primary docs:

- [Documentation Index](docs/README.md)
- [Product Requirements](docs/01-product-requirements.md)
- [Tech Stack](docs/02-tech-stack.md)
- [Architecture](docs/03-architecture.md)
- [Data Model](docs/04-data-model.md)
- [API Contract](docs/05-api-contract.md)
- [Realtime Collaboration](docs/06-realtime-collaboration.md)
- [Security and Permissions](docs/07-security-and-permissions.md)
- [Phases and Roadmap](docs/08-phases-and-roadmap.md)
- [Testing and Deployment](docs/09-testing-and-deployment.md)

Archived reference material:

- [Phase 2 Verification Checklist](docs/archive/10-phase-2-verification.md)

## Local Setup

1. Install dependencies:

```sh
npm install
```

2. Copy environment files:

```sh
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

3. Choose a runtime mode.

### Infra Only

Starts only PostgreSQL and Redis. Run app processes on the host.

```sh
npm run docker:up
npm run prisma:generate -w server
npm run prisma:migrate -w server
npm run dev
```

### Local Full App

Starts PostgreSQL, Redis, one backend instance, and the client.

```sh
npm run docker:up:local
```

### Full Scaled Stack

Starts PostgreSQL, Redis, migration runner, two backend instances, nginx
gateway, and the client.

```sh
npm run docker:up:full
```

## Local URLs

```txt
Client: http://localhost:3000
API:    http://localhost:4000
WS:     ws://localhost:1234
DB:     postgresql://postgres:postgres@localhost:5432/collabpad
Redis:  redis://localhost:6379
```

## Testing

Type checking and builds:

```sh
npm run typecheck
npm run build
```

Playwright smoke tests:

```sh
npm run test:e2e
```

## Resume Notes

This project is a strong showcase for:

- CRDT-based collaborative editing
- distributed system thinking
- WebSocket authorization
- role-based access control
- persistence and recovery flows
- monorepo frontend/backend architecture
- Dockerized local environments

