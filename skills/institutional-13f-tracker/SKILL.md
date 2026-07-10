---
name: institutional-13f-tracker
description: "13F institutional ownership tracker: quarterly hedge fund and mutual fund holdings from SEC 13F filings, by ticker or by manager, with top institutional holders per stock, quarter-over-quarter buying and selling deltas, and activist investor positions across thousands of managers. Use for 13F filings, 13F holdings changes, hedge fund holdings, institutional ownership by ticker, who owns this stock, activist fund positions, and superinvestor portfolios. Read-only. No trading, no purchases, no write operations, no wallet access."
license: MIT
metadata:
  homepage: https://sentisense.ai
  requires_env: SENTISENSE_API_KEY
---
# Institutional 13F Tracker (SentiSense)

See who owns a stock and how the big money is repositioning. This skill reads institutional ownership from SEC 13F filings through the read-only SentiSense API: the top institutional holders for any ticker, aggregate buying and selling per stock, activist positions, and a full portfolio for any manager (from Berkshire Hathaway to the largest index funds), with quarter-over-quarter change types (new, increased, decreased, sold out) across thousands of filers.

Read-only educational data interface. Output is informational context, never a personalized buy or sell recommendation.

## When to Use

Reach for this skill when the question is about institutional ownership or 13F positioning:

