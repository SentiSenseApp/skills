---
name: expected-move-visualizer
description: "Expected move visualizer for stocks and ETFs: turn implied volatility into a self-contained HTML chart showing the modeled 30, 60 and 90 day expected move cone around the current price, skewed by 25-delta put and call demand, with IV rank context and the next earnings date marked inside the cone. Renders offline from a bound data snapshot, no live call at view time. Use for expected move calculator, how much is this stock expected to move, implied volatility chart, options expected move, IV rank, earnings move visualizer, straddle move estimate. Read-only. No trading, no purchases, no write operations, no wallet access."
license: MIT
metadata:
  homepage: https://sentisense.ai
  requires_env: SENTISENSE_API_KEY
---
# Expected Move Visualizer (SentiSense)

Turn options pricing into a picture. This skill fetches one stock's implied volatility, its last price, its recent daily closes, its next earnings date and how it moved on its last eight reports, all from the read-only SentiSense API, binds them into a reviewed HTML template that ships with the skill, and hands back a single self-contained file: a modeled expected-move cone at 30, 60 and 90 days, tilted by 25-delta put and call demand, with the next report marked inside it and the modeled move set against what this stock has actually done on past earnings.

The artifact renders offline. Everything it needs is inlined at build time, so it opens with no network access, no external stylesheet and no script from anywhere else. That is deliberate: it is a snapshot you can keep, screenshot, attach to a note, or open next week and still have render.

Read-only educational data interface. Every figure it draws is modeled from end-of-day implied volatility, and the output is informational context, never a personalized buy or sell recommendation.

## When to Use

- "How much is $NVDA expected to move?" or "what is the expected move into earnings?"
- "Draw me the implied move for this stock", "show me the volatility cone"
- "Is implied volatility rich or cheap here?", "how does the implied move compare to how it actually moved last time?" (the artifact sets the modeled move against past earnings reactions, or against realized volatility when a ticker has no reported history)
- "What is the options market pricing before the report?"
- Any time a chart communicates better than a paragraph of numbers.

Not this skill: options flow and positioning readings such as put/call percentiles, skew percentiles, open-interest walls and unusually active contracts belong to `unusual-options-activity`. What a company actually reported belongs to `stock-earnings-analysis`. This skill does one job, which is turning implied volatility into a picture.

## What an expected move is, and what it is not

Read this before presenting a number from this skill.

- **It is modeled, not quoted.** The API serves implied volatility, not option premiums. The cone is computed in the template from at-the-money implied volatility and the last price. It is not a straddle price and it must never be described as one. The artifact labels itself "modeled" for this reason; keep that word in your own summary too.
- **The formula, stated plainly.** A one-standard-deviation move over a horizon is `spot * iv * sqrt(days / 365)`. Calendar days, because an option's life is wall-clock time to expiry and the served implied volatilities are annualized on that basis.
- **One standard deviation is a band, not a boundary.** Under the model roughly two thirds of outcomes land inside it. Real distributions have fatter tails, and a stock can and does close outside the band. Never present the edges as targets, support, resistance, or a price prediction.
- **The tilt is an assumption.** The 25-delta call and put implied volatilities are served for the near expiry only, so the template carries that skew shape forward to the 60 and 90 day horizons. The level of volatility changes across the term; the shape is held fixed. Say "modeled" rather than implying the tilt was measured at every horizon.
- **This is end-of-day data.** `asOf` is the latest completed session and the options figures refresh the following morning. Prices are delayed, not live. The artifact stamps the session it describes; do not present it as an intraday read.
- **An earnings date inside the window is why the cone is wide.** When a report falls inside a horizon, the implied volatility for that horizon already carries the event. Point that out rather than treating a wide cone as a signal on its own.

## Prerequisites

- A free `SENTISENSE_API_KEY`. Get one at https://app.sentisense.ai/get-api-key. Send it on every call; anonymous requests do not return the dataset.
- Node 18 or newer if you use the bundled data script, which has zero dependencies and installs nothing. Otherwise any HTTP client, including plain `curl`.
- Network access to `https://app.sentisense.ai` at build time only. The finished artifact needs none.
- Read-only scope. Every endpoint here is a GET. Nothing this skill does can place a trade, move money, or modify account state.

