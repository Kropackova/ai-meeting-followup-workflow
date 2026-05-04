# Test Cases

Use fake/demo data only.

## Core success path

### 1. Create draft

- submit transcript through the local UI
- confirm workflow accepts the request
- confirm a Google Sheets row appears with `status = draft`
- confirm structured fields are populated
- confirm delivery draft is populated

### 2. Review queue

- open the review queue
- confirm the new item appears under `draft`
- confirm queue filtering works

### 3. Review detail

- open one draft row
- confirm cards render:
  - summary
  - top actions
  - key decisions
  - risks and open questions
- confirm delivery draft is visible
- confirm editable delivery field is visible

### 4. Approve

- approve without edits
- confirm row status becomes `approved`
- confirm `final_markdown_approved` equals the generated delivery draft
- confirm Telegram summary is sent only after approval
- confirm notification-enabled approvals persist approved status only after successful Telegram send

### 5. Approve with edits

- use `Use draft as starting point`
- edit the delivery text
- approve with edits
- confirm row status becomes `approved_edited`
- confirm `final_markdown_approved` equals the edited delivery
- confirm Telegram summary reflects the approved edited delivery

### 6. Reject

- reject a draft
- confirm row status becomes `rejected`
- confirm no Telegram summary is sent

## Guardrail and failure scenarios

### 7. Empty transcript

- submit with an empty or whitespace-only transcript
- confirm the run is rejected with `status = rejected_input`
- confirm the LLM HTTP node is not called

### 8. Demo checkbox not confirmed

- submit fake transcript without confirming demo-only data
- confirm `status = rejected_input`
- confirm the LLM HTTP node is not called

### 9. LLM HTTP failure

- temporarily use an invalid LLM API key or mock a failed HTTP response
- confirm row status becomes `minimax_failed`
- confirm `error_message` is populated

### 10. JSON repair failure

- force malformed model output or mock a broken response
- confirm repair is attempted once
- confirm a failed repair writes `status = json_repair_failed`

### 11. Approval guard

- try approving a missing `run_id`
- try approving a duplicate `run_id`
- try approving a row not in `draft`
- confirm the workflow stops safely without sending a notification

### 12. Approve-with-edits guard

- trigger `approve_with_sheet_edits` without edited delivery text
- confirm the workflow blocks the action safely

### 13. Notification failure keeps the row retryable

- temporarily break Telegram delivery
- trigger `approve` or `approve_with_sheet_edits`
- confirm the workflow stops safely
- confirm the row does not change to `approved` / `approved_edited`
- confirm the row remains retryable from `draft`

## UI coverage

### 14. English UI

- start `local-ui` on port `8788`
- confirm submit/review flows work
- confirm submit-time and approval toasts display correctly

### 15. Czech UI

- start `local-ui-cs` on port `8790`
- confirm submit/review flows work
- confirm Czech labels and pluralization display correctly
- confirm Czech submit-time and approval toasts display correctly

### 15a. Audio tab in both local UIs

- confirm `local-ui` exposes the `Audio Intake` tab
- confirm `local-ui-cs` exposes the `Audio vstup` tab
- confirm both tabs call `/webhook/meeting-followup/audio-intake`
- confirm both tabs stay on the audio view when workflow 10 returns a non-draft failure status

## Optional audio intake add-on

### 16. Fake/demo audio creates a draft

- run workflow `10-audio-intake-api.safe-import.json`
- configure Gemini API key or credential
- set `CREATE_DRAFT_WEBHOOK_URL_PLACEHOLDER` to the production webhook URL for workflow 11
- open the audio intake tab in either local UI
- fill in meeting metadata
- upload a short fake/demo M4A, MP3, or WAV file
- confirm the demo-only checkbox
- submit the request
- confirm workflow 10 returns the response from workflow 11
- confirm a new row appears in the review queue with `status = draft`
- confirm the review detail contains a follow-up generated from the transcribed audio input

### 17. Audio without demo confirmation

- uncheck the demo-only checkbox in the audio intake tab
- submit the request
- confirm `status = audio_rejected_input`
- confirm Gemini and workflow 11 are not called

### 18. Missing or unsupported audio file

- submit audio intake without a file or with an unsupported file type
- confirm a safe error response
- confirm the workflow does not call Gemini or workflow 11

### 19. Gemini transcription failure

- temporarily use an invalid Gemini key or mock a failed response
- confirm `status = gemini_transcription_failed`
- confirm the UI shows the error and the user can continue with manual transcript paste

### 20. Unusable transcript

- mock an empty or too-short Gemini transcript
- confirm `status = gemini_transcript_empty`
- confirm workflow 11 is not called
