# CollabPad

CollabPad is a real-time collaborative document editor built with a two-app monorepo:

```txt
client/  Next.js, Tiptap, Yjs, Hocuspocus provider
server/  Express, Hocuspocus, Prisma, PostgreSQL
```

## Local Setup

1. Install dependencies:

```sh
npm install
```

2. Start local infrastructure:

```sh
npm run docker:up
```

This default compose file is intentionally lightweight and starts only:

- PostgreSQL
- Redis

Run the application on your machine during development:

```sh
npm run dev
```

Use the single-instance full app stack when you want to test the entire Docker
build locally without scaling:

```sh
npm run docker:up:local
```

That local full-app stack starts:

- PostgreSQL
- Redis
- one backend instance
- client container

The local backend container applies Prisma migrations before it starts.

Use the full Docker architecture only when you want to demo scaling locally:

```sh
npm run docker:up:full
```

That full stack starts:

- PostgreSQL
- Redis
- Prisma migration runner
- two backend instances
- nginx gateway
- client container

3. Configure environment:

```sh
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

4. Generate Prisma client and run migrations:

```sh
npm run prisma:generate -w server
npm run prisma:migrate -w server
```

Local URLs:

```txt
Client: http://localhost:3000
API:    http://localhost:4000
WS:     ws://localhost:1234
DB:     postgresql://postgres:postgres@localhost:5432/collabpad
```

## Phase 1 Permission Behavior

- REST document routes require authentication.
- Users only see documents where they are collaborators.
- Owner can rename and delete.
- Editor can rename and edit content.
- Viewer can open a document in read-only mode.
- Hocuspocus WebSocket connections verify the same document access before sync starts.
- WebSocket token refreshes re-check the user's current role.