- "Who owns $NVDA?" or "top institutional holders of $TSLA"
- "What did Berkshire Hathaway buy and sell last quarter?" (a manager's whole portfolio)
- "Is institutional money accumulating or distributing $AAPL?" (aggregate flows)
- "Which activist funds took new positions this quarter?"
- "How did 13F ownership of $COIN change quarter over quarter?"

This skill pairs naturally with `politicians-stock-tracker`: line up 13F accumulation against a congressional purchase on the same ticker. Convergence across sources is the high-conviction read.

Do not use it for order entry, portfolio management, or personalized advice. It has no write, trading, or wallet surface; every endpoint is a GET.

## What this data actually is (read before interpreting)

- **13F is quarterly and lagged.** Institutions file 13F-HR within 45 days after each quarter end, so the freshest complete data is always the prior quarter. Never present it as real-time positioning.
- **Always resolve the quarter first.** Every endpoint except `/quarters` needs a `reportDate`. The most recent quarter is `pending: true` during the 45-day filing window and holds only early filers; use the first quarter with `pending: false` for complete data.
- **Filer categories:** `INDEX_FUND`, `HEDGE_FUND`, `ACTIVIST`, `PENSION`, `BANK`, `INSURANCE`, `MUTUAL_FUND`, `SOVEREIGN_WEALTH`, `ENDOWMENT`, `OTHER`.
- **Parent/subsidiary rollups.** Large managers file under many CIKs (e.g. Vanguard). A filer profile carries `multiCikRollup` / `childCikCount` / `childCiks` so sub-manager holdings roll up into one portfolio. Report the rollup, not double-counted child rows.
- **Report values as given.** The API returns `valueUsd` (institution holdings) and `value` (per-holder) already denominated; quote them as the reported 13F value and do not re-scale or invent a unit.

## Prerequisites

- A free `SENTISENSE_API_KEY`. Get one at https://app.sentisense.ai/get-api-key. Required on every call; anonymous requests return `401 api_key_required`.
- Any HTTP client. Plain `curl` works, or Python 3.8+ using only the standard library. On macOS python.org installs can raise `CERTIFICATE_VERIFY_FAILED`: run `Install Certificates.command`, use the system `/usr/bin/python3`, or use `curl`.
- Network access to `https://app.sentisense.ai`.
- Read-only scope. Every endpoint here is a GET.

| Tier | Quota | Rate | 13F data |
|------|-------|------|----------|
| Free | 1,000 requests/month | 30 requests/min | preview slice (top N per endpoint) |
| PRO ($15/mo) | Unlimited | 300 requests/min | full holder lists and full portfolios |

## How to Run

Issue HTTP GET requests to `https://app.sentisense.ai`, authenticated with the `X-SentiSense-API-Key` header. Keep the key in the shell environment; never place it in a query string or in user-facing output.

**Step 1, always: resolve the quarter.** `/quarters` is a bare array (no envelope). Every other institutional endpoint returns the wrapped envelope `{ isPreview, previewReason, data }`, so read `.data` before iterating. A `429` returns a `Retry-After` header; back off rather than serving a stale value.

```bash
# 1) get valid reporting quarters, pick the first with pending=false
curl -s -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/institutional/quarters"
# -> [{ "value": ..., "label": "Q4 2025", "reportDate": "2025-12-31", "pending": false }, ...]
```

## Endpoints

- **`GET /api/v1/institutional/quarters`** : available 13F reporting quarters. **Public**, bare array of `{ value, label, reportDate, pending }`, newest first. Call this first; use the first `pending: false` `reportDate` everywhere below.
- **`GET /api/v1/institutional/holders/{ticker}?reportDate=`** : institutional holders for a stock. The holder list is nested at **`data.holders`** (not `data` directly). Each holder: filer name, category, shares, value, `changeType` (`NEW` / `INCREASED` / `DECREASED` / `SOLD_OUT` / `UNCHANGED`). `data` always carries `holderCount` (full-quarter count). **Paging (recommended):** pass `limit` (1-1000), `offset`, `sortBy`, `sortDir`. A mega-cap can have 5,000+ holders, and `notableChanges` (holders with a 10%+ change on 10k+ shares) plus `returnedCount` are returned **only when `limit` is passed**. Free: top 5.
- **`GET /api/v1/institutional/flows?reportDate=`** : aggregate institutional buying/selling per ticker. Free: top 5.
- **`GET /api/v1/institutional/activist?reportDate=`** : activist-filer positions for the quarter (NEW or INCREASED stakes). Free: top 3; PRO: full.
- **`GET /api/v1/institutional/institutions`** : the filterable universe of tracked filers (use it to find a manager's slug/CIK for the endpoint below). Query `category`, `minAumUsd`, `sort`, `quarter`. Full list on every tier, and quota-exempt.
- **`GET /api/v1/institutional/institution/{slugOrCik}`** : a single manager's profile, summary stats, and current-quarter equity holdings. Resolve by URL slug (`Berkshire-Hathaway`) or numeric CIK (`1067983`). Free: profile + top 10 holdings; PRO: full holdings. Holdings include `ticker, companyName, shares, valueUsd, changeType, sharesChange, sharesChangePct, portfolioWeight`, plus `multiCikRollup` / `childCiks` for parent/subsidiary rollups. Returns 404 for an unknown slug or CIK.

## Workflows

**1. Who owns this stock?**

```bash
Q=2025-12-31  # first pending:false reportDate from /quarters
curl -s -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/institutional/holders/NVDA?reportDate=$Q&limit=25"
```
Read `data.holders`; lead with the largest holders and the `NEW` / `INCREASED` / `SOLD_OUT` change types and `notableChanges` (returned because `limit` is set).

**2. A manager's whole portfolio (what did they buy and sell?)**

```bash
curl -s -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/institutional/institution/Berkshire-Hathaway"
```
Summarize new positions, adds, trims, and exits by `changeType`, and the biggest holdings by `portfolioWeight`.

**3. Aggregate accumulation vs distribution**

```bash
curl -s -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/institutional/flows?reportDate=$Q"
```

**4. Activist watch**

```bash
curl -s -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/institutional/activist?reportDate=$Q"
```

**5. Follow the convergence.** When institutional accumulation lines up with a congressional purchase (`politicians-stock-tracker`) on the same ticker, that agreement is the read worth surfacing. Cite each source.

## Answering well

- Always state the `reportDate` you are quoting and that 13F data is a quarterly snapshot filed up to 45 days after quarter end.
- Attribute holdings to the filer and category; roll parent/subsidiary CIKs into one manager rather than double-counting.
- Use `changeType` and `sharesChangePct` to describe direction; quote `valueUsd` / `value` as the reported 13F value without re-scaling.
- Report only what the API returns. Do not infer positions, prices, or intent that are not in the data, and do not frame any of it as advice.

## Going further

Free covers every workflow above at a preview depth (top holders, top-10 portfolio). **PRO ($15/mo)** lifts the monthly cap (no monthly limit, just a 300/min rate) and returns full holder lists and full manager portfolios, plus congressional, insider, options, and AI-insight data across the SentiSense API. Apply coupon `AGENTS26` at checkout for a builder launch discount: https://app.sentisense.ai/pricing?coupon=AGENTS26

---

*SentiSense is a read-only financial intelligence API. This data is for informational and educational purposes only, not investment advice.*
