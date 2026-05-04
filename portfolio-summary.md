# Portfolio Summary

## CV bullet

Built an n8n workflow that converts fake/demo meeting transcripts into structured follow-up drafts, routes them through human review in Google Sheets and a local reviewer UI, and sends approved Telegram summaries generated from the final approved delivery text.

## Short LinkedIn / portfolio summary

I built a low-code AI follow-up workflow in n8n for internal meeting and training recap scenarios. The workflow takes a transcript, uses an LLM API to generate structured follow-up content, stores the draft in Google Sheets, exposes it through an English/Czech reviewer UI, and only sends a Telegram summary after explicit approval. The project is a documented MVP tested on fake/demo transcripts, with JSON repair fallback, audit-friendly row storage, and clear approval controls.

## Interview answer

This project demonstrates that I can design practical business automation, not just call an LLM API. The key part is the control layer: structured extraction, repair fallback, editable delivery text, approval states, and downstream notification only after a human approves the output.
