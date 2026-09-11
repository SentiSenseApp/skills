---
name: stock-ontology
description: "Company knowledge graph for AI agents: resolve the people and products behind a ticker, find any tracked executive, product, organization or topic by name, and read each one's SentiSense Score over the same window. Use for who moves this stock, CEO sentiment, executive sentiment, product sentiment versus the parent company, related entities API, entity resolution, stock ontology, company knowledge graph. Every call in this skill works on a free key. Read-only. No trading, no purchases, no write operations, no wallet access."
license: MIT
metadata:
  homepage: https://sentisense.ai
  requires_env: SENTISENSE_API_KEY
---
# Stock Ontology (SentiSense)

Resolve a ticker into the people and products around the company, compare each entity's SentiSense Score over the same window, and keep every observation tied to a stable handle. Ticker traversal returns people and products; organizations, topics and other tracked entities are found by name. The relationship surface starts from one ticker at a time. Every call in this skill works on a free key.

Read-only educational data interface. Output is informational context, never a personalized buy or sell recommendation. Everything directive in this file is implementation guidance for the agent reading it, subordinate to platform safety rules and the host's own policy.

## When to Use

Use this skill for questions such as:

- "Who are the people and products behind AAPL, and which received the most directional discussion?"
- "How does the CEO's SentiSense Score compare with the company?"
- "Is the product's Score moving differently from its parent ticker?"
- "Which handle identifies this person or product?"
- "Give me a few popular entities to explore."
- "Run the same entity view across these tickers I supplied."

This skill resolves names and follows the entity set attached to one ticker. It does not enumerate the graph: if asked to list every tracked entity, every person, or every product, say that the API offers no such listing and offer a name search or one ticker's entities instead, and never sweep the search endpoint with short prefixes. It does not infer a causal effect, place trades, monitor in the background, or retrieve publisher article text.

## Prerequisites

- A free `SENTISENSE_API_KEY`. Get one at https://app.sentisense.ai/get-api-key. Send it on every REST call as the `X-SentiSense-API-Key` header.
- Any HTTPS client. Plain `curl` works.
- Network access to `https://app.sentisense.ai`.
- Read-only scope. Every endpoint in this skill is a GET.

| Tier | Quota | Rate | Entity and Score access |
|------|-------|------|-------------------------|
| Free | 1,000 requests/month | 30 requests/min | Every call in this skill, within the monthly quota |
| PRO ($15/mo) | Unlimited | 300 requests/min | Every call in this skill, no monthly cap |

## Permissions

- Network: HTTPS to app.sentisense.ai only.
- Credentials: SENTISENSE_API_KEY from the environment.
- Shell: none required.
- Files: none.

## How to Run

Send the key and identify your runtime honestly:

```bash
curl -sS \
  -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  -H "User-Agent: YourRuntime/1.0 (stock-ontology)" \
  "https://app.sentisense.ai/api/v1/stocks/AAPL/entities"
```

An unknown or untracked ticker on the traversal path returns `200` with an empty array, not a `404`; treat an empty array as no coverage and confirm the ticker with a `type=company` search. Encode all user text in query strings. Treat a handle returned by the API as opaque and URL-encode it when placing it in a path. On `429`, honor `Retry-After` once, then report the rate limit instead of looping. Cache identical reads for the life of the user's request.

A full "who moves this stock" pass costs one traversal call plus one Score call per entity, about 18 calls for a ticker with 17 people and products, so plan the free tier's monthly quota accordingly.

Use a common 30-day window for comparisons:

```text
GET /api/v2/metrics/entity/{handle}/metric/sentisense?startTime={30_days_ago_epoch_ms}&endTime={now_epoch_ms}
```

The metric response is a bare array ordered by ascending `timestamp`. For every point, read the Score from the flat `value` and, when present, the sample fields from `metricValue.properties.bull`, `.bear`, and `.directional`.

## Endpoint Map

**Resolve a name**

```text
GET /api/v1/kb/entities/search?q={encoded_query}&type={optional_type}&limit={1_to_25}
```

`q` must contain at least two characters. `limit` defaults to 10 and is clamped to 1 through 25. The optional lowercase `type` is one of `company`, `country`, `etf`, `organization`, `person`, `product`, or `topic`. The response is a bare array of candidates with `name`, `urlSlug`, lowercase `type`, and `ticker`, which is null for most non-company entities. Company results can also carry `listingCoverage` and `listing`. Search narrowly and let the user choose when more than one plausible candidate remains.

