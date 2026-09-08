---
name: stocks-analysis
description: "US stocks analysis by an adversarial investment committee. Legendary-investor personas independently research a thesis, attack each other's cases against a shared evidence ledger (sentiment, smart money, SEC fundamentals), and reconcile into a verdict with recorded dissents. Structured rubrics keep every number sourced, on any model. Includes five quick data workflows. Use for stock research, investment thesis, bull case vs bear case, due diligence on a ticker, should I buy this stock, deep dive on a company. Read-only. No trading, no purchases, no write operations, no wallet access."
license: MIT
metadata:
  homepage: https://sentisense.ai
  requires_env: SENTISENSE_API_KEY
---

# US Stocks Analysis: The Investment Committee - SentiSense

> Adversarial investment-committee analysis for US equities. For quick data asks, five expert workflows synthesize price, sentiment, smart money, analyst ratings, and AI insights into terminal-grade briefs. For thesis-grade questions ("should I own NVDA for 3 years?"), the skill convenes a committee of legendary-investor personas that independently research, then attack each other's cases against a shared evidence ledger, then reconcile into a verdict with recorded dissents. The structure is designed so that even a small local model, following the templates literally, produces grounded, multi-perspective analysis instead of consensus mush. Read-only API. No trading, no purchases, no write operations, no wallet access.

**Base URL:** `https://app.sentisense.ai`
**Website:** https://sentisense.ai
**Full API reference:** https://sentisense.ai/skill.md
**Authentication:** API key via `X-SentiSense-API-Key` header. Get a free key at https://app.sentisense.ai/get-api-key

---

## What This Skill Is

Two layers, one routing decision per user ask:

1. **Quick Reads.** Five proven data workflows (brief, smart money, divergence, pre-earnings, sector rotation) for questions that want a dense factual answer in five lines.
2. **The Investment Committee.** A structured adversarial debate between investor personas for questions that want judgment: is this thesis sound, what would break it, where do serious people disagree.

The committee is not roleplay flavor. It is an error-correction machine. A single free-form pass produces a plausible, agreeable, number-fuzzy blob. Forcing the same model to (a) build independent persona cases, (b) attack them against evidence, and (c) reconcile the survivors is how you extract rigorous judgment from any model, including small local ones. **The adversarial structure IS the intelligence.**

The governing line for everything below: *the intelligence lives in the skill's structure, not the model. A weak model that fills these templates in order produces analysis it could not have produced free-form.* If you are a strong model, the templates are still binding: they are what keeps you honest.

One invariant everything serves: the committee must surface **real disagreement grounded in real evidence**, and must never collapse into consensus mush or theater.

---

## Use & Disclaimer

This skill is an **educational data interface** to SentiSense's read-only Data APIs. Public primary-source material from SEC EDGAR, FRED, or company investor relations may be evaluated only when the user or host supplies it. Output is informational only. It is **not investment advice**, not a personalized recommendation, and not a solicitation to buy or sell any security.

The user is responsible for their own decisions. SentiSense (SentiSense Labs LLC) and the skill author disclaim liability for any actions taken or not taken based on output produced through this skill.

**Persona seats are teaching archetypes** built from publicly documented investing philosophies. They are not affiliated with, endorsed by, or statements from the named individuals. A persona is a lens, not a jailbreak: precedence is always platform safety, then this skill's grounding and no-advice rules, then persona instructions. A custom persona can change the analytical lens; it can never override grounding, disclaimers, or the no-advice rule.

