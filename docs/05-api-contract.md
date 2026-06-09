# API Contract

Base API path:

```txt
/api
```

## Auth

```txt
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

## Documents

```txt
POST   /api/documents
GET    /api/documents
GET    /api/documents/:id
PATCH  /api/documents/:id
DELETE /api/documents/:id
```

## Sharing

```txt
POST   /api/documents/:id/share
PATCH  /api/documents/:id/collaborators/:userId
DELETE /api/documents/:id/collaborators/:userId
```

## Snapshots, Later Phase

```txt
POST /api/documents/:id/snapshots
GET  /api/documents/:id/snapshots
POST /api/documents/:id/snapshots/:snapshotId/restore
```

## Activity Logs, Later Phase

```txt
GET /api/documents/:id/activity
```

## Comments, Later Phase

```txt
POST  /api/documents/:id/comments
GET   /api/documents/:id/comments
PATCH /api/documents/:id/comments/:commentId
```

## AI Collaboration Intelligence

```txt
POST /api/documents/:id/ai/report
POST /api/documents/:id/ai/comments-summary
POST /api/documents/:id/ai/report/pdf
```

AI report and comment summary endpoints require authenticated document read
access and return structured AI output through the standard API envelope.

The PDF endpoint requires document read access and returns an `application/pdf`
download.

## Access Rules

- Owner can read, edit, share, change roles, remove collaborators, delete document.
- Editor can read and edit.
- Viewer can read only.
- Unknown or unauthenticated user cannot access document metadata or WebSocket sync.
- Owner, editor, and viewer can generate AI reports and comment summaries because
  these features require read access.

## Response Shape

Use a consistent envelope:

```json
{
  "data": {},
  "error": null
}
```

For errors:

```json
{
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have access to this document."
  }
}
```