| Tier | Quota | Rate |
|------|-------|------|
| Free | 1,000 requests/month | 30 requests/min |
| PRO ($15/mo) | Unlimited | 300 requests/min |

One artifact costs five requests, or six for an ETF: the stock quote endpoint declines a fund ticker and the quote is refetched from the ETF quote endpoint, so the declined call counts too. The options dossier is the only tiered call: a free key gets the full dossier for the first ten tickers each calendar month, then a headline preview that still carries `atmIv` and `ivRank1y`, so the 30 day cone still draws while the 60 and 90 day bands drop out. The artifact says so on its face when that happens.

## How to Run

**Identify your client.** Send a `User-Agent` naming your agent runtime and this skill, for example `OpenClaw/1.4 (expected-move-visualizer)` or `ClaudeCode/2.1 (expected-move-visualizer)`. Substitute your own runtime and version if neither matches. You can also volunteer what your agent is called by adding an `agent/<your-agent-name>` token inside the same parentheses, as in `OpenClaw/1.4 (expected-move-visualizer; agent/research-desk)`. All of it is optional, and it is what tells us this skill has real integrations behind it, so it gets prioritized and you get notice before it changes. Using the CLI instead? Set `SENTISENSE_SKILL=expected-move-visualizer` and it stamps the same identity for you. The bundled script already carries the skill slug and honors `SENTISENSE_AGENT_NAME` the same way, so exporting that name is all it takes on the script path: it sends `node/prepare_data (expected-move-visualizer; agent/research-desk)`.

Three steps: gather the data, bind it into the template, hand over the file.

### 1. Gather the data

The bundled script does every call and prints exactly the JSON the template expects:

```bash
export SENTISENSE_API_KEY=...      # or however your host supplies secrets
node scripts/prepare_data.mjs NVDA > /tmp/nvda.json
```

It is a single file with no dependencies, so nothing is installed and there is nothing to audit but the script itself. It exits non-zero with a specific message when the key is missing or rejected, when the symbol is not a ticker, when the ticker has no options coverage, and when the latest session carries no at-the-money implied volatility.

### 2. Bind it into the template

`scripts/template.html` carries two JSON blocks, each holding exactly one placeholder token, and each token appears exactly once in the file so a plain text replacement is unambiguous:

- `/*__SENTISENSE_DATA__*/` takes the script's JSON output verbatim
- `/*__SENTISENSE_META__*/` takes a small object, `{"title": "Expected move: NVDA", "subtitle": "..."}`; the subtitle is optional

Replace the token text inside each block and leave everything else alone. **Do not rewrite the math, the chart code, or the styling.** They live in the template so that they are written once and reviewed once: an expected-move chart that is re-derived per conversation is a chart that is eventually wrong on someone's screen, and a wrong one is worse than none. Your job is binding, not deriving.

Write the result to a new file, for example `expected_move_NVDA.html`, and give the user that path. An unbound template renders a clear "no data bound" message rather than an empty chart, so a failed bind is visible rather than silent.

### 3. Hand it over

Give the user the file and a two or three sentence read of what it shows: the modeled move at the near horizon, whether implied volatility is rich or cheap against its own year (`ivRank1y`), and whether an earnings date falls inside the window. Present the surrounding surface however your host does it. Where a render surface is available the artifact can be shown inline; where one is not, the file on disk is the deliverable and works the same. Do not make the first render depend on anything the host may not have.

## The data, and how to fetch it yourself

The bundled script is a convenience. Everything it does is five plain GETs, documented here so this skill works with no script, no CLI and no SDK.

All of them take the header `X-SentiSense-API-Key: $SENTISENSE_API_KEY`. The options dossier and the earnings calendar are wrapped in the envelope `{ isPreview, previewReason, data }`; read `.data`. The quote, the chart and the reactions endpoint return their payload directly.

