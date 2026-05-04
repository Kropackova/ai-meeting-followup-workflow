# Metrics and Impact Notes

The workflow is a working MVP tested locally on fake/demo transcripts. The figures below are estimates based on manual timing assumptions, not measured production data.

## Measurement status

The current repo does not include production usage metrics. The estimates are useful for explaining the expected direction of impact, but they should be validated with timed runs before being treated as KPI evidence.

## Estimated manual baseline

Assumed manual process for one meeting or training follow-up package:

| Step | Estimated time |
| --- | --- |
| Read transcript or rough notes and clean them up | 8-12 min |
| Extract actions, decisions, and open questions | 6-10 min |
| Draft summary, FAQ, and internal follow-up text | 8-12 min |
| Rewrite and format the shareable version | 3-5 min |
| Total estimated manual effort | 25-39 min |

## Estimated workflow-assisted path

Assumed current MVP process:

| Step | Estimated time |
| --- | --- |
| Paste transcript and submit | 1-2 min |
| Review cards and generated delivery draft | 2-4 min |
| Light edits if needed | 1-4 min |
| Approve and send Telegram summary | 1-2 min |
| Total estimated assisted effort | 5-12 min |

## Estimated effect

- estimated reduction from a 25-39 minute manual drafting task to a 5-12 minute review-and-approval task
- estimated savings of roughly 13-27 minutes per follow-up in clean demo conditions

This should be treated as a demo estimate, not as a production KPI.

## What makes this estimate more credible

The workflow removes or compresses these manual steps:

- repeated copy/paste from transcript into notes
- ad hoc rewriting into a follow-up format
- separate manual drafting of summary, actions, FAQ, and short internal message
- manual delivery formatting after approval

It does **not** remove human review.  
That is intentional.

## How to turn this into measured evidence

1. Run 5-10 fake transcript cases manually and record the time.
2. Run the same cases through the workflow.
3. Record:
   - submission time
   - review/edit time
   - approval time
   - notification time
4. Compare manual vs workflow-assisted totals.

Until then, the measured evidence is limited to local test runs and manual timing assumptions.
