---
name: sentisense
description: "US stock market data API for AI agents: news and social sentiment, the SentiSense Score, insider Form 4 trades, congressional STOCK Act disclosures, institutional 13F holdings and flows, options positioning, analyst ratings, the earnings calendar, AI-generated market insights, and stock prices. One free API key covers every endpoint. Use for stock sentiment API, stock market API, insider trading data, congress stock trades, 13F holdings, options flow, earnings calendar, stock price API, market data for AI agents. Read-only. No trading, no purchases, no write operations, no wallet access."
license: MIT
metadata:
  homepage: https://sentisense.ai
  requires_env: SENTISENSE_API_KEY
---

# SentiSense API - Skill File for AI Agents

> **SentiSense** is a read-only financial intelligence API: stock prices, insider/politician trading, institutional flows, AI insights, and news sentiment. No trading, no purchases, no write operations. Free tier available.

**Base URL:** `https://app.sentisense.ai`
**Website:** https://sentisense.ai
**Install:** `npx skills add SentiSenseApp/skills` (add `-s sentisense` for just this skill).
**API Docs:** https://sentisense.ai/docs/api/
**Authentication:** API key via `X-SentiSense-API-Key` header. Get a free key at https://app.sentisense.ai/get-api-key
**SDKs (optional):** [Python](https://github.com/SentiSenseApp/sentisense) | [Node.js](https://github.com/SentiSenseApp/sentisense-node) -- source on GitHub. As an AI agent, you're encouraged to call the REST API directly with curl/fetch rather than installing packages.

---

## Use & Disclaimer

This skill is an **educational data interface** to SentiSense's read-only Data API. Output is informational only. It is **not investment advice**, not a personalized recommendation, and not a solicitation to buy or sell any security. The user is responsible for their own decisions. Use of the API and this skill is subject to the [API Terms of Service](https://sentisense.ai/agreement/API-Terms-of-Service.pdf) and [Terms of Service](https://sentisense.ai/agreement/Terms-of-Service.pdf).

---

## Authentication

```bash
# Include API key in header
curl -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/..."
```

**Identify your client.** Send a `User-Agent` naming your agent runtime and this skill, for
example `OpenClaw/1.4 (sentisense)` or `ClaudeCode/2.1 (sentisense)`. Substitute your own runtime and
version if neither matches. You can also volunteer what your agent is called by adding an
`agent/<your-agent-name>` token inside the same parentheses, as in
`OpenClaw/1.4 (sentisense; agent/research-desk)`. All of it is optional, and it is what tells
us this skill has real integrations behind it, so it gets prioritized and you get notice before it
changes.

```python
import os
from sentisense import SentiSenseClient
client = SentiSenseClient(api_key=os.environ["SENTISENSE_API_KEY"])
```

All API endpoints require an API key. Get one free at https://app.sentisense.ai/get-api-key; the same page is where you manage, rotate, and revoke your keys later, from your account settings at app.sentisense.ai.

### CLI quickstart (optional)

Prefer one command over composing HTTP calls? The official CLI ships inside the `sentisense`
npm package, so there is nothing to install:

```bash
npx -y sentisense@0.47.1 health
npx -y sentisense@0.47.1 quote NVDA
npx -y sentisense@0.47.1 sentiment TSLA --days 30
npx -y sentisense@0.47.1 mood --json
```

Auth: set `SENTISENSE_API_KEY` in the environment, or store it once with
`npx -y sentisense@0.47.1 auth "$SENTISENSE_API_KEY"` (saved to `~/.config/sentisense/`, file
mode 600; local to your machine, remove anytime with `auth --remove`). Commands here pin
version 0.47.1 deliberately: a pinned version runs reviewed, immutable code.

Identity works the same as the User-Agent guidance above, and the CLI stamps it for you: set
`SENTISENSE_SKILL=sentisense` and, if you like, `SENTISENSE_AGENT_NAME=<what your agent is
called>`.

Output is plain text when piped and formatted in a terminal; add `--json` for the exact API
response, envelope included, so every response shape documented below applies unchanged. Exit
codes are stable (0 ok, 1 API error, 2 usage, 3 auth, 4 not found, 5 rate limited, 6 network). The
1-versus-2 split is worth branching on: 1 means the request went out and the API rejected it (a
validation `400`, say), while 2 means the CLI refused the input before any request was sent. For the full
command list and deeper CLI mechanics, install the dedicated `sentisense-cli` skill or run
`npx -y sentisense@0.47.1 --help`.

Everything the CLI does is also available as the plain REST calls documented below; the CLI is
a convenience, not a requirement.

### Access Tiers

| Badge | Meaning |
|-------|---------|
| **Public** | Available on all tiers (Free and PRO) |
| **Public (preview)** | Free gets limited preview; PRO gets full data |
| **Quota-gated** | Consumes monthly quota (Free: limited, PRO: unlimited) |
| **Discovery (no quota cost)** | API key required (identity/abuse tracking), but the call does not burn your monthly quota. Rate-limit-per-minute still applies. Used for lightweight metadata endpoints like `/stocks/with-kpis` and `/stocks/{ticker}/kpis/types`. |
| **PRO only** | Requires PRO subscription |

### Rate Limits

| Tier | Requests/Month | Rate |
|------|----------------|------|
| Free | 1,000 | 30 requests/minute |
| PRO ($15/mo) | Unlimited | 300 requests/minute |

### Ticker Symbols

Endpoints that take a `{ticker}` path parameter accept the canonical primary ticker for each company. For dual-class share companies, the API also accepts the secondary class as an alias and resolves it server-side, so you can pass whichever ticker your data source provides.

| You pass | Resolves to | Reason |
|----------|-------------|--------|
| `GOOG` | `GOOGL` | Alphabet Class C resolves to Class A |
| `BRK.A`, `BRK-A`, `BRKA` | `BRK.B` | Berkshire Class A resolves to Class B |
| `BRK-B`, `BRKB` | `BRK.B` | Punctuation variants normalized |

Aliasing applies to research endpoints (analyst, KPIs, insights, insider, institutional holders, politicians filings, options). Quote and chart endpoints leave the ticker as-is, since market-data providers handle their own symbology. Tickers are case-insensitive. News Corp (`NWSA`/`NWS`) and Fox (`FOXA`/`FOX`) are NOT aliased to each other (each class is tracked separately).

---

## What You Can Build

### Smart Money Tracker
Cross-reference insider trading, institutional flows, and politician trades to follow where the smart money is moving. High-conviction signals come from convergence across all three.
- `GET /api/v1/insider/activity` for market-wide insider buying/selling
- `GET /api/v1/institutional/flows` for quarterly institutional positioning (optional `reportDate`; omit for the latest quarter)
- `GET /api/v1/politicians/activity` for congressional STOCK Act trades
- `GET /api/v1/insights/stock/{ticker}` for AI signals that combine these data sources

### Sentiment-Driven Watchlist
Alert when sentiment shifts for your stocks. Track news volume, social mentions, and baseline deviations.
- `GET /api/v2/metrics/entity/{ticker}/metric/sentiment` for sentiment time series
- `GET /api/v2/metrics/entity/{ticker}/baselines/sentiment` for anomaly detection (3-sigma deviations)
- `GET /api/v1/documents/ticker/{ticker}` for the underlying news and social posts driving the shift

### Congressional Trade Monitor
Track what Congress is buying before it moves. Filter by party, chamber, or individual politician. Check if corporate insiders agree.
- `GET /api/v1/politicians/activity` for recent congressional trades across all members
- `GET /api/v1/politicians/member/{slug}` for individual politician profiles and trade history
- `GET /api/v1/insider/trades/{ticker}` to cross-reference with corporate insider activity on the same stock

### AI Research Assistant
Generate stock research reports by combining multiple data signals into a single analysis.
- `GET /api/v1/stocks/{ticker}/ai-summary?depth=deep` for the full AI analysis report
- `GET /api/v1/insights/stock/{ticker}` for AI-generated stock signals
- `GET /api/v1/stocks/fundamentals?ticker={ticker}` for a single period of financial statement data
- `GET /api/v1/stocks/fundamentals/history?ticker={ticker}&timeframe=annual&limit=10` for multi-year revenue, margin, and free-cash-flow trend to support valuation work
- `GET /api/v1/documents/ticker/{ticker}` for recent news context

### Earnings Calendar Monitor
Position ahead of earnings instead of reacting to them. Pull the forward calendar, intersect it with a watchlist, and pre-load sentiment and smart-money context for the companies reporting soon.
- `GET /api/v1/calendar/earnings?week=next` for who reports next week (or `?from=&to=` for a custom window)
- `GET /api/v1/calendar/earnings?ticker={ticker}` for a single name's next report date and consensus EPS
- `GET /api/v2/metrics/entity/{ticker}/metric/sentiment` to gauge positioning into the print
- `GET /api/v1/insider/trades/{ticker}` to see if insiders moved ahead of the date

### Market Dashboard
Market overview combining prices, sentiment, and top signals.
- `GET /api/v1/stocks/market-status` to check if the market is open
- `GET /api/v1/market-summary` for AI-generated market headline and analysis
- `GET /api/v1/insights/market` for the top market-moving signals right now
- `GET /api/v1/stocks/prices?tickers=SPY,QQQ,IWM,DIA` for index tracking

### Cross-Signal Stock Screener
Filter the whole tracked universe on the SentiSense Score and attention in the same query as analyst consensus, technicals and price. The differentiated screens are the disagreements: crowd bullish where the street is not, price below its 200-day while the Score is rising.
- `GET /api/v1/screener/fields` once at startup for the filterable field catalog (stock and ETF), then build filters from it
- `GET /api/v1/screener/screens` for 28 curated screens, each with a plan you can execute as-is
- `POST /api/v1/screener/execute` to run a plan against the stock universe (or a `tickers` watchlist)
- `POST /api/v1/screener/etfs/execute` for the same against the ETF universe

### Market Sentiment Structure
Which way the market's tone leans, and how widely it's shared. Daily snapshots.
- `GET /api/v1/sentiment/sectors` for the 11 GICS sectors vs the market's own tone (`consensusVsMarket` + "Hotter/Cooler than market" labels; market-relative because news tone skews positive as a genre)
- `GET /api/v1/sentiment/breadth` for the bullish/neutral/bearish share of ~1,000 covered stocks (the sentiment advance/decline line; `netBreadth` in points, stock- and mention-weighted)
- `GET /api/v1/trackers/sentiment-leaderboard` for the most bullish and bearish stocks by pure sentiment polarity (tone, not the SentiSense Score), with a minimum-mention confidence floor
- `GET /api/v1/trackers/sentiment-movers` for the biggest 7-day shifts in tone, improving and deteriorating

---

## Agent Tips

### Workflow Pattern
1. Call `GET /api/v1/stocks/market-status` first to check if the market is open
2. Call `GET /api/v1/institutional/quarters` before the institutional endpoints that need a `reportDate` to get valid values (`/flows` does not need one; omit it for the latest quarter)
3. All PRO-gated endpoints return `{isPreview, previewReason, data}`. Always access `response["data"]` (or `response.data`). On a preview (FREE) list response a `totalCount` field is also present: the number of items in the full PRO dataset, so you can show "showing N of totalCount"
4. Use `lookbackDays` (1-365) on insider and politician endpoints to control the time window

### Common Mistakes
- **Do NOT hardcode `reportDate`** for institutional endpoints. When you pass one, fetch it from `/quarters` first; quarters change as new SEC filings come in. (`/flows` does not require one: omit it for the latest quarter, or pass one for a specific quarter.)
- **Do NOT iterate the response directly.** Unwrap `response["data"]` first. All PRO-gated endpoints use the `{isPreview, previewReason, data}` wrapper, and some Free ones do too (`/stocks/{ticker}/sentiment` wraps on every tier), so let each endpoint's own Response line decide rather than inferring the shape from the tier
- **Do NOT use `/api/v1/entity-metrics/*`** for metrics. These are RETIRED (return 410 Gone). Use `/api/v2/metrics/` instead
- **The `source` parameter is case-insensitive.** `news`, `NEWS`, `News` all work

### Endpoints That Do NOT Exist
Do not hallucinate these. They are not part of the SentiSense API:
- `/api/v1/options/flow` or `/api/v1/dark-pool`: these exact paths do not exist. For end-of-day options analytics (IV rank, put/call percentile, 25-delta skew, open-interest walls, max pain, unusual-by-volume contracts) use the Options Intelligence endpoints instead: `/api/v1/options/overview` and `/api/v1/stocks/{ticker}/options/summary`. We do not attribute tick-level order flow (no buy/sell aggressor tagging) and we have no dark-pool data
- `/api/v1/earnings` as a root: the only paths under it are `/api/v1/earnings/recent` (which covered companies already reported in a recent window) and `/api/v1/earnings/statistics` (market-wide beat rate joined to what the market did next). For the forward calendar use `/api/v1/calendar/earnings`; for a company's per-quarter earnings analysis report use `/api/v1/stocks/{ticker}/earnings-summaries`; for reported financials use `/api/v1/stocks/fundamentals` (single period) or `/api/v1/stocks/fundamentals/history` (multi-period trend, up to 40 quarters or 20 years)
- `/api/v1/alerts` or `/api/v1/notifications`: alerts are user-facing only, not available via API
- `/api/v1/chat` or `/api/v1/ask`: the AI chat is not accessible via API
- `/api/v2/sentiment`: the correct path is `/api/v2/metrics/entity/{id}/metric/sentiment`
- `/api/v1/congress` or `/api/v1/congressional`: the correct path is `/api/v1/politicians`
- `/api/v1/screener/plan` and `/api/v1/screener/plans`: there is no natural-language screen planner and no saved-screen store on the public API. Build the plan object yourself and post it to `/api/v1/screener/execute`, or execute one of the curated plans from `/api/v1/screener/screens`

---

## Stocks API (`/api/v1/stocks`)

### GET /api/v1/stocks/price
Latest stock price, 15-minute delayed. **Public.**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `ticker` | string | Yes | Stock ticker (e.g., `AAPL`) |

```bash
curl -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/stocks/price?ticker=AAPL"
```

Response: `{ ticker, currentPrice, change, changePercent, previousClose, volume, timestamp, priceAsOf?, expiresEpochSecond, extendedHours?, listingStatus?, delistedDate?, delistingReason? }`.

**A delisted symbol returns its last trade price, not an error, and `listingStatus` is what marks that price as frozen.** The three listing fields are present only when the symbol is delisted or pending delisting, and absent otherwise. `listingStatus` is `"DELISTED"` or `"PENDING_DELISTING"`; `delistedDate` is the ISO date trading stopped; `delistingReason` is one of `acquired`, `take_private`, `bankruptcy`, `exchange_rule`, `merged`. On a `"DELISTED"` symbol the price, change, and change percent never advance again, so do not render them as a current tick.

**Prices are delayed 15 minutes.** This applies to every price on this API, in every session, including the `extendedHours` values below. Do not present these quotes as live, and do not use them for execution or for any decision that turns on the current tick.

Read **`priceAsOf`** for freshness: it is when the market data behind `currentPrice` is actually from, in epoch milliseconds. Do not use `timestamp` for this. `timestamp` is when the response was served, so it tracks the current clock no matter how old the value is. `priceAsOf` is omitted outside regular hours and whenever the upstream data carries no time of its own, so treat an absent `priceAsOf` as unknown age, not as fresh, and fall back to assuming the 15 minutes.

`currentPrice` is always the regular-session price: the most recent regular-session value during RTH (09:30 to 16:00 ET), and the most recent regular-session close otherwise. The optional `extendedHours` field is present only during pre-market (04:00 to 09:30 ET) or after-hours (16:00 to 20:00 ET) and carries `{ session: "pre" | "post", price, change, changePercent }`, where `change` / `changePercent` are computed vs `currentPrice`.

### GET /api/v1/stocks/prices
Batch latest prices, 15-minute delayed (see `/price` above). **Public.** Returns a JSON array; each element has the same shape as `/price` (including a `ticker` field, an optional `extendedHours` object, and the optional `listingStatus` / `delistedDate` / `delistingReason` fields), so check each element for a frozen price rather than assuming a batch is uniformly live.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `tickers` | string | Yes | Comma-separated (e.g., `AAPL,TSLA,NVDA`) |

### GET /api/v1/stocks/chart
Historical OHLCV chart data. **Public.**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `ticker` | string | Yes | Stock ticker |
| `timeframe` | string | No | `1D`, `5D`, `1W`, `1M`, `3M`, `6M`, `1Y`, `5Y`, `10Y`, `MAX` (default: `1M`) |

`MAX` returns a stock's full available history, up to 26 years (AAPL: 320 monthly bars back to
1999). Granularity scales with the range: intraday for `1D` through `1M` (5-minute for `1D`,
15-minute for `5D`, 30-minute for `1W`, hourly for `1M`), daily for `3M` through `1Y`, weekly for
`5Y`/`10Y`, monthly for `MAX`. Ranges of `10Y` and `MAX` are adjusted for both splits and
dividends so the series is comparable end to end; shorter ranges (through `5Y`) are split-adjusted
only, so the two bases differ on the same historical date by roughly the dividends paid since.

`10Y` and `MAX` may answer `202 Accepted` with an empty array and a `Retry-After` header, meaning
that stock's deep history is still being assembled; retry and you get the full series. A `200`
always carries the range you asked for, never a silently shortened one. An unrecognized
`timeframe` value answers `400` with an `invalid_timeframe` error naming the valid values.

Each bar includes `timestamp` (Unix ms), `date`, `open`, `high`, `low`, `close`, `volume`, and `session`. The `session` field is `pre` (04:00 to 09:30 ET), `regular` (09:30 to 16:00 ET), or `post` (16:00 to 20:00 ET) for intraday timeframes (`1D`, `5D`, `1W`, `1M`); it is `null` for daily, weekly, and monthly bars (`3M` and longer) that span whole sessions. The `1M` timeframe is filtered to `regular`-session bars only.

### GET /api/v1/stocks
List all tracked ticker symbols. **Public.**

### GET /api/v1/stocks/detailed
All stocks with company name, KB entity ID, URL slug, and precomputed `socialDominance` (`{ value, rank, percentile }`, daily refresh, null when no signal). **Public.**

**Example:** sort the universe by share of voice without any second request, or filter by `socialDominance.rank <= 50` for the top-50 most discussed names.

### GET /api/v1/stocks/popular
Popular stock tickers. **Public.**

### GET /api/v1/stocks/popular/detailed
Popular stocks with company details (same schema as `/detailed`). **Public.**