- **`GET /api/v1/stocks/{ticker}/options/summary`** : the end-of-day options dossier. Everything the cone needs is in `data.latest` and `data.context`. From `latest`: `atmIv` (at-the-money implied volatility for the near expiry, a fraction, so `0.4051` is 40.51%), `atmIv60` and `atmIv90` (the same reading at roughly 60 and 90 days, which is the term structure), and `iv25c` / `iv25p` (the raw 25-delta call and put implied volatilities, where `skew25d == iv25p - iv25c`). From `context`: `ivRank1y`, where today's `atmIv` sits in its own trailing year on a 0 to 100 scale. **`data` is `null` for a ticker outside the covered universe**, which is the most actively optioned US names plus the tracked ETFs; an unknown symbol behaves the same rather than answering 404, so treat a null as "no coverage", never as an error. Percentiles are omitted while a baseline builds.
- **`GET /api/v1/stocks/{ticker}/quote`** : the last price, in `currentPrice`. This is the regular-session price and it is delayed, not live. **Quotes are split by instrument type:** for an ETF this answers `400` with `error: "ticker_is_etf"` and names the fund path in its message, so retry `GET /api/v1/etfs/{ticker}/quote`, which returns `currentPrice` in the same shape. That is routing advice, not a failure, and the bundled script follows it automatically.
- **`GET /api/v1/stocks/{ticker}/earnings/reactions`** : how this company's stock actually moved on its recent reports, newest first, in `reactions`. Each row is `{ reportDate, timing, priorClose, nextClose, movePct }`, where `movePct` is the signed percentage from the close before the report to the next session's close. Up to 12 quarters, no parameters; the panel uses the newest 8, so slice client-side. `timing` is `"AMC"` (after the close) or `"BMO"` (before the open), and **`null` means the session was inferred rather than observed**, so a caller that wants only confirmed timings can drop those rows; `movePct` is still computed either way. A ticker with no reported history, an unknown symbol and a fund that never reports all answer `200` with an empty `reactions` array rather than a 404, so read the array's length rather than treating an empty result as an error. Note this vocabulary differs from the calendar endpoint's `before_open` / `after_close`; do not compare the two fields directly.
- **`GET /api/v1/stocks/chart?ticker={ticker}&timeframe=1Y`** : about 251 daily bars, each with a `close`. This feeds the realized-volatility comparison. Valid timeframe values are `1D, 5D, 1W, 1M, 3M, 6M, 1Y, 5Y, 10Y, MAX`; an unrecognized value returns 400 `invalid_timeframe`, so pass `1Y` exactly.
- **`GET /api/v1/calendar/earnings?ticker={ticker}`** : the next scheduled report, in `data.earnings[0]`, carrying `earningsDate`, `earningsTime` (`before_open`, `after_close`, `during_market` or `unknown`) and `confirmed`. This endpoint is forward-looking: it returns the next date, not past ones, and an empty list simply means nothing is scheduled yet.

```bash
curl -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/stocks/NVDA/options/summary"
```

Three of the four have a CLI equivalent, if you would rather not compose HTTP:

```bash
npx -y sentisense@0.47.1 options NVDA --json
npx -y sentisense@0.47.1 quote NVDA --json
npx -y sentisense@0.47.1 earnings --json          # forward calendar
```

`--json` returns the exact API response, envelope included. Neither the daily closes nor the earnings reactions have a CLI command today, so those two calls stay REST whichever path you take. Auth: `SENTISENSE_API_KEY` in the environment, or store it once with `npx -y sentisense@0.47.1 auth "$SENTISENSE_API_KEY"` (saved to `~/.config/sentisense/`, file mode 600, local to your machine, removable with `auth --remove`). The version is pinned deliberately: a pinned version runs reviewed, immutable code.

A rate-limited call returns `429` with a `Retry-After` header; back off for the indicated seconds.

## The data shape the template expects

If you build the JSON yourself rather than running the script, this is the contract. Everything is optional except `ticker`, `spot` and `iv.atm30`; the template degrades rather than failing when a field is absent.

