# n8n Workflow Exports

This folder contains safe-import exports of the current live webhook-based MVP.

These `n8n/workflows/` files are shareable copies of the working implementation:

- secrets removed
- Google Sheet ID replaced with `GOOGLE_SHEET_ID_PLACEHOLDER`
- Telegram chat ID replaced with `TELEGRAM_CHAT_ID_PLACEHOLDER`
- LLM bearer tokens replaced with `Bearer <LLM_API_KEY>`
- credential bindings removed so they can be rebound after import

The safe-import export currently uses a MiniMax-compatible chat completions endpoint. Rebind the HTTP auth and model settings after import if you use another provider.

## Included workflow exports

1. `11-create-draft-api.safe-import.json`
2. `12-review-queue-api.safe-import.json`
3. `13-review-detail-api.safe-import.json`
4. `14-review-action-api.safe-import.json`
5. Optional add-on: `10-audio-intake-api.safe-import.json`

## What these workflows do

### 11. Create Draft API

- validates transcript intake
- sends the request to an LLM chat-completion endpoint
- parses structured JSON
- attempts one JSON repair pass if needed
- builds delivery draft text from structured fields
- appends a review row to Google Sheets

### 10. Audio Intake API optional add-on

- accepts fake/demo audio from the local UI
- validates required meeting metadata and demo-data confirmation
- sends small inline audio to Gemini `gemini-2.5-flash-lite` for transcription
- validates that a usable transcript was returned
- calls the existing `11-create-draft-api` webhook with `source_mode = gemini_audio_post_mvp`
- does not change the core review, approval, delivery, or audit workflows
- tested with a short fake/demo M4A recording; MP3/WAV remain recommended for broader compatibility

### 12. Review Queue API

- returns review rows for the local UI
- supports status filtering

### 13. Review Detail API

- returns one row detail by `run_id` query parameter
- exposes cards plus draft/edited/approved delivery fields

### 14. Review Action API

- handles `approve`, `approve_with_sheet_edits`, and `reject`
- builds a Telegram summary from approved delivery text
- sanitizes the Telegram message and sends it with HTML parse mode
- for notification-enabled approvals:
  - sends Telegram first
  - only then writes approved status back to Google Sheets
- if Telegram fails, the row remains retryable instead of being prematurely marked approved
- for no-notify approvals:
  - writes approved status directly to Google Sheets
- for `reject`:
  - writes `rejected` directly and never attempts Telegram

## Import order

Import in this order:

Optional audio add-on:

0. `10-audio-intake-api.safe-import.json`

Core MVP:

1. `11-create-draft-api.safe-import.json`
2. `12-review-queue-api.safe-import.json`
3. `13-review-detail-api.safe-import.json`
4. `14-review-action-api.safe-import.json`

## After import

Rebind these manually in n8n:

- Google Sheets credential
- Telegram credential if used
- LLM API auth in the relevant HTTP Request nodes
- Gemini API key or credential if using the optional audio add-on
- create-draft webhook URL in workflow 10 if using the optional audio add-on

Replace placeholders:

- `GOOGLE_SHEET_ID_PLACEHOLDER`
- `TELEGRAM_CHAT_ID_PLACEHOLDER`
- `Bearer <LLM_API_KEY>`
- `<GEMINI_API_KEY>`
- `CREATE_DRAFT_WEBHOOK_URL_PLACEHOLDER`

## Public-repo note

Do not commit token-bearing live exports.  
Treat `n8n/workflows/` as the public GitHub version.
