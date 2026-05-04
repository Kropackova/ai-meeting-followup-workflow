# Approval Form Fields

Use these fields in the review-action request handled by workflow `14`.

| Field | Type | Required | Allowed values |
| --- | --- | --- | --- |
| `run_id` | text | yes | Existing draft row ID |
| `decision` | dropdown | yes | `approve`, `approve_with_sheet_edits`, `reject` |
| `reviewer_notes` | textarea | no | Any reviewer comment or rejection reason |

Validation rules:

- `run_id` must exist exactly once in the Sheet.
- Row `status` must be `draft`.
- `approve_with_sheet_edits` requires non-empty `final_markdown_edited` (legacy storage field used for the edited delivery text).
- Notifications are blocked for `reject` and all error states.
