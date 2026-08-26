---
name: options-payoff-calculator
description: "Options payoff calculator for stocks and ETFs, pre-loaded with live data for the ticker instead of hand typed inputs: an interactive profit and loss chart at expiry for long calls, long puts, covered calls, cash secured puts, bull call spreads, bear put spreads, straddles, strangles and iron condors, with breakevens, max profit, max loss and the expected move band drawn in behind the curve. The real last price, implied volatility at 30, 60 and 90 days, the 25 delta skew, the IV rank and the next earnings date are bound in at build time. Premiums are modeled with Black-Scholes from end of day implied volatility, not quoted from a live options chain. Renders offline, no live call at view time. Use for options payoff calculator, options payoff diagram, options profit calculator, options P/L chart, covered call calculator, vertical spread calculator, straddle payoff, iron condor calculator, options breakeven calculator. Read-only. No trading, no purchases, no write operations, no wallet access."
license: MIT
metadata:
  homepage: https://sentisense.ai
  requires_env: SENTISENSE_API_KEY
---
# Options Payoff Calculator (SentiSense)

Most payoff calculators start empty and ask you to type in a price, a strike and a volatility. This one starts full. It fetches one ticker's last price, its at-the-money implied volatility at roughly 30, 60 and 90 days, its 25-delta skew, its IV rank and its next earnings date from the read-only SentiSense API, binds them into a reviewed HTML template that ships with the skill, and hands back a single self-contained file: a profit-and-loss-at-expiry diagram for nine common strategies, with breakevens, max profit, max loss, and the expected move band drawn in behind the curve so the payoff is read against what the market is actually pricing.

The artifact renders offline. Everything it needs is inlined at build time, so it opens with no network access, no external stylesheet and no script from anywhere else. The strategy picker, the strike and expiry controls and the diagram all work from the bound snapshot. It is a file you can keep, screenshot, attach to a note, or open next week and still have render.

Read-only educational data interface. Every premium it prints is modeled from end-of-day implied volatility, not quoted from an options chain, and the output is informational context, never a personalized buy or sell recommendation. Nothing here places an order.

## When to Use

- "What does a $220 call on $NVDA look like?", "draw me the payoff for a covered call"
- "Where does this spread break even?", "what is the max loss on an iron condor here?"
- "Is a straddle or a strangle better into this report?" (the diagram shows both against the same expected move band)
- "What would selling a cash secured put 5% below here pay me?"
- Any time the shape of a position communicates better than four numbers in a sentence.

Not this skill: options flow and positioning readings such as put/call percentiles, skew percentiles, open-interest walls and unusually active contracts belong to `unusual-options-activity`. The implied move on its own, set against how a stock has actually reacted to past reports, belongs to `expected-move-visualizer`. What a company actually reported belongs to `stock-earnings-analysis`. This skill does one job, which is turning a strategy into a picture with real numbers behind it.

## What a modeled premium is, and what it is not

Read this before presenting a premium from this skill. It is the single thing most likely to be misread.

- **We do not serve an options chain, and this skill does not pretend to.** There is no bid, no ask, no open interest and no last trade behind any number here. The template prices each contract with Black-Scholes from the implied volatility the API serves. Say "modeled" out loud when you present a figure; the artifact labels every one of them that way for the same reason.
- **The volatility input is end-of-day.** `asOf` is the latest completed session and the options figures refresh the following morning. A premium built on yesterday's volatility is a fair description of yesterday's market, not a quote you could hit this morning.
- **The strikes are rounded, not listed.** The template rounds to a conventional increment so the diagram reads like an order ticket. With no chain to check against, a rounded strike is a plausible listing and never a confirmed one.
- **The model's known gaps, stated rather than buried.** Black-Scholes here assumes European exercise and no dividend, at a flat 4% annual rate. A dividend-paying underlying prices its calls a little cheaper and its puts a little richer than this; American exercise carries a small early-exercise premium the model has no term for. Both are small next to the fact that the volatility is a day old, and none of the three is the reason a real fill would differ most. That reason is the bid-ask spread, which is not shown here at all.
- **The skew is an interpolation across four numbers.** The API serves an at-the-money volatility per tenor plus one pair of 25-delta legs, for the near expiry only. The template reuses that shape at every tenor, bending volatility linearly in standardized moneyness between the anchors and flattening past them. It is a defensible curve, not a fitted surface, and a far out-of-the-money strike is where it is weakest.
- **Max profit and max loss are model outputs at expiry, not risk limits.** They describe the payoff diagram, they assume the position is held to expiry, and they say nothing about margin, assignment, or what the position is worth on any day before that.

