# AI Collaboration Intelligence

## Purpose

Add a small AI layer to CollabPad that helps users understand collaborative
documents and related discussions faster.

The AI features should support the existing product direction instead of
turning the app into a generic chatbot. The focus is on document understanding,
comment discussion summaries, and exportable reports.

## Selected Features

## AI Document Intelligence Report

Users can generate a structured report for a document.

The report includes:

- Summary
- Key points
- Action items
- Risks or open questions

This helps collaborators quickly understand the current state of a shared
document.

## AI Comments Summarizer

Users can summarize the discussion around a document.

The comments summary includes:

- Active discussions
- Resolved decisions
- Blockers
- Follow-up items

This is separate from the document report because document content and team
discussion answer different questions.

## PDF Export

Users can download the generated document report as a PDF.

The PDF export is intended for sharing meeting notes, review summaries, or
project updates outside the app.

## Deferred Feature

AI snapshot comparison is a strong future enhancement, but it is intentionally
deferred.

It would compare two saved document snapshots and summarize semantic changes.
This is more complex because it requires processing two document versions and
can use more AI tokens.

## High-Level Approach

AI runs through the backend, not directly from the browser.

```txt
Client sidebar
  -> authenticated API request
  -> document permission check
  -> extract document or comment content
  -> AI provider service
  -> structured result
  -> sidebar UI or PDF download
```

The backend keeps provider API keys private and reuses the existing document
permission model before sending any content to an AI provider.

## Provider Strategy

The AI integration should support free or local development usage.

Initial provider:

- Gemini API

Future-friendly options:

- Groq
- OpenRouter
- Ollama or LM Studio for local models

The provider is kept behind a backend abstraction so the app can switch models
without changing the frontend.

## Token Control

Because this is a personal project using free-tier AI access, AI calls should be
explicit and limited.

Guidelines:

- Do not call AI on page load.
- Generate only after a user clicks an action.
- Limit the amount of document or comment text sent to the model.
- Prefer concise structured output.
- Reuse generated output for PDF export.

## Access Rules

AI features follow existing document read access.

```txt
owner  -> can generate AI reports and comment summaries
editor -> can generate AI reports and comment summaries
viewer -> can generate AI reports and comment summaries
unknown user -> no access
```

Client-side checks are only for user experience. The backend enforces access.

## Implementation Phases

1. Add AI provider configuration and backend provider service.
2. Add structured document report generation.
3. Add comments summarization.
4. Add PDF export for generated reports.
5. Add sidebar UI for AI actions and results.
6. Keep snapshot comparison as a later enhancement.

## Resume Positioning

Possible resume bullets:

- Built an AI collaboration intelligence layer for a realtime document editor,
  generating structured document reports and comment-thread summaries with
  role-aware backend access.
- Integrated an LLM provider through a backend abstraction, keeping API keys
  server-side and enforcing document permissions before model calls.
- Added downloadable AI-generated PDF reports for collaborative documents.

## Interview Talking Points

- AI was added as a backend capability, not a frontend-only API call.
- The same role-based access model protects AI features.
- Document reports and comment summaries are separate because they solve
  different collaboration problems.
- Token usage is controlled with explicit generation and input limits.
- Snapshot comparison was deferred because it is more complex and token-heavy.
