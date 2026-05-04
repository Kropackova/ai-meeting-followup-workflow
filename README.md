# AI Meeting Follow-up Workflow

Low-code n8n workflow for turning fake/demo meeting or training transcripts into structured follow-up drafts, routing them through human review, and sending a short Telegram summary only after explicit approval.

## What this project demonstrates

- Practical n8n workflow design around a real business problem
- Structured LLM output parsing, repair fallback, and review-safe failure states
- Human-in-the-loop approval before downstream delivery
- English and Czech local reviewer UIs backed by the same webhook workflows
- Clear separation between structured review data, editable delivery draft, and delivery notification

## Quick links

- [Case Study.md](Case%20Study.md)
- [metrics.md](metrics.md)
- [test-cases.md](test-cases.md)
- [portfolio-summary.md](portfolio-summary.md)
- [schemas/google-sheets-columns.md](schemas/google-sheets-columns.md)
- [n8n/workflows](n8n/workflows)
- [screenshots](screenshots)

## Business problem

Post-meeting follow-up is often inconsistent. Notes stay buried in chat, action owners are unclear, repeated questions do not become reusable FAQ content, and AI-generated text is risky to share without a visible approval step.

This MVP focuses on one practical use case: convert a transcript or recap into a reviewable follow-up package, let a human approve or edit it, and only then send a concise internal summary onward.

## Current MVP

Current implemented flow:

`Manual transcript input -> LLM structured output -> JSON parse/repair -> Google Sheets review row -> local reviewer UI -> approve / approve with edits / reject -> Telegram summary from approved delivery -> persist approved state`

Optional add-on flow:

`Fake/demo audio -> Gemini transcription -> transcript -> existing workflow 11 -> review -> approval -> delivery`

What the reviewer sees:

- structured cards for summary, actions, decisions, and risks
- a generated delivery draft
- an editable delivery field for `approve_with_sheet_edits`
- visible approval/rejection feedback in the UI

What gets delivered:

- an approved delivery text stored in the Sheet
- a shorter Telegram summary derived from the approved delivery
- when notification is enabled, the approved status is written only after successful Telegram delivery
- if Telegram delivery fails, the row stays retryable instead of being prematurely marked approved

## Architecture overview

### Workflow 11: Create Draft API

- Trigger: webhook from the local UI
- Input schema: meeting metadata, transcript, reviewer, notify channel, demo-data confirmation
- Transformation logic:
  - validate input
  - build LLM prompt
  - parse structured JSON
  - attempt one JSON repair pass on malformed output
  - build delivery draft from structured fields
  - append the draft row to Google Sheets
- Error handling:
  - `rejected_input`
  - `minimax_failed`
  - `json_repair_failed`
- Audit trail: `run_id`, timestamps, reviewer fields, prompt version, error message, stored structured output, delivery draft fields

### Workflow 10: Audio Intake API optional add-on

- Trigger: POST webhook from the local UI audio tab
- Input schema: meeting metadata, fake/demo audio file, reviewer, notify channel, demo-data confirmation
- Transformation logic:
  - validate audio input
  - transcribe a small inline audio file with Gemini into transcript JSON
  - validate that the transcript is usable
  - pass the transcript into the existing `11-create-draft-api`
- Error handling:
  - `audio_rejected_input`
  - `gemini_transcription_failed`
  - `gemini_transcript_parse_failed`
  - `gemini_transcript_empty`
  - `audio_create_draft_failed`
- Scope: optional intake step; it does not change the core review, approval, delivery, or audit logic

### Workflow 12: Review Queue API

- Trigger: GET webhook
- Input schema: optional `status` query filter
- Transformation logic: read rows from Google Sheets and return compact queue cards
- Error handling: empty result set returns safely
- Audit trail: queue is read directly from the Sheet

### Workflow 13: Review Detail API

- Trigger: GET webhook
- Input schema: `run_id` as query parameter
- Transformation logic: load one row, parse stored JSON fields, return cards + delivery draft/edit state
- Error handling: missing `run_id` or missing row returns a safe error object

### Workflow 14: Review Action API

- Trigger: POST webhook
- Input schema: `run_id`, `decision`, `reviewer_notes`, optional edited delivery text
- Approval logic:
  - `approve` uses generated delivery draft
  - `approve_with_sheet_edits` uses reviewer-edited delivery
  - `reject` stores rejection and blocks delivery
- Error handling:
  - guard against missing row
  - guard against duplicate `run_id`
  - guard against non-draft approval
  - guard against empty edited-delivery approval
- Delivery:
  - `reject` updates the Sheet immediately and never sends Telegram
  - if notification is enabled, Telegram is sent first and the approved status is stored only after successful delivery
  - if notification is disabled, the approved status is stored immediately
  - Telegram summary is generated from approved delivery text, not from raw transcript
  - Telegram text is sanitized before send to avoid entity-parsing failures

## Data model

The workflow still uses these legacy Google Sheets field names for compatibility:

- `final_markdown_draft`
- `final_markdown_edited`
- `final_markdown_approved`

In the current implementation they mean:

- delivery draft
- edited delivery
- approved delivery

The main structured fields remain:

- `summary`
- `action_items_json`
- `key_decisions_json`
- `risks_open_questions_json`
- `employee_faq_json`
- `ai_opportunities_json`
- `ambassador_brief_json`

## Local reviewer UI

Two local UIs are included:

- English UI: `http://localhost:8788`
- Czech UI: `http://localhost:8790`

Both use the same n8n backend.

Current UI behavior:

- submit-time toast while transcript summarization is running
- audio intake tab for fake/demo recordings in both local UI variants
- audio intake tested with a short fake/demo M4A recording; MP3/WAV remain recommended for broader compatibility
- review queue filtered by status
- detail cards from structured output
- `Use draft as starting point` copies the generated delivery draft into the editable field
- toast feedback for approve / approve with edits / reject

Start the English UI:

```powershell
powershell -ExecutionPolicy Bypass -File ".\local-ui\start-local-ui.ps1" -OpenBrowser
```

Start the Czech UI:

```powershell
powershell -ExecutionPolicy Bypass -File ".\local-ui-cs\start-local-ui.ps1" -OpenBrowser
```

## Scope

This is a local MVP tested with fake/demo data.

Implemented:

- transcript-to-draft workflow
- human review and approval
- editable approved delivery text
- Telegram notification after approval
- optional audio intake for fake/demo recordings

Not included:

- real meeting recordings without consent and governance
- production-scale governance
- role-based access control
- production delivery channels beyond the local Telegram demo path
- production metrics collection

## Repo contents

- [n8n/workflows](n8n/workflows) - safe-import exports of the current live webhook workflows
- [prompts](prompts) - prompt and JSON-repair prompt reflecting the current schema
- [schemas](schemas) - current output schema, sample structured output, and Google Sheets columns
- [samples](samples) - fake/demo transcripts and approved delivery examples
- [local-ui](local-ui) - English reviewer UI
- [local-ui-cs](local-ui-cs) - Czech reviewer UI
- [templates](templates) - notification/checklist/form field helpers

## Setup notes

- Keep all secrets outside the repo
- Keep Google service-account files outside the repo
- Use fake/demo transcripts only
- Rebind credentials after importing workflow exports

See:

- [n8n/README.md](n8n/README.md)
- [schemas/google-sheets-columns.md](schemas/google-sheets-columns.md)