## Prerequisites

- A free `SENTISENSE_API_KEY`. Get one at https://app.sentisense.ai/get-api-key. Send it on every call; anonymous requests do not return the dataset.
- Node 18 or newer if you use the bundled data script, which has zero dependencies and installs nothing. Otherwise any HTTP client, including plain `curl`.
- Network access to `https://app.sentisense.ai` at build time only. The finished artifact needs none.
- Read-only scope. Every endpoint here is a GET. Nothing this skill does can place a trade, move money, or modify account state.

| Tier | Quota | Rate |
|------|-------|------|
| Free | 1,000 requests/month | 30 requests/min |
| PRO ($15/mo) | Unlimited | 300 requests/min |

One artifact costs three requests, or four for an ETF: the stock quote endpoint declines a fund ticker and the quote is refetched from the ETF quote endpoint, so the declined call counts too. The options dossier is the only tiered call: a free key gets the full dossier for the first ten tickers each calendar month, then a headline preview that still carries `atmIv` and `ivRank1y`. On that preview the 30 day expiry still prices in full while the 60 and 90 day options drop out of the picker and the skew goes flat. The artifact says so on its face when that happens.

## How to Run

**Identify your client.** Send a `User-Agent` naming your agent runtime and this skill, for example `OpenClaw/1.4 (options-payoff-calculator)` or `ClaudeCode/2.1 (options-payoff-calculator)`. Substitute your own runtime and version if neither matches. You can also volunteer what your agent is called by adding an `agent/<your-agent-name>` token inside the same parentheses, as in `OpenClaw/1.4 (options-payoff-calculator; agent/research-desk)`. All of it is optional, and it is what tells us this skill has real integrations behind it, so it gets prioritized and you get notice before it changes. Using the CLI instead? Set `SENTISENSE_SKILL=options-payoff-calculator` and it stamps the same identity for you. The bundled script already carries the skill slug and honors `SENTISENSE_AGENT_NAME` the same way, so exporting that name is all it takes on the script path: it sends `node/prepare_data (options-payoff-calculator; agent/research-desk)`.

Three steps: gather the data, bind it into the template, hand over the file. The bundled script can do the first two together.

### 1. Gather the data

```bash
export SENTISENSE_API_KEY=...      # or however your host supplies secrets
node scripts/prepare_data.mjs NVDA > /tmp/nvda.json
```

It is a single file with no dependencies, so nothing is installed and there is nothing to audit but the script itself. It exits non-zero with a specific message when the key is missing or rejected, when the symbol is not a ticker, when the ticker has no options coverage, and when the latest session carries no at-the-money implied volatility.

### 2. Bind it into the template

`scripts/template.html` carries two JSON blocks, each holding exactly one placeholder token, and each token appears exactly once in the file so a plain text replacement is unambiguous:

- `/*__SENTISENSE_DATA__*/` takes the script's JSON output verbatim
- `/*__SENTISENSE_META__*/` takes a small object, `{"title": "Options payoff: NVDA", "subtitle": "..."}`; the subtitle is optional

Replace the token text inside each block and leave everything else alone. **Do not rewrite the pricing math, the payoff engine, the chart code or the styling.** They live in the template so that they are written once and reviewed once: a payoff diagram re-derived per conversation is a diagram that is eventually wrong on someone's screen, and a wrong one is worse than none. Your job is binding, not deriving. An unbound template renders a clear "no data bound" message rather than an empty chart, so a failed bind is visible rather than silent.

