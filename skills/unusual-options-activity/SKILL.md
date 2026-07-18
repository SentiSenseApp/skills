---
name: unusual-options-activity
description: "Unusual options activity radar for US stocks: end-of-day IV rank, implied volatility, options sentiment, put/call percentile, 25-delta skew, open-interest walls, and max pain, each ranked against the stock's own trailing history. Use for unusual options activity, options flow scanner, IV rank, implied volatility, options sentiment, put/call ratio, max pain, open-interest walls, spotting where options positioning is stretched for a ticker. Read-only. No trading, no purchases, no write operations, no wallet access."
license: MIT
metadata:
  homepage: https://sentisense.ai
  requires_env: SENTISENSE_API_KEY
---
# Options Radar (SentiSense)

Read the options market for US stocks without pulling and cleaning a full option chain yourself. This skill turns each session's chain into a small set of end-of-day analytics through the read-only SentiSense API, and it ranks every reading against that stock's own trailing history rather than against other stocks. You get a market-wide radar of the most interesting names, and a per-stock dossier covering IV rank, put/call percentile, 25-delta skew, open-interest walls, max pain, and the session's unusually active contracts.

Read-only educational data interface. Output is informational context about how a chain looks today versus its own past, never a personalized buy or sell recommendation, and never a forecast.

## When to Use

Reach for this skill when the question is about options positioning or activity on a stock:

- "Any unusual options activity in $NVDA today?" (unusually active contracts, ranked by premium)
- "Where is implied volatility for this name relative to its own range?" (IV rank)
- "Is the options market leaning puts or calls here?" (put/call ratio and its percentile)
- "What is the downside skew on $TSLA?" (25-delta put-minus-call skew and its percentile)
- "Where are the open-interest walls and max pain?" (strike structure for the dossier expiry)
- "Which stocks have the most stretched options readings right now?" (the market-wide radar board)

This skill pairs naturally with `stock-sentiment`, `politicians-stock-tracker`, and `institutional-13f-tracker`: the strongest reads come from convergence. Rich call activity that lines up with climbing sentiment, a congressional buy, and institutional accumulation on the same ticker is a story; any one signal alone is noise.

Do not use it for order entry, portfolio management, greeks-based hedging, or personalized advice. It has no write, trading, or wallet surface; every endpoint is a GET.

## What this data actually is (read before interpreting)

Options data is easy to over-read. Four things to hold onto:

- **It is end-of-day, not real-time.** Each reading is the latest completed session, refreshed the next morning after the session settles. The `asOf` date is the prior trading day. This is not an intraday tape, so it does not classify sweeps or blocks and it does not stream live prints. "Unusually active contracts" means the session's volume ran far above standing open interest, which is a fresh-positioning signal, not a live order-flow feed.
- **Percentiles are the point, not the raw levels.** A put/call ratio of 0.9 or an IV of 45% means little on its own. Every reading is served next to its rank within the ticker's own trailing window (a percentile for put/call and skew, a min-max range position for IV rank), so "put/call volume at the 92nd percentile of its 1y range" is the actual signal: unusual *for this specific name*. Lead with the ranked context, not the raw number.
- **Coverage is a bounded universe.** Roughly 950 of the most actively optioned US stocks, reported in the overview's `coverageCount`. A ticker outside it returns `200` with `data: null` (summary) or an empty `series` (history). Treat a null as "not covered", not as an error. The authoritative covered list is the `rows` of `/options/overview`.
- **Building baseline is not zero.** A covered ticker with too little history (roughly under 60 sessions) or below a liquidity floor returns its raw readings with the percentiles and `interestScore` omitted while its baseline accrues. Treat a missing percentile as "not enough history yet", never as a low reading.

## Prerequisites

- A free `SENTISENSE_API_KEY`. Get one at https://app.sentisense.ai/get-api-key. The key is required on every call; anonymous requests return `401 api_key_required`.
- Any HTTP client. Plain `curl` works, or Python 3.8+ using only the standard library (`urllib`, `json`); no third-party packages required. On macOS python.org installs can raise `CERTIFICATE_VERIFY_FAILED` (missing CA certs): run the bundled `Install Certificates.command`, use the system `/usr/bin/python3`, or use `curl`.
- Network access to `https://app.sentisense.ai`.
- Read-only scope. Every endpoint here is a GET. Nothing this skill does can place a trade, move money, or modify account state.

