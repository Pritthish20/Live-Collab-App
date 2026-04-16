# CollabPad

CollabPad is a real-time collaborative document editor built with a two-app monorepo:

```txt
client/  Next.js, Tiptap, Yjs, Hocuspocus provider
server/  Express, Hocuspocus, Prisma, PostgreSQL
```

## Phase 1 Scope

- Authentication.
- Document CRUD.
- Real-time collaborative editing.
- Presence and cursor awareness.
- Yjs persistence.
- Basic role checks.

## Local Setup

1. Install dependencies:

```sh
npm install
```

2. Start local PostgreSQL:

```sh
docker compose up -d postgres
```

Redis is defined for later scaling work, but it is not required for Phase 1. When needed:

```sh
docker compose --profile phase4 up -d redis
```

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

5. Start both apps:

```sh
npm run dev
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