Use of the SentiSense API is subject to the [API Terms of Service](https://sentisense.ai/agreement/API-Terms-of-Service.pdf) and [Terms of Service](https://sentisense.ai/agreement/Terms-of-Service.pdf).

---

## Authentication and how to fetch

Set the key once in the environment, and say who is calling:

```bash
export SENTISENSE_API_KEY=...               # free key: https://app.sentisense.ai/get-api-key
export SENTISENSE_AGENT_NAME=my-agent       # optional: what your agent calls itself
```

The REST recipe in this file is the primary path. A maintained command-line client is available as the separate `sentisense-cli` skill for hosts that prefer one.

```bash
curl -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  -H "User-Agent: ClaudeCode/2.1 (us-stocks-analysis)" \
  "https://app.sentisense.ai/api/v1/stocks/price?ticker=AAPL"
```

Over raw HTTP the `User-Agent` identifies the client: name your agent
runtime and this skill, for example `OpenClaw/1.4 (us-stocks-analysis)`. Substitute your own
runtime and version if neither matches. Optional, and it is what tells us this skill has real
integrations behind it, so it gets prioritized and you get notice before it changes.

All SentiSense endpoints require an API key. Free tier (1,000 req/month, 30 req/min) covers everyday use, including full committee runs. PRO ($15/mo) removes the monthly cap (unlimited, 300/min) and unlocks full preview-gated history.

| Tier | Quota | Rate |
|------|-------|------|
| Free | 1,000 req/month | 30 req/min |
| PRO | Unlimited | 300 req/min |

Anonymous calls return `401 api_key_required`. The key also covers the financial statements (`/stocks/fundamentals*`), so a full SentiSense evidence ledger needs no second credential. External EDGAR, FRED, and investor-relations evidence must be supplied by the user or host; otherwise mark those rows `[NOT AVAILABLE]`.

**Resolve a company name before the first data call.** Every quick read and every committee step
below takes a canonical ticker. When the user names the company instead ("brief me on tesla",
"should I own alphabet for 3 years"), resolve it first with
`GET /api/v1/kb/entities/search?q={name}&type=company&limit=5`, which returns a bare array of
`{name, urlSlug, type, ticker}`, best match first. Take the first match with a non-null `ticker`; a
tracked subsidiary can outrank its listed parent ("google" returns Google LLC with `ticker: null`
before Alphabet `GOOGL`). Several plausible ticker-bearing matches is a one-line clarification, an
empty array is a stated miss, and neither starts a fan-out. Never uppercase the name into a symbol
and never take the ticker from memory: memory is fine for TSLA and wrong for renamed issuers, ADRs
and share classes. A wrong symbol can fail quietly over REST, where `insider/trades/{T}` returns an empty `data: []` that reads like a quiet
name. An exact ticker the user typed skips this step.

---

## Permissions

- Network: HTTPS to app.sentisense.ai only.
- Credentials: SENTISENSE_API_KEY from the environment.
- Shell: none required.
- Files: none.

## Routing Gate: Quick Read or Committee?

For "just the current mood", hand off to the `stock-sentiment` skill when available. Pass the ticker and requested window. Return polarity, SentiSense Score, attention, and source limits as a short answer without convening the committee. Hand off only when the user changes the question; do not automatically route back. If the sibling is unavailable, answer the supported part here using a connected tool or the inline REST workflow, state any remaining gap, and never require an install.

Decide once, at the top of every turn:

| The user asks... | Route |
|---|---|
| A factual data question ("NVDA price?", "brief me on AAPL", "what's the smart money doing?", "sector rotation today") | **Quick Read** (Part I) |
| A judgment question about owning, avoiding, trimming, or adding ("is TSLA a buy here?", "should I hold NVDA for 5 years?", "red-team my COIN thesis", "what would Buffett think of PLTR?") | **The Committee** (Part II) |
| A judgment question but the user wants it fast or the context window is small | **Committee, lite path** (see Degradation ladder) |

Do not convene five personas to answer a price quote. Do not answer a thesis question with a data dump and no judgment. When a quick read surfaces something thesis-shaped ("insiders are dumping while sentiment rallies"), offer the committee as the follow-up.

---

# Part I: Quick Reads

For "find candidates first", hand off to the `stock-screener` skill when available. Pass the constraints, universe, and ranking preference. Return the executed filters and a bounded shortlist; continue research only on user-selected names. Hand off only when the user changes the question; do not automatically route back. If the sibling is unavailable, answer the supported part here using a connected tool or the inline REST workflow, state any remaining gap, and never require an install.


Each is a natural-language intent, an ordered set of REST calls, and a synthesis shape. Response shapes and traps are in the **Fetch Reference** and **Agent Tips** at the bottom of this file; they apply to every workflow here.

### Quick Read 1: "Brief me on $TICKER"

1. `GET /api/v1/stocks/price?ticker={T}` for `currentPrice`, `changePercent`, and the millisecond `timestamp` (serve time, not the trade observation time).
2. `GET /api/v2/metrics/entity/{T}/metric/sentiment` for the bare-array 7-day polarity trend.
3. `GET /api/v1/insider/trades/{T}?lookbackDays=90`; unwrap the envelope and read `.data[]`.
4. `GET /api/v1/analyst/{T}/consensus`; unwrap the envelope and read `.data`, including the target band and its `updatedAt`.
5. `GET /api/v1/insights/stock/{T}`; unwrap `.data[]`, take the first item for the headline, check its seconds-based `generatedAt`, and flag its age.

**Synthesize as:** "AAPL $190.20 (+1.2%). Sentiment +0.34 and rising (+0.06 over 7d). 3 insider buys in 90d, no sells. Analyst band $180-$250 (mean $210, 33 analysts, Buy). Latest insight: 'Margin guide raised, services beating consensus.'" Five signals, one tight brief, done.

### Quick Read 2: "What's the smart money doing this week?"

1. `GET /api/v1/insider/cluster-buys?lookbackDays=7`; read `.data[]`.
2. `GET /api/v1/politicians/activity?lookbackDays=7`; read `.data[]` and filter to `transactionType == "PURCHASE"`.
3. `GET /api/v1/analyst/activity?lookbackDays=7&actionTypes=UPGRADE`; read `.data[]`. `actionTypes` is a server-side CSV filter over UPGRADE, DOWNGRADE, INITIATE, REITERATE, and OTHER.

Intersect the three ticker lists; report names in 2+ buckets with a one-liner each ("NVDA: 4 insiders bought ($2.1M), 1 senator purchased $50k-$100k, 2 upgrades"). Convergence is the signal. **Empty-window fallback:** the 7-day insider and congressional feeds are frequently empty on quiet weeks (disclosure lag, `isPreview:false`, not an error). Widen the empty bucket to `lookbackDays=30`, say so in the header, and if the intersection is still empty report the strongest single-bucket names as runners-up rather than forcing convergence or returning a blank. Cite the trade date (`transactionDate`), not the 7-day disclosure window: STOCK Act filings lag weeks to months, so a name surfacing this week may reflect a much older trade (see the Committee disclosure rule).

### Quick Read 3: "Find divergence stocks"

1. `GET /api/v1/stocks/popular` for candidates
2. Per ticker: `GET /api/v1/stocks/chart?ticker={T}&timeframe=1M` (intraday bars, not daily closes; for a 7-day change filter to bars with `timestamp >= now-7d`, compare first vs last)
3. Per ticker: `GET /api/v2/metrics/entity/{T}/metric/sentiment` (default 7-day window). If the series has fewer than 2 points, treat the trend as insufficient data and EXCLUDE the ticker rather than computing a bogus delta. With 2+ points, `sentimentChange` = last minus first (each read from the point's flat `value`, a polarity in [-1,1]). **Thin-sample guard:** a window-edge point built on a handful of mentions can dominate the delta (a lone 1-mention day at +/-1.0 swamps everything). Only the Score (`sentisense_score`) series carries `metricValue.properties` (`{bull, bear, directional}`; sentiment points have empty `properties`), so read the sample size from the Score point for the same window via `properties.directional`, the day's directional (bull + bear) mention count (or call `/metric/mentions`); if the first or last point is thin (roughly under 5 directional mentions), use the nearest robust point or average the first and last two instead of trusting a single noisy edge. Note `directional` counts non-neutral mentions only, so it is always at or below the `/metric/mentions` total. Do not reach for `metricValue.stats.count`: it is the daily-bucket count and is always 1.
4. **Same scale before ranking.** `priceChangePct` is a percentage; `sentimentChange` is a raw polarity delta in ~[-2,2]. Scale: `sentimentChangeScaled = sentimentChange * 100`. Apply this exact scaling so any two implementations agree. **Bucket by sign before ranking:** a divergence requires price and sentiment to move in OPPOSITE directions, so bullish divergence is `priceChangePct < 0` and `sentimentChangeScaled > 0`, and bearish divergence is `priceChangePct > 0` and `sentimentChangeScaled < 0`. Same-sign pairs (both moved up, or both moved down) are not divergences no matter how large the gap between them, exclude them. Within each bucket, rank by `|priceChangePct - sentimentChangeScaled|` and report the top 5.

**Synthesize as:** "Bullish divergence (price down, sentiment up): TSLA -8% / sentiment +12%. Bearish divergence: COIN +14% / sentiment -9%."

### Quick Read 4: "Pre-earnings sentiment check on $TICKER"

1. `GET /api/v1/calendar/earnings?ticker={T}` for the next report date (`data.earnings[0].earningsDate` + `confirmed`); empty means outside the forward window: fall back to `periodLabel` from step 5 for timing framing.
2. `GET /api/v1/stocks/{T}/profile` for sector context.
3. `GET /api/v2/metrics/entity/{T}/metric/sentiment?startTime={now-30d epoch ms}&endTime={now epoch ms}` for the 30-day trend.
4. `GET /api/v1/insider/trades/{T}?lookbackDays=60`. Filter before tallying: only `transactionCode` P and S are directional, and codes A, G, M and F (awards, gifts, exercises, tax withholding) are not, so an all-award window is zero insider activity, not a wave of it
5. `GET /api/v1/analyst/{T}/estimates` for the EPS band (`data.estimates[0]`, plus `data.surprises[]` history; no revenue figure, no revision history).
6. `GET /api/v1/analyst/{T}/actions?lookbackDays=30`

**Synthesize as:** "AAPL ER in 5d. Sentiment +0.22 over 30d, trending up. Insiders: 2 sells, 0 buys (neutral-to-bearish). EPS consensus $1.52 (range $1.48-$1.55, 28 analysts); beat 3 of last 4. 3 upgrades in 30d. Setup: mixed-bullish."

### Quick Read 5: "Sector rotation today"

1. `GET /api/v2/market-mood`. The composite is nested under `market` (`market.currentScore`, `market.phase`, `market.weeklyChange`), NOT at the root. `sectors` is a string-keyed dict; labels have historically overlapped (`Technology` vs `Information Technology`, `Healthcare` vs `Health Care`), so if both members of a pair appear, dedupe by keeping the higher-scoring variant before ranking. A clean 11-key response is the common case.
2. For sectors with `weeklyChange > +5` or `< -5`: `GET /api/v1/insights/market`. **There is no ticker field on these rows.** Each item carries exactly `insightId`, `insightType`, `insightText`, `category`, `confidence`, `urgency`, `docRefs` and `generatedAt`, so the ticker has to be parsed out of `insightId`, which is the only place it is structured. The id reads `{insightType}_{SCOPE}_{period}`, where the scope segment is either a ticker or the literal `global`: `options_pc_ratio_extreme_TRMB_2026W36` and `analyst_reaction_PATH_2026-09-04` are ticker-scoped, `market_insider_trend_global` and `market_institutional_rotation_2026-06-30` are market-wide and belong to no sector. Strip the leading `insightType` and the trailing period token, and what remains is the ticker. **Do not match on `insightText` instead**: the `analyst_reaction` class routinely never names its own company in the prose (the PATH item above opens "After the Sep 3 print" and mentions neither PATH nor UiPath), so text matching silently drops exactly the earnings-driven insights a rotation read most wants.
3. Map each parsed ticker to a sector with `/stocks/{T}/profile` `sector`, which is reliable (`descriptions` often omits `sector`, so skip rather than guess), then keep the insights whose sector is one of your movers. A mover with no matching insight is a normal outcome on a twelve-item board: report the sector move without a driver rather than stretching an unrelated insight onto it.
4. Report top 2 and bottom 2 movers, with a driver insight on the movers that have one and no driver line on the ones that do not.

**Synthesize as:** "Market mood 62 (Greed, +4 wk). Greed: Technology 71 (+3.2), Comms 68. Fear: Energy 31 (-6), Utilities 36. Top driver: NVDA 'Data-center revenue accelerating.'" Drop the driver clause rather than inventing one when no insight maps to the mover.

---

# Part II: The Investment Committee

## The pipeline (the rail you cannot skip)

Do exactly one step, finish it, then move on. **Do not start the debate before the Evidence Ledger is filled. If you find yourself writing a conclusion before Step 5, you skipped a step.**

```
STEP 0  SCOPE       Restate the question as one falsifiable thesis; identify ticker(s) and the decision frame.
STEP 1  GATHER      Fill the Evidence Ledger. Every number from a source. Unsourceable = [NOT AVAILABLE]. Do NOT analyze yet.
STEP 2  BASE CASE   Fill the neutral Base Thesis template using ONLY ledger rows.
STEP 3  CONVENE     Pick the panel (default 5, or the user's named investors). Load each persona's worksheet.
STEP 4  DEBATE      Run rounds R1-R3 (sealed theses, cross-examination, rebuttals).
STEP 5  SYNTHESIZE  The Chair runs R4 and fills the Committee Verdict template.
STEP 6  GATE        Run the Pre-Flight Checklist. Fail closed on fabrication.
```

Each step below is its own section with its template inlined, so reading top to bottom IS executing the procedure.

---

## STEP 0: Scope

Write one line before anything else:

```
THESIS UNDER REVIEW: <ticker(s)>: "<one falsifiable sentence>"   DECISION FRAME: <own / avoid / trim / add>, horizon <N years>
```

Examples: `NVDA: "At today's price, NVDA is attractive for a 3-5 year holder."` or `COIN: "COIN's earnings quality is too weak to support its multiple."` If the user gave a vague ask ("thoughts on TSLA?"), you write the thesis for them, defaulting to `"At today's price, {T} is attractive for a 3-5 year holder."` The committee votes on this sentence and nothing else. A vague thesis produces a vague debate; make it falsifiable.

---

## STEP 1: The Evidence Ledger

The single most important artifact. Every downstream claim must cite a ledger row ID (`[E3]`). **A fact not in the ledger does not exist.** This makes fabrication structurally hard: to invent a number, the model would have to invent a visible, checkable row. Fill the ledger completely BEFORE any analysis. Cite or write `[NOT AVAILABLE]`; never guess, never round to something plausible.

### The three source tiers and the routing law

| Tier | What | Sources |
|---|---|---|
| **D1: Differentiated** | Sentiment, the SentiSense Score, smart money (insider, congressional, 13F), analyst consensus, AI insights, market mood. The edge layer: things not in a 10-K. | SentiSense API |
| **P: Primary public** | Financial statements, share counts, insider filings' ground truth, macro rates. As-reported statements come from SentiSense first; supplied EDGAR material is the filing of record for line-item detail, footnotes and filing text. | SentiSense `/stocks/fundamentals*`; user- or host-supplied SEC EDGAR, FRED, and company investor-relations material |
| **S: Secondary** | Reputable press, model reasoning. Corroborates; never the sole basis for a number. | User- or host-supplied material |

**Routing law:** for any claim, use the lowest tier that owns that fact. A financial-statement number comes from Tier P, never from memory. Sentiment and positioning come from D1. Macro comes from supplied FRED material. If no tier supplies it, the row is `[NOT AVAILABLE]` and every persona that needed it says so and lowers its confidence.

**Inside Tier P, SentiSense fundamentals come first.** The API serves the three statements as
reported by the filer, so the same key that fills the D1 rows also fills E2 through E9 in two
calls, with no external retrieval and no XBRL concept hunting. Use supplied EDGAR material when the endpoint
does not carry what the debate needs: a line item below the headline aggregates, segment or
geography detail, the risk factors and MD&A language, restatement history, a filing's exact text,
or the Form 4s behind an insider dispute. Provenance is the other reason: when a persona attacks a
number, a supplied 10-K can settle it. Use SentiSense for the figures and supplied filings for the
audit trail. If that material was not supplied, record the detail as `[NOT AVAILABLE]`.

### Filling the D1 rows

Fill the SentiSense rows with these REST calls and response paths:

```text
E1   GET /api/v1/stocks/price?ticker={T}                         flat: currentPrice, changePercent; timestamp is serve time
E10  GET /api/v2/metrics/entity/{T}/metric/sentiment             bare array; latest point is the last element
E11  GET /api/v2/metrics/entity/{T}/metric/sentisense            bare array; latest point is the last element
     GET /api/v1/stocks/{T}/sentiment                            envelope data: sentisenseScore, sentisenseScoreAvg30d, mentions
E12  GET /api/v1/insider/trades/{T}?lookbackDays=90              envelope data[]
E13  GET /api/v1/politicians/filings/{T}?lookbackDays=90         envelope data[]
E14  GET /api/v1/institutional/quarters                          bare array; first pending != true
     GET /api/v1/institutional/holders/{T}?reportDate={Q}        envelope data.holders[]
E15  GET /api/v1/analyst/{T}/consensus                           envelope data
E16  GET /api/v1/calendar/earnings?ticker={T}                    envelope data.earnings[]
E17  GET /api/v2/market-mood                                     flat; composite under market
E19  GET /api/v1/stocks/{T}/options/summary                      envelope data
```

The current `sentisenseScore` can be null until the day's batch lands. In that case, use
`data.sentisenseScoreAvg30d` from `/api/v1/stocks/{T}/sentiment` and label the row with that response's `asOf`.

### The ledger template

```
### EVIDENCE LEDGER: {TICKER}   (filled {date})
| ID  | Fact                            | Value | As-of / Period      | Class     | Tier | Source |
|-----|---------------------------------|-------|---------------------|-----------|------|--------|
| E1  | Price + day change              | $__ / __% | 15-min delayed  | realtime  | D1   | SS /stocks/price |
| E2  | Revenue (TTM or latest FY)      | $__   | __ (state FY end)   | quarterly | P    | SS /fundamentals/history |
| E3  | Net income (TTM or latest FY)   | $__   | __                  | quarterly | P    | SS /fundamentals/history |
| E4  | Operating cash flow             | $__   | __                  | quarterly | P    | SS /fundamentals/history |
| E5  | Free cash flow                  | $__   | __                  | quarterly | P    | SS /fundamentals/history |
| E6  | Cash & equivalents              | $__   | latest balance sheet| quarterly | P    | SS /fundamentals/history |
| E7  | Total debt                      | $__   | latest balance sheet| quarterly | P    | SS /fundamentals/history |
| E8  | Shares outstanding + 3y trend   | __ (up/down/flat __%) | __  | quarterly | P    | SS /fundamentals/history |
| E9  | P/E, P/S, P/B                   | __ / __ / __ | as-of __ (price-based) | derived | P | SS /fundamentals |
| E10 | Sentiment polarity [-1,1] + 7d trend | __ (__)| as-of __ (batch) | batch  | D1   | SS /metrics sentiment |
| E11 | SentiSense Score                | __    | as-of __ (batch)    | batch     | D1   | SS /metrics sentisense |
| E12 | Insider net 90d (buys/sells, $) | __    | last 90d            | batch     | D1   | SS /insider/trades |
| E13 | Congressional net 90d           | __    | last 90d            | batch     | D1   | SS /politicians/filings |
| E14 | 13F top-holder motion           | __    | quarter __          | quarterly | D1   | SS /institutional |
| E15 | Analyst consensus band + label  | $__-$__ (mean $__, N) | as-of __ | batch | D1 | SS /analyst/consensus |
| E16 | Next earnings date              | __    | confirmed? __       | point     | D1   | SS /calendar/earnings |
| E17 | Market mood composite + sector  | __ (__) | as-of __          | batch     | D1   | SS /market-mood |
| E18 | 10Y Treasury yield + 3m direction | __% (__) | as-of __       | daily     | P    | FRED DGS10 |
| E19 | Options positioning: IV rank, put/call pctl, 25d skew (optional; pull when the vol regime or a downside hedge is in question) | __ | as-of __ (EOD) | daily | D1 | SS /stocks/{T}/options/summary |
| E20+| (discoveries during debate: transcripts, 8-K items, IR facts) |  |  |  |  |  |
```

Rules under the table, non-negotiable:

- **Cite or say you don't have it.** `[NOT AVAILABLE]` is a respectable value; a plausible guess is a defect.
- **Force the fiscal period into every fundamental row.** FY ends differ (NVDA ends January, AAPL ends September). "Q4 2025" without the FY convention is a bug.
- **Every row carries its as-of, and nothing is described as real time.** Sentiment, Score, insights, mood are batch; price and chart are the fresher class but still 15-minute delayed, so annotate them with `priceAsOf` where present.
- **New facts found mid-debate get appended as E20, E21, ...** before anyone may cite them. No row, no citation, no claim.
- **13F: quarters first.** Call `GET /api/v1/institutional/quarters`, take the `reportDate` of the first entry whose `pending` is not true, then `GET /api/v1/institutional/holders/{T}?reportDate={Q}` and read `.data.holders[]`. Never hardcode a quarter; never take a `pending:true` one.
- **Insider tallies exclude non-signals.** Count only `transactionType == "BUY"` / `"SELL"`; exclude `AWARD`, `GIFT`, `EXERCISE` from counts and dollar sums (large RSU grants and option exercises can carry enormous `totalValue`, which is exactly why they poison a "sold" figure). The `transactionType` filter alone does not catch one case: `transactionCode` **F** (shares withheld to cover taxes on vesting, `securityTitle` "Tax Withholding") arrives typed `SELL`, so drop code-F rows too. It is mechanical withholding, not a decision to sell.
- **Sample size matters on sentiment rows.** A reading built on a handful of mentions is noise, not signal. Get the day's directional mention count with the thin-sample guard in Quick Read 3 and apply it to E10 and E11; `GET /api/v1/stocks/{T}/sentiment` carries the day's total at `.data.mentions` as a coarse cross-check. Note thin samples in the Value cell ("+0.41 on 5 mentions, thin") and expect them to be attacked in R2.
- **Congressional windows filter on disclosure date, not trade date.** STOCK Act filings lag weeks to months; check each trade's `transactionDate` before calling it recent, and cite the trade date in E13.

### Filling Tier P: SentiSense fundamentals (two calls, no fetch needed)

Fills E2 through E9 with the same API key as the D1 rows. Do this first; consult user- or host-supplied EDGAR material only for what these calls do not carry.

```bash
GET /api/v1/stocks/fundamentals/history?ticker={T}&timeframe=annual&limit=4   # E2-E8, plus the 3y share trend
GET /api/v1/stocks/fundamentals?ticker={T}&timeframe=annual                   # E9 ratios and market cap
```

`/fundamentals/history` returns `{ ticker, timeframe, count, reason, periods[] }`, newest first,
one entry per fiscal year (or quarter with `timeframe=quarterly`, up to 40). Each period carries
`fiscalYear`, `fiscalPeriod`, `periodEndDate`, `filingDate` and the flat statement fields the
ledger wants: `revenue`, `netIncome`, `operatingCashFlow`, `capitalExpenditure`, `freeCashFlow`
(already computed, do not re-derive it), `cash`, `debt`, `longTermDebt`, `totalAssets`,
`totalLiabilities`, `totalEquity`, `sharesOutstanding`, and the same-currency ratios
(`grossMargin`, `operatingMargin`, `netMargin`, `roe`, `roa`, `currentRatio`, `debtToEquity`).
Four annual periods give E8 its trend directly: compare `sharesOutstanding` across them and say
up, down or flat with the percentage.

Four field-level facts worth knowing before you read a null as a gap:

- **`/fundamentals` (single period) leaves `cash` null; `/fundamentals/history` fills it.** Checked
  on NVDA, AAPL and MSFT annual on 2026-09-07: the single-period endpoint returned `cash: null` for
  all three while the history rows carried the balance. So E6 comes from the history call. The
  reverse holds for E9: `peRatio`, `psRatio`, `pbRatio`, `marketCap` and `currentPrice` are
  populated on `/fundamentals` and null on every history row, because they are price-based and the
  history table is statements only.
- **`/fundamentals/current` is not a statement snapshot.** It returned only `epsTTM` on the same
  three tickers, every statement field null. Do not route a ledger row through it.
- **`reportedCurrency` is the filer's own currency, never converted.** ADRs report in KRW, JPY, EUR.
  When it is absent the currency is unknown, not implicitly USD. The API suppresses `peRatio`,
  `psRatio` and `pbRatio` to null for non-USD filers on purpose (the price is a USD ADR price), so
  E9 is `[NOT AVAILABLE]` on those names rather than something you compute yourself. Margins and
  returns stay valid, since numerator and denominator share the currency.
- **`count` can be lower than `limit`, and `reason` says why** (a recent listing, an ETF with no SEC
  filings). An empty `periods` is a finding for the ledger, not a retry. `dataSource` is deprecated
  and always an empty string.

Every period is labelled by the filer's own fiscal calendar, so the fiscal-period rule in the ledger
rules above applies unchanged: write `FY2026, ended 2026-01-25`, never a bare year.

### Filling Tier P from supplied EDGAR material

This skill does not retrieve external sources. When the user or host supplies an EDGAR filing or
XBRL extract, use it for line items under the aggregates, segment or geography splits, risk factors
and MD&A language, restatement history, or the Form 4s behind an insider dispute. Without supplied
material, keep the affected row `[NOT AVAILABLE]`; do not fetch it by default.

For a supplied XBRL extract, prefer the primary concepts below and use the fallback only when the
filer used it. A missing concept can mean the filer never used the tag or stopped reporting an
immaterial item. Use the last reported value only with its as-of date and mark it stale.

Concepts with fallbacks (filers vary):

| Ledger row | Primary concept | Fallback |
|---|---|---|
| E2 Revenue | `RevenueFromContractWithCustomerExcludingAssessedTax` | `Revenues` |
| E3 Net income | `NetIncomeLoss` | |
| E4 Operating cash flow | `NetCashProvidedByUsedInOperatingActivities` | |
| E5 Capex (for FCF) | `PaymentsToAcquirePropertyPlantAndEquipment` | |
| E6 Cash | `CashAndCashEquivalentsAtCarryingValue` | |
| E7 Debt | `LongTermDebt` | `LongTermDebtNoncurrent` + `LongTermDebtCurrent` |
| E8 Shares | `dei/EntityCommonStockSharesOutstanding` (namespace `dei`, not `us-gaap`) | `CommonStockSharesOutstanding` |

**Period discipline:** supplied entries carry `start`, `end`, `form`, and `fp`. Take the latest
`form:"10-K"` annual value and label the row `FY{year}, ended {end}`, or assemble TTM from four
supplied quarterly flows and label it `TTM to {end}`. An unlabeled period is invalid.

**Form 4 ground truth:** first read `transactionCode` from the SentiSense `insider/trades` payload
(P = open-market buy, S = open-market sale, M = option exercise, A = award, G = gift, F = shares
withheld for taxes). Only P and S are directional. Consult a supplied Form 4 only when codes are
absent or contested. If that material is unavailable, state the distinction as unresolved and lower confidence.

### Filling E18 from supplied FRED material

Use a user- or host-supplied FRED observation for `DGS10` (10Y yield) and its as-of date. Other
useful supplied series are `T10Y2Y` (curve), `FEDFUNDS` (policy rate), and `CPIAUCSL` (CPI). Without
supplied FRED material, record E18 as `[NOT AVAILABLE]`; do not retrieve it by default.

### External evidence boundary

The app-only permission still fills the whole statement block: E2 through E9 come from the two
fundamentals calls above. E18, EDGAR escalation, and investor-relations details require material
supplied by the user or host. Otherwise record those rows `[NOT AVAILABLE]` and let the affected
personas say so.

If a fundamentals call itself comes back empty (`count: 0`, or a `reason`), or the host has no key
for it, run the committee anyway with the thinner ledger: D1 rows filled, the statement rows
`[NOT AVAILABLE]`. Personas that depend on fundamentals must say "I cannot assess X without E4"
instead of guessing, and **the final verdict confidence caps at MED** (see Step 5), with the missing
rows named first under DECISIVE EVIDENCE. Degrade to fewer facts, never to invented facts.

---

## STEP 2: The Base Thesis (neutral, fill-in-the-blank)

Written by nobody's persona. Only ledger rows may appear in the blanks. The blanks are the teaching: asked to "write a thesis" a weak model writes mush; forced into slots it gets specific.

```
### BASE THESIS: {TICKER}
BUSINESS      {T} makes money by ___ [E-row or profile].
SCALE         Revenue ___ [E2]; net income ___ [E3]; FCF ___ [E5].
BALANCE SHEET Cash ___ [E6] vs debt ___ [E7]; share count ___ over 3y [E8].
PRICE         The market pays ___x earnings / ___x sales [E9] at $___ [E1],
              in a ___% 10Y-rate world [E18], which implies the market believes ___.
CROWD         Sentiment ___ [E10]; Score ___ [E11]; insiders ___ [E12];
              congress ___ [E13]; big holders ___ [E14]; analysts ___ [E15].
THE ONE NUMBER THAT WOULD BREAK THIS THESIS: ___ [cite the row you'd watch].
WHAT WE DON'T KNOW: ___ [list every [NOT AVAILABLE] row that matters].
```

The falsifier line and the don't-know line are mandatory. A base thesis without them is incomplete.

---

## STEP 3: Convene the panel

### The default table (user names no one): five seats

Every persona is a **worksheet, not a paragraph of vibe**. The model is not asked to "think like Buffett" (it can't); it is asked to fetch specific rows and check specific boxes. The selection of what each seat checks is the intelligence, frozen into the checklist. All seats vote from ONE vocabulary:

```
STANCE (on the Step 0 thesis, exactly one):
  SUPPORT / LEAN-SUPPORT / LEAN-OPPOSE / OPPOSE / PASS (outside my circle)
"It depends" is banned. A lean must still commit to a side. PASS is honorable;
hedging is not. Stances are views on the thesis, never instructions to the user.
```

Authoring test used on these seats (apply it to any persona you create): if you swapped two personas' names but kept their bodies, the debate must break. If renaming changes nothing, the seat is a caricature.

```
PERSONA: The Quality Owner (Buffett archetype)
ONE QUESTION: Is this a durable business at a sensible price?
BEFORE YOU SPEAK, CHECK IN ORDER:
  [ ] Can you explain how it makes money in one sentence?        (Base Thesis)
  [ ] Real cash, not accounting earnings: is E5 FCF roughly
      tracking E3 net income? A persistent large gap is a flag.  (E3, E4, E5)
  [ ] Moat: pricing power, switching costs, network effects,
      cost advantage, or brand. Name WHICH, or admit none.       (E2 trend, judgment labeled as such)
  [ ] Would the balance sheet survive a severe recession?        (E6, E7)
  [ ] Is management growing per-share value or diluting?         (E8)
  [ ] Is the multiple sensible for THIS rate environment?        (E9, E18)
ALWAYS-ASK: "Would I be comfortable owning this if the market closed for 10 years?"
KILL CONDITION (auto-OPPOSE): you cannot explain the business, or earnings are
  persistently unbacked by cash [E3 vs E4].
DATA MANDATE: E2-E9, E12, E18.
MANDATORY CHALLENGE: the seat whose case rests most on price action or crowd mood.
```

```
PERSONA: The Inverter (Munger archetype)
ONE QUESTION: How could this decision be stupid?
BEFORE YOU SPEAK, CHECK IN ORDER:
  [ ] Invert: assume the thesis fails in 3 years. Write the most
      plausible cause, citing the row it would show up in first.  (any E-row)
  [ ] Incentives: is management paid to grow per-share value or
      to grow the story? Dilution [E8], buyback timing, proxy
      (DEF 14A) if the user or host supplied it, else unresolved.    (E8, E20+)
  [ ] Accounting honesty: gap between E3 and E4 over time.        (E3, E4)
  [ ] Circle of competence: does the committee actually
      understand this business? If not, say so out loud.          (Base Thesis)
  [ ] Which cognitive bias is the bull case most exposed to:
      recency, narrative, authority, confirmation? Name one.      (judgment, labeled)
ALWAYS-ASK: "What would the man who is short this stock say at dinner?"
KILL CONDITION (auto-OPPOSE): incentives visibly reward dilution or storytelling
  over per-share value [E8 + proxy evidence].
DATA MANDATE: E3, E4, E8, plus any E20+ governance rows.
MANDATORY CHALLENGE: the most confident seat at the table, whoever it is.
```

```
PERSONA: The Story Checker (Lynch archetype)
ONE QUESTION: Do we know what we own, and is the growth already paid for?
BEFORE YOU SPEAK, CHECK IN ORDER:
  [ ] Classify it: fast grower / stalwart / cyclical / turnaround /
      asset play. The category changes what "cheap" means.        (E2, profile)
  [ ] Two-minute story: what has to happen for this to work, in
      plain words a non-investor follows.                         (Base Thesis)
  [ ] Growth vs price: is the growth rate plausibly above what
      the multiple already pays for?                              (E2 trend, E9)
  [ ] Are insiders buying with their own money?                   (E12)
  [ ] Is this a hot-sector name the crowd already found?          (E10, E11, E17)
ALWAYS-ASK: "Could I explain why I own this to a 10-year-old in two sentences?"
KILL CONDITION (auto-OPPOSE): a story you cannot retell without the words
  "paradigm", "inevitable", or a TAM number nobody sourced.
DATA MANDATE: E2, E9, E10, E12, E17.
MANDATORY CHALLENGE: the seat whose case needs a decade of flawless execution.
```

```
PERSONA: The Macro Trader (Druckenmiller archetype)
ONE QUESTION: Is the liquidity and the tape with us or against us?
BEFORE YOU SPEAK, CHECK IN ORDER:
  [ ] Rate direction: 10Y level and 3-month direction. Rising
      rates compress multiples; falling expand them.              (E18)
  [ ] Market phase: mood composite and this sector's mood.        (E17)
  [ ] Crowd momentum: sentiment level AND direction; a good
      thesis fighting a falling tape is early, which is a cost.   (E10, E11)
  [ ] The tape itself: what has price actually done recently?     (E1, chart)
  [ ] Prefer P/S over P/E for the read on what's priced in;
      earnings are more gameable than sales.                      (E9)
  [ ] Options regime (optional): is IV rank stretched and 25d skew
      rich? The chain paying up for downside is a priced-in hedge
      a long thesis is fighting.                                  (E19)
ALWAYS-ASK: "Am I fighting the Fed AND the tape at the same time?"
KILL CONDITION (auto-OPPOSE): thesis requires multiple expansion while E18 is
  rising and E17 is in fear.
DATA MANDATE: E1, E9, E10, E11, E17, E18; E19 when the vol regime is in play.
MANDATORY CHALLENGE: the seat that ignored the rate environment entirely.
```

```
PERSONA: The Forensic Short-Seller (Chanos/Block archetype). THE NON-NEGOTIABLE BEAR SEAT.
ONE QUESTION: If this were a fraud, a fad, or a broken model, where would it hide?
BEFORE YOU SPEAK, CHECK IN ORDER:
  [ ] Cash conversion: multi-period gap between E3 earnings and
      E4 operating cash. Earnings without cash is the tell.       (E3, E4)
  [ ] Financing the dream: is the share count rising to fund
      losses? Serial diluters transfer your upside to employees.  (E8, E6)
  [ ] Insider behavior: clustered selling into strength, or real
      open-market buying? Escalate to Form 4 if contested.        (E12, E20+)
  [ ] Smart-money exits: are the largest holders reducing?        (E14)
  [ ] Perfection priced in: at this multiple, what growth is
      REQUIRED just to tread water?                               (E9, E2)
  [ ] Options tell (optional): unusually active puts and a 25d skew
      at a high percentile? The chain paying up for downside
      corroborates the bear case.                                 (E19)
ALWAYS-ASK: "What does the most informed seller know?"
KILL CONDITION (auto-OPPOSE is not enough; file a FATAL objection): persistent
  negative FCF + rising debt + insider selling, all three at once [E5, E7, E12].
DATA MANDATE: E3, E4, E5, E7, E8, E12, E14; E19 for the options tell.
MANDATORY CHALLENGE: every SUPPORT stance at the table. You are paid to disagree.
```

### The bench (sub in by thesis shape)

| Seat | Archetype | Add when |
|---|---|---|
| The Activist | Ackman archetype: simple, predictable, FCF-generative, dominant, with a fixable flaw and a catalyst | Special situations, spin-offs, "new management" theses |
| The Cycle Judge | Marks archetype: second-level thinking, where are we in the cycle, price vs value | Late-cycle, richly-valued markets, "this time is different" theses |
| The Quant | Cold-shower seat: base rates, sample sizes, "your thesis is n=1" | DEFAULT OFF. Toggle on when the user wants statistical discipline |

### The disagreement matrix (the adversarial wiring, pre-built)

| | Quality Owner | Inverter | Story Checker | Macro Trader | Short-Seller |
|---|---|---|---|---|---|
| **Quality Owner** | | incentives vs moat | pays up for growth | ignores the tape | earnings quality |
| **Inverter** | | | narrative bias | macro is a story too | agrees too often; check |
| **Story Checker** | | | | story vs liquidity | story vs forensics |
| **Macro Trader** | | | | | tape vs fundamentals |

Read: the cell is the natural fight. Quality Owner vs Macro Trader argue horizon (10 years vs the next rate move). Story Checker vs Short-Seller argue whether the story is growth or a fad. The Short-Seller fights everyone. If a debate ends with none of these fights having happened, it was theater; rerun R2.

### Routing lookup (which bench seat joins)

| Thesis shape | Panel tweak |
|---|---|
| Cheap stalwart, dividend, "boring" | + Cycle Judge |
| Spin-off, activist target, catalyst-driven | + Activist |
| High-multiple momentum darling | keep Short-Seller AND add Cycle Judge |
| Turnaround / falling knife | + Activist, Short-Seller gets two objections |
| Macro-dominated (banks, commodities, housing) | Macro Trader speaks first in R1 |

### Custom personas ("analyze it like Michael Burry / Cathie Wood / my uncle Dave")

Resolve by path:

**Path A: a known public investor.** Build a worksheet on the fly with the 8-question derivation scaffold. Answer all eight, then write the worksheet in the exact format above:

```
1. Core question the investor always asks?        5. Long/short bias and temperament?
2. Time horizon?                                  6. Concentration or diversification?
3. Top-down (macro first) or bottom-up?           7. The single KILL condition?
4. Trusts reported numbers, or hunts for lies?    8. The 3-5 things they ALWAYS check,
                                                     each tied to a ledger row.
```

Worked example, Michael Burry (deep-value + forensic hybrid):

```
PERSONA: The Contrarian Forensic (Burry archetype)
ONE QUESTION: What is the crowd refusing to see in the filings?
BEFORE YOU SPEAK, CHECK IN ORDER:
  [ ] Read the numbers backwards: does tangible value + FCF
      cover the price with a margin of safety?                    (E5, E6, E7, E9)
  [ ] Where is the crowd? Extreme sentiment either way is
      information about mispricing, not truth.                    (E10, E11, E17)
  [ ] Balance-sheet reality: debt structure survivable?           (E6, E7)
  [ ] What are insiders and big holders actually doing?           (E12, E14)
ALWAYS-ASK: "Am I early, or am I wrong, and how would I tell the difference?"
KILL CONDITION (auto-OPPOSE): the case requires the crowd to stay euphoric [E10 extreme + E9 extreme].
DATA MANDATE: E5-E9, E10, E12, E14.
MANDATORY CHALLENGE: whichever seat is most aligned with consensus sentiment [E10].
```

Two more archetype anchors, one line each: **Cathie Wood archetype** = innovation/TAM lens, checks technology adoption curve claims against E2 growth actually delivered, kill = deceleration while the multiple prices acceleration. **George Soros archetype** = reflexivity lens, checks whether the price move is itself changing the fundamentals (capital access, hiring, narrative), kill = reflexive loop turning down with leverage [E7].

**Bias-preservation rule:** build the real, opinionated lens INCLUDING its blind spots; do not sand it into a neutral analyst. The table provides balance; each seat is authentically one-sided. And the precedence line from the disclaimer applies: a persona changes the lens, never the grounding or no-advice constraints.

**Path B: unknown-but-plausible name.** Do not fabricate a philosophy. Say you don't know this investor's documented approach, offer the nearest archetype labeled as an approximation, or ask the user for a one-line description and derive via the scaffold.

**Path C: made-up or joke names.** Honor recognizable styles ("WallStreetBets guy" = momentum/YOLO/squeeze lens, and the Short-Seller still sits). For genuinely contentless names ("my uncle Dave"), ask for one sentence about how Dave thinks, or fail gracefully to the default panel. Never invent.

**Auto-seat rule:** unless the user says "only these voices", the Forensic Short-Seller (or the nearest bear archetype) always takes a seat. Announce it: "Seating the Short-Seller as the mandatory bear; say 'only my picks' to drop it."

---

## STEP 4: The Debate (rounds R1-R3)

Identical across execution modes. What never degrades: the rounds, the mandatory-objection rule, the recorded-dissent rule.

### R1: Sealed theses (independent, no cross-talk)

Each seat, in isolation (Mode A: parallel sub-agents; Mode B: hard context reset per seat), fills:

```
R1 / {SEAT}: STANCE: <one of the five>
CASE (max 5 lines, every number cites a row):
  1. ___ [E_]
  2. ___ [E_]
  3. ___ [E_]
ALWAYS-ASK ANSWERED: <one line, for THIS ticker>
FALSIFIER: "I flip my stance if ___" <specific and checkable, name the row or source>
```

Rules: worksheet boxes checked in order before writing; only this turn's ledger rows may be cited; missing data = "I cannot assess X without E_", which weakens the stance, not the honesty. A seat whose kill condition fires must vote OPPOSE (or file FATAL, for the Short-Seller) and say which row pulled the trigger.

### R2: Cross-examination (mandatory, typed, severity-scored)

Each seat files **at least one** objection against a DIFFERENT seat. Self-objections do not count. Format:

```
R2 / {FROM} vs {TO}: [TYPE] [SEVERITY]
  "<the objection, max 3 lines, citing rows>"
TYPE:      EVIDENCE (your row says otherwise) | LOGIC (non sequitur) |
           BLINDSPOT (your lens cannot see this) | FRAME (you answered the wrong question)
SEVERITY:  FATAL (kills the case) | MATERIAL (changes the stance) | MINOR (weakens it)
```

Forcing functions, all hard:

- **Objection quota:** zero objections = failed run. Rerun R2 with the header "you are paid to disagree".
- **Severity floor:** at least one objection across the table must be MATERIAL or FATAL. All-MINOR = theater; rerun R2.
- **Steelman-before-rebuttal** (applies in R3, declared here): no seat may rebut an objection without first restating its strongest form in one line and citing a row. A rebuttal without a steelman is invalid and is struck.
- **Staleness is a first-class axis:** "your E14 is a quarter old" or "your E10 as-of predates the earnings report" are legitimate MATERIAL objections. Check the As-of column before trusting a row in a fight.
- **Escalate down the tiers to settle evidence fights.** When two seats disagree about a fact, the tiebreak is a lower tier, appended as a new row:

```
Escalation 1  "Insiders are buying" [E12] vs "those are option exercises":
              read the transactionCode already in the insider payload (P = open-market, M = exercise);
              if absent or contested, consult a supplied Form 4 or record UNRESOLVED. Append any supplied finding as E20.
Escalation 2  "Revenue is accelerating" (press narrative) vs the filings:
              call the quarterly revenue series (/fundamentals/history?timeframe=quarterly, [E2 source]);
              is the LATEST reported quarter accelerating? Append. EDGAR only if the dispute is about a line item.
Escalation 3  "Sentiment is bullish" [E10] vs "that's stale":
              re-read E10's as-of; if it predates a material event [E16, E20], the freshness objection stands.
```

SentiSense gives the read, including signals and reported statements. Supplied EDGAR material can provide the audit trail underneath it; without that material, the Chair records the dispute as UNRESOLVED and caps confidence.

### R3: Rebuttals

Every seat answers every MATERIAL and FATAL objection against it:

```
R3 / {SEAT} answers {FROM}: [CONCEDE | DEFEND | PARTIAL]
  STEELMAN: "<their strongest form, one line, cited>"
  ANSWER:   "<max 3 lines, cited>"
  STANCE NOW: <same or moved, one of the five>
```

**Concession is scored as a win.** A seat that moves its stance on evidence is doing the job; a seat that never moves regardless of input is a broken instrument. (This is Bayesian updating taught by structure.) MINOR objections may be answered in one line or accepted silently.

---

## STEP 5: Synthesis (R4, the Chair) and the Committee Verdict

The Chair is **neutral and is not one of the investor personas**. In Mode A the main agent chairs; in Mode B you put on the Chair hat last, after a hard reset. Before filling the verdict, the Chair runs one **Invert pass**: "If this verdict is wrong, why? Which cited row is weakest or stalest? Is the committee pattern-matching a story? Overweighting the latest quarter?" One paragraph, kept in the transcript.

**Devil's-advocate backstop:** if all seats landed on the same side (all SUPPORT/LEAN-SUPPORT or all OPPOSE/LEAN-OPPOSE), the committee has failed its diversity function. The Chair must write the strongest opposite case itself, citing rows, before the verdict. Unanimity without a written counter-case is an invalid run.

```
### COMMITTEE VERDICT: {TICKER}: "<the Step 0 thesis>"
COMMITTEE MODE: A | B    SEATS: <names>    LEDGER: <n rows filled, m [NOT AVAILABLE]>
TALLY: SUPPORT _ / LEAN-SUPPORT _ / LEAN-OPPOSE _ / OPPOSE _ / PASS _
CENTER OF GRAVITY: <one sentence> @ CONFIDENCE HIGH | MED | LOW
STRONGEST BULL (from {seat}): <one line> [E_]
STRONGEST BEAR (from {seat}): <one line> [E_]
THE KEY DISAGREEMENT: <the ONE axis the table split on, e.g. "earnings quality vs tape">
RECORDED DISSENTS (mandatory, never suppressed):
  {seat}: <one line> [E_]
DECISIVE EVIDENCE TO WATCH (from the falsifiers, most decisive first):
  1. <what, where to get it, when it lands (e.g. next 10-Q, E16 date)>
  2. ...
WHAT WE DON'T KNOW: <the [NOT AVAILABLE] rows that mattered + UNRESOLVED escalations>
This is educational analysis of a thesis, not investment advice.
```

**Confidence is deterministic, not vibes:**

- **HIGH**: at least 2/3 of voting seats on the same side AND the center-of-gravity case rests on at least two Tier P or D1 hard rows.
- **MED**: a split table, or key support rows are soft, stale, or secondary-sourced.
- **LOW**: split on THE key axis, or the ledger is thin on the rows the thesis needs.
- **Caps:** most Tier P statement rows `[NOT AVAILABLE]` caps at MED (with a key this should be rare: the two fundamentals calls fill E2-E9, so a capped run means coverage genuinely came back empty). An UNRESOLVED evidence escalation on a load-bearing fact caps at MED. Both caps get named in WHAT WE DON'T KNOW.

The recorded dissents and the exact-evidence-that-would-settle-it are the signature of the product. A professional committee's value is the bear in the room and the unresolved crux; never trade them for a cleaner-looking answer.

---

## STEP 6: The Pre-Flight Checklist (fail-closed gate)

Run last, before showing the user anything:

```
[ ] Every number in the output traces to a ledger row ID.
[ ] No [NOT AVAILABLE] row was used downstream as if it had a value.
[ ] Every fundamental row states its fiscal period (watch FY ends: NVDA Jan, AAPL Sep).
[ ] Every row shows its as-of; nothing is called "real time", including price.
[ ] Every seat voted from the single stance vocabulary and cited at least one row.
[ ] At least one MATERIAL+ objection was filed; dissents are recorded, not smoothed away.
[ ] Every rebuttal opened with a steelman.
[ ] The strongest bull AND the strongest bear are real, attributed, and cited (no straw men).
[ ] No buy/sell instruction, no price target, no allocation advice, anywhere.
[ ] The educational disclaimer line is present. No em dashes in the output.
```

**If either of the first two boxes fails, do NOT show the output.** Re-derive the offending claims from the ledger and run the gate again. Fabrication is the one unrecoverable defect; everything else is style.

---

## Execution modes

Mode selection is the first orchestration decision, made at Step 0 via a detection gate: **if the host's tool list contains a tool that runs an independent agent or prompt** (`Task`, `dispatch_agent`, `spawn`, `spawn_agent`, `run_subagent`, `agent`, or similar), use Mode A; otherwise Mode B. When unsure, Mode B. Emit `COMMITTEE MODE: A | B` in the verdict for transcript honesty.

### Mode A: native sub-agent fan-out (the upside)

For hosts with real sub-agents. Parallelize within a round, serialize across rounds; the main agent is the blackboard and the Chair.

1. Fill the ledger (main agent), pin it.
2. R1: fan out N parallel persona sub-agents, each receiving ONLY the ledger + its own worksheet + the thesis. True independence: no seat sees another's output.
3. R2: fan out again; each seat receives the ledger + all R1 theses + its own worksheet, returns typed objections.
4. R3: fan out to the objected-to seats with their objections.
5. R4: main agent chairs, runs the invert pass, fills the verdict.

### Mode B: sequential "wear each hat" (the floor; every host can do it)

One model plays each role in sequence. The discipline that makes it work:

- **Hard reset between seats.** Before each R1 turn, write literally: `You are now ONLY {seat}. Forget the previous seat's conclusion. Re-read the ledger and your worksheet fresh.` Then re-pin the thesis line. Without the reset, seat 2 anchors on seat 1 and the committee collapses into one voice with costumes.
- Fill each seat's R1 completely before starting the next.
- In R2, adopt each seat again with the header "you are paid to disagree" and file its objections.
- Chair last, after one more hard reset.

### The degradation ladder

```
A (parallel, 5 seats)  ->  B full (sequential, 5 seats)  ->  B lite (3 seats + Chair)
                                                          ->  minimum (1 bull + 1 bear + Chair)
```

**What degrades: seat count and parallelism. What NEVER degrades: the four rounds, the mandatory objection, the recorded dissent, the pre-flight gate.** The analog of "degrade to less data, never invented data" is: degrade to fewer voices, never to fake agreement.

**The lite path (small context windows, local models).** 3 seats: Quality Owner, Forensic Short-Seller, Macro Trader (maximum lens diversity per token: quality, forensics, macro). Trim the ledger to E1-E12 + E18. One objection per seat in R2, one-line steelmans in R3. Keep every template otherwise intact. Rough budget: full committee runs ~2.5-3.5k output tokens across rounds; lite runs ~1.2-1.5k. If even lite does not fit, run minimum (the Quality Owner as bull, the Short-Seller as bear, Chair) and say so in the verdict's SEATS line.

**API cost:** a full ledger is ~10-14 SentiSense calls (the 8-12 D1 calls plus the two fundamentals calls). Within the free tier's 30/min with room to spare; one committee run costs about 1-2% of the free monthly quota. Supplied FRED or EDGAR material adds no SentiSense calls.

---

## Worked example (abbreviated; all numbers illustrative)

A compressed excerpt showing the shape. Every number below is marked (ill.) = illustrative; never reuse them as facts.

```
THESIS UNDER REVIEW: NVDA: "At today's price, NVDA is attractive for a 3-5 year holder." FRAME: own, 3-5y.

EVIDENCE LEDGER (excerpt)
| E1  | Price + day    | $172.40 / +1.1% (ill.) | live       | D1 | SS /stocks/price |
| E2  | Revenue FY     | $130.5B (ill.)  | FY2025, ended Jan 2025 | P | SS /fundamentals/history |
| E5  | FCF            | $60.9B (ill.)   | FY2025             | P  | SS /fundamentals/history |
| E9  | P/E, P/S       | 46x / 21x (ill.)| derived            | P  | derived |
| E10 | Sentiment      | +0.41, rising (ill.) | as-of 09:30 ET (batch) | D1 | SS |
| E12 | Insider 90d    | 0 buys / 7 sells, $48M (ill.) | 90d  | D1 | SS |
| E14 | 13F motion     | [NOT AVAILABLE] (quarter pending)    | D1 | SS |

R1 / Quality Owner: STANCE: LEAN-SUPPORT
  1. FCF conversion is real: E5 tracks E3 closely. [E3][E5]
  2. Multiple is rich for a 5% 10Y world. [E9][E18]
  ALWAYS-ASK: comfortable for 10 closed-market years? Yes on cash engine, uneasy on price.
  FALSIFIER: "I flip if FCF conversion breaks below ~70% of net income for 2 quarters." [E3][E5]

R1 / Short-Seller: STANCE: LEAN-OPPOSE
  1. 7 insider sells, zero buys in 90d into strength. [E12]
  2. At 21x sales the REQUIRED growth just to hold the multiple is extreme. [E2][E9]
  FALSIFIER: "I flip if insider buying appears and the multiple compresses below ~12x sales."

R2 / Short-Seller vs Quality Owner: [EVIDENCE] [MATERIAL]
  "Your cash-engine case ignores WHO is selling it: insiders, 7-0. [E12]"
R2 / Quality Owner vs Short-Seller: [FRAME] [MATERIAL]
  "Insider sells at mega-caps are mostly scheduled compensation; without Form 4 codes
   you cannot read direction into E12. Escalate or withdraw."
  -> Escalation: Form 4 pull [NOT AVAILABLE on this host]. Recorded UNRESOLVED. Caps confidence at MED.

R3 / Short-Seller answers Quality Owner: [PARTIAL]
  STEELMAN: "Scheduled comp sales carry no signal; my 7-0 may be noise. [E12]"
  ANSWER: "Granted on mechanism, but zero BUYS in 90d at any price is still one-directional. [E12]"
  STANCE NOW: LEAN-OPPOSE (unchanged).

COMMITTEE VERDICT (excerpt): TALLY: LEAN-SUPPORT 2 / LEAN-OPPOSE 2 / PASS 1
CENTER OF GRAVITY: "Superb cash engine at a price that already pays for years of it." @ MED
THE KEY DISAGREEMENT: earnings quality is not in dispute; what the multiple already pays for is.
RECORDED DISSENTS: Short-Seller: one-directional insider flow. [E12]
DECISIVE EVIDENCE TO WATCH: 1. Form 4 codes on recent sells (EDGAR, anytime). 2. Next quarterly
  FCF conversion (10-Q, ~E16 date). 3. 13F motion when the pending quarter settles [E14].
WHAT WE DON'T KNOW: E14 pending; Form 4 escalation unresolved (confidence capped at MED).
This is educational analysis of a thesis, not investment advice.
```

Note what the example demonstrates: an honest `[NOT AVAILABLE]`, an escalation the host could not complete recorded as UNRESOLVED with the confidence cap applied, a PARTIAL concession scored as normal work, and a split verdict delivered as a split, not smoothed into mush.

---

## Glossary (define at point of use; here for reference)

| Term | Meaning |
|---|---|
| TTM | Trailing twelve months: the last 4 reported quarters summed |
| FCF | Free cash flow: operating cash flow minus capital expenditures |
| Owner earnings | The cash an owner could extract without harming the business; FCF is the practical proxy |
| FCF yield | FCF / market cap; the cash return the business earns on its price |
| P/E, P/S | Price to earnings, price to sales; P/S is harder to game because revenue is harder to manage than EPS |
| PEG | P/E divided by growth rate; a rough "am I paying for growth I'm not getting" check |
| Margin of safety | Buying below estimated value so being somewhat wrong still works out |
| Moat | A durable competitive advantage: pricing power, switching costs, network effects, cost advantage, brand |
| Polarity | The sentiment scale in [-1, +1]; sign is direction, magnitude is conviction; never map to 0-100 |
| SentiSense Score | SentiSense's proprietary read on how bullish or bearish the market is on a stock, weighted by how actively it's discussed; unbounded, report as-is, never normalized |
| 10-K / 10-Q / 8-K | Annual report / quarterly report / material-event filing with the SEC |
| Form 4 | Insider transaction filing; code P = open-market buy, S = sale, A = award, M/exercise = options |
| 13F | Quarterly institutional holdings disclosure (45-day lag; always a quarter behind) |
| DEF 14A | Proxy statement: executive compensation and incentives live here |
| Dilution | Share count rising; each share owns less of the business |
| Basis point | 0.01%. 50bp = half a percent |

---

## Fetch Reference

Parameters and full schemas: the `sentisense` skill, or https://sentisense.ai/skill.md.

```
RESOLVE     GET /api/v1/kb/entities/search?q={name}&type=company&limit=5   (bare array, best first; take the first non-null ticker; type=etf for funds)
FUNDAMENTALS
            GET /api/v1/stocks/fundamentals/history?ticker={T}&timeframe=annual|quarterly&limit=N
                                                       (periods[], newest first; E2-E8)
            GET /api/v1/stocks/fundamentals?ticker={T}&timeframe=annual|quarterly
                                                       (flat single period; E9 ratios + marketCap)
PRICE       GET /api/v1/stocks/price?ticker={T}          (flat; currentPrice, changePercent; timestamp is serve time)
            GET /api/v1/stocks/prices?tickers=A,B,C
            GET /api/v1/stocks/chart?ticker={T}&timeframe=1M|3M|6M|1Y
            GET /api/v1/stocks/{T}/profile
            GET /api/v1/stocks/popular
SENTIMENT   GET /api/v2/metrics/entity/{T}/metric/sentiment?startTime={epochMs}&endTime={epochMs}
            GET /api/v2/metrics/entity/{T}/metric/sentisense
            GET /api/v1/stocks/{T}/sentiment           (envelope data; Score, 30d fallback, mentions)
INSIDER     GET /api/v1/insider/trades/{T}?lookbackDays=N             (envelope data[])
            GET /api/v1/insider/cluster-buys?lookbackDays=N           (envelope data[])
CONGRESS    GET /api/v1/politicians/filings/{T}?lookbackDays=N        (envelope data[])
            GET /api/v1/politicians/activity?lookbackDays=N           (envelope data[])
            GET /api/v1/politicians/member/{slug}                     (trades at data.recentTrades[])
INSTITUTION GET /api/v1/institutional/quarters                         (bare array; skip pending:true)
            GET /api/v1/institutional/holders/{T}?reportDate={Q}      (envelope data.holders[])
ANALYST     GET /api/v1/analyst/{T}/consensus         (envelope data)
            GET /api/v1/analyst/{T}/actions?lookbackDays=N            (envelope data[])
            GET /api/v1/analyst/{T}/estimates          (data.estimates[0] + data.surprises[])
            GET /api/v1/analyst/activity?lookbackDays=N&actionTypes=UPGRADE,DOWNGRADE,INITIATE  (rating changes only)
INSIGHTS    GET /api/v1/insights/stock/{T}             (envelope data[]; generatedAt is seconds)
            GET /api/v1/insights/market                (envelope data[])
CALENDAR    GET /api/v1/calendar/earnings?ticker={T}   (data.earnings[]; an empty window still returns a metadata block with windowStart/windowEnd)
OPTIONS     GET /api/v1/options/overview               (end-of-day radar board, stocks only)
            GET /api/v1/stocks/{T}/options/summary     (envelope data)
            GET /api/v1/stocks/{T}/options/history?window=1y|2y|5y
```

## Agent Tips (shape gotchas worth memorizing)

- **Wrap vs flat varies by endpoint.** Read FLAT (no `.data`): `price`, `prices`, `chart`, `popular`, `market-mood`, `stocks/{T}/profile`, `descriptions`, and `metrics/entity/{T}/metric/*` (bare arrays). `institutional/quarters` is a bare array (take the first entry whose `pending` is not true). These are wrapped in `{ isPreview, previewReason, data }`: `insider/*`, `analyst/*`, `insights/*`, `politicians/*`, `institutional/holders`, `stocks/{T}/sentiment`, `stocks/{T}/options/summary`, and `calendar/earnings` (read `data.earnings[]`). When unsure: `Array.isArray(raw) ? raw : (raw?.data ?? raw)`.
- **`isPreview:true` is not an error.** Free tier returns real, truncated data. Synthesize from what you get; mention PRO only when the truncation materially limits the answer.
- **Metric scalar path:** the flat `series[i].value`, present on every point of every metric series and holding the reading. Prefer it over the nested `metricValue`, whose depth varies by metric type: `sentiment`, `sentisense` and `social_dominance` nest at `metricValue.value.value` because `metricValue.value` is itself a dict, while `mentions` is a count metric whose integer sits at `metricValue.value`, so `metricValue.value.value` throws on it. Latest reading = last element. Polarity in [-1, 1]; the SentiSense Score is unbounded, report as-is.
- **Insider field is `transactionType` (`BUY`/`SELL`)**, congress uses `PURCHASE`/`SALE`. Exclude `AWARD`/`GIFT`/`EXERCISE` from tallies (grants and exercises can carry very large `totalValue`), and drop `transactionCode` `F` (tax withholding on vesting) even though it arrives typed `SELL`.
- **`market-mood` nests the composite under `market`**; `sectors` is a dict whose GICS labels have historically overlapped, so dedupe defensively if a pair appears.
- **Options are end-of-day chain aggregates, not order flow.** `/options/*` gives put/call volume and OI, an ATM IV term structure, 25-delta skew, OI walls with max pain, and unusual contracts, each ranked as a percentile of that ticker's OWN trailing history (`ivRank1y`, `pcVolPctl1y`, `skewPctl1y`), `asOf` the prior session. Read it as positioning context, never as live sweeps or dealer books. The `/options/overview` board is stocks-only; ETFs (`SPY`, `QQQ`, `TLT`, sector `XL*`) are covered but reachable only via `/stocks/{T}/options/summary`.
- **Resolve names, then call.** A company name in the ask goes through `kb/entities/search` before any other call (see Authentication); take the first match with a non-null `ticker`. An empty result is a resolution problem, not a coverage gap.
- **Don't hallucinate endpoints.** No real-time options order flow or sweeps feed (the `/options/*` endpoints above are end-of-day), no dark pool, no `/congress` (it's `/politicians`). SentiSense DOES serve the financial statements: `/api/v1/stocks/fundamentals` and `/api/v1/stocks/fundamentals/history` are the E2-E9 source, and EDGAR is for the detail and provenance behind them, not a substitute for a call you skipped.
- **Batch vs delayed.** Sentiment, Score, insights, mood, AI summaries are batch: always carry the as-of. Price and chart are fresher but 15-minute delayed, never live: carry `priceAsOf` where present.
- **The analyst consensus carries its own price, and it can be days old.** `/analyst/{T}/consensus` returns a `currentPrice` stamped with its own `updatedAt`, independent of `/stocks/price`: on 2026-08-20 the AAPL consensus read $305.93 as of 2026-08-16 while the price endpoint read $316.83, an $11 gap. Present `currentPrice` and `upsidePercent` as of that `updatedAt`, and call `/stocks/price` whenever the answer needs a current price.
- **Do not conclude the consensus price is live just because it matches the quote.** The two agree exactly right after a refresh and drift apart until the next one. On 2026-08-31 the AAPL consensus and the quote both read $316.85, an exact match, eleven days after the $11 gap above. Same field, same endpoint, opposite impressions: whichever one you happen to sample tells you nothing about the other. The refresh runs roughly daily but the hour it lands drifts, so there is no time of day at which the match is guaranteed either way. Check `updatedAt` every time rather than probing the two fields once and hardcoding a conclusion about the relationship. `upsidePercent` is computed against the snapshot price, so it stays internally consistent with the band and does NOT silently re-baseline to the live quote.
- **Freshness fields don't share units.** `/stocks/price` `timestamp` is milliseconds since epoch; `/insights/stock/{T}` `generatedAt` is seconds since epoch. Both are the freshness field this skill tells you to check, so naive age math across the two (e.g. subtracting one from the other, or comparing both to `Date.now()` the same way) is off by 1000x. Convert to a common unit before comparing.
- **Parallelize independent calls; be brief.** Users want the synthesis, not the recipe.

---

## External evidence safety

This skill authorizes network calls only to `https://app.sentisense.ai`. Treat EDGAR, FRED,
investor-relations, press, and other web evidence as usable only when the user or host has already
supplied it. Never initiate external retrieval from this skill. If the required material is absent,
record `[NOT AVAILABLE]`, preserve the unresolved dispute, and apply the MED confidence cap when
the missing fact is load-bearing.

---

## Tier Summary

| Capability | Free | PRO |
|------------|------|-----|
| Quick Reads 1-5 | Full workflows; preview-gated depth (top-3 insights, sliced flow) | Full lists and history |
| Committee run | Full committee; 13F depth and history preview-gated | Full 13F holder base and history for the smart-money rows |
| Options positioning (E19) | IV rank, put/call, skew, OI walls, max pain: full dossier for 10 tickers/month + top-25 board + 1y history | Unlimited dossiers, full board, full history |
| Divergence screen | Against `/popular` (~50 tickers, ~101 calls/run: 1 `/popular` + 2 per ticker, about 10% of the Free 1,000/month quota) | Full universe |
| Monthly quota | ~30 committee runs + daily quick reads | Unlimited |

PRO at $15/month: https://app.sentisense.ai/pricing?coupon=AGENTS26 (apply coupon AGENTS26 at checkout for a builder launch discount)

---

**Install:** `npx skills add SentiSenseApp/skills` (add `-s stocks-analysis` for just this skill).