| Tier | Request quota | Rate | Options data |
|------|---------------|------|--------------|
| Free | 1,000 requests/month | 30 requests/min | Radar: top 25 rows plus every market-pulse aggregate. Per-stock dossier: full detail for the first 10 calls each calendar month, then a headline-only preview. History: `1y` window. |
| PRO ($15/mo) | Unlimited | 300 requests/min | Full radar board, unlimited full dossiers, and up to `5y` history. |

The free tier exercises every workflow below on real data. Uncovered tickers that return `data: null` never spend the monthly dossier meter.

## How to Run

Issue HTTP GET requests to `https://app.sentisense.ai` and synthesize the JSON into a concise, sourced answer. Authenticate every request with the `X-SentiSense-API-Key` header; keep the key in the shell environment and never place it in a query string or in user-facing output.

Every endpoint returns the wrapped envelope `{ isPreview, previewReason, data }`. When `isPreview` is `true` (`previewReason: "PRO_REQUIRED"`), say so ("showing the free preview slice"). Null-valued fields are omitted from the JSON entirely, so check for field presence rather than comparing against `null`. Two distinct `429` responses exist: a per-minute `rate_limit_exceeded` includes a `Retry-After: 60` header, so wait that long before retrying; a monthly `quota_exceeded` carries no `Retry-After` header and does not clear until the next calendar month, so stop calling rather than retrying.

```python
import os, json, urllib.request

def get(path):
    req = urllib.request.Request(
        f"https://app.sentisense.ai{path}",
        headers={"X-SentiSense-API-Key": os.environ["SENTISENSE_API_KEY"]},
    )
    with urllib.request.urlopen(req) as r:
        return json.load(r)

board = get("/api/v1/options/overview")
data = board.get("data")  # None before the first nightly build
rows = (data or {}).get("rows", [])
```

## Endpoints

- **`GET /api/v1/options/overview`** : the market-wide radar board, one row per covered ticker plus a few market-pulse aggregates (`asOf`, `medianIvRank`, `marketPcVol`, `extremeCount`, `coverageCount`). Rows arrive ranked by `interestScore` descending, so the top of the list is the most interesting names today; building-baseline rows sort last. Free keys receive the top 25 rows plus `totalCount`; PRO keys receive every row. Each row carries `ticker`, `name`, `sector`, `asOf`, `sentiment` (-1 to +1, options-implied), `interestScore` (0-100), `pcVol` and `pcVolPctl1y`, `atmIv` and `ivRank1y`, `skew25d` and `skewPctl1y`, `notionalVol`, `ivMove20`, `observations1y`, `unusualCount`, `maxVolOiRatio`, `maxUnusualPremium`, and the single heaviest wall as `wallSide` / `wallStrike` / `wallShare`.
- **`GET /api/v1/stocks/{ticker}/options/summary`** : the latest dossier for one stock. `data` is `null` for uncovered or unknown tickers (which never spend the dossier meter), otherwise `{ asOf, sentiment, latest, context, oiWalls, unusual }`. Free keys receive this full dossier for the first 10 calls each calendar month; after that, `data` is a headline-only preview of exactly `{ asOf, sentiment, ivRank1y, atmIv, pcVol, pcVolPctl1y, maxPain }` with `isPreview: true` until the monthly reset. `latest` is today's aggregate (volumes, open interest, `pcVol`/`pcOi`, `vwIv`, `atmIv` plus the `atmIv60`/`atmIv90` term structure, `iv25c`/`iv25p`, `skew25d`, `netDelta`, `notionalVol`, `contracts`). `context` holds `ivRank1y` (a min-max range position, 0-100) plus the percentile readings (`pcVolPctl1y`, `pcVolPctl5y`, `pcOiPctl1y`, `skewPctl1y`) and `observations1y`. `oiWalls` holds `expiry`, `maxPain`, and up to three `callWalls` / `putWalls` `{ strike, oi }` levels. `unusual` is the top 5 contracts by premium, each `{ contract, type, strike, expiry, dte, volume, oi, volOiRatio, premium }`.
- **`GET /api/v1/stocks/{ticker}/options/history`** : the daily aggregate time series, ascending by date, `{ ticker, window, series }`. Each `series` element has the same shape as `latest`. `window` is `1y` (default), `2y`, or `5y`; `5y` returns all stored history (currently about two years, backfilled from mid-2024). Free keys always receive `1y` regardless of the requested value; the response's `window` field reports what was actually served.