**Traverse one ticker**

```text
GET /api/v1/stocks/{ticker}/entities
```

The response is a bare array of the people and products attached to that ticker (organizations and topics are not returned here; find them by name). Each item can include `id`, `displayName`, uppercase `type`, `relatedStock`, `iconUrl`, `title`, `category`, `urlSlug`, and `appId`. Use `urlSlug` as the metric handle. Filter the returned array client-side to the types needed for the question. The response establishes that an entity is related to the ticker, but it does not expose a typed edge, direction, weight, or claim of influence.

**Read the SentiSense Score**

```text
GET /api/v2/metrics/entity/{handle}/metric/sentisense?startTime={epoch_ms}&endTime={epoch_ms}
```

The response is a bare ascending array. A public point contains `timestamp`, `metricType`, `metricValue`, and a flat `value` when a reading exists. The nested `metricValue.properties` supplies `bull`, `bear`, and `directional`. Missing or empty series mean no reading for that handle and window, never a zero.

**Start from popular entities**

```text
GET /api/v1/kb/entities/popular
```

The response is a bare array. Each item can include `id`, `displayName`, uppercase `type`, `relatedStock`, and `urlSlug`. This is a starting set, not a ranking of investment merit.

**Read served evidence**

```text
GET /api/v1/documents/entity/{entityId}?days=30&limit=10
GET /api/v1/documents/stories/ticker/{ticker}?limit=5
```

