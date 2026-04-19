# Product Requirements

## Project

CollabPad is a web-based real-time collaborative document editor. It allows multiple authenticated users to edit the same document at the same time, see who else is present, and share access based on roles.

## Goals

- Enable real-time multi-user editing.
- Ensure conflict-free synchronization through CRDTs.
- Keep perceived update latency under 200 ms for the initial target use case.
- Support authenticated and authorized document access.
- Handle reconnects without losing document state.
- Persist document content without requiring an explicit save button.

## Non-Goals

- Full Google Docs feature parity.
- Offline-first sync across multiple devices.
- File attachments and images in the first release.
- Spreadsheet or slide support.
- Advanced document layout, tables, or page formatting.

## Target Users

- Students working on assignments.
- Developers writing shared notes or lightweight docs.
- Small teams collaborating on text content.
- Interview or demo users evaluating real-time collaboration.

## Core Features

- Signup and login.
- Create, rename, delete, and list documents.
- Real-time collaborative editing.
- Live presence and cursor awareness.
- Owner, editor, and viewer roles.
- Document sharing by email or link.
- Autosave through Yjs state persistence.
- Reconnect handling.
- Version snapshots in a later phase.
- Activity logs in a later phase.
- Comments in a later phase.

## Success Metrics

- Document sync latency.
- Collaboration error rate.
- Successful reconnect rate.
- Average session duration.
- Concurrent active users per document.
- Unauthorized access rejection rate.

## Initial Capacity Target

- 5 to 10 concurrent users per document.
- Single WebSocket collaboration server instance for MVP.
- PostgreSQL-backed metadata and Yjs state persistence.
- Redis added later for horizontal scaling.