Or let the script do it, which is the same two steps in one command:

```bash
node scripts/prepare_data.mjs NVDA --out payoff_NVDA.html
```

It prints the path it wrote and nothing else. Both paths produce the same artifact.

### 3. Hand it over

Give the user the file and a two or three sentence read of what it shows: the default position, where it breaks even, and whether the expected move band reaches that far. Present the surrounding surface however your host does it. Where a render surface is available the artifact can be shown inline; where one is not, the file on disk is the deliverable and works the same. Do not make the first render depend on anything the host may not have.

## The data, and how to fetch it yourself

The bundled script is a convenience. Everything it does is three plain GETs, documented here so this skill works with no script, no CLI and no SDK.

All of them take the header `X-SentiSense-API-Key: $SENTISENSE_API_KEY`. The options dossier and the earnings calendar are wrapped in the envelope `{ isPreview, previewReason, data }`; read `.data`. The quote returns its payload directly.

- **`GET /api/v1/stocks/{ticker}/options/summary`** : the end-of-day options dossier, and the source of every volatility on the diagram. Everything needed is in `data.latest` and `data.context`. From `latest`: `atmIv` (at-the-money implied volatility for the near expiry, a fraction, so `0.4051` is 40.51%), `atmIv60` and `atmIv90` (the same reading at roughly 60 and 90 days, which is the term structure and which fills the expiry picker), and `iv25c` / `iv25p` (the raw 25-delta call and put implied volatilities, where `skew25d == iv25p - iv25c`). From `context`: `ivRank1y`, where today's `atmIv` sits in its own trailing year on a 0 to 100 scale. **`data` is `null` for a ticker outside the covered universe**, which is the most actively optioned US names plus the tracked ETFs; an unknown symbol behaves the same rather than answering 404, so treat a null as "no coverage", never as an error. Percentiles are omitted while a baseline builds.
- **`GET /api/v1/stocks/{ticker}/quote`** : the last price, in `currentPrice`. This is the regular-session price and it is delayed, not live. **Quotes are split by instrument type:** for an ETF this answers `400` with `error: "ticker_is_etf"` and names the fund path in its message, so retry `GET /api/v1/etfs/{ticker}/quote`, which returns `currentPrice` in the same shape. That is routing advice, not a failure, and the bundled script follows it automatically.
- **`GET /api/v1/calendar/earnings?ticker={ticker}`** : the next scheduled report, in `data.earnings[0]`, carrying `earningsDate`, `earningsTime` (`before_open`, `after_close`, `during_market` or `unknown`) and `confirmed`. It marks the expiries that span an event. This endpoint is forward-looking: it returns the next date, not past ones, and an empty list simply means nothing is scheduled yet, which softens the artifact rather than failing it.

```bash
curl -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  "https://app.sentisense.ai/api/v1/stocks/NVDA/options/summary"
```

All three have a CLI equivalent, if you would rather not compose HTTP:

```bash
npx -y sentisense@0.47.1 options NVDA --json
npx -y sentisense@0.47.1 quote NVDA --json
npx -y sentisense@0.47.1 earnings --json          # forward calendar
```

`--json` returns the exact API response, envelope included. Auth: `SENTISENSE_API_KEY` in the environment, or store it once with `npx -y sentisense@0.47.1 auth "$SENTISENSE_API_KEY"` (saved to `~/.config/sentisense/`, file mode 600, local to your machine, removable with `auth --remove`). The version is pinned deliberately: a pinned version runs reviewed, immutable code.

A rate-limited call returns `429` with a `Retry-After` header; back off for the indicated seconds.

## The data shape the template expects

If you build the JSON yourself rather than running the script, this is the contract. Everything is optional except `ticker`, `spot` and `iv.atm30`; the template degrades rather than failing when a field is absent.