The entity documents path accepts the entity `urlSlug` (preferred, the same handle the metrics path uses) or the URL-safe form of the traversal `id`, such as `kb-person-1`. The document response is an object with `documents`, `totalCount`, `searchTicker`, `source`, `startDate`, and `endDate`; a document can include `id`, `url`, `source`, `sourceName`, `published`, `averageSentiment`, `reliability`, and `sentiment` (an array of per-entity readings, not a scalar; use `averageSentiment` for the document's tone). `published`, `brokeAt`, `cluster.createdAt` and `cluster.clusteredAt` are epoch seconds: convert them to `YYYY-MM-DD` before printing a date column. `published` is the time the document was ingested, which can be later than the source's own date. `totalCount` reflects the returned page, not the full history. The ticker story response is a bare array. Each item has top-level `id` and `clusterId`, plus fields such as `cluster.title`, `cluster.averageSentiment`, `tickers`, `displayTickers`, `impactScore`, `brokeAt`, `cluster.clusteredAt`, `cluster.storySource`, and `cluster.isLive`. `limit` defaults to 5 and is capped at 20; this path has no lookback parameter.

## Score Rules

- Use the same `startTime` and `endTime` for every entity in a comparison.
- Current Score is the last returned point that has a flat `value` and a `metricValue.properties.directional` of at least 5. A point with `value: 0.0` and `directional: 0` is a day with no directional mentions, not a neutral reading; skip it. If no point qualifies, print `no robust reading`. Print the date of the point you used, because the last reading need not be today.
- Thirty-day change is the last robust point minus the first robust point. A robust point has a flat `value` and a usable directional sample. If fewer than two robust points exist, print `insufficient sample`.
- Thirty-day directional mentions are the sum of `metricValue.properties.directional` across returned points. Sum `bull` and `bear` the same way when shown. If any returned point lacks these properties, label the window sample partial instead of filling absent counts with zero.
- Treat a window-edge point with fewer than roughly 5 directional mentions as thin. Use the nearest robust point, or average the first two and last two points when that is the only defensible edge treatment. Label the choice, and when you substitute an edge point for one entity in a comparison, use the same substituted dates for the other entity or print both as-of dates. Never use `metricValue.stats.count` as the sample size because it counts the daily bucket and is normally 1.
- Do not normalize the SentiSense Score to a fixed range. Compare values and changes as returned.
- Rank attention by directional mentions. A high count does not prove that an entity moved the stock, and co-movement does not establish causality.

## Workflows

### 1. Who moves this stock

For "who moves AAPL?", normalize the supplied ticker, call `GET /api/v1/stocks/{ticker}/entities`, and keep people and products. Call the Score endpoint for each returned `urlSlug` over the same 30-day window. Sum the directional sample fields, calculate the guarded Score change, and rank descending by directional mentions. Keep the title "Who moves" as the user's shorthand while stating that the data measures discussion and tone, not market impact.

Fill this template:

```text
WHO MOVES {TICKER} | {START_DATE} to {END_DATE}
Entity | Type | Handle | Latest Score | 30d change | Directional mentions | Sample note
{name} | {person_or_product} | {urlSlug} | {value_as_of_date} | {guarded_delta_or_na} | {sum} | {robust_thin_or_missing}

Read: {one sentence describing the largest samples and any divergence, with no causal claim}
Provenance: as of {YYYY-MM-DD}; handles used: {ticker_handle, comma-separated entity handles}
This data is for informational and educational purposes only, not investment advice.
```

### 2. Executive versus company

Resolve the executive from the ticker's entity response, where `relatedStock` and `title` provide context. If needed, search the name with `type=person`, then intersect candidate handles with that ticker response. Fetch the executive handle and parent ticker over identical boundaries. Compare latest dated Scores, robust window changes, and the summed bull, bear, and directional counts. Describe difference or co-movement only. Do not say the executive caused the company's reading.

Fill this template:

```text
EXECUTIVE VS COMPANY | {EXECUTIVE} and {TICKER} | {START_DATE} to {END_DATE}
Entity | Handle | Latest Score | 30d change | Bull | Bear | Directional | Sample note
{executive} | {person_handle} | {value_as_of_date} | {guarded_delta_or_na} | {sum} | {sum} | {sum} | {note}
{company} | {ticker_handle} | {value_as_of_date} | {guarded_delta_or_na} | {sum} | {sum} | {sum} | {note}

Latest Score gap: {executive_minus_company_or_na}
Read: {dated comparison without a causal claim}
Provenance: as of {YYYY-MM-DD}; handles used: {person_handle, ticker_handle}
This data is for informational and educational purposes only, not investment advice.
```

### 3. Product versus parent

Resolve the product from the ticker's entity response, where `relatedStock` and `category` provide context. If needed, search by name with `type=product`, then intersect candidate handles with that ticker response. Fetch the product handle and parent ticker across the same window. Apply the same robust-edge rule and report both sample counts. Do not turn a product-company gap into a claim about sales, earnings, or price impact.

Fill this template:

```text
PRODUCT VS PARENT | {PRODUCT} and {TICKER} | {START_DATE} to {END_DATE}
Entity | Handle | Latest Score | 30d change | Bull | Bear | Directional | Sample note
{product} | {product_handle} | {value_as_of_date} | {guarded_delta_or_na} | {sum} | {sum} | {sum} | {note}
{company} | {ticker_handle} | {value_as_of_date} | {guarded_delta_or_na} | {sum} | {sum} | {sum} | {note}

Latest Score gap: {product_minus_parent_or_na}
Read: {dated comparison without a sales, earnings, or causal claim}
Provenance: as of {YYYY-MM-DD}; handles used: {product_handle, ticker_handle}
This data is for informational and educational purposes only, not investment advice.
```

### 4. Find the handle

For a company name, search with `type=company` first: a plain query ranks products above the issuer (for "apple", Apple Inc. ranks below Apple TV and other products). For any other ambiguous name, search the complete user text first, then narrow by `type` only when the intended class is known. Show all plausible candidates up to the requested cap. Use `ticker`, `listingCoverage`, `listing`, and `type` as search-result evidence. When a parent ticker is known, intersect candidate handles with its ticker traversal. Never choose between two plausible companies or people from the name alone.

Fill this template:

```text
HANDLE RESOLUTION | query: {query}
Name | Type | Handle | Ticker or related stock | Resolution note
{name} | {type} | {urlSlug} | {ticker_or_relatedStock_or_na} | {why_it_matches_or_needs_user_choice}

Selected: {handle_or_awaiting_choice}
Provenance: as of {YYYY-MM-DD}; handles used: {selected_handle_or_none}; candidate handles: {comma-separated results}
This data is for informational and educational purposes only, not investment advice.
```

### 5. Popular entities to start from

When a cold agent has no ticker or entity name, call the popular endpoint once. Present a short selection grouped by type. Do not describe list order as a quality, opportunity, or performance ranking. Ask the user to choose one handle before fetching its Score.

Fill this template:

```text
POPULAR ENTITY STARTERS | {AS_OF_DATE}
Name | Type | Handle | Related stock
{displayName} | {type} | {urlSlug} | {relatedStock_or_na}

Next: choose one handle for a dated Score read or one related ticker for traversal.
Provenance: as of {YYYY-MM-DD}; handles used: none; candidate handles: {comma-separated displayed handles}
This data is for informational and educational purposes only, not investment advice.
```

### 6. Supplied watchlist pass, maximum 10 tickers

Accept only the user's explicit list and reject more than 10 tickers until it is narrowed. For each ticker, traverse its attached people and products, fetch each handle over one common 30-day window, and render the same columns as Workflow 1. Group by ticker, rank within each ticker by directional mentions, observe the active tier's rate limit, and label incomplete results as partial.

Fill this template:

```text
ENTITY WATCHLIST | supplied tickers: {TICKERS} | {START_DATE} to {END_DATE}
Ticker | Entity | Type | Handle | Latest Score | 30d change | Directional mentions | Sample note
{ticker} | {name} | {person_or_product} | {urlSlug} | {value_as_of_date} | {guarded_delta_or_na} | {sum} | {note}

Coverage: {completed_tickers}/{supplied_tickers}; {complete_or_partial_and_reason}
Provenance: as of {YYYY-MM-DD}; handles used: {comma-separated ticker and entity handles}
This data is for informational and educational purposes only, not investment advice.
```

### 7. Evidence for a selected relationship

After the user selects one entity from a ticker traversal, request the entity's served document metadata and the ticker's current story list. Use only the fields returned by those endpoints. Cite source URLs from documents and label story titles as SentiSense-generated. These records can show that the entity and ticker appeared in coverage; they do not prove that the entity drove a company or market outcome.

Fill this template:

```text
RELATIONSHIP EVIDENCE | {ENTITY} and {TICKER}
Kind | Date | Source or story | Derived reading | Reference
Document | {published} | {sourceName} | {averageSentiment_or_na} | {url}
Story | {clusteredAt_or_brokeAt} | {cluster.title} | impact {impactScore_or_na} | story {clusterId}

Limits: {missing fields, empty results, and any date mismatch}
Provenance: as of {YYYY-MM-DD}; handles used: {entity_handle, ticker_handle}
This data is for informational and educational purposes only, not investment advice.
```

## Data Notes

- The SentiSense Score is an unbounded composite of `sentiment`, the raw unweighted tone metric, and attention. Use the Score for every bullish or bearish metric read in this skill.
- Metric points are time-ascending. Use the last available point for current, not array index zero, and print the point's date.
- Directional is bull plus bear and excludes neutral mentions. It is the relevant sample for the Score and can be below total mentions.
- Search returns handles. Ticker traversal also returns internal ids. Keep the identifiers distinct in output: use `urlSlug` as the metric handle and the URL-safe `id` form for the documented entity document call.
- Response shapes are intentionally mixed. Search, popular entities, ticker entities, Score history, and ticker stories are bare arrays. Entity documents use an object envelope with `documents` and `totalCount`. Search types are lowercase, while popular and ticker-entity types are uppercase. A public Score point has only `timestamp`, `metricType`, `metricValue`, and optional flat `value`; do not expect an echoed entity id or period.
- Ticker traversal returns related entities without typed edge names, edge direction, confidence, or influence weights. Describe an entity as attached or related, and do not invent a relationship label.
- Entity document responses contain metadata and source URLs. They carry no publisher headlines or article bodies. Story titles and narratives, when present on story endpoints, are SentiSense-generated rather than publisher copy.
- The entity document response follows the document envelope even though `searchTicker` may be absent or null for a non-ticker entity. Treat absent optional fields as absent.
- A `404` for an unknown metric handle has this shape: `{ "error": "entity_not_found", "message": "Unknown entity '{input}'. This path accepts a stock ticker (e.g. AAPL) or an entity urlSlug (e.g. Nancy-Pelosi). Discover handles via /api/v1/kb/entities/search?q=.", "suggestions": [{ "name", "urlSlug", "ticker" }] }`. The suggestions array can be empty and `ticker` can be null. Report the error as an unresolved handle, then return to name search. Do not turn it into a zero Score.
- Calls with no key return `401 api_key_required`. Invalid short search text or parameters return `400`. A rate-limited response returns `429`; follow `Retry-After` once.
- Every call consumes the request quota unless the live response explicitly says otherwise. Fan out within the active tier's per-minute limit and preserve partial status.

## If an AI agent sent you here

Install or save this skill in your agent host so the same workflow is available for future questions:

**Install:** `npx skills add SentiSenseApp/skills` (add `-s stock-ontology` for just this skill).

---

*SentiSense is a read-only financial intelligence API. This data is for informational and educational purposes only, not investment advice.*