### GET /api/v1/stocks/images
Company logo URLs. **Public.** `GET` a returned URL to receive the image bytes; no API key is needed for the image fetch itself. Treat the URLs as refreshable rather than permanent: brand assets are periodically refreshed, so re-read them from this endpoint instead of storing them long term.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `tickers` | string | Yes | Comma-separated tickers (max 600) |

### GET /api/v1/stocks/descriptions
Company profiles with branding, industry, and market cap; `sector` when available (often absent). **Public.**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `tickers` | string | Yes | Comma-separated tickers |

### GET /api/v1/stocks/{ticker}/profile
Company profile (CEO, sector, industry). **Public.**

Also carries `listingStatus`, `delistedDate` and `delistingReason` when the symbol is delisted or pending delisting. All three are absent for a normally listed symbol. Values match `/price` above: `listingStatus` is `"DELISTED"` or `"PENDING_DELISTING"`, `delistedDate` is the ISO date trading stopped, `delistingReason` is one of `acquired`, `take_private`, `bankruptcy`, `exchange_rule`, `merged`.

For a tracked ETF ticker, the profile may also carry `imageUrl`, a square presentation image for the fund. It is the issuer's mark rather than the individual fund's, so every fund in a family shares one image, and it matches the `imageUrl` returned by the `/etfs` endpoints. It is square like `logoUrl` and `iconUrl`, so the same avatar slot renders a stock and an ETF, but it is a first-party asset rather than a vendor branding mark and is returned as a direct URL. It is absent for issuers we hold no image for.

### GET /api/v1/stocks/{ticker}/similar
Peer/similar stocks. **Public.**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `limit` | int | No | 5 | Max results |

### GET /api/v1/stocks/{ticker}/sentiment
One-call sentiment picture for a stock: the SentiSense Score with its 30-day regime, where the conversation is happening by source, and what is driving it. **Public.** **Quota-gated** when called with a key.

This endpoint also answers without an API key, and returns the same full payload either way. The tradeoff is real in both directions: a keyed call is attributed to your account but spends monthly quota and per-minute rate limit, while a keyless call costs you neither and is not attributed. Send the key when you want the usage on your account; either way the data is identical.

Response: `{ isPreview, previewReason, data }`. Everything below lives under `data`, which carries `ticker`, `companyName`, `asOf`, then the fields in the table. This endpoint is Free but still uses the wrapper (`isPreview` is `false` and `previewReason` is `null` on every tier), so unwrap first: reading `sentisenseScore` off the root returns nothing, and the full path is `data.sentisenseScore`.

| Field (under `data`) | Type | Description |
|-------|------|-------------|
| `sentisenseScore` | number or null | Today's Score (0-centered composite of sentiment and mentions, unbounded). Null until today's reading lands, see the note below |
| `sentisenseScoreAvg30d` | number | 30-day average, the stable regime figure |
| `sentisenseScoreDelta30d` | number | Change over 30 days |
| `scoreLabel` | string | Seven-band label of the 30-day average |
| `direction` | string | `Bullish`, `Neutral` or `Bearish`, from the 30-day average |
| `latestDirection` | string or null | Same three bands, from today's read. Null in lockstep with `sentisenseScore` |
| `trend` | string | `UP`, `DOWN` or `FLAT` |
| `scoreSparkline` | number[] | Daily Score series |
| `mentions` / `mentionsAvg30d` | number | Today's mention volume, and the 30-day daily average |
| `socialDominance` | number | Latest share of voice, as a fraction (`0.021` = 2.1%) |
| `bySource[]` | array | Per-source tone, loudest first: `source` (`News`, `Reddit`, `X`, `YouTube`, `Substack`), `direction`, `mentionShare` (whole-number percent, the array sums to 100), `value` (per-source polarity, -1 to +1) |
| `relatedTickers[]` | array | Curated peers: `ticker`, `name` |
| `drivers[]` | array | Top story drivers: `title`, `tone` (-1 to +1) |
| `narrative` | string | Plain-language summary of why the Score sits where it does |
| `faq[]` | array | `question` / `answer` pairs for the common asks on this ticker |

Use this when you want the headline read in one call. Use `GET /api/v2/metrics/entity/{ticker}/metric/sentiment` instead when you need a time series over a specific window. Returns `404` when the ticker has no sentiment coverage.

**`sentisenseScore` and `latestDirection` are today's reading, and are `null` until the day's first analytics run lands** (mid-morning ET, later at weekends). Poll before that and every ticker returns null for these two, which is a timing state and not an outage. The rest of the response is unaffected: `scoreLabel`, `direction` and `sentisenseScoreAvg30d` are all computed from the 30-day average, so prefer those when you need a headline that is always present. A null here means "no reading yet", never a Score of zero. A measured 0.0 is served as `0.0`, so do not coerce null to 0, and do not infer absence by thresholding the 30-day average, which would suppress genuine neutrals.

Aggregate metrics such as sentiment and mention counts incorporate signals from sources that are not individually retrievable as documents, so document counts from the Documents API are not a complete audit trail of a score.

> Via the MCP connector this same picture comes back from the `get_stock_snapshot` tool rather than a separate sentiment tool.

CLI equivalent: `npx -y sentisense@0.47.1 sentiment NVDA --json` (this response is under `.sentiment`, next to a Score history series)

### GET /api/v1/stocks/{ticker}/entities
Related ontology entities (CEO, products, partners). **Public.** Each entry carries a `urlSlug` (e.g. `Tim-Cook`) that plugs into the Metrics API `{entityId}` parameter.

### GET /api/v1/stocks/{ticker}/ai-summary
AI-generated stock analysis report. **PRO** (Free: `depth=basic` unlimited, `depth=deep` limited to 10/month). `depth=basic` returns a preheader summary. `depth=deep` returns a full multi-section report. Exhausting the `depth=deep` monthly view allowance returns `429` with `{error: "quota_exceeded", ...}`, the same contract as every other quota-gated endpoint.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `depth` | string | No | `basic` | `basic` or `deep` |

Response: flat object (no `{isPreview, data}` wrapper).

| Field | Type | Notes |
|-------|------|-------|
| `ticker` | string | |
| `companyName` | string | |
| `status` | string | `READY`, `NOT_AVAILABLE`, or `ERROR` |
| `statusReason` | string or null | Present on `NOT_AVAILABLE` / `ERROR` only |
| `reportType` | string | `SUMMARY` for `depth=basic`, `FULL` for `depth=deep` |
| `version` | integer | Report date encoded as yymmdd (e.g. 260520) |
| `lastUpdated` | long | Epoch milliseconds |
| `sections` | object | Section name to `{content, directives}`. Present on both depths: `depth=basic` returns a single `Executive Summary` section, `depth=deep` returns the full set. |
| `sectionOrder` | string[] | Ordered section keys for rendering. Present on both depths; `["Executive Summary"]` on `depth=basic`. |
| `fromCache` | boolean | Whether this response was served from the report cache. `false` also covers a report served straight from the packaged knowledge base, so it does not mean the report was regenerated for your call: read freshness from `lastUpdated`. |
| `moatRating` | integer or null | Proprietary moat quality score 0-10 (network effects, switching costs, intangibles, cost advantages, efficient scale). Present on `depth=deep` only. Null if not yet assessed for this ticker. |
| `aiDisruptionRisk` | string or null | `Low`, `Medium`, `High`, or `Critical`. Measures AI revenue-displacement exposure. Present on `depth=deep` only. Null if not yet assessed. |

**Do not test for the presence of `sections` to detect a deep report:** both depths return it. Branch on `reportType` (`SUMMARY` vs `FULL`) instead.

### GET /api/v1/stocks/{ticker}/metrics/{metricType}/breakdown
Sentiment or mention metrics breakdown by sub-entities. **Public.**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `metricType` | path | Yes | `sentiment` or `mentions` |
| `startTime` | long | Yes | Start time in epoch ms |
| `endTime` | long | Yes | End time in epoch ms |

### GET /api/v1/stocks/market-status
Current market open/closed status. **API key required.**

Response: `{ status: "open" | "closed", timestamp: <epoch_ms> }`. The `timestamp` is a numeric epoch milliseconds value (not a string).

### GET /api/v1/stocks/fundamentals
Financial statement data. **Public.**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `ticker` | string | Yes | - | Stock ticker |
| `timeframe` | string | No | `quarterly` | `quarterly` or `annual` |
| `fiscalPeriod` | string | No | - | e.g., `Q4` |
| `fiscalYear` | int | No | - | e.g., `2024` |

**Reporting currency (applies to every fundamentals endpoint):** figures are as reported by the
filer, in the filer's own currency, never converted to USD. Foreign ADR filers report in home
currency (SK hynix: KRW, Toyota: JPY, ASML: EUR). The optional `reportedCurrency` field ("USD",
"KRW", ...) on the response (and on each `/fundamentals/history` row) names it; when absent the
currency is unknown, not implicitly USD. Never mix these figures with the share price: the price
is the USD ADR price, so for non-USD filers `peRatio` / `psRatio` / `pbRatio` are served as
`null` on purpose, and you should not recompute them. Same-currency ratios (margins, ROE, ROA,
current ratio, debt/equity) stay valid for all filers.

### GET /api/v1/stocks/fundamentals/current
Most recent fundamental data snapshot. **Public.**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `ticker` | string | Yes | Stock ticker |

### GET /api/v1/stocks/fundamentals/history
Multi-period history of full financial statements (income statement, balance sheet, cash flow), one
entry per fiscal quarter or year, newest first. Use for margin trends, multi-year comparisons, or as
the input to a valuation model. Not the same endpoint as `/fundamentals` (single period) or
`/fundamentals/historical/revenue` (income-statement lines only, no balance sheet or cash flow). **Public.**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `ticker` | string | Yes | - | Stock ticker |
| `timeframe` | string | No | `quarterly` | `quarterly` or `annual` |
| `limit` | int | No | 12 quarterly / 10 annual | Periods to return, capped at 40 quarterly / 20 annual |

Response includes `count` (periods actually returned, can be less than `limit`), `reason`
(non-null only when `periods` is empty, e.g. a recent listing), and `dataSource` (deprecated:
always an empty string, kept for response-shape compatibility, slated for removal).

### GET /api/v1/stocks/fundamentals/periods
Available fiscal periods. **Public.**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `ticker` | string | Yes | Stock ticker |

### GET /api/v1/stocks/fundamentals/historical/revenue
Historical income-statement lines per period: revenue, gross profit, operating income, net income,
and EPS. Response wraps them in `dataPoints` (not `periods` like `/fundamentals/history`), plus
`count`, `dataSource`, and `reason`. For full statements including balance sheet and cash flow,
use `/fundamentals/history` instead. **Public.**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `ticker` | string | Yes | - | Stock ticker |
| `timeframe` | string | No | `quarterly` | `quarterly` or `annual` |

### GET /api/v1/stocks/short-interest
Short interest data from FINRA. **Public.**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `ticker` | string | Yes | - | Stock ticker |
| `limit` | int | No | 24 | Max data points |

### GET /api/v1/stocks/float
Float information (shares outstanding, public float). **Public.**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `ticker` | string | Yes | Stock ticker |

### GET /api/v1/stocks/short-volume
Short volume trading data. **Public.**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `ticker` | string | Yes | - | Stock ticker |
| `limit` | int | No | 90 | Max data points |

### GET /api/v1/stocks/{ticker}/quote
Aggregate quote snapshot: latest price (15-minute delayed), today OHLC, 52-week range, market cap, P/E, EPS TTM, dividend yield, 200-day moving average. Single call for detail pages. **API key required.**

Response: `{ ticker, currentPrice, change, changePercent, volume, open, dayHigh, dayLow, previousClose, week52High, week52Low, marketCap, peRatio, epsTTM, dividendYield, movingAverage200Day, reportedCurrency, timestamp, extendedHours?, listingStatus?, delistedDate?, delistingReason? }` -- all fields except `ticker` are nullable. `currentPrice` is always the regular-session price; the optional `extendedHours` object (`{ session, price, change, changePercent }`) is present only during pre-market or after-hours. `movingAverage200Day` is `null` when fewer than 200 trading days of history exist. `reportedCurrency` ("USD", "EUR", "KRW", ...) names the currency `epsTTM` is reported in, matching the fundamentals endpoints. Cached 15 s server-side.

**Null fields are omitted, and foreign filers omit the fundamentals trio.** A null field is left out of the JSON entirely rather than serialized as `null`, so do not assume a key is present: read defensively. In particular `reportedCurrency`, `epsTTM` and `peRatio` are all absent on foreign ADR filers such as `ASML` and `TM`, while price fields and `dividendYield` are served normally. This is the same cross-currency rule as the fundamentals endpoints: the price is the USD ADR price and the filer's earnings are in home currency, so `peRatio` is withheld rather than computed across two currencies. Do not divide `currentPrice` by a non-USD `epsTTM` to fill the gap yourself.

**Delisted symbols keep quoting their last trade.** `listingStatus`, `delistedDate` and `delistingReason` are present only when the symbol is delisted or pending delisting, and absent otherwise, with the same values as `/price`. When `listingStatus` reads `"DELISTED"`, every price field in this payload is frozen at the last trade before `delistedDate` and nothing else in the response says so.

ETF tickers (e.g. `VTI`, `SPY`) return `400 ticker_is_etf` from this endpoint. Use `GET /api/v1/etfs/{ticker}/quote` instead, which returns AUM, expense ratio, NAV, and inception date rather than market cap, P/E, and EPS.

CLI equivalent: `npx -y sentisense@0.47.1 quote NVDA --json`

### GET /api/v1/stocks/{ticker}/kpis
Company-specific KPI time-series. Curated GAAP and non-GAAP metrics from earnings filings: iPhone unit sales, Tesla deliveries, AWS revenue, Netflix paid net adds, etc. **PRO (preview)** -- Free: metadata only with empty `kpis` list, PRO: full series. Returns 404 for tickers without curated coverage.

Coverage today: near-complete for the S&P 500 plus extended universe (~500 tickers). Use `GET /api/v1/stocks/with-kpis` to enumerate.

Response wrapper: `{ isPreview, previewReason, data: CompanyKpis }`.

`CompanyKpis` shape: `{ ticker, companyName, cik, lastUpdated, kpis: KpiSeries[] }`.

`KpiSeries` shape: `{ id, name, category, unit, displayFormat, chartType, values: KpiDataPoint[], sourceRef, discontinued, discontinuedNote }`. `id` is a stable per-ticker identifier (e.g. `iphone_revenue`). `category` is one of `product_revenue`, `segment_revenue`, `unit_economics`, etc. `chartType` is `bar` or `line`.

`KpiDataPoint` shape: `{ period, date, value, isEstimate }`. `period` is the fiscal label (e.g. `Q2 FY2026`); `date` is the ISO close date.

### GET /api/v1/stocks/with-kpis
List every ticker with curated KPI coverage. Sorted alphabetically. Builder discovery: render a supported-tickers page or seed a watchlist without 404-probing one ticker at a time. **Discovery (no quota cost)** -- API key required for identity/abuse tracking, but the call does not consume your monthly quota. Rate-limit-per-minute still applies.

Response: `{ count, tickers: KpiCoverageEntry[] }` where each entry is `{ ticker, companyName, lastUpdated, kpiCount }`.

```python
client = SentiSenseClient(api_key=os.environ["SENTISENSE_API_KEY"])
coverage = client.list_kpi_coverage()
print(f"{coverage.count} tickers covered")
for entry in coverage.tickers[:5]:
    print(f"  {entry.ticker}: {entry.kpiCount} KPIs (refreshed {entry.lastUpdated})")
```

### GET /api/v1/stocks/{ticker}/kpis/types
Lightweight KPI metadata tuples for a ticker, without the full series payload. Mirrors `/api/v1/insights/stock/{ticker}/types`. Useful for letting an agent or UI decide what to fetch before committing to the heavy data call. **Discovery (no quota cost)** -- API key required, no quota burn.

Response: bare array of `{ id, name, category, chartType }`. Returns 404 if the ticker has no curated KPIs.

```python
types = client.get_kpi_types("AAPL")
for t in types:
    print(f"  {t.id} ({t.chartType}): {t.name}")
```

---

## Entities API (`/api/v1/kb`)

### GET /api/v1/kb/entities/search
Search the SentiSense ontology for the people, companies, products, and organizations SentiSense tracks, and get the handle to query their metrics. **Public** (API key required).

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `q` | string | Yes | - | Name, alias, ticker, or slug fragment (case-insensitive, minimum 2 characters) |
| `type` | string | No | all | `company`, `country`, `etf`, `organization`, `person`, `product`, `topic` |
| `limit` | int | No | 10 | Max results (capped at 25) |

**Response:** array of `{name, urlSlug, type, ticker}` matches, best first. `ticker` is null for entities without one. Feed the `urlSlug` (or `ticker`) into the Metrics API `{entityId}` parameter:

```
GET /api/v1/kb/entities/search?q=pelosi -> [{"name": "Nancy Pelosi", "urlSlug": "Nancy-Pelosi", "type": "person", "ticker": null}]
GET /api/v2/metrics/entity/Nancy-Pelosi/metric/sentiment
```

People, products, and organizations have the same metrics surface as stocks, so this unlocks queries like a politician's mention volume, a CEO's SentiSense Score (`.../entity/Jensen-Huang/metric/sentisense`), or crowd sentiment on a product versus its parent ticker.

### GET /api/v1/kb/entities/popular
Curated list of high-profile tracked entities (major CEOs, political figures, the Federal Reserve). **Public** (API key required). Returns `{displayName, type, urlSlug, relatedStock}` entries; use as an autocomplete seed list without issuing a search.

## Metrics API (`/api/v2/metrics`)

Time series metrics for stocks and entities: mentions, sentiment, social dominance, and more. The `{entityId}` path segment accepts a stock ticker (e.g. `AAPL`) or an entity `urlSlug` (e.g. `Nancy-Pelosi`); both are case-insensitive, and a ticker-shaped identifier always means the listed company. Discover handles with `GET /api/v1/kb/entities/search?q=` or `GET /api/v1/stocks/{ticker}/entities`. An unknown identifier returns `404 entity_not_found` with up to three `suggestions`.

Which handle to store: the `urlSlug` is the quick, memorable one and is what discovery hands you. For a long-lived reference, such as a tracker that must keep working if an entity is renamed, store the entity `id` in URL-safe dashed form instead (replace `/` with `-`, e.g. `kb-person-65`). Both forms resolve on every endpoint that takes an `{entityId}`.

