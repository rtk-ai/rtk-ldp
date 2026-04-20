---
name: update-rss
description: Add a new entry to the RSS feed
---

Add a new entry to `src/data/rss-entries.ts`.

## Steps

1. Ask what type of update this is:
   - `release` — new RTK version
   - `new_page` — new product or landing page
   - `new_doc` — new documentation page
   - `new_feature` — significant new feature
   - `performance` — perf improvement worth announcing

2. Ask for: title, date (format: "Apr 10, 2026"), description (1-3 sentences, no HTML), link (absolute URL).

3. Add the entry at the **top** of the `rssEntries` array in `src/data/rss-entries.ts`.

4. Confirm the entry was added correctly (show the first 5 entries).

## Rules

- Entries must be sorted newest first
- Date format: "Mon D, YYYY" (e.g., "Apr 10, 2026")
- Description: plain text only, no HTML tags
- Link: always absolute URL starting with `https://`
- Never edit `src/pages/rss.xml.ts` — only `src/data/rss-entries.ts`
