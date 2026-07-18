---
name: politicians-stock-tracker
description: "Track congress stock trades and politician stock trades: Pelosi tracker, senate stock trades, House trades, congress trades by ticker, STOCK Act disclosures, and congressional trading data from the SentiSense Politicians Trading API. Read-only. No trading, no purchases, no write operations, no wallet access."
license: MIT
metadata:
  homepage: https://sentisense.ai
  requires_env: SENTISENSE_API_KEY
---
# Politicians Stock Tracker (SentiSense)

Track what the U.S. Congress is buying and selling. This skill reads congressional STOCK Act disclosures, the trades that Senators and Representatives are legally required to report, through the read-only SentiSense API: recent trades across all members, the trading history for a single stock, the most active politicians, and a full per-member profile. Amounts, chambers, parties, and the gap between when a trade happened and when it was disclosed all come straight from the official filings.

Read-only educational data interface. Output is informational context, never a personalized buy or sell recommendation.

## When to Use

Reach for this skill when the question is about congressional or political trading activity:

- "What did Congress buy this week?" or "recent congressional stock trades"
- "Has any senator or representative traded $NVDA?" (per-ticker congressional history)
- "Show me Nancy Pelosi's stock trades" or any single member's activity
- "Which politicians trade the most?" (most active members by trade count)
- "Did a politician disclose a buy right before the stock moved?" (disclosure-delay context)

This skill pairs naturally with `institutional-13f-tracker`: cross-reference a congressional buy against institutional 13F accumulation on the same ticker. High-conviction reads come from convergence across sources, not from any one signal in isolation.

Do not use it for order entry, portfolio management, or personalized advice. It has no write, trading, or wallet surface; every endpoint is a GET.

## What this data actually is (read before interpreting)

- **Amounts are ranges, not exact values.** STOCK Act filings disclose a dollar band (for example "$1,001 - $15,000"). The API returns the raw `amountRange` string plus parsed `amountMin` / `amountMax`. Never present a single precise dollar figure.
- **"Recent" means recently disclosed, not recently traded.** A filing can reveal a transaction made up to 45 days earlier. Each trade carries both `transactionDate` and `disclosureDate`, plus `disclosureDelayDays`. Always state which date you are quoting.
- **Chambers are `SENATE` and `HOUSE`.** Each trade also carries `party`, `state`, and `owner` (the trade may belong to the member, a spouse, or a dependent).
- **Source:** official House Clerk and Senate eFD filings, updated daily.

## Prerequisites

- A free `SENTISENSE_API_KEY`. Get one at https://app.sentisense.ai/get-api-key. The key is required on every call; anonymous requests return `401 api_key_required`.
- Any HTTP client. Plain `curl` works, or Python 3.8+ using only the standard library (`urllib`, `json`); no third-party packages required. On macOS python.org installs can raise `CERTIFICATE_VERIFY_FAILED` (missing CA certs): run the bundled `Install Certificates.command`, use the system `/usr/bin/python3`, or use `curl`.
- Network access to `https://app.sentisense.ai`.
- Read-only scope. Every endpoint here is a GET. Nothing this skill does can place a trade, move money, or modify account state.

| Tier | Quota | Rate | Congressional data |
|------|-------|------|--------------------|
| Free | 1,000 requests/month | 30 requests/min | preview slice (top N per endpoint) |
| PRO ($15/mo) | Unlimited | 300 requests/min | full history and full lists |

The free tier exercises every workflow below; preview-gated endpoints return a truncated but real slice on a free key.

## How to Run

Issue HTTP GET requests to `https://app.sentisense.ai` and synthesize the JSON into a concise, sourced answer. Authenticate every request with the `X-SentiSense-API-Key` header; keep the key in the shell environment and never place it in a query string or in user-facing output.

The politician endpoints return the wrapped envelope `{ isPreview, previewReason, data }`. For `/activity`, `/filings/{ticker}`, and `/members`, `.data` is a **list**; for `/member/{slug}`, `.data` is an **object** `{ profile, recentTrades, topTickers }` (read those keys, do not iterate it as a list). When `isPreview` is true, say so ("showing the free preview slice"). A rate-limited call returns `429` with a `Retry-After` header; back off for the indicated seconds rather than serving a stale value.

```python
rows = raw.get("data", []) if isinstance(raw, dict) else raw
```

## Endpoints

- **`GET /api/v1/politicians/activity`** : recent congressional trades across all members, sorted by disclosure date (most recently disclosed first). Query `lookbackDays` (1-365) to control the window. Free: top 5; PRO: full. Each trade: `politicianName`, `firstName`, `lastName`, `chamber`, `party`, `state`, `bioguideId`, `imageUrl`, `ticker`, `assetDescription`, `assetType` (`Stock`, `ETF`, or `Stock Option`), `assetMetadata` (`null`, or `{kind:"OPTION", optionType, strikePrice, expirationDate}`), `transactionType` (`PURCHASE` / `SALE` / `EXCHANGE` / `OTHER`), `transactionDate`, `disclosureDate`, `disclosureDelayDays`, `amountRange`, `amountMin`, `amountMax`, `owner`, `urlSlug`.
- **`GET /api/v1/politicians/filings/{ticker}`** : congressional trades for one stock, most recently disclosed first. Query `lookbackDays` (1-365, default 90) to set the window. Free: top 3; PRO: full.
- **`GET /api/v1/politicians/members`** : all tracked politicians with trading summaries, sorted by total trade count. Free: top 5; PRO: full. Use the returned `urlSlug` to drill into a member.
- **`GET /api/v1/politicians/member/{slug}`** : one politician's profile: summary stats, recent trades, and top tickers. Free: preview-wrapped; PRO: full detail.

## Workflows

**1. This week's congressional trades**

```bash
curl -s -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/politicians/activity?lookbackDays=7"
```
Summarize by member and ticker; lead with the largest `amountRange` bands and note the `disclosureDelayDays`.

**2. Has Congress traded a specific stock?**

```bash
curl -s -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/politicians/filings/NVDA"
```
Report purchases vs sales (`transactionType`), which members and parties, and the transaction-to-disclosure gap.

**3. A specific politician's activity**

```bash
# find the member's slug
curl -s -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/politicians/members"
# then pull their profile and history
curl -s -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/politicians/member/{slug}"
```

**4. Follow the convergence.** When a congressional buy lines up with institutional 13F accumulation (`institutional-13f-tracker`) on the same ticker, that agreement is the signal worth surfacing. Say so explicitly and cite each source.

## Answering well

- Always distinguish `transactionDate` (when they traded) from `disclosureDate` (when it was reported), and mention the delay.
- Quote the `amountRange` band, never a single invented number.
- Attribute party, chamber, and state; flag when `owner` is a spouse or dependent rather than the member.
- Report only what the API returns. Do not infer trades, amounts, or motives that are not in the data, and do not frame any of it as advice. This is public-disclosure data presented for education.

## Going further

Free covers every workflow above at a preview depth. **PRO ($15/mo)** lifts the monthly cap (no monthly limit, just a 300/min rate) and returns full congressional history and full member lists, plus institutional flows, insider detail, and AI insights across the SentiSense API. Apply coupon `AGENTS26` at checkout for a builder launch discount: https://app.sentisense.ai/pricing?coupon=AGENTS26

**Install:** `npx skills add SentiSenseApp/skills` (add `-s politicians-stock-tracker` for just this skill).

---

*SentiSense is a read-only financial intelligence API. This data is for informational and educational purposes only, not investment advice.*