Every metric type (`mentions`, `sentiment`, `sentisense`, `social_dominance`) is available on the Free tier: no PRO subscription needed. All metrics endpoints are **Quota-gated**: an API key is required and each request counts against your monthly quota (Free: 1,000 requests/month; PRO: no monthly cap). Per-minute rate limits apply on every tier.

### GET /api/v2/metrics/entity/{entityId}/metric/{metricType}
Time series metric data for a stock or entity. **Quota-gated** -- all metric types (`mentions`, `sentiment`, `sentisense`, `social_dominance`) are available on the Free tier.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `entityId` | path | Yes | - | Stock ticker (e.g., `AAPL`) or entity `urlSlug` (e.g., `Nancy-Pelosi`) |
| `metricType` | path | Yes | - | `mentions`, `sentiment`, `sentisense`, `social_dominance` |
| `startTime` | long | No | 7 days ago | Epoch milliseconds |
| `endTime` | long | No | now | Epoch milliseconds |
| `maxDataPoints` | int | No | - | Downsample to N data points |

**Response:** an array of points ordered ascending by `timestamp`. Each point exposes a flat `value` scalar alongside the full `metricValue` object:

```json
[
  {
    "timestamp": 1780372800000,
    "metricType": "SENTIMENT",
    "value": 0.42,
    "metricValue": { "type": "ValueMetricValue", "valueType": "MEAN", "value": { "value": 0.42 } }
  }
]
```

Read the scalar from the flat `value` (the polarity for `sentiment`, the count for `mentions`). It saves you walking the nested `metricValue.value` (count metrics) or `metricValue.value.value` (value metrics), whose depth varies by metric type. A point with no reading omits `value`. To derive the current reading and its change: points are time-ascending, so the current value is the last point's `value`, and the change is the last point's `value` minus the prior point's (or minus the first point's for the whole window). A window with 0 or 1 point has no derivable trend, so widen `startTime` rather than reporting a change.

### GET /api/v2/metrics/entity/{entityId}/distribution/{metricType}
Distribution of a metric across a dimension (e.g., mentions by source). **Quota-gated**, available on the Free tier.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `entityId` | path | Yes | - | Stock ticker or entity `urlSlug` |
| `metricType` | path | Yes | - | Metric type key |
| `dimension` | string | Yes | - | Dimension to slice by (e.g., `source`) |
| `startTime` | long | No | 7 days ago | Epoch milliseconds |
| `endTime` | long | No | now | Epoch milliseconds |

### GET /api/v2/metrics/entity/{entityId}/metric/{metricType}/mean-by/{dimension}
Mean of a metric per dimension value over a time window (e.g., per-source mean sentiment). **Quota-gated**, available on the Free tier.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `entityId` | path | Yes | - | Stock ticker or entity `urlSlug` |
| `metricType` | path | Yes | - | Metric type key (e.g., `sentiment`) |
| `dimension` | path | Yes | - | Dimension to group by (e.g., `source`) |
| `startTime` | long | No | 7 days ago | Epoch milliseconds |
| `endTime` | long | No | now | Epoch milliseconds |

Response: flat map of dimension value to mean, e.g. `{ "NEWS": 0.42, "REDDIT": -0.05 }`. For sentiment by source, each value is the average of that source's daily mean readings inside the window; a window with no data returns `{}`. Returns `400` for an unknown metric type or when `startTime` is after `endTime`.

### GET /api/v2/metrics/entity/{entityId}/metric/{metricType}/slices
Available slice dimensions for a metric. **Quota-gated**, available on the Free tier.

### GET /api/v2/metrics/entity/{entityId}/baselines/{metricType}
Historical and peer baselines for a metric. **Quota-gated**, available on the Free tier.

---

## Market Sentiment API (`/api/v1/sentiment`)

Market-wide sentiment structure: which way tone leans by sector, and how widely that lean is shared. Both endpoints serve a precomputed daily snapshot, so serving never recomputes and the values move once a day. Both are **Quota-gated** (API key required, each call counts against your monthly quota), take **no parameters**, and return their payload **flat**, with no `{isPreview, previewReason, data}` wrapper.

Read tone here as market-relative. News and social tone carries a large structural positive skew as a genre, so an absolute sector reading is bullish almost every day and says little on its own. What carries information is a sector's distance from the market's own tone.

### GET /api/v1/sentiment/sectors
The 11 GICS sectors measured against the market's own tone, with the most bullish and most bearish member stock per sector. No parameters.

Response: `{schemaVersion, generatedAt, asOf, narrative, marketConsensusRatio, sectors: [...]}`. `generatedAt` is epoch seconds, `asOf` is the ISO `YYYY-MM-DD` day the snapshot covers, `narrative` is a ready-to-print one-line summary, and `marketConsensusRatio` is the whole covered universe's directional-consensus ratio, the baseline every sector is measured against.

```json
{
  "schemaVersion": "1.0",
  "generatedAt": 1787177768,
  "asOf": "2026-08-19",
  "narrative": "As of 2026-08-19, Energy runs hottest versus the market's own tone, across 1028 covered US stocks.",
  "marketConsensusRatio": 0.3259,
  "sectors": [
    {
      "sector": "Energy",
      "meanSentiment": 0.2086, "label": "Bullish",
      "meanScore": 4.6723, "scoreLabel": "Neutral",
      "consensusRatio": 0.4359, "consensusVsMarket": 0.11,
      "consensusLabel": "Hotter than market",
      "bullMentions": 844, "bearMentions": 331,
      "stockCount": 52, "totalMentions": 339,
      "topStock": {"ticker": "APA", "value": 0.9},
      "bottomStock": {"ticker": "MUR", "value": -0.4}
    }
  ]
}
```

Four field notes worth reading before rendering any of it:

- **`consensusVsMarket` is the value to rank or color by.** It is `consensusRatio` minus `marketConsensusRatio`. A negative value means **cooler than the market**, not bearish; `consensusLabel` already carries the safe wording ("Hotter than market", "In line with market", "Cooler than market").
- **`meanSentiment` and `meanScore` are different scales.** The first is polarity on [-1, 1]; the second is the SentiSense Score, open-ended and banded by `scoreLabel`. Do not compare them or plot them on one axis. `consensusRatio` is a tone ratio and is not a Score either, so do not run it through the Score bands.
- **`stockCount` and `totalMentions` are confidence cues.** A sector carrying a handful of covered names is a thin reading; show the count next to the tile.
- **`topStock` and `bottomStock`** are the sector's most bullish and most bearish member by polarity, each `{ticker, value}`, ready for a drill-down link.

### GET /api/v1/sentiment/breadth
The sentiment analogue of the advance/decline line: across the covered universe, what share of stocks is bullish versus bearish, today and daily back through the backfilled history. No parameters.

Response: `{schemaVersion, generatedAt, asOf, minMentions, latest: {...}, series: [...]}`. `latest` is today's bucket, `series` is the daily history oldest to newest (the stacked distribution chart), and `minMentions` is the mention floor a stock must clear to be counted at all.

```json
{
  "schemaVersion": "1.0",
  "generatedAt": 1787177768,
  "asOf": "2026-08-19",
  "minMentions": 5,
  "latest": {
    "date": "2026-08-19",
    "coveredStocks": 459, "totalMentions": 7984,
    "bullish": 318, "neutral": 76, "bearish": 65,
    "bullishPct": 69.28, "neutralPct": 16.56, "bearishPct": 14.16,
    "netBreadth": 55.12,
    "bullishMentionPct": 76.32, "neutralMentionPct": 14.4, "bearishMentionPct": 9.28,
    "sentimentDispersion": 0.2884
  },
  "series": [{"date": "2026-07-02", "...": "same shape as latest"}]
}
```

Every bucket carries the same classification under two weightings, and mixing them is the easy mistake. `bullish` / `neutral` / `bearish` and their `*Pct` are **stock-weighted**: one vote per covered stock, the true advance/decline analogue. `bullishMentionPct` / `neutralMentionPct` / `bearishMentionPct` are **mention-weighted**: the same votes weighted by how much each stock is being talked about. The two diverge when a few heavily discussed names lean against the crowd, which is itself the interesting reading.

