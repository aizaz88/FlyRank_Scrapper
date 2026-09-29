# The Polite Scraper — FlyRank A9

A small, polite scraping pipeline for [Books to Scrape](https://books.toscrape.com): it fetches the first 3 catalogue pages, visits all 60 book pages, and turns the HTML into clean, schema-validated JSON.

## Target classification

- **Site:** Books to Scrape — a public sandbox built for practicing web scraping. Its own homepage states this purpose.
- **Scope:** the first 3 catalogue pages only, and the 60 book pages linked from them.
- **Data collected:** title, price, availability, star rating, description, and product URL — all public data present in the page HTML.
- **robots.txt result:** [paste your actual curl result here from Stage 0]
- I will not reuse this code on another site without checking its rules and terms first.

## Why no browser was needed

The price, title, rating and description are already present in the HTML the server sends — confirmed with `curl` and `view-source`. A headless browser would only add cost (memory, startup time) with no extra data.

## Pipeline

fetch → discover catalogue links → extract raw fields → normalize → validate → store → report

## Run it

```bash
cd scraper
npm install
node src/index.js
```

Outputs:

- `output/books.json` — 60 validated records
- `output/errors.json` — any records that failed validation, with a reason
- `output/run-report.json` — counts and duration for the run

To test failure handling (adds one fake book URL on purpose):

```bash
INJECT_FAKE_URL=1 node src/index.js
```

## Politeness rules

- Identifying `User-Agent`: `FlyRankInternshipA9/1.0 (+https://github.com/aizaz88/Assignments_flyRank)`
- 8-second timeout on every request
- At least 500ms delay before every real (non-cached) request
- Status code checked before any parsing
- Every response is cached in `cache/` (gitignored) — reruns during development read from disk, not the site
- 5xx or network errors are retried once; 404/403 are never retried

## Record schema

| Field             | Type                  | Notes                                          |
| ----------------- | --------------------- | ---------------------------------------------- |
| title             | string                |                                                |
| product_url       | string (URL)          | canonical identity of the record               |
| price_gbp         | number                | parsed from `price_text`                       |
| price_text        | string                | original, e.g. `"£51.77"`                      |
| availability_text | string                | e.g. `"In stock (22 available)"`               |
| rating            | number 1–5, nullable  | parsed from `rating_text`                      |
| rating_text       | string, nullable      | e.g. `"Three"`                                 |
| description       | string, nullable      | `null` when the page has none — never invented |
| source_page       | string (URL)          | provenance: which catalogue page linked here   |
| fetched_at        | string (ISO datetime) | provenance: when it was fetched                |

## Sample run-report.json

```json
[PASTE YOUR REAL output/run-report.json CONTENTS HERE]
```

## Idempotency

Running the scraper twice produces the same 60 records, not 120 — duplicates by `product_url` are skipped, and reruns read from cache instead of re-hitting the site.

## Ethics note

Use an official API when one exists. Never bypass logins, paywalls, or blocks. Collect only the data needed for the task, and only from sites that explicitly permit it, like this practice sandbox.

## Known limitation

[Write one honest sentence, e.g.: "Retry logic is a single fixed-delay retry, not full exponential backoff — Assignment A16 builds that properly."]