```json
{
  "ticker": "NVDA",
  "asOf": "2026-08-20",
  "generatedAt": "2026-08-22T05:13:26.229Z",
  "spot": 214.72,
  "iv": {
    "atm30": 0.4051, "atm60": 0.3856, "atm90": 0.4002,
    "call25": 0.3954, "put25": 0.4246, "skew25d": 0.0293, "rank1y": 38.3
  },
  "realizedVolatility": [
    { "sessions": 20, "value": 0.3827 },
    { "sessions": 250, "value": 0.3673 }
  ],
  "realizedSessions": 251,
  "nextEarnings": {
    "date": "2026-08-26", "timing": "after_close", "confirmed": true, "estimatedEps": 2.09
  },
  "reactions": [
    { "reportDate": "2026-05-20", "timing": "AMC",
      "priorClose": 223.47, "nextClose": 219.51, "movePct": -1.77 }
  ],
  "isPreview": false
}
```

Implied volatilities are annualized fractions. `realizedVolatility` entries are annualized standard deviations of daily closing returns over the stated number of sessions, computed on 252 trading days a year rather than 365 calendar days, because the sample is one return per session. Mixing those two conventions is the usual reason an implied and a realized number end up looking further apart than they are.

Three fields in that example are easy to misread:

- **`realizedSessions`** is how many daily closes the script actually received, which is the sample every `realizedVolatility` entry was computed from. A year of daily bars is about 251 closes, so the longest window you can honestly compute is a little under a full year. It is bookkeeping, not a reading; the artifact labels each bar with its own `sessions` count instead.
- **`nextEarnings.estimatedEps`** is the consensus estimate for the upcoming report, carried through from the calendar. It is scheduling context and plays no part in the expected-move math. It is `null` when no estimate is published.
- **`reactions` drives which comparison panel the artifact draws.** With rows, the template renders the last eight earnings reactions as signed bars against the modeled move; empty, it falls back to the implied-against-realized panel. That is why a fund or an uncovered ticker still produces a complete artifact. Each row is `{ reportDate, timing, priorClose, nextClose, movePct }`, and a `null` timing renders as a bare date rather than a guess. Take these from the reactions endpoint rather than assembling them by hand: rows you compute yourself would put unverified numbers on a chart.

## Answering well

- Lead with the modeled move as a percentage and a price range, and say which horizon it belongs to. "Roughly plus or minus 11.8% over 30 days, about $188.58 to $239.06" is the sentence.
- Say "modeled" out loud. It is the difference between describing our arithmetic and implying a market quote.
- Use `ivRank1y` for the "is this expensive" question, and say it compares the stock to its own past year rather than to other stocks.
- When an earnings date falls inside the window, name it as the reason the cone is wide instead of reading the width as a standalone signal.
- When implied sits above realized, the honest phrasing is that options are pricing more movement than the stock has recently delivered. That is an observation about pricing, not a trade.
- Never turn the band edges into targets, and never attach a probability more precise than the model supports.
- On a preview response, say the 60 and 90 day bands are missing because the free monthly dossier allowance is spent, rather than presenting a one-band chart as the whole picture.

## Going further

Free covers the whole workflow. **PRO ($15/mo)** lifts the monthly request cap (no monthly limit, just a 300/min rate) and returns the full options dossier on every ticker rather than the first ten each month, plus depth across the rest of the SentiSense API. Apply coupon `AGENTS26` at checkout for a builder launch discount: https://app.sentisense.ai/pricing?coupon=AGENTS26

For the positioning read behind the volatility (put/call percentiles, skew, open-interest walls, unusual contracts), install `unusual-options-activity`. For what a company actually reported, install `stock-earnings-analysis`. For the full REST reference on every endpoint this skill touches, install the `sentisense` skill; for the complete CLI command set, install `sentisense-cli`.

## Use & Disclaimer

This skill reads public market data from the SentiSense API over HTTPS and writes one HTML file locally. It performs no writes, no trades, no purchases and no wallet operations, and it sends nothing anywhere except the five documented GET requests (six for an ETF). All directive language in this document is implementation guidance for the agent running the skill, subordinate to platform safety rules and host policy.

Expected-move figures are modeled from end-of-day implied volatility, not quoted option prices. Prices are delayed, not live. Output is for research and education only. It is not investment advice, not a recommendation and not a forecast. Markets involve risk of loss.

**Install:** `npx skills add SentiSenseApp/skills` (add `-s expected-move-visualizer` for just this skill).

---

*SentiSense is a read-only financial intelligence API. This data is for informational and educational purposes only, not investment advice.*