## Workflows

**1. Scan the radar for stretched names**

```bash
curl -s -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/options/overview"
```
Rows are pre-ranked by `interestScore`. Lead with the top few by that score, then re-sort client-side for a specific lens: `notionalVol` for "most active by premium", `abs(ivMove20)` for "biggest IV moves", or `pcVolPctl1y` for the most put-heavy names. Always report the percentile alongside the raw reading, and skip rows where `interestScore` is omitted (baseline still building).

**2. Read one stock's options dossier**

```bash
curl -s -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/stocks/NVDA/options/summary"
```
Summarize in percentile terms: where `atmIv` sits in its 1y range (`ivRank1y`), whether `pcVol` is high or low for this name (`pcVolPctl1y`), and which way `skew25d` leans (positive means puts bid richer than calls, a downside-demand tilt). Note `maxPain` and the nearest walls as context for the dossier expiry, not as targets. If `context` percentiles are missing, say the baseline is still building. If `isPreview` is `true` instead, the free monthly dossier meter is spent: only the headline fields are present, so summarize those and say the full dossier needs PRO or the next monthly reset, rather than reading the missing sections as a data gap.

**3. Spot unusually active contracts**

```bash
curl -s -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/stocks/TSLA/options/summary" | \
  python3 -c "import sys,json; d=json.load(sys.stdin).get('data') or {}; print(json.dumps(d.get('unusual', []), indent=2))"
```
The `unusual` list is contracts whose session volume ran far above open interest (`volOiRatio`), ranked by dollar `premium`. A high ratio on a short-dated contract is often event-driven, so quote the `dte` and let the reader weigh it. This is end-of-day activity, so describe it as "unusually active in the last session", not as a live sweep.

**4. Chart how a reading has trended**

```bash
curl -s -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/stocks/AAPL/options/history?window=1y"
```
Pull `atmIv`, `pcVol`, or `skew25d` out of `series` to show the trend behind today's percentile. A free key always gets `1y`; the `window` field confirms what was served.

**5. Follow the convergence.** When rich call activity or a low put/call percentile lines up with climbing sentiment (`stock-sentiment`), a congressional buy (`politicians-stock-tracker`), or institutional accumulation (`institutional-13f-tracker`) on the same ticker in the same window, that agreement is the read worth surfacing. Say so explicitly, cite each source, and note when the dots disagree (for example, bullish flow against a put-heavy skew) rather than forcing a clean story.

## Answering well

- **Lead with the percentile.** "IV rank 74 (elevated for this name)" carries the signal; the bare 53% IV does not. Do the same for put/call and skew.
- **Say end-of-day.** Frame every reading as the latest completed session. Never imply real-time flow, live sweeps, or intraday order tape.
- **Do not overstate structure.** Max pain and open-interest walls are descriptive magnets and context, not predictions of where the stock will close. `netDelta` is the chain's aggregate net delta exposure (open-interest-weighted), not an inference about dealer books and not a gamma or hedging figure.
- **Respect the baseline.** If percentiles or `interestScore` are omitted, state that history is still accruing rather than reading it as a zero or a bearish signal.
- **Report only what the API returns.** Do not infer greeks, dealer gamma, or intentions the data does not contain, and do not frame any of it as advice. Options carry a high level of risk; this is derived analytics for education.

## Going further

Free covers every workflow above: the top of the radar, ten full dossiers a month, and a year of history. **PRO ($15/mo)** lifts the monthly request cap (no monthly limit, just a 300/min rate), returns the full radar board and unlimited full dossiers, and deepens history, plus sentiment, smart-money flows, insider detail, and AI insights across the rest of the SentiSense API. Apply coupon `AGENTS26` at checkout for a builder launch discount: https://app.sentisense.ai/pricing?coupon=AGENTS26

**Install:** `npx skills add SentiSenseApp/skills` (add `-s unusual-options-activity` for just this skill).

---

*SentiSense is a read-only financial intelligence API. Options analytics here are derived, end-of-day, and for informational and educational purposes only, not investment advice. Options carry a high level of risk.*