- `netBreadth` is `bullishPct` minus `bearishPct`, in percentage points on [-100, 100]. It says which way the market leans.
- `sentimentDispersion` is the spread of per-stock polarity across that same universe. High means the tape is splitting name by name (a stock-picker's market), low means one shared mood is washing over everything. It says how much the market agrees with itself, which is a different question from which way it leans. Null when fewer than two stocks qualify.
- `coveredStocks` is the denominator and it moves day to day with news volume, so compare percentages across days, never raw counts.

---

## Market Mood API (`/api/v2/market-mood`)

SentiSense's proprietary composite market sentiment index. Combines social sentiment, market direction, risk appetite, social momentum, S&P 500 trend, and options flow signals into a single 0-100 score with sector breakdown. **Free (API key required).** Free for all tiers, but anonymous calls return 401 api_key_required.

### GET /api/v2/market-mood
Composite market sentiment score with history and sector breakdown.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `days` | int | No | 180 | Days of history to return |

Response shape:

```json
{
  "market": {
    "currentScore": 62.88,
    "phase": "Optimism",
    "weeklyChange": -2.3,
    "signals": [
      {"key": "social_sentiment", "label": "Social Sentiment", "value": 54.95, "change": -1.2},
      {"key": "market_direction", "label": "Market Direction", "value": 71.0, "change": 3.1},
      {"key": "fear_gauge", "label": "Risk Appetite", "value": 58.4, "change": null},
      {"key": "social_momentum", "label": "Social Momentum", "value": 62.1, "change": -0.5},
      {"key": "spy_trend", "label": "S&P 500 Trend", "value": 68.9, "change": 2.0},
      {"key": "options_flow", "label": "Options Flow", "value": 57.3, "change": 1.4}
    ],
    "history": [
      {"date": "2026-04-01", "timestamp": 1743465600000, "score": 65.2,
       "socialSentiment": 56.1, "marketDirection": 72.0, "fearGauge": 61.0,
       "socialMomentum": 63.5, "spyTrend": 70.0, "optionsFlow": 59.8}
    ]
  },
  "sectors": {
    "Technology": {"currentScore": 71.2, "phase": "Greed", "weeklyChange": 1.5},
    "Healthcare": {"currentScore": 48.3, "phase": "Neutral", "weeklyChange": -3.1}
  }
}
```

**Phase interpretation** (`market.phase` and each sector's `phase`, by score): 0-15 Extreme Fear, 16-30 Fear, 31-45 Anxiety, 46-55 Neutral, 56-70 Optimism, 71-85 Greed, 86-100 Extreme Greed. `phase` is `"---"` when the score is null.

`signals[]` only lists signals present in the latest reading, so key off `key`, not array position or length.

**Node SDK:**
```javascript
const mood = await client.marketMood.get();
console.log(mood.market.currentScore, mood.market.phase);
```

CLI equivalent: `npx -y sentisense@0.47.1 mood --json`

---

## Documents & News API (`/api/v1/documents`)

> **Note:** Document responses include a `url` field but **no headline or title text**. The API provides derived analytics (sentiment, entities, reliability), not source content. The `sourceName` field identifies the publisher. If your application needs to display titles, the `url` field links to the original source. Any content retrieval from source URLs is your application's independent action, subject to the source platform's terms. See our [API Terms of Service](https://sentisense.ai/agreement/API-Terms-of-Service.pdf).

### GET /api/v1/documents/ticker/{ticker}
News and social posts for a stock with sentiment scores. **Public.**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `source` | string | No | all | `NEWS`, `REDDIT`, `X`, `SUBSTACK`, `YOUTUBE` |
| `days` | int | No | 7 | Lookback in days (1-365) |
| `hours` | int | No | - | Lookback in hours, 1-8760 (overrides days). Out-of-range values return `400` |
| `limit` | int | No | 200 | Max results (capped at 200) |

Response: `{ documents: [...], totalCount, searchTicker, source, startDate, endDate }`. Each document includes: `id`, `url`, `source`, `sourceName`, `published`, `averageSentiment`, `reliability`, `sentiment[]`. Per-entity sentiment classifies each mentioned entity as POSITIVE/NEGATIVE/NEUTRAL.

### GET /api/v1/documents/ticker/{ticker}/range
Documents within a date range. **Public.**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `startDate` | ISO date | Yes | e.g., `2025-01-01` |
| `endDate` | ISO date | Yes | e.g., `2025-01-31` |
| `source` | string | No | Filter by source |
| `limit` | int | No | Max results (capped at 200) |

### GET /api/v1/documents/entity/{entityId}
Documents mentioning an ontology entity. **Public.** Use URL-safe format: `kb-person-67` instead of `kb/person/67`.

### GET /api/v1/documents/search
Smart search with natural language queries. **Public.**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `query` | string | Yes | - | e.g., `AAPL earnings`, `Elon Musk TSLA` |
| `source` | string | No | all | Filter by source |
| `days` | int | No | 7 | Lookback in days |
| `limit` | int | No | 200 | Max results (capped at 500) |

### GET /api/v1/documents/source/{source}
Latest documents from a specific source. **Public.**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `source` | path | Yes | `NEWS`, `REDDIT`, `X`, `SUBSTACK`, `YOUTUBE` |
| `days` | int | No | Lookback in days |
| `limit` | int | No | Max results (capped at 500) |
| `sort` | string | No | `latest` (default, newest first) or `top` (reliability-first: recent documents are grouped into freshness buckets and ranked by publisher reliability within each bucket, so high-authority publishers surface first). Any other value returns `400`. |

### GET /api/v1/documents/stories
AI-curated news story clusters. **Public.**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `limit` | int | No | 20 | Max stories (capped at 50) |
| `filterHours` | int | No | none | Lookback window in hours, e.g. `720` for 30 days. This is the real lookback control for this endpoint. The window counts from when a story STARTED breaking, not from its latest article, so a running story with fresh coverage but an older start falls out of short windows (an empty short window can be correct). Setting it also switches ordering to curation score instead of the day-bucketed default. |
| `days` | int | No | 7 | Accepted but has no effect on the response; ignored server-side. Use `filterHours` instead (the CLI's `--days` flag sends `filterHours` for you). |
| `offset` | int | No | 0 | Pagination offset |

Response: Story objects with a top-level `id` AND `clusterId` (both equal to the cluster id -- pass either to `/documents/stories/{clusterId}`), plus `cluster.title`, `cluster.averageSentiment`, `tickers`, `displayTickers`, `impactScore` (0-10), `brokeAt` (epoch seconds, nullable), `cluster.clusteredAt` (epoch seconds). Use `tickers` (bare symbols, e.g. `["AAPL"]`) programmatically; `displayTickers` are human-formatted labels (e.g. `["Apple Inc (AAPL)"]`) for display only, do not parse symbols out of them. The `cluster.createdAt` field (epoch millis) is deprecated and will be removed on or after 2026-08-16; use `cluster.clusteredAt`.

CLI equivalent: `npx -y sentisense@0.47.1 news --days 2 --limit 20 --json` (the CLI's `--days` sends `filterHours` = days x 24; needs 0.45.0 or newer)

### GET /api/v1/documents/stories/ticker/{ticker}
News stories for a specific stock. **Public.** Takes `limit` only (default 5, capped at 20): there is no lookback window here, so `days` / `hours` / `filterHours` are ignored. Use `/documents/stories` with `filterHours` for a freshness window.

CLI equivalent: `npx -y sentisense@0.47.1 news NVDA --limit 5 --json`

### GET /api/v1/documents/stories/{clusterId}
Full detail for a single story cluster. **Public** -- Free: 10 story views/month, PRO: unlimited. Each list item from `/stories` and `/stories/ticker/{ticker}` carries a top-level `id` AND a `clusterId` (both equal to the cluster id); pass either one here as `{clusterId}`.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `clusterId` | path | Yes | Story cluster ID (from `/stories` or `/stories/ticker/{ticker}`) |

Response: a flat story object (no `{isPreview, data}` wrapper) containing SentiSense-generated content and derived data only: `id`, `createdAt`, `lastUpdatedAt`; AI-written content (`title`, `summarizedContent`, `narrativeBody`, `bullishView`, `bearishView`, `aspectPerspectives`); `citationLinks` (map of `docN` markdown references in `narrativeBody` to public article URLs); computed metrics (`averageSentiment`, `momentumScore`, `aiConfidence`); source metadata (`clusterSize`, `sourcesList`, `primaryCategory`, `dominantEventType`, `publishersList`, `primaryPublisher`, `topPublishers`); `tickers`, `displayTickers`, `primaryEntityNames`, `relatedEntities`; `archived`, `totalDocuments`.

Consistent with the documents policy above, publisher headlines, article text, and images are never included: the `title` and narrative are AI-generated by SentiSense, and `citationLinks` point to the original sources.

---

## Institutional Flows API (`/api/v1/institutional`)

Data from SEC 13F-HR filings. Filer categories: `INDEX_FUND`, `HEDGE_FUND`, `ACTIVIST`, `PENSION`, `BANK`, `INSURANCE`, `MUTUAL_FUND`, `SOVEREIGN_WEALTH`, `ENDOWMENT`, `CONGLOMERATE`, `OTHER`.

**Important:** `/flows` no longer requires `reportDate`: omit it to get the latest available quarter (the response is labeled with `isPending` + filer coverage), or pass one explicitly for a specific quarter. The other institutional endpoints (except `/quarters`) still require a `reportDate`. **When you need one, call `GET /quarters` first** to get valid dates; do not hardcode them. For a fully-filed quarter, use the `reportDate` from the first quarter with `pending:false` (the most-recent quarter is `pending:true` while inside the 45-day 13F filing window and holds only early filers; see `/quarters` below).

### GET /api/v1/institutional/quarters
Available 13F reporting quarters. **Public.** Call this first.

Response: array of `{ value, label, reportDate, pending }` objects sorted newest-first. `pending` is a boolean. Use the `reportDate` of the first quarter with `pending:false`; the most-recent quarter is `pending:true` while inside the 45-day 13F filing window and holds only early filers. Pass that `reportDate` (e.g., `"2025-12-31"`) when calling other institutional endpoints.

### GET /api/v1/institutional/flows
Aggregate institutional buying/selling per ticker. **Public (preview)** -- Free: top 5, PRO: full data.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `reportDate` | ISO date | No | Quarter to fetch (e.g., `2025-12-31`). Omit to get the latest available quarter, including a still-open one; the response labels it with `isPending` + filer coverage. Pass a `reportDate` from `/quarters` for a specific quarter. |
| `limit` | int | No | Max results per direction (default: 50, max: 100) |

Response: `{ isPreview, previewReason, data: { inflows: [...], outflows: [...], reportDate, isPending, filerCount, baselineFilerCount } }`. `reportDate` is the quarter served (useful when you omitted the param). `isPending` is true when that quarter is still inside the 45-day 13F filing window, so only early filers are represented; when pending, `filerCount` and `baselineFilerCount` give the coverage (e.g., 578 of 8789 filers) and are null otherwise. Each flow includes net share changes, new/closed positions, and per-category breakdowns (indexFundNetChange, hedgeFundNetChange, etc.). Flows are ranked by `dollarFlowUsd` (= `netSharesChange × avgClosePrice`): inflows DESC, outflows ASC. `avgClosePrice` is null and `dollarFlowUsd` is 0 for tickers without a cached quarterly price; clients should fall back to `netSharesChange` for those rows.

CLI equivalent: `npx -y sentisense@0.47.1 flows --limit 50 --json`

### GET /api/v1/institutional/holders/{ticker}
Institutional holders for a stock. **Public (preview)** -- Free: top 5, PRO: full data.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `reportDate` | ISO date | Yes | Quarter end date |
| `limit` | int | No | Page size (1-1000). When present, returns a sorted page plus `returnedCount`/`offset` and a `notableChanges` summary; when omitted, returns the full list (legacy). Mega-caps have 5,000+ holders, so paging is recommended. |
| `offset` | int | No | Page start within the sorted list (default 0; used with `limit`) |
| `sortBy` | string | No | `shares` (default), `valueUsd`, or `sharesChangePct` (used with `limit`) |
| `sortDir` | string | No | `desc` (default) or `asc` (used with `limit`) |

Response: `{ isPreview, previewReason, data: { ticker, companyName, reportDate, totalInstitutionalShares, holderCount, holders: [...] } }`. The holder list is nested at `data.holders` (not `data` directly). Each holder includes filer name, category, shares, value, change type (NEW/INCREASED/DECREASED/SOLD_OUT/UNCHANGED). `holderCount` is always the full-quarter count; on paged requests `data` also carries `returnedCount`, `offset`, and `notableChanges` (`{count, top}`: holders with a 10%+ change on 10k+ shares, top 5 by dollar impact). Free-tier previews return the top 5 rows and omit `returnedCount`, `offset`, and `notableChanges` even when `limit` is passed.

CLI equivalent: `npx -y sentisense@0.47.1 flows NVDA --json` (it reads `/quarters` first and passes the latest settled `reportDate`)

### GET /api/v1/institutional/activist
Activist investor positions (NEW or INCREASED stakes). **Public (preview)** -- Free: top 3, PRO: full data.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `reportDate` | ISO date | Yes | Quarter end date |

### GET /api/v1/institutional/bonds
Convertible bond flows grouped by base ticker. **Public (preview)** -- Free: top 3, PRO: full data.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `reportDate` | ISO date | Yes | Quarter end date |

### GET /api/v1/institutional/options
Institutional options activity with call/put breakdown. **Public (preview)** -- Free: top 3, PRO: full data.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `reportDate` | ISO date | Yes | Quarter end date |

### GET /api/v1/institutional/institutions
Discover the universe of institutions: paginated, AUM-ranked list of filers (slug + metadata) so you can find what to query without knowing slugs upfront. Each institution is rolled up by parent filer, so a multi-filer manager (e.g. Vanguard) appears once with combined AUM. Summary only; use `/institution/{slugOrCik}` for full holdings. **API key required, quota-exempt** (per-minute rate limits still apply); full list for every key holder.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `category` | string | No | Filer category: `INDEX_FUND`, `HEDGE_FUND`, `ACTIVIST`, `PENSION`, `BANK`, `INSURANCE`, `MUTUAL_FUND`, `SOVEREIGN_WEALTH`, `ENDOWMENT`, `CONGLOMERATE`, `OTHER` |
| `minAumUsd` | long | No | Minimum total AUM in USD (e.g. `10000000000`) |
| `limit` | int | No | Page size (default: 50, max: 200) |
| `offset` | int | No | Pagination offset (default: 0) |
| `sort` | string | No | `aumDesc` (default), `aumAsc`, or `nameAsc`. Deterministic ordering, so pagination is stable. |
| `quarter` | string | No | AUM snapshot quarter as `YYYYQN` (e.g. `2026Q1`); defaults to latest. |

Response: `{ isPreview, previewReason, data: { quarter, totalCount, offset, limit, institutions: [...] } }`. `isPreview` is always false here. Each institution: `cik, urlSlug, displayName, filerCategory, totalValueUsd, holdingsCount, multiCikRollup, childCikCount`. Bad inputs (unknown category/sort, negative offset/minAumUsd, quarter with no data) return 400.

### GET /api/v1/institutional/institution/{slugOrCik}
Full profile, summary stats, and current-quarter equity holdings for a specific institutional filer. Resolved by URL slug (e.g. `Berkshire-Hathaway`) or numeric CIK (e.g. `1067983`). **PRO (preview)** -- Free: profile + top 10 holdings, PRO: full holdings array. Returns 404 if the slug or CIK is unknown.

Response: `{ isPreview, previewReason, data: { filerCik, displayName, urlSlug, filerCategory, totalValueUsd, holdingsCount, latestReportDate, quartersTracked, newPositions, increasedPositions, decreasedPositions, soldOutPositions, multiCikRollup, childCikCount, childCiks, holdings: [...] } }`. `multiCikRollup`/`childCikCount`/`childCiks` describe parent/subsidiary rollups (e.g. Vanguard) and are present for all tiers (`childCiks` is null when not a rollup). Holding objects include `ticker, companyName, shares, valueUsd, changeType, sharesChange, sharesChangePct, portfolioWeight`.

---

## Insider Trading API (`/api/v1/insider`)

SEC Form 4 insider trading data: track buys, sells, awards, and exercises by company officers, directors, and 10%+ shareholders. Updated daily. Includes cluster buy detection (a historically bullish signal).

**Insider relationships:** `OFFICER`, `DIRECTOR`, `TEN_PCT_OWNER`, `OTHER`. Each filer also has independent `officer`, `director`, `tenPctOwner` booleans (a person can be both officer and director).

**Transaction types:** `BUY`, `SELL`, `EXERCISE`, `AWARD`, `GIFT`, `OTHER`. To count open-market activity, filter `transactionType` to `BUY` or `SELL`; `AWARD` (grants), `GIFT`, and `EXERCISE` are not open-market trades and should be excluded from a buys/sells tally. The `transactionType` filter alone misses one case: rows with raw `transactionCode` `F` (shares withheld to cover taxes on vesting) arrive typed `SELL`, so drop code-F rows from sell tallies too; on names with heavy stock compensation they can be most of the reported selling. This applies when you tally rows yourself from `/insider/trades/{ticker}`, which returns every filed row untouched. The server-side rollup at `/insider/activity` already excludes code F from its sells, so do not subtract it a second time there. Sanity-check `totalValue` against `sharesTransacted` times `pricePerShare` before headlining a dollar figure. Note the insider endpoint uses `BUY`/`SELL`, NOT the politician endpoint's `PURCHASE`/`SALE` vocabulary (a filter written for one returns zero on the other).

### GET /api/v1/insider/activity
Market-wide insider buying and selling aggregated by ticker. **Public (preview)** -- Free: top 5, PRO: full data.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `lookbackDays` | int | No | 90 | Days to look back (1-365) |

Response (FREE tier): `{ isPreview: true, previewReason: "PRO_REQUIRED", data: { buys: [...], sells: [...] } }`. PRO: `{ isPreview: false, previewReason: null, data: { buys: [...], sells: [...] } }`. Each entry: `ticker`, `companyName`, `tradeCount`, `insiderCount`, `totalShares`, `totalValue`, `latestDate`, `latestInsider`, `latestTitle`.

### GET /api/v1/insider/trades/{ticker}
Insider transactions for a specific stock, newest first. **Public (preview)** -- Free: top 5, PRO: full data.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `ticker` | path | Yes | - | Stock ticker (e.g., `AAPL`) |
| `lookbackDays` | int | No | 90 | Days to look back (1-365) |

Response: `{ isPreview: bool, previewReason: string|null, data: [...] }`. Free: top 5 trades, PRO: full list. Each trade: `ticker`, `companyName`, `insiderName`, `insiderTitle`, `insiderRelation`, `officer`, `director`, `tenPctOwner`, `transactionDate`, `filedDate`, `transactionCode`, `transactionType`, `securityTitle`, `sharesTransacted`, `pricePerShare`, `totalValue`, `sharesOwnedAfter`, `directOwnership`, `rule10b51`.

```python
client = SentiSenseClient(api_key=os.environ["SENTISENSE_API_KEY"])
trades = client.get_insider_trades("AAPL", lookback_days=90)
for t in trades.data:
    print(f"{t['transactionDate']} {t['insiderName']} {t['transactionType']} {t['sharesTransacted']} shares")
```

CLI equivalent: `npx -y sentisense@0.47.1 insiders AAPL --days 90 --json`

### GET /api/v1/insider/cluster-buys
Cluster buy signals: stocks where 3+ distinct insiders purchased recently. **Public (preview)** -- Free: top 5, PRO: full data.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `lookbackDays` | int | No | 90 | Days to look back (1-365) |

Response: `{ isPreview: bool, previewReason: string|null, data: [...] }`. Free: top 5 signals, PRO: full list. Each entry: `{ ticker, companyName, insiderCount, tradeCount, totalShares, totalValue, firstBuyDate, lastBuyDate }`.

---

## Politicians Trading API (`/api/v1/politicians`)

Congressional STOCK Act trading disclosures: purchases, sales, and exercises by U.S. Senators and Representatives. Updated daily from official filings.

**Chambers:** `SENATE`, `HOUSE`.

**Transaction types:** `PURCHASE`, `SALE`, `EXCHANGE`, `OTHER`.

**Amount ranges:** STOCK Act disclosures report dollar amounts as ranges (e.g., "$1,001 - $15,000"), not exact values. The API returns the raw range string plus parsed `amountMin`/`amountMax`.

### GET /api/v1/politicians/activity
Recent congressional trades across all politicians, paged, sorted by disclosure date (most recently disclosed first) and tie-broken to a total order so `limit`/`offset` page without dropping or repeating rows. "Recent" means recently disclosed, not recently traded: a filing can reveal a transaction made up to 45 days earlier. **Public (preview)** -- Free: top 5, PRO: pages the whole window.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `lookbackDays` | int | No | 90 | Trailing window applied to the disclosure date (1-365) |
| `limit` | int | No | 200 | Rows per page. Above 500 is clamped, not rejected. Returns `400 invalid_limit` below 1 |
| `offset` | int | No | 0 | Rows to skip, for paging |

Response: `{ isPreview, previewReason, totalCount, data: [...] }`. `totalCount` is the size of the whole window, not the page, so `offset + data.length < totalCount` means there is another page. Each trade: `politicianName`, `firstName`, `lastName`, `chamber`, `party`, `state`, `bioguideId`, `imageUrl`, `ticker`, `assetDescription`, `assetType` (`Stock`, `ETF`, or `Stock Option`), `assetMetadata` (object: `null`, or `{kind:"OPTION", optionType, strikePrice, expirationDate}` for options), `transactionType`, `transactionDate`, `disclosureDate`, `disclosureDelayDays`, `amountRange`, `amountMin`, `amountMax`, `owner`, `urlSlug`, `sentiSenseScore`. That last field is reserved: it is present on every row and currently `null` on all of them, so read the ticker's Score from `/stocks/{ticker}/sentiment` rather than building on it here.

```python
client = SentiSenseClient(api_key=os.environ["SENTISENSE_API_KEY"])
activity = client.get_politician_activity(lookback_days=90)
for trade in activity.data:
    print(f"{trade['politicianName']} ({trade['party']}-{trade['state']}): {trade['transactionType']} {trade['ticker']}")
```

CLI equivalent: `npx -y sentisense@0.47.1 congress --days 90 --limit 200 --json` (no `offset`, so the CLI reads the first page only)

### GET /api/v1/politicians/filings/{ticker}
Congressional trades for a specific stock, sorted by disclosure date (most recently disclosed first). **Public (preview)** -- Free: top 3, PRO: full data.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `ticker` | path | Yes | - | Stock ticker (e.g., `NVDA`) |
| `lookbackDays` | int | No | 90 | Trailing window applied to the disclosure date (1-365) |

Response: same preview wrapper and trade object schema as `/activity`.

CLI equivalent: `npx -y sentisense@0.47.1 congress NVDA --days 90 --json`

### GET /api/v1/politicians/members
All tracked politicians with trading summaries, sorted by total trade count. **Public (preview)** -- Free: top 5, PRO: full list.

No parameters.

Response: `{ isPreview, previewReason, data: [...] }`. Each entry: `urlSlug`, `displayName`, `firstName`, `lastName`, `chamber`, `party`, `state`, `bioguideId`, `imageUrl`, `totalTrades`, `purchaseCount`, `saleCount`, `latestTradeDate`.

### GET /api/v1/politicians/directory
Every tracked member of Congress and the slug that identifies them, so you can find who is worth querying without knowing slugs upfront. Summary only, no trade data. **API key required**, not tier-gated (FREE and PRO get the same full response), and it does not count against your monthly quota.

Unlike `/members`, which lists who currently holds office, the directory lists everyone we track, including members who have left Congress. Those carry `former: true` and `servedUntil`.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `q` | string | No | - | Case-insensitive filter across display name, state and slug (max 100 chars) |
| `limit` | int | No | 50 | Results per page (max 200) |
| `offset` | int | No | 0 | Results to skip, for paging |

Response: `{ isPreview, previewReason, data: { members: [...], totalCount } }`. Each member: `urlSlug`, `displayName`, `chamber`, `party`, `state`, `bioguideId`, `imageUrl`, `former`, `servedUntil`. Read `totalCount` to page: `limit` caps at 200, so a larger value is silently clamped rather than rejected.

Use this to resolve a name to a slug, then call `/politicians/member/{slug}` for that member's filings.

### GET /api/v1/politicians/member/{slug}
Detailed profile for a single politician: summary stats, recent trades, and top tickers. **Public (preview)** -- Free: preview-wrapped, PRO: full detail.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `slug` | path | Yes | - | Politician URL slug (from `/members`) |
| `limit` | int | No | 200 | Trades per page in `recentTrades`. Above 500 is clamped to 500; below 1 returns 400 `invalid_limit` |
| `offset` | int | No | 0 | Trades to skip, for paging the history. Negative returns 400 `invalid_offset` |

Response: `{ isPreview, previewReason, totalCount, data: { profile: {...}, recentTrades: [...], topTickers: [...] } }`.

`recentTrades` is one page of the member's history, newest transaction first, not all of it. Most members disclose a few dozen trades and arrive complete in the default page; a handful have disclosed thousands. `totalCount` is the whole history, so `offset + recentTrades.length < totalCount` means there is another page. `profile` and `topTickers` always describe the whole history whatever page you ask for, so `profile.totalTrades` does not shrink with a small `limit`.

---

## Insights API (`/api/v1/insights`)

AI-generated signals for stocks and the overall market. Each insight identifies a specific pattern: insider cluster buying, institutional position changes, volume anomalies, sentiment baseline deviations, and more. Most lists are sorted by urgency then confidence; the per-stock endpoint (`/stock/{ticker}`) is ranked by importance (relevance, confidence, and recency) so fresh signals lead.

**Insight fields:** `insightId`, `insightType`, `category` (`SENTIMENT`/`TRENDING`/`TECHNICAL`/`FUNDAMENTAL`/`PERSONALIZED`), `insightText`, `confidence` (0.0-1.0), `urgency` (`low`/`medium`/`high`), `generatedAt` (epoch seconds), `docRefs` (`[{url, type}]`).

**Response shape (all tiers):** `{ isPreview, previewReason, data: [...] }`. Free: top N insights, PRO: full list.

### GET /api/v1/insights/stock/{ticker}
AI insights for a specific stock, ranked by importance (relevance, confidence, and recency); `data[0]` is the top insight. **Public (preview)** -- Free: top 3, PRO: full list.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `ticker` | path | Yes | - | Stock ticker (e.g., `AAPL`) |
| `urgency` | string | No | - | Filter by urgency: `low`, `medium`, or `high` |
| `insightType` | string | No | - | Filter by type (e.g., `insider_buy_signal`) |

```python
client = SentiSenseClient(api_key=os.environ["SENTISENSE_API_KEY"])
result = client.get_stock_insights("AAPL", urgency="high")
for i in result.data:
    print(f"[{i['urgency'].upper()}] {i['insightType']}: {i['insightText'][:80]}")
```

CLI equivalent: `npx -y sentisense@0.47.1 insights AAPL --urgency high --json` (`--type` covers `insightType`)

### GET /api/v1/insights/stock/{ticker}/range
Per-stock insights within a date range, sorted by urgency then confidence. **PRO (preview)** -- Free: top 3, PRO: full list. Returns `400 invalid_parameter` when `startDate` is after `endDate`.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `ticker` | path | Yes | Stock ticker (e.g. `AAPL`) |
| `startDate` | ISO date | Yes | Inclusive |
| `endDate` | ISO date | Yes | Inclusive, on or after `startDate` |
| `urgency` | string | No | Filter by `low`, `medium`, or `high` |
| `insightType` | string | No | Filter by insight type |

### GET /api/v1/insights/market
Market-level AI insights: insider buying trends, institutional rotation, and top high-urgency stock signals. **Public (preview)** -- Free: top 5, PRO: full list.

No parameters required.

```python
result = client.get_market_insights()
for i in result.data:
    print(f"[{i['urgency'].upper()}] {i['insightText'][:100]}")
```

### GET /api/v1/insights/latest
Latest AI insights across all tracked stocks, newest first. **PRO (preview)** -- Free: top 5, PRO: up to `limit`.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `limit` | int | No | 50 | Max results, clamped to 1-200 |
| `urgency` | string | No | - | Filter by urgency |

### GET /api/v1/insights/user
Personalized insights for the authenticated user, biased toward their watchlist and portfolio. Falls back to market-level insights when the user has no watchlist. **API key required.** Returns 401 without credentials.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `limit` | int | No | 20 | Max results, clamped to 1-100 |
| `category` | string | No | - | Filter by category: `SENTIMENT`, `TRENDING`, `TECHNICAL`, `FUNDAMENTAL`, or `PERSONALIZED` |

Response wrapper is `{isPreview: false, previewReason: null, data: [...] }` since the endpoint is auth-required.

### GET /api/v1/insights/stock/{ticker}/types
Available insight types for a ticker. API key required. Every type listed has at least one currently servable insight, so filtering the main endpoint by a returned type always yields rows; types whose insights have all expired drop off the list.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `ticker` | path | Yes | Stock ticker (e.g., `AAPL`) |

Response: string array, e.g. `["insider_buy_signal", "institutional_position_change", "volume_anomaly_high"]`.

---

## Analyst Ratings API (`/api/v1/analyst`)

Wall Street analyst coverage: aggregate price target band, buy/hold/sell distribution, recent upgrade/downgrade actions, forward EPS estimates with earnings surprise history, and the individual analysts behind the calls -- who covers a stock, and everything one analyst has published. This is one of the most free-tier-generous surfaces in the API: free users get the price target band (`targetLow`, `targetMean`, `targetHigh`, `numberOfAnalysts`, `consensusLabel`) in full -- it powers the public projection cone -- and the entire first page (50 rows) of market-wide `/activity`. The buy/hold/sell distribution counts, full per-ticker action/estimate history, and deep `/activity` paging are PRO.

### GET /api/v1/analyst/{ticker}/consensus
Aggregate Wall Street consensus: price target band, number of covering analysts, upside-to-current, recommendation distribution. **PRO (preview)** -- Free: full price band plus the as-of stamp, no buy/hold/sell counts. PRO: full distribution.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `ticker` | path | Yes | Stock ticker (e.g. `AAPL`) |

Response: `{ isPreview, previewReason, data: { ticker, currentPrice, targetLow, targetMean, targetHigh, targetMedian, numberOfAnalysts, upsidePercent, consensusLabel, recommendationMean, strongBuy, buy, hold, sell, strongSell, updatedAt, updatedAtEpoch } }`. The five `*Buy/*Sell/hold` count fields are zero in the free preview, and `recommendationMean` and `targetMedian` are null there. Returns 404 when no analyst coverage exists for the ticker.

**The as-of stamp comes in two forms and is served on every tier, free included.** `updatedAt` is an ISO-8601 UTC instant with a `Z` suffix, to whole seconds (`"2026-09-01T21:04:59Z"`); `updatedAtEpoch` is the same moment in epoch seconds (`1788296699`). Both are absolute instants, so compare them against `now` in UTC, and prefer `updatedAtEpoch` over parsing the string. (Before 2026-09, `updatedAt` was served as a naive local-time string with no offset and read about four hours early; if you cached values from then, re-read rather than mixing the two.)

**`recommendationMean` runs 1.0 to 5.0 and is INVERTED: lower is more bullish** (1 = Strong Buy, 2 = Buy, 3 = Hold, 4 = Sell, 5 = Strong Sell). Flip the comparison when you screen or rank on it (the options put/call and skew fields run inverted too, higher = more bearish; most other fields run the intuitive direction). The mean is aggregated from a different analyst set than the five rating counts, so it will not reconcile as their weighted average. `consensusLabel` is derived from it at these cutoffs: `<=1.5` STRONG_BUY, `<=2.5` BUY, `<=3.5` HOLD, `<=4.5` SELL, else STRONG_SELL. **`numberOfAnalysts` belongs to the price target, not the ratings.** The five rating fields sum to a separate count (not every analyst publishes both, and the rating total is usually the larger). For percent-of-analysts math, divide by the sum of the five rating fields; dividing by `numberOfAnalysts` mixes the two groups and returns above 100% on many tickers.

**Analyst data refreshes as one sweep over the whole covered universe, roughly once a day, but the wall-clock time it lands drifts and is NOT anchored to the US pre-market.** The sweep is attempted several times a day and skips unless enough hours have passed since the last successful one, so the hour it completes moves from day to day. `updatedAt` is stamped when the sweep *finishes* writing, not when it started, and the sweep takes hours to walk the universe: a run that began late morning ET can carry an early-evening `updatedAt`. Two consequences worth coding for: a rating change can be up to ~24h old before it appears in `/actions` or `/activity`, and `updatedAt` advances on every sweep even when nothing about the ticker changed, so it tells you when the row was last written, never that the content is new. Read `updatedAt` rather than assuming a schedule, and diff the payload if you need to detect an actual change.

Most tickers in one sweep share an `updatedAt` to the second, so it is a good cache key for the batch. The exception: stocks that reported earnings in the last day or two get topped up on their own pass and will carry a newer `updatedAt` than the rest of the universe. Do not assume a single global timestamp covers every ticker you asked for.

**`currentPrice` on this endpoint is not the live quote.** It is the reference price captured when the analyst snapshot was written, dated by `updatedAt`, and `upsidePercent` is computed against that same reference so the band and the upside stay internally consistent. Expect it to drift from the traded price between snapshots (a few percent is normal). When you need the current regular-session price, read `currentPrice` from `/api/v1/stocks/price` or `/api/v1/stocks/{ticker}/quote` instead, where the field tracks the session and carries the standard 15-minute delay rather than a snapshot's age.

CLI equivalent: `npx -y sentisense@0.47.1 analysts AAPL --json` (this response is under `.consensus`)

### GET /api/v1/analyst/{ticker}/actions
Recent analyst upgrade/downgrade actions for a ticker, newest first. **PRO (preview)** -- Free: 3 most recent, PRO: full list.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `ticker` | path | Yes | - | Stock ticker |
| `lookbackDays` | int | No | 90 | Days of history to return |

Action object: `{ ticker, actionDate, firm, actionType (UPGRADE/DOWNGRADE/INITIATE/REITERATE/OTHER), fromGrade, toGrade }`.

**`actionType` is the research provider's own label, and it is not cross-checked against `fromGrade` and `toGrade`.** We pass it through rather than re-deriving it, so a small share of rows are internally inconsistent: an `INITIATE` that still carries a `fromGrade`, or an `UPGRADE` whose two grades are identical. Measured over a recent trailing week, about 3% of actions disagree with their own grade pair, but they arrive in bursts (one bank initiating coverage across a dozen names in a morning), so a single 50-row page can run several times that. Pick one interpretation and stay with it: **filter on `actionType`** (what the provider says the analyst did, the right choice for counting upgrades and downgrades) **or compare the grades yourself** (the right choice when you are rendering the transition to a user). Do not mix them in the same view, or you will print a row that reads "UPGRADE: Buy to Buy". If you display grades, drop the ones where `fromGrade == toGrade` rather than relabeling them.

CLI equivalent: `npx -y sentisense@0.47.1 analysts AAPL --days 90 --json` (this response is under `.actions`)

### GET /api/v1/analyst/{ticker}/estimates
Forward EPS estimates and recent earnings surprise history. **PRO (preview)** -- Free: 1 estimate (current quarter) + 2 most recent surprises, PRO: full history.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `ticker` | path | Yes | Stock ticker |

Response: `{ isPreview, previewReason, data: { estimates: [...], surprises: [...] } }`.

### GET /api/v1/analyst/activity
Market-wide recent analyst actions across all covered tickers, paged. Ordered by action date descending, ties broken by ticker then id ascending, a total order so paging is stable. **Free: the full first page** -- the first 50 rows of the window are complete data on every tier (`isPreview: false`). Depth is what PRO buys: `limit` above 50 or any `offset` past row 50 serves FREE keys their in-allowance slice as a preview (`previewReason: "PRO_REQUIRED"`) while PRO pages the whole window.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `lookbackDays` | int | No | 30 | Days of history to search |
| `limit` | int | No | 50 | Page size, capped at 500. Returns `400 invalid_limit` below 1 |
| `offset` | int | No | 0 | Rows to skip. Returns `400 invalid_offset` when negative |
| `actionTypes` | string | No | - | CSV filter on action type: any of `UPGRADE`, `DOWNGRADE`, `INITIATE`, `REITERATE`, `OTHER` (case-insensitive). Unknown values return `400 invalid_actionTypes` |

Response: `{ isPreview, previewReason, totalCount, data: [...] }`. `totalCount` is the number of actions in the whole `lookbackDays` window **after the `actionTypes` filter**, not the page size, so `offset + data.length < totalCount` means another page is available.

Roughly 70 to 110 rating actions land on a single active market day (measured across a recent trailing week; a heavy day runs a little over 100, not several hundred), and roughly 83% of all actions are `REITERATE` (an analyst confirming an unchanged rating). Weekend and holiday dates carry a handful of stragglers at most, so a 7-day window is about 500 rows, not 1,400. For actual rating changes, pass `actionTypes=UPGRADE,DOWNGRADE,INITIATE` -- otherwise the newest-first page is mostly reiterations. Since rows come back newest first, the default 50-row page is typically filled by the newest day alone, and raising `lookbackDays` by itself returns nothing new. Raise `limit` for a wider slice, or walk the window with `offset`.

Same per-action shape as `/api/v1/analyst/{ticker}/actions`.

### GET /api/v1/analyst/{ticker}/coverage
Who covers this stock and what they most recently said, grouped by firm, most recently active firm first. The one-call answer to "who covers AMD and what do they say". **PRO (preview)** -- Free: the 5 most recently active firms with every response-level count intact. PRO: all firms.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `ticker` | path | Yes | - | Stock ticker (e.g. `AMD`) |
| `lookbackDays` | int | No | 365 | Coverage window, capped at 1825. Returns `400 invalid_lookbackDays` below 1 |

Response: `{ isPreview, previewReason, data: { ticker, windowDays, asOf, firmCount, ratingOnlyFirmCount, namedAnalystCount, noteCount, attributedNoteCount, unattributedNoteCount, attributionNote, coverage: [...] } }`. `windowDays` echoes the window actually applied after clamping, so a request for 99999 comes back saying 1825. A truncated FREE response adds a top-level `totalCount` carrying the full number of covering firms; the untruncated response omits it, because nothing was withheld to count. Read `data.firmCount` when you want that number on every tier. `firmCount` counts firms that covered the ticker in the window, which means a price target note OR a rating action; `ratingOnlyFirmCount` says how many of them are here on a rating alone, so firms that published a target are `firmCount - ratingOnlyFirmCount`.

Firm row: `{ firm, analysts: [{ slug, name, noteCount, firstNote, lastNote, latestPriceTarget }], noteCount, attributedNoteCount, unattributedNoteCount, firstNote, lastNote, latestNote: { publishedDate, analyst, priceTarget, adjPriceTarget, priceWhenPosted, newsTitle, newsUrl, newsPublisher }, firmRating: { rating, priorRating, actionType, date } }`. `latestNote.analyst` is an object `{ slug, name }`, not a string, and it is null when the report named nobody. `firmRating` is null for a firm that published a price target in the window without a rating action behind it, which is common: 5 of AMD's 27 covering firms on a 180-day window.

**A firm can cover a stock without publishing a price target.** The upstream price target feed goes quiet on a desk while that desk's rating actions keep arriving, so a firm in that state comes back as an ordinary row with `noteCount: 0`, an empty `analysts` array, `null` for `firstNote` / `lastNote` / `latestNote`, and its `firmRating` set. Rows are ordered by whichever came later, the firm's last note or its last rating action, so a rating-only firm interleaves by its rating date rather than sinking to the end. Check `noteCount` on the row before reaching into `latestNote`, and never render such a row as "analyst not named": there is no note, so there is no byline to be missing.

**A large share of price target notes name no individual analyst, and those notes are still here.** Whether a note carries a byline is a property of the PUBLISHER that reported it, not of the note, which is what the `attributionNote` field on every response says in plain language. The share is high and it varies enormously by ticker: across a 16-ticker large-cap sample on a 365-day window, 52% of notes named nobody, ranging from 11% on `CRM` to 64% on `BA`. Do not hardcode a rate. Filtering unnamed notes out would report a firm as absent from a stock it demonstrably published on, unevenly by publisher, so a firm can legitimately appear with an empty `analysts` array and a non-zero `noteCount`. Read the `attributedNoteCount` and `unattributedNoteCount` on the response you actually received before concluding a desk went quiet.

**`firmRating` belongs to the firm, never to the person named beside it.** Rating actions are published at firm level: the upstream feed carries the firm, the grade and the date, with no individual attached. Do not render a firm rating as a named analyst's rating.

`analysts[].slug` addresses `/api/v1/analyst/people/{slug}`, so this endpoint is how you get a valid slug. A named analyst whose name resolves to no profile, or ambiguously to two, comes back with a `name` and a `null` slug rather than being dropped or linked to a guess, so handle a null slug before you build a link. For an ETF, which has no analyst desk, this returns a pointer to the surfaces that do answer for ETFs.

### GET /api/v1/analyst/people/{slug}
One analyst: the firms they have published under, the window of notes we hold at each, and the tickers they cover. **PRO (preview)** -- Free: the profile with the coverage book truncated to the 5 most recently covered tickers. PRO: the whole book.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | path | Yes | Analyst slug, e.g. `dan-ives`. Get one from `/{ticker}/coverage` |

Response: `{ isPreview, previewReason, data: { slug, name, role, mostRecentFirm, firms: [{ firm, firstSeen, lastSeen, mostRecent }], firstSeen, lastSeen, noteCount, tickerCount, coverage: [{ ticker, noteCount, firstNote, lastNote, latestPriceTarget, latestFirm }] } }`. `role` is `sell_side_equity`. As on `/coverage`, a truncated FREE response adds a top-level `totalCount` with the full number of covered tickers and the untruncated response omits it; `data.tickerCount` carries that number on every tier. Returns 404 when the slug matches no analyst.

**`firstSeen` and `lastSeen` are observation windows, not employment dates.** They are the dates of the first and last note we hold from that analyst at that firm. `mostRecentFirm` says where they last published, not where they work today. Do not render either as a hire or departure date. Analysts do move: `firms[]` runs to three entries for plenty of the roster.

**There is no accuracy score, hit rate or ranking on this endpoint, by design.** This is attributed call history: who said what, when, and where it was reported. SentiSense does not publish a rating of an individual analyst, and nothing here should be presented to a user as one.

### GET /api/v1/analyst/people/{slug}/calls
One analyst's price target notes, newest first, paged. Ordered by published date descending with the row id as the final tie-break, a total order, so walking the history with `offset` never drops or repeats a row. **Free: the first 25 rows** of the history are complete data on every tier (`isPreview: false`); `limit` above 25 or an `offset` past row 25 serves FREE keys their in-allowance slice as a preview. PRO pages the whole history.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `slug` | path | Yes | - | Analyst slug, e.g. `dan-ives` |
| `limit` | int | No | 25 | Page size, capped at 200 rather than rejected. Returns `400 invalid_limit` below 1 |
| `offset` | int | No | 0 | Rows to skip. Returns `400 invalid_offset` when negative |

Call object: `{ publishedDate, ticker, firm, priceTarget, adjPriceTarget, priceWhenPosted, newsTitle, newsUrl, newsPublisher }`. `newsUrl` is the report that carried the note, so every call cites its source.

Response: `{ isPreview, previewReason, totalCount, data: [...] }`. Unlike the two endpoints above, `totalCount` is always present here, and it is the analyst's whole attributed history rather than the page size, so `offset + data.length < totalCount` means another page is available. Returns 404 for an unknown slug rather than an empty page, so "published nothing we hold" and "does not exist" stay distinguishable.

`publishedDate` is day granularity on purpose. Publisher timestamps are not comparable across sources: a note filed after the US close is dated the next day by some publishers while the matching rating action keeps the session date. A time of day would advertise precision the data does not have.

**Worked example -- who covers AMD, then read one of them:**

```bash
# 1. who covers it, and what they most recently said
curl -s -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/analyst/AMD/coverage?lookbackDays=180" \
| jq -r '.data.coverage[] | "\(.firm): \(.analysts[0].name // "not named") target \(.latestNote.priceTarget // "n/a") rating \(.firmRating.rating // "n/a")"'

# 2. take a slug from that response and read that analyst's own history
curl -s -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/analyst/people/stacy-rasgon/calls?limit=10" \
| jq -r '.data[] | "\(.publishedDate) \(.ticker) target \(.priceTarget // "n/a")"'
```

---

## ETFs API (`/api/v1/etfs`)

ETF discovery, composition (holdings), and holdings-weighted aggregate views. Funds aren't rated by analysts directly and don't have insiders of their own, so the aggregate endpoints synthesize fund-level views from each constituent's per-stock data, weighted by allocation. Every aggregate response carries a `coverage` block so consumers see how much of the fund's AUM the underlying data covered.

**Coverage**: a growing set of widely-traded funds (SPY, QQQ, IWM, VOO, VTI, major SPDR sectors, etc.). Expect coverage and aggregate freshness to keep improving.

### GET /api/v1/etfs
List every ETF SentiSense tracks. Sorted by ticker. **Discovery (no quota cost)** -- API key required, but the call does not consume your monthly quota. No parameters. This exemption applies to this list endpoint only; the per-ticker ETF endpoints below (holdings, quote, aggregates) count against monthly quota as usual.

Response: `Array<{ ticker, name, kbEntityId, urlSlug, issuer, trackedIndex, assetClass, imageUrl }>` where `imageUrl` is a square presentation image keyed to the fund's `issuer`, so funds from the same family share one, or `null` for an issuer we hold no image for.

### GET /api/v1/etfs/{ticker}/holdings
Full composition of an ETF: per-holding weights, freshness timestamps, partial-coverage signal. **Free tier** (API key required).

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `ticker` | path | Yes | ETF ticker (e.g. `QQQ`) |

Response: `{ ticker, issuer, issuerEndpoint, asOfDate (ISO date), fetchedAt (epoch seconds), nextRefreshDue (ISO date), totalHoldings, holdings: [{ ticker, name, weightPct, firstSeen (ISO date) }], partial?, totalKnownHoldings? }`. Returns 404 for unknown ETFs or commodity-only funds (e.g. GLD) without equity holdings.

### GET /api/v1/etfs/{ticker}/quote
Aggregate ETF detail-page quote: latest price (15-minute delayed), today OHLC, 52-week range, trailing-12-month dividend yield, AUM, expense ratio, NAV, inception date. Peer of `/api/v1/stocks/{ticker}/quote` for fund tickers. **API key required.**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `ticker` | path | Yes | ETF ticker (e.g. `VTI`) |

Response: `{ ticker, currentPrice, change, changePercent, volume, open, dayHigh, dayLow, previousClose, week52High, week52Low, dividendYield, aum, expenseRatio, nav, inceptionDate (ISO date), timestamp, extendedHours? }` -- all fields except `ticker` are nullable. `aum` is the ETF analogue of `marketCap` on the stock quote. `expenseRatio` and `dividendYield` are decimals (e.g. `0.0003` for 0.03%). Cached 15 s server-side.

Stock tickers (e.g. `AAPL`) return `400 ticker_is_not_etf` from this endpoint. Use `GET /api/v1/stocks/{ticker}/quote` instead.

### GET /api/v1/etfs/{ticker}/aggregates/analyst
Holdings-weighted analyst consensus for an ETF, derived from per-stock coverage of each constituent. Math: weight × per-stock upside, renormalized to the covered subset. **API key required.** Returns the full response (including `topContributors`) to every API caller; tiers differ only in per-tier rate limits and quota.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `ticker` | path | Yes | ETF ticker |

Response: `{ isPreview, previewReason, data: { ticker, asOfDate (ISO date), computedAt (epoch seconds), coverage: { holdingsCount, holdingsCovered, weightCovered, partial?, totalKnownHoldings? }, weightedConsensus: { upsidePercent, consensusLabel ("BUY"|"HOLD"|"SELL"), distribution: { BUY: 0.62, HOLD: 0.31, SELL: 0.07 }, totalAnalysts }, topContributors: [{ ticker, weightPct, upsidePercent, consensusLabel, contributionPp }] } }`. Returns 404 when not an ETF or when covered AUM is too low to publish (typically foreign-listed funds).

### GET /api/v1/etfs/{ticker}/aggregates/insider
Holdings-weighted SEC Form 4 insider activity for an ETF over a configurable window. **API key required.** Returns the full response (including `topContributors`) to every API caller.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `ticker` | path | Yes | - | ETF ticker |
| `lookbackDays` | int | No | 30 | Trailing window (typical: 30 or 90) |

Response: `{ isPreview, previewReason, data: { ticker, asOfDate (ISO date), computedAt (epoch seconds), lookbackDays, coverage, weightedNetFlow: { netDollars (signed), buyDollars, sellDollars, buyTradeCount, sellTradeCount, distinctInsiderCount }, topContributors: [{ ticker, weightPct, netDollars, weightedNetDollars, tradeCount }] } }`.

### GET /api/v1/etfs/{ticker}/aggregates/sentiment
Two SentiSense Score readings side-by-side: constituent-weighted (precomputed daily across the fund's holdings) and direct (mentions of the ETF's own ticker). The two can diverge meaningfully and the gap is itself informative. Covers a growing set of widely-traded funds (SPY, QQQ, VOO, VTI, IWM, major SPDR sector funds, and more). Returns 404 for funds outside the current coverage window. **API key required.**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `ticker` | path | Yes | ETF ticker |

Response: `{ isPreview, previewReason, data: { ticker, asOfDate (ISO date), computedAt (epoch seconds), coverage, constituentsWeighted: { sentiSenseScore, scoreLabel ("BULLISH"|"NEUTRAL"|"BEARISH"), asOfTimestamp (epoch seconds) }, direct: { ...same shape... } | null } }`. The `direct` block can be null for low-mention funds. Returns 404 when the constituent-weighted metric hasn't been produced for the ticker yet.

---

## Options Intelligence API (`/api/v1/options`, `/api/v1/stocks/{ticker}/options`)

End-of-day options analytics for US stocks and ETFs, ranked against each ticker's OWN history. Derived nightly from the prior session's full option chain, then reduced to a lean daily aggregate: put/call volume and open interest, an ATM implied-volatility term structure, 25-delta skew, notional premium traded, open-interest walls with max pain, and the session's unusually-active contracts. The product thesis is percentile-first: every reading is served alongside its percentile within that ticker's trailing window (for example "put/call volume at the 92nd percentile of its 1y range"), never a bare cross-sectional number. Readings describe what the chain looks like today versus its own past; they are not forecasts.

This is end-of-day data, latest session (not real-time): `asOf` is the prior trading day and the blobs refresh each morning after the session closes. Coverage is two universes, discovered differently. **Stocks:** a bounded universe of the most actively optioned US names, roughly 950 in the latest build (the exact size is in `coverageCount`) and expanding; the `rows` of `/options/overview` are the authoritative list. **ETFs:** the US ETFs SentiSense tracks (enumerate them with `GET /api/v1/etfs`) get the same coverage on the same `/stocks/{ticker}/options/...` paths, and on the overview they are a SEPARATE board: `etfRows`, never mixed into `rows`. `coverageCount` and the market-pulse aggregates describe the stock board only, so an ETF is never counted there. The two boards are ranked independently and must not be merged: every reading is a percentile of that ticker's own trailing history, so an ETF's `interestScore` is comparable to other ETFs, not to a single stock. A ticker in neither universe returns `200` with `data: null` from `/summary` (unknown tickers behave the same), so treat a null as "not covered", not as an error. Separately, a covered ticker that has not yet accumulated enough sessions (roughly 60) or cleared a liquidity floor returns its raw readings with omitted percentiles and no `interestScore` while its baseline builds.

**Access and free-tier gating:** all three endpoints require an API key and each call counts against your monthly request quota. The options data itself is additionally tiered by key. PRO keys always get the full response. FREE keys get a working taster: `/options/overview` returns the top 25 ranked rows (plus all market-pulse aggregates and a `totalCount` of the full board); `/stocks/{ticker}/options/summary` returns the full dossier for the first 10 calls each calendar month (monthly reset; `data: null` responses never spend the meter), then a headline-only preview (`asOf`, `sentiment`, `ivRank1y`, `atmIv`, `pcVol`, `pcVolPctl1y`, `maxPain`); `/stocks/{ticker}/options/history` always serves `window=1y`. Previewed bodies carry `isPreview: true` and `previewReason: "PRO_REQUIRED"`; full bodies carry `isPreview: false` and `previewReason: null`. Null-valued fields are omitted from the JSON entirely, so check for field presence rather than comparing against `null`.

### GET /api/v1/options/overview
Market-wide Options Radar: two boards plus market-pulse aggregates. `rows` is one row per covered stock; `etfRows` is the same row shape for covered ETFs (omitted entirely when a build has none). Both boards arrive ranked by `interestScore` descending (unscored building-baseline rows last), so the top of the list is the most interesting names today. FREE keys receive the top 25 rows with `totalCount`; PRO keys receive every row. **API key required.** No parameters.

Response: `{ isPreview, previewReason, data }`, where `data` is `{ asOf, medianIvRank, marketPcVol, extremeCount, coverageCount, rows: [...], etfRows: [...], etfMedianIvRank, etfMarketPcVol, etfExtremeCount, etfCoverageCount }`. `data` is `null` before the first nightly build populates it. Each board carries its OWN aggregates and they are never blended: `medianIvRank` / `marketPcVol` / `extremeCount` / `coverageCount` describe the stock board, and the four `etf*` aggregates describe the ETF board (all four omitted when a build has no ETF rows). `etfCoverageCount` is the denominator for `etfExtremeCount` and stays the full board size even on a truncated FREE response. On a FREE key the envelope's `totalCount` reports the full stock board and `data.etfTotalCount` reports the full ETF board. For ETF rows, `sector` carries the fund's asset class (`Equity`, `Bond`, `Commodity`, ...) rather than a GICS sector. Each row, in either board:

| Field | Type | Notes |
|-------|------|-------|
| `ticker` | string | Primary ticker |
| `name` | string | Company name (null if unmapped) |
| `sector` | string | Sector (null if unmapped) |
| `asOf` | ISO date | Session date of this row's snapshot |
| `sentiment` | number | Options-implied sentiment, -1 to +1 (null on cold start) |
| `interestScore` | number | Composite 0-100 blend of how extreme the row's readings are (null while the baseline builds) |
| `pcVol` | number | Put/call volume ratio today |
| `pcVolPctl1y` | number | Percentile (0-100) of `pcVol` in the trailing 1y window |
| `atmIv` | number | ATM implied volatility, as a fraction (0.42 = 42%) |
| `ivRank1y` | number | IV rank (0-100) of `atmIv` in its trailing 1y range |
| `skew25d` | number | 25-delta skew, `iv25p - iv25c`, a fraction on the same scale as IV (0.03 = 3 IV points) |
| `skewPctl1y` | number | Percentile (0-100) of `skew25d` in the trailing 1y window |
| `notionalVol` | number | Premium traded today (sum of volume × mark × 100) |
| `ivMove20` | number | Signed change of `atmIv` vs its ~20-session mean; rank the "biggest IV moves" pill by its absolute value |
| `observations1y` | integer | Trailing-1y observation count (drives the building-baseline state) |
| `unusualCount` | integer | Unusually-active contracts this session |
| `maxVolOiRatio` | number | Largest volume/open-interest multiple among them |
| `maxUnusualPremium` | number | Largest premium ($) among them |
| `wallSide` | string | Side of the single heaviest OI wall, `call` or `put` |
| `wallStrike` | number | Strike of that wall |
| `wallShare` | number | That wall's share of its side's open interest (0-1) |

Rows arrive ranked by `interestScore`; re-sort client-side for other views (`notionalVol` for "most active", `maxUnusualPremium` for unusual activity). Sort each board on its own; never concatenate `rows` and `etfRows` into one ranking.

```bash
curl -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/options/overview"
```

### GET /api/v1/stocks/{ticker}/options/summary
The latest options dossier for one stock or ETF: today's aggregate, its percentile context, the open-interest wall structure with max pain, and the session's unusual contracts. **API key required.**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `ticker` | path | Yes | Stock or ETF ticker (e.g., `NVDA`, `SPY`) |

Response: `{ isPreview, previewReason, data }`, where `data` is `null` when the ticker is outside the covered universe (unknown tickers behave the same; null responses never spend the FREE dossier meter) or has no snapshot yet, otherwise `{ asOf, sentiment, latest, context, oiWalls, unusual }` (FREE keys: full for the first 10 calls/month, then the headline preview described in the access paragraph):

- `latest` (today's daily aggregate): `{ date, callVol, putVol, callOi, putOi, pcVol, pcOi, vwIv, atmIv, skew25d, atmIv60, atmIv90, iv25c, iv25p, netDelta, notionalVol, contracts }`. `atmIv60`/`atmIv90` are the ~60d/~90d ATM IV proxies (the term structure); `iv25c`/`iv25p` are the raw 25-delta call/put IVs, and `skew25d == iv25p - iv25c`. Ratio/IV fields are omitted when undefined (e.g. `pcVol` when call volume is 0).
- `context` (percentiles of `latest`): `{ pcVolPctl1y, pcVolPctl5y, pcOiPctl1y, ivRank1y, skewPctl1y, observations1y }`. Any percentile whose trailing window has too few observations is omitted (building baseline).
- `oiWalls` (point-in-time, for the dossier expiry): `{ expiry, maxPain, callWalls: [{ strike, oi }], putWalls: [{ strike, oi }] }`, up to 3 walls per side, descending by open interest.
- `unusual` (top 5 by premium): `[{ contract, type, strike, expiry, dte, volume, oi, volOiRatio, premium }]` -- contracts whose volume far exceeds open interest (fresh positioning). `contract` is the OCC-style option symbol (e.g. `NVDA260821C00200000`).

```bash
curl -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/stocks/NVDA/options/summary"
```

CLI equivalent: `npx -y sentisense@0.47.1 options NVDA --json`

ETFs use the same path, and it is the only way to reach them since the Radar board is stocks-only:

```bash
curl -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/stocks/SPY/options/summary"
```

### GET /api/v1/stocks/{ticker}/options/history
The daily-aggregate time series for one stock or ETF, ascending by date. **API key required.**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `ticker` | path | Yes | - | Stock or ETF ticker |
| `window` | string | No | `1y` | `1y`, `2y`, or `5y` (`5y` returns all stored history, currently about two years); any other value clamps to `1y`. FREE keys always receive `1y` |

Response: `{ isPreview, previewReason, data }`, where `data` is `{ ticker, window, series: [...] }` and each element of `series` has the same shape as the `latest` aggregate above (`{ date, callVol, putVol, ..., contracts }`). An empty `series` means the ticker has no stored aggregates yet.

```bash
curl -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/stocks/NVDA/options/history?window=1y"
```

**When to use these:** call `/options/overview` (no ticker) for the market-wide read of where options activity and implied volatility are unusual today, then drill into a name with `/stocks/{ticker}/options/summary` for its full dossier (walls, max pain, unusual contracts). For a macro or sector read, use `data.etfRows` from the overview, or go straight to an ETF dossier (`SPY`, `QQQ`, `IWM`, `TLT`, `GLD`, the sector `XL*` funds). Use `/stocks/{ticker}/options/history` to chart how a reading (IV, put/call, skew) has trended over time (history is backfilled from mid-2024, so `5y` currently returns about two years). Every value is a percentile of that stock's own past, so read it as "elevated or muted versus this stock's own history", not as a cross-stock ranking.

---

## Screener API (`/api/v1/screener`)

Run a structured filter over the tracked universe and get every matching row back in one response. This is the only place where the SentiSense Score and attention are queryable in the same filter as analyst consensus, technicals and price. That cross is the point: screening on analyst ratings alone is something a dozen free tools already do, screening on analyst ratings where the SentiSense Score disagrees is not.

Four endpoints, all **API key required**. Call `/fields` once to learn the catalog, then execute plans against it. Screens read a snapshot that refreshes every 20 minutes and the Score windows behind it are daily, so this is not a quote feed and should not be polled per second (for live prices use the Stocks API quote endpoints). One screen is one request no matter how many rows it returns, so prefer one broad screen plus client-side slicing over many narrow ones.

**The plan object.** Every screen is a `plan`, and the same shape works for both universes.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `filters` | array | required | ANDed together. There is no OR: run two screens and merge |
| `sort` | object | none | `{ "fieldName": "<FIELD>", "dir": "ASC" \| "DESC" }` |
| `universe` | string | set by the path | The body value is a no-op; the endpoint you call decides stock vs ETF |

Each filter is `{ "fieldName": "<FIELD>", "op": "<OP>", "value": <number> }`. Operators: `GTE`, `LTE`, `GT`, `LT`, `EQ`, `NEQ`, `IN`, `NOT_IN`. `IN` / `NOT_IN` take a `values` array instead of `value` and are only meaningful on the string-typed ETF fields (`ISSUER`, `ASSET_CLASS`, `TRACKED_INDEX`). Every curated plan from `/screens` carries `fieldName` on every filter and sort, in both universes, so read that one key. A legacy `field` key (the stock-only enum) is also accepted on input and still appears alongside `fieldName` on some stock plans; it holds the same name and can be ignored. When both are present, `fieldName` wins.

**`limit` sits next to `plan` on the request body, never inside it.** The plan object has no `limit` field, so a nested one is ignored and you silently get the default. It defaults to 100 and caps at 500.

**Nulls never match.** A row missing the field you filtered on is excluded in both directions, so `RETURN_1Y >= 0` and `RETURN_1Y < 0` do not partition the universe: a stock listed four months ago is in neither result. Sorting puts nulls last regardless of direction. Coverage is not uniform (analyst fields cover most of the universe, the 200-day technicals only names with at least 200 trading days of history), so when a screen returns fewer rows than you expect, check coverage before you touch your thresholds.

**Reading the SentiSense Score.** Most interesting screens filter on the Score, and it is not sentiment polarity. Sentiment is a [-1, 1] polarity measure; the Score is an unbounded, volume-aware measure of directional conviction that currently runs roughly -30 to +45 across the tracked universe. Filter on the band edges (`5`, `13`, `23`), not on polarity-scale values like `0.5`, which behave as "any positive score":

| Range | Reading |
|-------|---------|
| -5 to +5 | Neutral |
| +5 to +13 | Slightly bullish |
| +13 to +23 | Bullish |
| +23 and above | Strong |

Symmetric on the bearish side. `SENTI_SCORE_7D` and `SENTI_SCORE_1M` are window averages; `SCORE_CHANGE_7D` is the 7-day Score minus the 1-month baseline, so positive means strengthening against the longer window.

**The Score is a nowcast, not a forecast.** It reads how bullish or bearish the market currently is on a stock, weighted by how actively that stock is being discussed. It does not predict price. Present a screen as what it is, a filtered list of current readings, and never label a high Score a buy signal, a price target, or a prediction.

### GET /api/v1/screener/fields
The full catalog for both universes: every filterable field with its group, unit, accepted operators, sortability and a human description. **API key required.** No parameters. Call this once and build filters from the response rather than hardcoding names, and you inherit new fields as they ship.

Response: `{ stock: [...], etf: [...] }`, each entry `{ name, label, group, type, unit, ops, sortable, description }`. The string-typed ETF fields (`ISSUER`, `ASSET_CLASS`, `TRACKED_INDEX`) also carry a `values` array populated from the live universe, so pickers stay current without a redeploy.

CLI equivalent: `npx -y sentisense@0.47.1 screen --fields --json`

Stock fields by group:

| Group | Fields |
|-------|--------|
| Sentiment | `SENTI_SCORE_7D`, `SENTI_SCORE_1M`, `SCORE_CHANGE_7D`, `SENTIMENT_DIRECTION`, `SENTI_SCORE_TREND_7D`, `SENTI_SCORE_TREND_30D`, `SENTI_SCORE_RISING_STREAK_30D` |
| Popularity | `SOCIAL_DOMINANCE`, `MENTION_SHARE`, `MENTION_VELOCITY`, `DOMINANCE_CHANGE` |
| Price & size | `MARKET_CAP`, `PRICE`, `CHANGE_PERCENT`, `CHANGE`, `VOLUME`, `PCT_OFF_52W_HIGH`, `PCT_OFF_52W_LOW`, `PRICE_TREND_30D` |
| Analyst | `ANALYST_BUY_RATIO_PCT`, `ANALYST_TARGET_UPSIDE_PCT`, `ANALYST_COUNT`, `ANALYST_RATING_MOMENTUM_30D`, `ANALYST_RATING_MEAN` |
| Technical | `PCT_OFF_200D_MA`, `PCT_OFF_50D_MA`, `MA_CROSS_STATE`, `RETURN_1M`, `RETURN_3M`, `RETURN_6M`, `RETURN_1Y`, `VOLATILITY_30D` |

ETF fields by group:

| Group | Fields |
|-------|--------|
| Sentiment | `CONSTITUENTS_WEIGHTED_SENTISENSE`, `DIRECT_SENTISENSE` |
| Analyst | `WEIGHTED_ANALYST_UPSIDE` |
| Price & size | `MARKET_CAP` (AUM), `EXPENSE_RATIO`, `CURRENT_PRICE`, `CHANGE_PERCENT`, `PRICE_CHANGE`, `VOLUME`, `PCT_OFF_52W_HIGH`, `PCT_OFF_52W_LOW` |
| Coverage | `WEIGHT_COVERED_PCT`, `HOLDINGS_COUNT` |
| Profile | `ISSUER`, `ASSET_CLASS`, `TRACKED_INDEX` |

**Four field semantics worth stating outright**, because guessing them wrong produces a screen that looks fine and means nothing:

- **`SENTI_SCORE_*` and `SCORE_CHANGE_*` are the SentiSense Score, not sentiment.** The field names keep a legacy spelling, so describe them to users as the Score. See the band table above for the thresholds that actually mean something.
- **`ANALYST_RATING_MEAN` is inverted.** It is the industry-standard 1-to-5 analyst scale where **1.0 is strong buy** and 5.0 is sell. Bullish is `LTE 2.5`, not `GTE`. Prefer `ANALYST_BUY_RATIO_PCT`, which runs the intuitive direction.
- **`MA_CROSS_STATE` is ordinal, not boolean.** `1` golden cross (50-day above 200-day), `-1` death cross, `0` neither. Use `EQ`.
- **`SENTIMENT_DIRECTION` is the sign of the 7-day Score** with a neutral band: `1` above +5, `-1` below -5, `0` in between. Despite the name it is not sentiment polarity.

`ANALYST_COUNT` is the sum of the rating buckets, deliberately not the same population as the target-price panel, so the two counts disagree for most tickers. When you screen on `ANALYST_BUY_RATIO_PCT`, add an `ANALYST_COUNT >= 5` leg: coverage bottoms out at a single analyst, and a 0% buy ratio from one analyst is noise, not disagreement.

### GET /api/v1/screener/screens
The 28 curated screens shipped in the product, each with an executable plan you can run directly or use as a starting point. **API key required.** No parameters.

Response: `{ screens: [{ id, name, summary, plan }] }`. The set covers both universes (the ETF ones are prefixed `etf-`). Two conventions in the names are load-bearing: `+` means both conditions hold, `vs` means the two sides disagree. Screen `id` values are stable and safe to persist; `name` and `summary` are display copy and may be revised.

```bash
curl -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/screener/screens"
```

CLI equivalent: `npx -y sentisense@0.47.1 screen --list --json` (run one with `screen --screen <id>`)

### POST /api/v1/screener/execute
Run a plan against the stock universe. **API key required.**

| Body field | Type | Required | Default | Description |
|------------|------|----------|---------|-------------|
| `plan` | object | Yes | - | The plan object described above |
| `tickers` | array | No | whole universe | Restrict the screen to a watchlist. Omit it to screen every tracked ticker (roughly 1,000) |
| `limit` | int | No | 100 | Rows returned, capped at 500. Sits here, not inside `plan` |

```bash
curl -X POST "https://app.sentisense.ai/api/v1/screener/execute" \
  -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": {
      "filters": [
        { "fieldName": "SENTI_SCORE_7D", "op": "GTE", "value": 13 },
        { "fieldName": "ANALYST_BUY_RATIO_PCT", "op": "LTE", "value": 30 },
        { "fieldName": "ANALYST_COUNT", "op": "GTE", "value": 5 }
      ],
      "sort": { "fieldName": "SENTI_SCORE_7D", "dir": "DESC" }
    },
    "limit": 25
  }'
```

CLI equivalent: `npx -y sentisense@0.47.1 screen --filter SENTI_SCORE_7D:GTE:13 --filter ANALYST_BUY_RATIO_PCT:LTE:30 --filter ANALYST_COUNT:GTE:5 --sort SENTI_SCORE_7D:DESC --limit 25 --json`

That is the "crowd is bullish, the street is not" screen. To run the same plan over a watchlist instead, add `"tickers": ["NVDA", "AMD", "AVGO"]` next to `plan`.

Response: `{ matched, limit, results: [...] }`. **`matched` is the number of rows the plan matched before `limit` was applied**, so truncation is visible: a capped list with no count is how a caller quietly concludes the universe is smaller than it is. Every row carries the full field set, not only the fields you filtered on, so you can re-sort or post-process client side without a second call; fields with no data for that ticker are `null`. Row shape: `{ ticker, sentiSenseScore7D, sentiSenseScore1M, scoreChange7D, socialDominance, marketCap, currentPrice, changePercent, analystBuyRatioPct, analystTargetUpsidePct, analystCount, pctOff200dMa, maCrossState, return1Y, volatility30D, ... }`.

**Validation.** Both execute endpoints check the plan before running it: an unrecognized
`fieldName` in `filters` or `sort` returns HTTP 400 with `{ error, field, message }`, where
`message` names the bad field and lists the valid ones for that universe. Field names are
case-sensitive (`SENTI_SCORE_7D`, not `senti_score_7d`); take them from
`GET /api/v1/screener/fields` rather than guessing.

### POST /api/v1/screener/etfs/execute
Identical request and response shape, run against the ETF universe. **API key required.** Use the ETF field names from the catalog; `tickers` and `limit` behave the same way.

ETFs carry two distinct Score fields and they answer different questions. `CONSTITUENTS_WEIGHTED_SENTISENSE` is the holdings-weighted Score across what the fund actually owns, and is the one you usually want. `DIRECT_SENTISENSE` is the Score from chatter about the fund's own ticker, which on a widely-traded index fund is mostly macro noise. `WEIGHT_COVERED_PCT` tells you how much of the fund's weight had constituent data behind the weighted number: a weighted Score over thin coverage is not wrong so much as under-evidenced.

```bash
curl -X POST "https://app.sentisense.ai/api/v1/screener/etfs/execute" \
  -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": {
      "filters": [
        { "fieldName": "CONSTITUENTS_WEIGHTED_SENTISENSE", "op": "GTE", "value": 5 },
        { "fieldName": "WEIGHT_COVERED_PCT", "op": "GTE", "value": 80 },
        { "fieldName": "EXPENSE_RATIO", "op": "LTE", "value": 0.25 }
      ],
      "sort": { "fieldName": "CONSTITUENTS_WEIGHTED_SENTISENSE", "dir": "DESC" }
    },
    "limit": 25
  }'
```

CLI equivalent: `npx -y sentisense@0.47.1 screen --etf --filter CONSTITUENTS_WEIGHTED_SENTISENSE:GTE:5 --filter WEIGHT_COVERED_PCT:GTE:80 --filter EXPENSE_RATIO:LTE:0.25 --sort CONSTITUENTS_WEIGHTED_SENTISENSE:DESC --limit 25 --json`

Two scale traps worth taking from the catalog rather than guessing. `EXPENSE_RATIO` is in percent, so `0.25` means 0.25%, not 25% and not 0.0025. And `CONSTITUENTS_WEIGHTED_SENTISENSE` is a Score, not a percentage: the field's own description puts the bullish line at +5, which is why this example uses it. Do not assume the two `quickValues` the catalog offers are both reachable; the ETF universe is small and its top Score sits near +12, so the higher suggestion can match nothing on a given day. Read the returned `matched` count and loosen if it is 0.

**When to use these:** call `/fields` once at startup and cache it, use `/screens` when the user asks for something a curated screen already expresses (execute its `plan` verbatim), and build a plan yourself when they want a cross the curated set does not cover. Full docs: <https://sentisense.ai/docs/api/screener>.

---

## Market Summary API (`/api/v1/market-summary`)

AI-generated market overview with headline and expanded markdown analysis.

### GET /api/v1/market-summary
AI market summary with headline and markdown analysis. **Public.** No parameters required.

Response:

| Field | Type | Description |
|-------|------|-------------|
| `lastUpdated` | long | Epoch milliseconds when data was last updated |
| `headline` | string? | 1-2 sentence market punchline |
| `expandedContent` | string? | Full markdown analysis |
| `generatedAt` | long? | Epoch seconds when AI summary was generated |

---

## Indexes API (`/api/v1/indexes`)

Every SentiSense composite index on one standardized envelope: a single scalar, its history, and where applicable the constituent breakdown behind it. **Free (API key required)** on every index today. Full docs: <https://sentisense.ai/docs/api/indexes>.

Market Mood is a member of this family. Read it here when you want every index to answer the same shape, or at `/api/v2/market-mood` above when you want its phase band, weekly change, per-signal breakdown, and sector map.

### GET /api/v1/indexes
Discovery endpoint. Returns every published index.

Response: `{"indexes": IndexListing[]}` where each `IndexListing` has:

| Field | Type | Description |
|-------|------|-------------|
| `indexId` | string | URL slug; use as `{indexId}` below |
| `displayName` | string | Human-readable name |
| `description` | string | One-sentence summary |
| `scale` | string | `SENTIMENT` (signed, -1 to +1) or `PERCENT_0_100` |
| `accessTier` | string | `free` or `pro`. Every index is `free` today. Read this rather than assuming |
| `canonicalUrl` | string | Richest view of the index. For Market Mood this is `/api/v2/market-mood`; every id still resolves at `/api/v1/indexes/{indexId}` |

Live indexes: `market-mood` (0-100 fear and greed composite), `fed-sentiment` (weekly, Federal Reserve leadership), `ai-sentiment` (daily, AI-exposed names). Treat the discovery endpoint as the source of truth, not this list.

### GET /api/v1/indexes/{indexId}
Latest reading for one index.

Response: `indexId`, `displayName`, `asOf` (YYYY-MM-DD), `value`, `scale`, `coverage`, `basketSize`, `totalMentions`, `methodologyNote`, `constituents[]`.

Two archetypes share this envelope. A **basket** index (`fed-sentiment`, `ai-sentiment`) weight-averages tracked entities, so `constituents[]` carries `kbEntityId`, `displayName`, `role`, `weight`, `value`, `mentionsCount`, `staleness`, `contribution`, `link`, and `coverage`/`basketSize`/`totalMentions` describe how the headline was built. **`contribution` is reserved and currently returns `null` on every constituent, so do not build on it**; derive a constituent's share of the headline as `weight * value` over the sum of `weight` across the constituents whose `staleness` is not `EXCLUDED`. A **composite** index (`market-mood`) is built from signals rather than entities, so those four fields are `null`. That `null` means "no constituents by construction", not "data missing": branch on it instead of treating it as an error.

`staleness` is `FRESH` (mentioned inside the lookback), `CARRIED_FORWARD` (last known value standing in), `EXCLUDED` (no usable reading, renormalized out), or `OUT_OF_SEGMENT` (not in the basket on this date; `weight` is 0). Compare `coverage` against `basketSize` to spot a thin day before quoting the number.

### GET /api/v1/indexes/{indexId}/history
Historical scalar series for charting.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `days` | int | No | 180 | Days of history to return |

Response: `{"indexId", "displayName", "scale", "days", "history": [{"date": "2026-05-25", "value": 0.12}]}`, oldest first.

Point spacing follows the index, not the calendar: weekly indexes emit one point per Monday-Sunday bucket, daily indexes one per day, and Market Mood trading days only. Thin or low-coverage buckets are withheld rather than published, so `history` can be shorter than `days` and can contain gaps. Plot against `date`; do not assume a fixed interval, and do not read a missing date as zero.

---

## Trackers API (`/api/v1/trackers`)

Observational data products. Every tracker returns the same standardized envelope, so one renderer per `viewType` covers every current and future SentiSense tracker. Full docs: <https://sentisense.ai/docs/api/trackers>.

### GET /api/v1/trackers
Discovery listing of every publicly-visible tracker.

Response: `{"trackers": TrackerListing[]}` where each `TrackerListing` has:

| Field | Type | Description |
|-------|------|-------------|
| `trackerId` | string | Slug for the detail endpoint |
| `displayName` | string | Hub-card title |
| `category` | string | Coarse grouping (`institutional`, etc.) |
| `description` | string | One-sentence subtitle |
| `viewType` | string | Renderer hint. Phase 1 publishes `table` |
| `accessTier` | string | `free` or `pro`. `pro` trackers serve FREE callers a preview, either fewer rows or fewer columns; `free` trackers return the full snapshot to everyone |
| `methodologyAnchor` | string | Fragment on `/methodology` for the tracker |
| `refreshIntervalSeconds` | int | Expected refresh cadence |
| `canonicalUrl` | string | Detail endpoint path |

### GET /api/v1/trackers/{trackerId}
Standardized snapshot envelope for one tracker. Returns:

```
{"isPreview": false, "previewReason": null, "data": TrackerSnapshot}
```

A `pro` tracker served to a FREE caller sets `isPreview: true, previewReason: "PRO_REQUIRED"` plus `totalCount` (the full row count on every response), and withholds one of two ways: most truncate `rows[]` to a top-N preview, while a tracker whose value is a complete dataset keeps every row and drops the proprietary columns instead, naming them in `data.meta.previewWithheld` (`market-heatmap` is the one that does this). `free` trackers and PRO callers get the full snapshot. Where `TrackerSnapshot` has `trackerId`, `displayName`, `viewType`, `asOf`, `headline[]` (top-of-page stat tiles), and one payload field per `viewType`:

| `viewType` | Payload field | Per-item shape |
|-----------|---------------|----------------|
| `table` | `rows[]` | `{rank, rowId, name, category?, url?, metrics[]}` where each metric is `{label, value, unit}` |
| `heatmap` | `rows[]` | The same row plus its columns as named fields directly on the row, e.g. `rows[].marketCap`. Cheaper to read, and far smaller than repeating a label and unit on each of 500 rows |

Live trackers as of this writing. The catalog grows over time: treat the `GET /api/v1/trackers` discovery endpoint as the source of truth, not this table.

| Tracker id | accessTier | What it ranks |
|-----------|-----------|---------------|
| `reddit-picks` | free | Stocks finance-Reddit turned bullish on, scored on return since entry vs SPY |
| `institution-concentration` | free | 13F filers by share of the book held in their top 10 positions |
| `institution-aum` | free | Largest 13F filers by disclosed long-equity AUM |
| `hedge-fund-reported-returns` | pro | Net-of-fee annual returns large hedge funds publish, with citations |
| `media-darlings` | free | Stocks by how bullish or bearish the curated financial press is on them |
| `sentiment-leaderboard` | free | Most bullish and most bearish stocks by pure sentiment polarity |
| `sentiment-movers` | free | Biggest 7-day sentiment shifts, improving and deteriorating |
| `trending-products` | free | Products and services by mention volume and week-over-week growth |
| `market-heatmap` | pro | A whole index as tiles in one call: market cap, the day's move, GICS sector, plus sentiment, Score, mentions and options overlays per stock. Every row on every tier, overlays PRO. Scope-aware, see below |

Column headers are the metric labels on `rows[0]`. Common metric `unit` values are `percent`, `usd`, and `count`; newer trackers add richer units such as `polarity`, `ratio`, `status`, and `sparkline`.

**`market-heatmap` takes a `scope`:** `GET /api/v1/trackers/market-heatmap?scope=sp500` (the default), `nasdaq100` or `popular`. Any other value returns `400 invalid_scope` listing the valid ones; it is never silently coerced to the default.

**Its tier split is by column, not by row.** Every caller gets every tile, the full `headline` and the full `meta` sector rollups. A non-PRO response carries `isPreview: true`, `previewReason: "PRO_REQUIRED"` and `meta.previewWithheld`, and drops the proprietary overlays from every row: `sentiment7d`, `sentimentChange7d`, `sentisenseScore` and `mentionsZ` (layer `sentiment`), and `optionsInterestScore` (layer `options`). `meta.previewWithheld` lists the layer names removed, and only ones this snapshot actually has, so it is the field to read when deciding whether to show a locked control rather than a missing reading.

Per-row fields: `ticker`, `sector` (canonical GICS-11 or `Unclassified`), `industry`, `marketCap`, `price`, `previousClose`, `changePercent`, `volume`, `priceAsOf`, `sentiment7d`, `sentimentChange7d`, `sentisenseScore`, `mentionsZ`, `optionsInterestScore`. `meta` carries `scope`, `universeSize`, `tileCount`, `missingPrice[]`, `breadthUp`, `breadthDown`, `capWeightedChangePct`, `equalWeightedChangePct`, `marketMoodScore`, `marketMoodPhase`, `layers` and `sectors[]`.

Within the layers you were served, an absent field means no reading for that tile, never a zero, and a measured `0.0` is always written. Whether an overlay ran at all is answered by `meta.layers`, which omits any layer that failed or is not shipped. Snapshots rewrite every 15 minutes during the US regular session and hourly outside it, with prices delayed about 15 minutes (`meta.layers.prices.delayMinutes`), so do not present the board as real time.

Errors: `404 unknown_tracker`, `404 no_snapshot` (a scope whose first snapshot has not been written yet: a warm-up state, retry in 15 minutes), `400 invalid_scope`, `503 tracker_unavailable`.

**Methodology:** <https://sentisense.ai/methodology/> (each tracker's `methodologyAnchor` from the discovery listing points at its own section; an empty anchor means the tracker has no dedicated section yet).

---

## Calendar API (`/api/v1/calendar`)

Forward-looking market calendars. Earnings is the first feed; the `/calendar/{type}` namespace is built to grow. The value is lead time: not what reports tonight, but which companies report over the next several weeks, with consensus EPS and confirmation status attached, so you can position ahead of the event. API key required on every call.

### GET /api/v1/calendar
Discover which calendars are available. **Discovery (no quota cost)** -- API key required, does not burn monthly quota.

Response: `{ calendars: [ { type, path, description } ] }`. Today: `earnings`.

### GET /api/v1/calendar/earnings
Upcoming company earnings, sorted by date. **Public (preview)** -- Free: one week, PRO: full forward window (about 30 days). Field richness is identical across tiers; the gate is how much of the window you get back, not which columns you get. On Free the week returned is the first week of the window you asked for, so `week=next` returns next week and `week=this` (or no date params) returns the current week. Defaults to the current week onward, measured from Monday of the current US Eastern week rather than from today, so it can include dates earlier in the week that have already passed; pass an earlier `from` to reach further back. Entries are schedule data in every case and never carry what a company actually reported.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `ticker` | string | No | - | Filter to a single ticker |
| `week` | string | No | - | Shorthand window. `this` is the Monday-to-Sunday week containing the current US Eastern date; `next` is the seven days right after it. Rolls over at midnight ET, not local midnight; `metadata.windowStart`/`windowEnd` echo the resolved dates |
| `from` | string | No | - | Inclusive lower bound, ISO `YYYY-MM-DD` (overrides `week`) |
| `to` | string | No | - | Inclusive upper bound, ISO `YYYY-MM-DD` |
| `confirmed` | bool | No | - | When `true`, only company-confirmed dates |
| `time` | string | No | - | `before_open`, `after_close`, `during_market`, `unknown` |

Response: `{ isPreview, previewReason, totalCount?, data: { earnings: [...], metadata: {...} } }`. Each event: `{ ticker, companyName, earningsDate (ISO date), earningsTime, fiscalQuarter, confirmed, estimatedEps }`. Metadata: `{ generatedAt (epoch seconds), windowStart, windowEnd, count, source }`. On a FREE preview, `totalCount` is the full-window event count and `data.earnings` is limited to one week. `metadata.windowStart`/`windowEnd` always describe the window actually returned and `metadata.count` always equals `data.earnings.length`, so read the window off the response rather than assuming which week you got.

`earningsTime` is always one of `before_open`, `after_close`, `during_market`, or `unknown`, never null or absent. Treat `unknown` as "no session claim applies" and render it as blank rather than as missing data. It covers two cases: timing the issuer has not published yet, and timing that cannot exist. A few issuers release results on a Saturday or Sunday ahead of a Monday call, and there is no weekend open or close for the report to sit against. **A weekend `earningsDate` is legitimate data, not a bug.** Do not drop it, and do not shift it to the next weekday; the date is what the issuer announced.

```python
client = SentiSenseClient(api_key=os.environ["SENTISENSE_API_KEY"])
cal = client.get_earnings_calendar(week="next")
for e in cal.earnings:
    print(f"{e['earningsDate']} {e['ticker']} ({e['earningsTime']})")
```

CLI equivalent: `npx -y sentisense@0.47.1 earnings --week next --json` (also takes `--from`, `--to`, `--confirmed`)

---

## Earnings Analysis API (`/api/v1/stocks`, `/api/v1/earnings`)

The earnings lifecycle as one family: who reports (calendar), what management changed in its SEC filings (risk-factor diffs), the per-quarter analysis of what was actually reported, how the stock moved on each announcement (reactions), the reported numbers (fundamentals and KPIs), and the AI takeaway (insights). What Changed, the earnings analysis report, the reaction series, and the recently-reported feed are documented here; the rest live in their own sections above.

**The quarter is the unit.** The analysis is organized by fiscal quarter, and everything else attaches to one: a filing diff belongs to the quarter it covers, and consensus EPS from the Calendar is the anchor a headline beats or misses. Pair `earnings-summaries` with the filings that fall near its `reportDate` rather than treating results and filings as two unrelated lists.

### GET /api/v1/stocks/{ticker}/what-changed
What changed in a company's latest SEC filing versus the previous one. Deterministic diffs of the Item 1A Risk Factors section of consecutive 10-K and 10-Q filings: excerpts of added, removed, and modified passages, new key terms, and a 0-to-1 materiality score. **PRO (preview)** -- Free: per-filing summary (form, dates, section, materialityScore, noMaterialChanges, edgarUrl) + `totalCount`, PRO: the full `diff` object. Params: `form` (`10-K` or `10-Q`), `limit` (1 to 12, default 4; above 12 is capped at 12, below 1 returns `400 invalid_limit`).

Coverage: roughly 500 large-cap US companies, including 99% of the S&P 500 plus widely followed software and semiconductor names outside the index. 10-K and 10-Q Risk Factors, up to about three sequential comparisons per form (annuals back to 2023, roughly the last year of quarterlies), expanding over time. Nearly every comparison returns full `diff` detail; the earliest filing held for a given form has no prior filing to compare against and returns the summary fields without the `diff` object, so treat `diff` as optional on every entry. New filings are typically reflected within 48 hours. Tickers outside the covered set return `200` with an empty `data` array, not an error. Use canonical symbols (`GOOGL` not `GOOG`, `BRK.B` not `BRK-B`).

Response: `{ isPreview, previewReason, totalCount?, data: [...] }`. Each entry: `{ ticker, formType, accessionNo, filedAt, reportDate, section, materialityScore, noMaterialChanges, edgarUrl, diff? }`. The PRO `diff` object: `{ blocks: [{op, similarity, oldExcerpt, newExcerpt, oldParagraphs, newParagraphs}], paragraphsAdded, paragraphsRemoved, paragraphsModified, charsAdded, charsRemoved, changedRatio, noveltyRatio, materialityScore, topNewTerms, identical, noMaterialChanges }`. Block `oldExcerpt` and `newExcerpt` values are capped at 400 characters and end with `...` when truncated; they are bounded excerpts, not the full passage text.

### GET /api/v1/stocks/{ticker}/earnings-summaries
The per-quarter earnings analysis report: one object per fiscal quarter carrying the editorial headline, the KPI highlights that matter for that company with year-over-year deltas, the guidance language as management phrased it, and a summary of the earnings call. This is the readout the SentiSense app itself renders, in one call rather than four. **PRO (preview)** -- Free: the latest quarter only, shaped rather than truncated, plus `totalCount`; PRO: every hydrated quarter in full. Params: `limit` (1 to 40, default 12; above 40 is capped at 40, below 1 returns `400 invalid_limit`; FREE keys receive one quarter regardless).

Coverage: the actively curated US equity universe, expanding each earnings season. A ticker with no stored quarter returns `200` with an empty `data` array, not an error. Use canonical symbols (`GOOGL` not `GOOG`, `BRK.B` not `BRK-B`). Freshness: a quarter typically appears within 48 hours of the company reporting, and the call summary can arrive after the press-release content for the same quarter, so read `generatedAt` and `transcriptGeneratedAt` rather than assuming a fixed lag and expect a quarter to gain its call summary on a later read.

Response: `{ isPreview, previewReason, totalCount?, data: [...] }`, quarters newest first. Each PRO quarter: `{ fiscalPeriod, reportDate, headline, summaryMd, kpiHighlights: [{label, value, yoy?}], guidance?, hasTranscript, transcriptSummaryMd?, transcriptHighlights?, transcriptGeneratedAt?, sources: [{title, url}], generatedAt, source }`. `fiscalPeriod` is a display label (e.g. `Q2 FY2026`), `reportDate` is `YYYY-MM-DD`, `generatedAt` and `transcriptGeneratedAt` are epoch seconds, and `source` is `press_release` or `transcript`.

The FREE preview quarter is shaped, not cut: `fiscalPeriod`, `reportDate` and `headline` in full, plus `kpiHighlights` as up to two `{label, value}` cards, `kpiHighlightCount`, `summaryTopics` and `transcriptTopics` (section titles only, never body text), `hasTranscript`, `hasGuidance`, `guidanceDirection` (`RAISED`, `CUT`, `HELD`, `MIXED`, or `null`), `generatedAt` and `source`. It never carries a body, a KPI history, or a guidance figure.

`guidance` is prose, not a number: PRO callers get the language and classify it themselves, and the classification must let no-guidance language win before any direction word ("no formal guidance was issued ... increasingly difficult" is not a raise). Absence is explicit rather than omitted: a quarter with no call summary sets `hasTranscript: false`, so a client can say "no call summary yet" instead of rendering nothing.

CLI equivalent: `npx -y sentisense@0.47.1 earnings AAPL --limit 12 --json` (a ticker switches the command from the calendar to this report)

### GET /api/v1/stocks/{ticker}/earnings/reactions
What the stock actually did on each of its last twelve earnings announcements: the signed close-to-close move of the session that traded on the news, newest first. Pair it with the implied move from the Options Intelligence API to see whether the options market is pricing the next event above or below what recent prints delivered. **API key required**, no tier gate: every key receives the full series. No params beyond the `{ticker}` path variable.

Response: `{ ticker, asOf, reactions: [...] }`, returned directly rather than through the `{ isPreview, previewReason, data }` envelope its siblings use. `asOf` is the ISO `YYYY-MM-DD` date the response was produced. Each row is `{ reportDate, timing, priorClose, nextClose, movePct }`, newest first, at most 12: `reportDate` is the `YYYY-MM-DD` the results were announced, `priorClose` is the close of the session immediately before the reaction session, `nextClose` is the close of the reaction session, and `movePct` is the signed percent change between the two, to two decimals.

```json
{
  "ticker": "NVDA",
  "asOf": "2026-01-31",
  "reactions": [
    { "reportDate": "2026-01-28", "timing": "AMC", "priorClose": 100.00, "nextClose": 108.50, "movePct": 8.50 }
  ]
}
```

`timing` tells you which session the move belongs to, and it is the whole difficulty of the endpoint. A company that announces after the close moves the *next* session; one that announces before the open moves that same session, so getting it backwards returns an unrelated day rather than a slightly wrong number. `AMC` means the release was furnished at or after 16:00 ET, so `nextClose` is the next trading day and `priorClose` is the report date. `BMO` means it was furnished before 09:30 ET, so `nextClose` is the report date and `priorClose` is the trading day before it. `null` means the announcement could not be placed outside trading hours and the move was measured on the report date itself: read it as "the session was inferred, not observed" and drop those rows when your analysis needs certainty. The field is always present and is never omitted from a row.

**The timing vocabulary is not shared with the Calendar API.** Reactions say `AMC` and `BMO`; `earningsTime` on `GET /api/v1/calendar/earnings` says `after_close` and `before_open`. They mean the same two sessions and match on neither string, so map between them when you chain the forward-looking calendar to this backward-looking series.

Past announcements only: a company that reported after today's close has no completed reaction session yet and appears once that session closes. A quarter that cannot be measured is absent rather than approximated, and no move is computed across a gap in price history. An empty `reactions` array means no measured history for that ticker rather than an error, and unknown tickers return the same shape.

### GET /api/v1/earnings/recent
The cross-ticker backward-looking feed: which covered companies reported on or after `today - days`, newest first. Drives a post-earnings sweep ("who reported this week"), then follow up per ticker with the per-quarter analysis above. **API key required**, no tier gate: every key receives the full window it asks for. Params: `days` (1 to 31, default 7; above 31 is capped, below 1 returns `400 invalid_days`), `limit` (1 to 100, default 50; above 100 is capped, below 1 returns `400 invalid_limit`).

Response: `{ isPreview: false, previewReason: null, data: [...] }`. Each row: `{ ticker, fiscalPeriod, reportDate, headline, hasTranscriptSummary, generatedAt }`. The window is bounded by `reportDate`, so a quarter reported inside it appears even when its call summary lands later. An empty `data` array means nobody in the covered set reported in that window, not an error. This is the only backward-looking earnings feed; the Calendar API is forward-looking and covers scheduled dates, not results.

### GET /api/v1/earnings/statistics
The only endpoint here that describes the market rather than one company: of everyone who reported in a window, how many cleared the estimate, and how the market actually traded them. **API key required**, no tier gate. One param, `window`: `last_completed_week` (default), `week_to_date`, `trailing_52w`, `all_time`. Anything else returns `400 invalid_window`. Weeks are ISO weeks evaluated in America/New_York; the default is the last finished week because a mid-week figure gets revised underneath you, and `week_to_date` marks itself partial in its window key.

Response: `{ isPreview: false, previewReason: null, data: {...} }`. `data` carries `calculationVersion`, `asOf`, a `window` object (`key`, `kind`, `startDate`, `endDate`), the counts (`eventsInWindow`, `classifiedEvents`, `unclassifiedEvents`, `distinctTickers`, `completedReactions`, `pendingReactions`), `coverageRatio`, `sufficientData` with `insufficientDataReason`, one identically-shaped block per outcome (`beat`, `miss`, `inline`, each with `count`, `rate`, `withReaction`, `fell`, `rose`, `flat`, `fellRate`, `averageMovePct`), `averageMovePct`, and, on the two weekly windows, a `baseline` and a `deviation`. `thresholds` is always present.

Four things to get right before you quote a number from this:
- **Units are in the field names.** `Rate` and `Ratio` are fractions in `[0,1]`; `Pct` is a signed percent. A rate with a zero denominator is `null`, never `0`.
- **There are two denominators and they are never equal.** `classifiedEvents` is quarters with both EPS figures and is what `rate` divides by. `withReaction` is the subset whose trading session has closed and is what `fellRate` divides by. A company reporting after the close has a known surprise hours before the session that trades it, so dividing a reaction statistic by `classifiedEvents` understates it.
- **Check `sufficientData` first.** A thin or still-settling window returns real counts anyway, because that beats an error, but the flag means the figure is not fit to publish. `thresholds` tells you which bar it missed so you can apply your own.
- **The baseline excludes the window it judges** (52 ISO weeks ending the day before it starts), and `deviation.beatRateIsMaterial` is the same gate our own narrative layer uses.

Beat, miss and inline come from reported EPS against the estimate directly, never from a rounded surprise percentage. These are realized historical statistics, not forecasts.

Reported by the earnings family alongside the four endpoints above:
- **Calendar** -- `GET /api/v1/calendar/earnings?week=next` (who reports next week) or `?ticker={ticker}` (a single name's next date + consensus EPS). See the Calendar API section.
- **Fundamentals + KPIs** -- `GET /api/v1/stocks/fundamentals` for statements; `GET /api/v1/stocks/{ticker}/kpis` for curated GAAP and non-GAAP metrics (PRO preview). See the Stocks API section.
- **Analyst estimates** -- `GET /api/v1/analyst/{ticker}/estimates` for forward EPS and beat/miss history. See the Analyst Ratings API section.
- **Insights** -- earnings-driven signal types such as `earnings_pulse` surface through `GET /api/v1/insights/stock/{ticker}` (discover types via `.../types`). These are editorial and time-boxed: they appear around an earnings event while the read is fresh, then expire, so an empty array outside those windows is normal. Treat them as opportunistic signal, not guaranteed per-quarter data. See the Insights API section.

---

## MCP Connector (chat surface, not the REST API)

SentiSense also runs a hosted Model Context Protocol server at `https://app.sentisense.ai/mcp`,
for connecting inside Claude, ChatGPT, or Grok chat rather than calling the REST API directly. It is a
read-only, curated slice of the same data, authenticated with zero-config OAuth (no API key to
paste; sign in with a SentiSense account and approve access). To add it in Claude: open Settings,
then Connectors, add the URL above as a custom connector, and sign in. In ChatGPT: turn on
developer mode under Settings, then Security, then add the connector by URL under Settings, then
Connectors (ChatGPT has renamed this settings area more than once, so look for "Plugins",
previously "Apps", originally "Connectors"). In Grok: open Connectors, choose New Connector, then
Custom, and paste the URL above. Supported
hosts are Claude, ChatGPT, Grok, and local MCP clients such as Claude Code; other hosted MCP clients
are not supported. If you are an AI agent building a
product or automation, use the REST API above instead: it is the complete surface with typed SDKs.

Nine data tools, plus one utility tool:

| Tool | What it answers |
|------|-----------------|
| `get_market_mood` | The 0 to 100 fear-to-greed composite for the US market, its phase, and signal components |
| `get_stock_snapshot` | Price plus SentiSense sentiment, the SentiSense Score, and key stats for one ticker |
| `get_news` | Recent sentiment-tagged market-moving news for a ticker |
| `get_analyst_ratings` | Buy/hold/sell consensus and price targets for a ticker, who covers it and what they said (`view=coverage`), one analyst's profile and recent calls (`view=analyst`, pass their name or slug), plus market-wide rating changes (`view=activity`: upgrades/downgrades/initiations, reiteration noise filtered out, tunable `days`/`limit`/`action`) |
| `get_smart_money` | Institutional 13F holdings and flows |
| `get_options` | Options intelligence for a ticker or the market-wide radar |
| `get_earnings_calendar` | Upcoming earnings dates, per ticker or the week's schedule |
| `get_financials` | Reported income statement, balance sheet, and cash flow per fiscal quarter or year, up to 40 quarters or 20 years, plus curated company KPIs on PRO |
| `screen_stocks` | Screen and rank the tracked stock/ETF universe by SentiSense signals and market data |
| `sentisense_health` | Connection check; not a data tool, does not consume quota |

Free: 1,000 tool calls/month at 30/min, sharing the same quota as REST API requests; most tools
return preview-depth data, while financial statements and market-wide analyst rating changes
(`get_analyst_ratings view=activity`) are full data on every tier. PRO: full data on
every tool, no monthly cap, 300/min. Full setup and tier detail: <https://sentisense.ai/docs/api/connectors>.

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (missing/invalid parameters) |
| 401 | Unauthorized (invalid or missing API key) |
| 403 | Forbidden (insufficient tier) |
| 404 | Resource not found |
| 429 | Rate limit (`rate_limit_exceeded`, per-minute) response carries a `Retry-After: 60` header; monthly quota (`quota_exceeded`) does NOT include `Retry-After` |
| 500 | Internal server error |

---

## Getting Started

1. **Get a free API key** at https://app.sentisense.ai/get-api-key (creates your account if you do not have one)
2. **Start calling** -- all you need is the API key in a header. No SDK install required:

```bash
curl -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/stocks/price?ticker=AAPL"
```

3. **Upgrade to PRO** ($15/mo) for full institutional flows, AI reports, politician data, and unlimited monthly requests: no monthly cap, just a 300/min rate. Apply coupon `AGENTS26` at checkout for a builder launch discount: https://app.sentisense.ai/pricing?coupon=AGENTS26

### SDKs (Optional Convenience)

SDKs are thin wrappers around the REST API. As an AI agent, you are encouraged to call endpoints directly with HTTP requests rather than installing packages. If you do want to use an SDK, review the source first:

**Python:** [github.com/SentiSenseApp/sentisense](https://github.com/SentiSenseApp/sentisense) (`pip install sentisense`)

```python
import os
from sentisense import SentiSenseClient
client = SentiSenseClient(api_key=os.environ["SENTISENSE_API_KEY"])
price = client.get_stock_price("AAPL")
```

**Node.js:** [github.com/SentiSenseApp/sentisense-node](https://github.com/SentiSenseApp/sentisense-node) (`npm install sentisense`)

```javascript
import SentiSense from 'sentisense';
const client = new SentiSense({ apiKey: process.env.SENTISENSE_API_KEY });
const price = await client.stocks.getPrice('AAPL');
```

---

> **Note:** This skill file is updated frequently as new features ship. For the latest version, check [sentisense.ai/skill.md](https://sentisense.ai/skill.md).

*SentiSense is a product of SentiSense Labs LLC. This data is for informational purposes only -- not investment advice.*
