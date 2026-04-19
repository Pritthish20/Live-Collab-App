# Security and Permissions

## Authentication

- Users must sign up and log in before creating or accessing documents.
- Passwords must be hashed with Argon2id.
- Use secure cookies or JWTs.
- Never store plaintext passwords.

## Authorization

Permissions must be enforced in two places:

- REST API layer.
- Hocuspocus WebSocket connection layer.

Client-side UI checks are useful for experience but are not security controls.

## Roles

```txt
owner  -> full control
editor -> read and edit
viewer -> read only
```

## REST API Permission Rules

- Create document: authenticated users.
- List documents: only documents where user is owner or collaborator.
- Read document: owner, editor, viewer.
- Rename document: owner, editor if allowed by product decision.
- Delete document: owner only.
- Share document: owner only.
- Change role: owner only.
- Remove collaborator: owner only.

## WebSocket Permission Rules

- Reject unauthenticated users.
- Reject users without document access.
- Allow viewer connections only if the client editor is read-only.
- Re-check permission on reconnect.

## Security Hardening

- Validate every request body with Zod.
- Use rate limiting for auth endpoints.
- Use Helmet for common HTTP headers.
- Configure CORS to allow only the client origin.
- Keep secrets in environment variables.
- Avoid logging tokens, passwords, or raw session cookies.
- Add audit logs for permission changes in Phase 3.

## Stale Permissions

If a user is downgraded or removed while connected, the MVP can enforce the new role on reconnect. A later phase can actively disconnect or downgrade live WebSocket sessions.

