# Realtime Collaboration

## Core Flow

1. User opens a document.
2. Client fetches document metadata and role from the REST API.
3. Client initializes a Yjs document.
4. Client initializes Tiptap with Yjs collaboration extensions.
5. Client connects to Hocuspocus using the document ID.
6. Hocuspocus validates the session and document permission.
7. Server loads the latest Yjs state.
8. Users exchange updates through Hocuspocus.
9. Server persists document state automatically.

## Editing Flow

```txt
Tiptap change
  -> Yjs update
  -> Hocuspocus WebSocket
  -> server applies update
  -> server broadcasts update
  -> other clients apply update
```

## Presence Flow

Use Hocuspocus awareness for:

- Active user list.
- Cursor position.
- User name.
- User color.
- Inactive user removal on disconnect.

Do not add Socket.IO for presence in the MVP unless a separate non-Yjs event system becomes necessary.

## Permission Handling

On WebSocket connection:

- Read the auth token or session cookie.
- Resolve the user.
- Resolve the document ID from the connection name.
- Check collaborator role.
- Allow owner, editor, and viewer to connect.
- Mark viewer as read-only on the client.
- Reject unknown users.

## Persistence

MVP recommendation:

- Store the latest Yjs binary state for each document.
- Persist periodically and on document unload hooks where supported.
- Load the latest binary state when the first user connects.

Later:

- Store incremental updates.
- Compact updates into snapshots.
- Add version restore.

## Reconnect Handling

Expected behavior:

- Client automatically reconnects when the socket drops.
- Hocuspocus and Yjs sync missing state after reconnect.
- Awareness state is restored after the client reconnects.
- User session must still be valid.
- If permissions changed while disconnected, reconnect should respect the new role.

## Edge Cases

- Simultaneous edits on the same text.
- User disconnects mid-edit.
- Duplicate updates.
- Stale permission while socket is still open.
- Reconnect after long inactivity.
- Network latency spikes.

