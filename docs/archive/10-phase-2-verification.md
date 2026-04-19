# Phase 2 Verification

This checklist validates sharing, roles, dashboard updates, and reconnect behavior.

## Automated Checks

Run from the repository root:

```bash
npm run typecheck
npm run build
```

Expected result:

- server TypeScript passes
- client TypeScript passes
- Next.js production build passes

## Local Services

Postgres must be running before live verification:

```bash
docker compose up -d postgres
npm run prisma:migrate -w server
npm run dev
```

Expected services:

- API: `http://localhost:4000`
- Client: `http://localhost:3000`
- Collaboration WebSocket: `ws://localhost:1234`
- Postgres: `localhost:5432`

## Test Users

Create three users:

- Owner user
- Editor user
- Viewer user

Use separate browsers, profiles, or incognito windows so sessions do not overlap.

## Sharing Flow

1. Log in as Owner.
2. Create a document.
3. Open the document.
4. Click `Share`.
5. Add Editor user by email with `Editor` role.
6. Add Viewer user by email with `Viewer` role.

Expected result:

- both users appear in `People with access`
- Owner row cannot be removed or downgraded
- Editor and Viewer rows can be changed or removed

## Dashboard Flow

1. Log in as Editor.
2. Open Dashboard.
3. Check `All`, `Owned`, and `Shared`.

Expected result:

- shared document appears under `All`
- shared document appears under `Shared`
- shared document does not appear under `Owned`
- role badge says `Editor`

Repeat as Viewer.

Expected result:

- role badge says `Viewer`
- shared document appears under `Shared`

## Editor Role Flow

Open the same document as Owner, Editor, and Viewer.

Expected result:

- Owner can edit content, rename, delete, and share
- Editor can edit content and rename
- Editor cannot delete or share
- Viewer can open the document in read-only mode
- Viewer cannot edit, rename, delete, or share

## Realtime Collaboration Flow

1. Open the same document as Owner and Editor.
2. Type in the Owner window.
3. Type in the Editor window.

Expected result:

- changes appear in both windows
- presence shows active collaborators
- connection banner shows connected/synced state

## Role Change Flow

1. Owner changes Editor user to Viewer while Editor has the document open.
2. Editor attempts to continue editing.

Expected result:

- socket becomes read-only after the next sync/token refresh path
- further edits do not persist
- after reload, Editor is shown as Viewer/read-only

## Remove Access Flow

1. Owner removes Viewer user while Viewer has the document open.
2. Viewer attempts to interact or reload.

Expected result:

- socket access is revoked on the next sync path
- reload shows document unavailable or redirects according to auth handling
- Viewer no longer sees the document on Dashboard

## Reconnect Flow

1. Open a document as Editor.
2. Stop the collaboration server or temporarily disconnect the network.
3. Type a small edit.
4. Restart the server or reconnect network.

Expected result:

- editor shows disconnected/reconnecting messaging
- pending changes are retained in the tab
- pending changes sync after reconnect
- presence refreshes after reconnect

## Phase 2 Completion Criteria

Phase 2 is complete when:

- sharing UI works for registered users
- owner can manage collaborators
- owner is protected from downgrade/removal
- editor and viewer roles are enforced in API, WebSocket, and UI
- dashboard separates owned/shared documents clearly
- reconnect state is visible and pending edits survive temporary disconnects
- `npm run typecheck` and `npm run build` pass
