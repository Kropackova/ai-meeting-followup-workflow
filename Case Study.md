# AI Meeting Follow-up Workflow Case Study

## One-sentence summary

Built an n8n workflow that turns fake/demo meeting transcripts into structured follow-up drafts, routes them through human review, and sends a short Telegram summary only after approval.

## Business problem

Internal follow-up after training sessions or meetings is often inconsistent. Notes are messy, repeated questions do not become reusable FAQ content, and action items stay in chat instead of becoming something operationally reviewable.

The business need was to create a workflow where AI helps draft the follow-up package, but a human still approves what gets shared.

## Manual process before

Before automation, the follow-up process typically meant:

- read transcript text or rough notes manually
- pull out actions, decisions, and open questions by hand
- draft a summary or short internal message manually
- rewrite it into something presentable
- send it onward without a clean review trail

That works for one-off meetings, but it scales poorly and creates inconsistent output quality.

## What was built

This project is a working low-code MVP built in n8n around four core webhook workflows:

1. Create Draft API
2. Review Queue API
3. Review Detail API
4. Review Action API

The flow is:

`manual transcript -> LLM structured output -> JSON parse/repair -> Google Sheets review row -> reviewer UI -> approve / approve with edits / reject -> Telegram summary from approved delivery -> persist approved state`

## Tool stack

- n8n
- LLM API
- Google Sheets
- Telegram
- local HTML/CSS/JS reviewer UI

## How the workflow works

### Step 1: Draft creation

The user submits:

- meeting metadata
- audience
- reviewer name
- notify channel
- manual transcript
- fake/demo data confirmation

The LLM is asked for structured output, not just a freeform summary.

If the response is malformed:

- the parser strips wrapper noise
- one JSON repair pass is attempted
- failed repair writes a `json_repair_failed` row instead of silently breaking the flow

### Step 2: Review surface

The workflow stores:

- summary
- action items
- key decisions
- risks and open questions
- FAQ
- AI adoption opportunities
- ambassador brief
- generated delivery draft

Google Sheets acts as the review and audit layer.  
The local reviewer UI sits on top of it and exposes queue/detail/approval actions without forcing the reviewer to work directly in raw Sheet rows.

### Step 3: Approval

The reviewer can:

- approve the generated draft
- approve with edits
- reject

The approved output is stored in the compatibility fields:

- `final_markdown_draft`
- `final_markdown_edited`
- `final_markdown_approved`

Semantically these now mean:

- delivery draft
- edited delivery
- approved delivery

### Step 4: Delivery

After approval, the workflow creates a shorter Telegram summary from the approved delivery text.  
It does not summarize the raw transcript again.

For notification-enabled approvals, Telegram is sent first and the approved state is written back to Google Sheets only after successful delivery. If Telegram fails, the row stays retryable instead of being prematurely marked approved.

That keeps the reviewer's approved version as the source of truth.

## What makes the project credible

The project includes more than a prompt and a form:

- input validation
- explicit failure states
- JSON repair fallback
- reviewer approval logic
- editable final delivery
- storage/audit row
- notification-driven approvals persist the approved state only after successful delivery
- English and Czech UI variants
- optional audio intake using Gemini transcription as a pre-step to the same review workflow

## What was actually tested

Tested locally on fake/demo transcripts and one short fake/demo audio recording:

- create draft
- audio intake to draft
- review queue
- review detail
- approve
- approve with edits
- reject
- Telegram summary
- English UI
- Czech UI

## Estimated impact

This is a local MVP, so the impact numbers below are estimates from demo timing assumptions.

- manual follow-up drafting can take roughly 25-39 minutes
- workflow-assisted review can reduce that to roughly 5-10 minutes in clean demo conditions

These figures are not production usage metrics.

## Risks and limits

- fake/demo data only
- no production governance
- no production-scale access control
- not tested with real users
- model quality still depends on prompt quality and reviewer discipline
- Google Sheets is acceptable for MVP review, but may not be the right long-term system of record

## Evidence package

The repo includes:

- safe-import workflow exports
- prompts and repair prompt
- schemas and sample outputs
- test cases
- metrics notes
- English and Czech reviewer UIs
- sample transcripts

## What I would say in an interview

"I built this as an approval-gated AI workflow, not just a transcript summarizer. The point was to make AI useful in follow-up preparation without removing human review. The LLM produces structured output, the reviewer checks or edits the delivery text, and Telegram only gets a short summary after approval."

## Next iteration

- add a short demo clip
- measure manual vs assisted timing across several runs
- decide whether the long-term system of record should stay in Sheets or move elsewhere
