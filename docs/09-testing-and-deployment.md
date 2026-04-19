# Testing and Deployment

## Testing Strategy

## Unit Tests

Use unit tests for:

- Auth service.
- Password hashing helpers.
- Permission checks.
- Document service.
- Request validation schemas.

## Integration Tests

Use integration tests for:

- Auth routes.
- Document CRUD routes.
- Sharing and role routes.
- Database reads and writes through Prisma.

## Realtime Tests

Use targeted tests for:

- Hocuspocus connection auth.
- Loading persisted Yjs state.
- Rejecting unauthorized WebSocket connections.
- Viewer read-only behavior at the app level.

## End-to-End Tests

Playwright is now configured at the repo root for browser-level E2E coverage.

Current scripts:

```json
{
  "scripts": {
    "test:e2e": "playwright test"
  }
}
```

Before running E2E locally, keep PostgreSQL and Redis available. The
Playwright web server setup starts the app processes, but it does not boot the
infrastructure services for you.

Current smoke coverage:

- Signup/login flow.
- Create and open document.
- Basic editor typing after realtime connection.

Planned next:

- Two-browser collaboration.
- Presence display.
- Viewer cannot edit.
- Removed collaborator cannot reconnect.

## Environment Variables

Root or server `.env` should include:

```txt
DATABASE_URL=
JWT_SECRET=
CLIENT_ORIGIN=
SERVER_PORT=
HOCUSPOCUS_PATH=
```

Later:

```txt
REDIS_HOST=
REDIS_PORT=
INSTANCE_NAME=
LOG_LEVEL=
```

Client `.env.local` should include:

```txt
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_COLLAB_URL=
```

## Local Development

Recommended local services:

- PostgreSQL for metadata and Yjs persistence.
- Redis for realtime sync and local parity with the current backend setup.
- A separate full stack only when validating horizontal scaling behavior.

Recommended root scripts:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev -w server\" \"npm run dev -w client\"",
    "build": "npm run build -w server && npm run build -w client",
    "test": "npm run test -w server && npm run test -w client",
    "docker:up": "docker compose up -d",
    "docker:down": "docker compose down",
    "docker:up:local": "docker compose -f docker-compose.local.yml up --build",
    "docker:up:full": "docker compose -f docker-compose.full.yml up --build"
  }
}
```

## Local Docker Stack

Default development compose:

- `postgres` on `localhost:5432`
- `redis` on `localhost:6379`

Use this for daily development, then run `server` and `client` on the host with
`npm run dev`.

Startup flow:

1. `npm run docker:up`
2. `npm run prisma:migrate -w server`
3. `npm run dev`

## Local Full-App Docker Stack

Single-instance Docker app stack:

- `postgres` on `localhost:5432`
- `redis` on `localhost:6379`
- `server` on `http://localhost:4000`
- Hocuspocus on `ws://localhost:1234`
- `client` on `http://localhost:3000`

Use this when you want to verify the whole Dockerized app locally without the
memory overhead of multiple backend instances and the nginx gateway.

Startup flow:

1. `npm run docker:up:local`
2. `server` applies Prisma migrations before starting
3. one backend instance starts
4. client starts against that backend directly

## Full Docker Stack

The local production-style stack now uses:

- `client` container on `http://localhost:3000`
- `gateway` container exposing:
  - API load balancer on `http://localhost:4000`
  - Hocuspocus WebSocket load balancer on `ws://localhost:1234`
- `server-1` and `server-2` backend containers
- `postgres` on `localhost:5432`
- `redis` on `localhost:6379`

Startup flow:

1. `npm run docker:up:full`
2. `server-migrate` applies Prisma migrations
3. backend instances boot with Redis-backed Hocuspocus sync
4. nginx distributes API and WebSocket traffic across both backend instances

Notes:

- The default `docker-compose.yml` is the low-memory dev stack.
- `docker-compose.local.yml` is a standalone single-instance full-app stack.
- `docker-compose.full.yml` is the heavier local architecture/demo stack.
- Redis is required in the local scaled setup.
- The server expects `@hocuspocus/extension-redis` to be installed in workspace dependencies.
- Because this repository may be updated in an offline environment, run `npm install` locally before the first Docker build so the lockfile and workspace dependencies are aligned.
- Playwright is a local and CI testing tool, not part of the app runtime containers.
- Detailed phase verification checklists can live under `docs/archive/`.

## Deployment Notes

- Deploy the client as a Next.js app.
- Deploy the server as a long-running Node.js process because WebSockets are required.
- Make sure the host supports WebSocket connections.
- Use a managed PostgreSQL database.
- Add Redis when running multiple server instances.
- Keep API and WebSocket CORS/origin settings strict.

## Production Checklist

- Database migrations applied.
- Environment variables configured.
- Password hashing enabled.
- Auth cookies or JWT configured securely.
- CORS limited to the real client origin.
- WebSocket auth enabled.
- Yjs persistence enabled.
- Basic logs and error tracking enabled.
- Backups configured for PostgreSQL.
