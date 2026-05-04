# Google Sheets Column Spec

Create one Google Sheet tab named `followup_runs` with the columns below in this exact order.

| Column | Type | Required | Written by | Purpose |
| --- | --- | --- | --- | --- |
| `run_id` | string | yes | n8n | Unique workflow run identifier. |
| `submitted_at` | ISO datetime | yes | n8n | Intake timestamp. |
| `department` | string | yes | form | Team or business unit. |
| `meeting_title` | string | yes | form | Meeting or training title. |
| `meeting_type` | string | yes | form | Example: training, planning, workshop. |
| `language_hint` | string | no | form/audio workflow | Used to keep Czech and English outputs in the intended language, including Telegram summaries. Example: `English`, `Čeština`. |
| `source_mode` | string | yes | n8n | Example: `manual_transcript` or `gemini_audio_post_mvp`. |
| `status` | string | yes | n8n/reviewer | Workflow state such as `draft`, `approved`, or `rejected`. |
| `reviewer_name` | string | yes | form | Person responsible for review. |
| `reviewer_notes` | string | no | reviewer | Approval note or rejection reason. |
| `prompt_version_followup` | string | yes | n8n | Prompt version, e.g. `followup_v1.0.0`. |
| `raw_transcript` | long text | yes | form | Fake/demo transcript. |
| `summary` | long text | yes for draft | LLM | Human-readable summary lines. |
| `action_items_json` | JSON string | yes for draft | LLM | Array of action item objects. |
| `key_decisions_json` | JSON string | yes for draft | LLM | Array of key decision strings. |
| `risks_open_questions_json` | JSON string | yes for draft | LLM | Array of risks and open questions. |
| `employee_faq_json` | JSON string | yes for draft | LLM | FAQ array. |
| `ai_opportunities_json` | JSON string | yes for draft | LLM | AI adoption opportunity array. |
| `ambassador_brief_json` | JSON string | yes for draft | LLM | Ambassador brief object. |
| `final_markdown_draft` | long text | yes for draft | n8n | Delivery draft text. |
| `final_markdown_edited` | long text | no | reviewer | Reviewer-edited delivery text. |
| `final_markdown_approved` | long text | no | approval workflow | Final approved delivery text. |
| `notify_channel` | string | no | form/reviewer | Example: `none`, `telegram`. |
| `error_message` | string | no | n8n | Short error text for failed runs. |

## Header Row

```csv
run_id,submitted_at,department,meeting_title,meeting_type,language_hint,source_mode,status,reviewer_name,reviewer_notes,prompt_version_followup,raw_transcript,summary,action_items_json,key_decisions_json,risks_open_questions_json,employee_faq_json,ai_opportunities_json,ambassador_brief_json,final_markdown_draft,final_markdown_edited,final_markdown_approved,notify_channel,error_message
```

## Status Values

| Status | Meaning |
| --- | --- |
| `received` | Intake accepted before model call. |
| `rejected_input` | Demo data was not confirmed or transcript was empty. |
| `minimax_failed` | LLM HTTP request failed. |
| `json_repair_failed` | Initial parse and one repair attempt failed. |
| `draft` | Draft row is ready for human review. |
| `rejected` | Reviewer rejected the draft. |
| `approved` | Reviewer approved generated delivery draft. |
| `approved_edited` | Reviewer approved edited delivery text. |
