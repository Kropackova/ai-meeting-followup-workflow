# Intake Form Fields

Use these fields in the create-draft request handled by workflow `11`.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `meeting_title` | text | yes | Fake/demo meeting title. |
| `department` | text | yes | Demo department or workflow area. |
| `meeting_type` | dropdown/text | yes | Example: training, workshop, planning. |
| `language_hint` | text | no | Example: English, Czech, Czech/English. |
| `audience` | text | no | Intended internal audience. |
| `manual_transcript` | textarea | yes | Fake transcript only. |
| `notify_channel` | dropdown | no | `none`, `telegram`, `email`. |
| `reviewer_name` | text | yes | Reviewer responsible for Sheet approval. |
| `demo_data_confirmed` | checkbox | yes | Reminder acknowledgement; must be checked before the LLM HTTP node is called, but reviewer still verifies demo-only data. |