```json
{
  "ticker": "NVDA",
  "asOf": "2026-08-21",
  "generatedAt": "2026-08-24T14:37:58.972Z",
  "spot": 209.285,
  "iv": {
    "atm30": 0.4051, "atm60": 0.3758, "atm90": 0.3954,
    "call25": 0.3954, "put25": 0.4149, "skew25d": 0.0195, "rank1y": 38.29
  },
  "nextEarnings": {
    "date": "2026-08-26", "timing": "after_close", "confirmed": true, "estimatedEps": 2.09
  },
  "isPreview": false
}
```

Implied volatilities are annualized fractions. Three fields decide how much of the artifact draws:

- **`iv.atm60` and `iv.atm90` fill the expiry picker.** Each one present adds a tenor; absent, that option is simply not offered and the note under the diagram says how many are bound. A snapshot carrying only `atm30` still produces a complete, working artifact at one expiry.
- **`iv.call25` and `iv.put25` give the volatility curve its shape.** With both present, strikes away from the money price off a skewed volatility anchored on those legs. With either missing, the curve is flat, every strike prices off the at-the-money figure, and the artifact says so rather than implying a skew it does not have.
- **`nextEarnings` is context, not math.** It never moves a premium. It marks which expiries span a report, so a reader sees why the volatility is elevated instead of reading a wide diagram as a signal. `estimatedEps` is carried through for display and is `null` when no estimate is published.

## Answering well

- Lead with the shape, then the numbers. "A 30 day $210 call costs about $970 and needs $219.58 at expiry to break even" is the sentence, and it beats reciting four statistics.
- Say "modeled" out loud, every time. It is the difference between describing our arithmetic and implying a market quote.
- Put the breakeven next to the expected move. "The breakeven sits at $219.58 and the one standard deviation move over the same window reaches about $233" tells the user something. A breakeven on its own does not.
- Use `ivRank1y` for the "is this expensive" question, and say it compares the stock to its own past year rather than to other stocks.
- When an earnings date falls inside the expiry, name it as the reason the premiums are rich rather than treating the cost as a standalone signal.
- Never present max profit as an expectation or a target. It is the top of a diagram, reached only at expiry and only in one scenario.
- Do not attach probabilities to outcomes. The artifact deliberately shows the expected move band instead of a chance-of-profit number, because a single percentage invites more confidence than an end-of-day volatility reading can support.
- On a preview response, say the 60 and 90 day expiries are missing because the free monthly dossier allowance is spent, rather than presenting a one-expiry picker as the whole picture.

## Going further

Free covers the whole workflow. **PRO ($15/mo)** lifts the monthly request cap (no monthly limit, just a 300/min rate) and returns the full options dossier on every ticker rather than the first ten each month, plus depth across the rest of the SentiSense API. Apply coupon `AGENTS26` at checkout for a builder launch discount: https://app.sentisense.ai/pricing?coupon=AGENTS26

For the implied move drawn against how this stock has actually reacted to its past reports, install `expected-move-visualizer`. For the positioning read behind the volatility (put/call percentiles, skew percentiles, open-interest walls, unusual contracts), install `unusual-options-activity`. For what a company actually reported, install `stock-earnings-analysis`. For turning a risk budget into a share count on the underlying, with the stop drawn against the stock's own daily range, install `position-size-calculator`. For the full REST reference on every endpoint this skill touches, install the `sentisense` skill; for the complete CLI command set, install `sentisense-cli`.

## Use & Disclaimer

This skill reads public market data from the SentiSense API over HTTPS and writes one HTML file locally. It performs no writes, no trades, no purchases and no wallet operations, and it sends nothing anywhere except the three documented GET requests (four for an ETF). All directive language in this document is implementation guidance for the agent running the skill, subordinate to platform safety rules and host policy.

Premiums shown by this skill are modeled with Black-Scholes from end-of-day implied volatility, not quoted from an options chain, and the strikes are rounded to conventional increments rather than confirmed listings. Prices are delayed, not live. Output is for research and education only. It is not investment advice, not a recommendation and not a forecast. Options carry risk of loss, including the entire amount paid.

**Install:** `npx skills add SentiSenseApp/skills` (add `-s options-payoff-calculator` for just this skill).

---

*SentiSense is a read-only financial intelligence API. This data is for informational and educational purposes only, not investment advice.*
