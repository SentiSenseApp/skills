---
name: stock-screener
description: "Stock screener for AI agents: filter US stocks and ETFs on the SentiSense Score, sentiment direction, analyst ratings and upside, technicals, momentum, price and market cap in one query, or run 28 curated screens like Crowd vs Street and Golden Cross + Bullish. Translates plain-language asks such as find oversold stocks with bullish sentiment into valid screen plans. Use for AI stock screener, stock screener with sentiment, stock screener API, ETF screener, stock scanner, find stocks by sentiment, screen stocks by market cap, momentum screener, analyst upgrade screener, oversold stocks, 52-week low screener, unusual social volume. Read-only. No trading, no purchases, no write operations, no wallet access."
license: MIT
metadata:
  homepage: https://sentisense.ai
  requires_env: SENTISENSE_API_KEY
---
# Stock Screener (SentiSense)

Filter the tracked US stock and ETF universe in one query. This is the only surface where SentiSense's own signals, the SentiSense Score and social attention, sit in the same `WHERE` clause as analyst consensus, technicals, momentum, and price. A screen on analyst ratings alone is something a dozen free tools already do; a screen on *analyst ratings where the Score disagrees* is not. 28 curated screens ship ready to run, and all 48 screenable fields are available for custom plans; both are enumerated in the appendix at the end of this skill.

This skill's job is translation: turning what the user actually asked ("find me oversold stocks people are turning bullish on") into a valid, honest screen plan, running it, and presenting the results with the plan visible so the user can tighten or loosen it.

Read-only educational data interface. Output is informational context, never a personalized buy or sell recommendation.

## When to Use

- "Find me stocks that..." or "which stocks are..." in any combination of sentiment, analyst, price, momentum, or size conditions
- "Screen for unusual social volume", "what is oversold but loved", "where do analysts and the crowd disagree"
- "Run the momentum screen", "what are the curated screens?"
- "Screen my watchlist": the same plans run against a fixed ticker list
- ETF questions in the same shape: "low-cost broad funds with bullish holdings"

Not this skill: single-ticker deep dives (`stock-sentiment`, `stocks-analysis`; the latter is `us-stocks-analysis` on ClawHub), options positioning (`unusual-options-activity`), price quotes (the `sentisense` reference). Screener rows read a snapshot refreshed every 20 minutes; it is a research surface, not a quote feed.

## Prerequisites

- A free `SENTISENSE_API_KEY`. Get one at https://app.sentisense.ai/get-api-key. The key is required on every call; anonymous requests return `401 api_key_required`.
- Any HTTP client, or no install at all via the official CLI (`npx -y sentisense@0.47.1`).
- Read-only scope: everything here is a `GET` or a filter-only `POST`. Nothing this skill does can place a trade, move money, or modify account state.

| Tier | Quota | Rate |
|------|-------|------|
| Free | 1,000 requests/month | 30 requests/min |
| PRO ($15/mo) | Unlimited | 300 requests/min |

A screen is a single request no matter how many rows it returns, so prefer one broad screen plus client-side slicing over many narrow ones.

## How to Run

**Identify your client.** Send a `User-Agent` naming your agent runtime and this skill, for example `OpenClaw/1.4 (stock-screener)` or `ClaudeCode/2.1 (stock-screener)`. Substitute your own runtime and version if neither matches. You can also volunteer what your agent is called by adding an `agent/<your-agent-name>` token inside the same parentheses, as in `OpenClaw/1.4 (stock-screener; agent/research-desk)`. All of it is optional, and it is what tells us this skill has real integrations behind it, so it gets prioritized and you get notice before it changes. Using the CLI instead? Set `SENTISENSE_SKILL=stock-screener` and it stamps the same identity for you.

The CLI is the fastest path:

```bash
npx -y sentisense@0.47.1 screen --list                # the 28 curated screens
npx -y sentisense@0.47.1 screen --fields              # every filterable field, with operators
npx -y sentisense@0.47.1 screen --screen crowd-vs-street
npx -y sentisense@0.47.1 screen --filter SENTI_SCORE_7D:GTE:13 --filter ANALYST_COUNT:GTE:5 --sort SENTI_SCORE_7D:DESC --limit 25
npx -y sentisense@0.47.1 screen --etf --filter ISSUER:IN:Vanguard,iShares
```

Filters are `FIELD:OP:VALUE` and are ANDed; operators are `GTE`, `LTE`, `GT`, `LT`, `EQ`, `NEQ`, `IN`, `NOT_IN`. Add `--json` for the exact API response, and `--tickers NVDA,AMD,AVGO` to screen a watchlist instead of the universe. Auth: `SENTISENSE_API_KEY` in the environment, or store it once with `npx -y sentisense@0.47.1 auth "$SENTISENSE_API_KEY"` (saved to `~/.config/sentisense/`, file mode 600, local to your machine, removable with `auth --remove`). The version is pinned deliberately: a pinned version runs reviewed, immutable code.

REST equivalent, same plan shape the CLI builds:

```bash
curl -X POST https://app.sentisense.ai/api/v1/screener/execute \
  -H "X-SentiSense-API-Key: $SENTISENSE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "plan": { "filters": [ { "fieldName": "SENTI_SCORE_7D", "op": "GTE", "value": 13 } ], "sort": { "fieldName": "SENTI_SCORE_7D", "dir": "DESC" } }, "limit": 25 }'
```

Endpoints: `POST /api/v1/screener/execute` (stocks), `POST /api/v1/screener/etfs/execute` (ETFs, same shape), `GET /api/v1/screener/fields` (the catalog), `GET /api/v1/screener/screens` (curated screens with their full plans). `limit` sits next to `plan` (default 100, cap 500); an optional top-level `tickers` array scopes the screen to a watchlist. An unrecognized field name returns HTTP 400 with a message naming the bad field and listing the valid ones, and field names are case-sensitive: take them from `--fields`, never from guesswork.

One REST shape difference that the numeric example above does not show: **`IN` and `NOT_IN` filters take a `values` array, not `value`**. Sending `"value"` (singular) gets a generic `400 malformed_request` that does not name the problem, so this is worth getting right the first time:

```json
{ "plan": { "filters": [ { "fieldName": "ISSUER", "op": "IN", "values": ["Vanguard", "iShares"] } ] } }
```

The CLI builds this for you (`--filter ISSUER:IN:Vanguard,iShares`). The live string values for `ISSUER`, `ASSET_CLASS`, and `TRACKED_INDEX` come back in the fields catalog; note the plain `--fields` table shows names, ops, and units only, so add `--json` (or call `GET /fields` directly) when you need the descriptions and those value lists.

## Translating a fuzzy ask (the procedure)

Most screening requests arrive fuzzy. Translate them honestly:

1. **Check the curated screens first** (`--list`). If one matches the intent, run it and say which one you used; the curated plans are also worked examples of the plan shape, so quote the plan when adapting one. In the names, `+` means both conditions hold and `vs` means the two sides disagree.
2. **Get the field catalog** (`--fields`) rather than guessing names. The catalog carries units, operators, and descriptions, and grows without notice; a guessed field name is a 400, never a silent wrong answer. The appendix below is a per-release snapshot of the same catalog, good for planning without a call; the live catalog can be ahead of it.
3. **Map intent words to field groups.** "Loved / bullish / mood improving" is the Score group; "everyone is talking about it" is popularity (`SOCIAL_DOMINANCE`, `MENTION_VELOCITY`); "cheap lately / beaten down" is `PCT_OFF_52W_HIGH` or the moving-average distances; "analysts like it" is the analyst group; "big / liquid" is `MARKET_CAP` and `VOLUME`.
4. **Add a coverage guard when a ratio can be thin.** `ANALYST_BUY_RATIO_PCT` from one analyst is noise: pair it with `ANALYST_COUNT GTE 5`. If a screen returns fewer rows than expected, check field coverage before loosening thresholds.
5. **Show the plan with the results.** The user can only correct a translation they can see. State filters, sort, and `matched` count; `matched` is the pre-limit total, so truncation is visible. Say it as three numbers when they differ: "56 matched, showing 50, more exist" (more exist whenever `matched` is greater than the rows returned).
6. **There is no OR.** Filters AND together; for an OR, run two screens and merge client-side, saying so.

## Popular asks, translated

The phrases people actually type, mapped to the screen that answers them. Curated ids run with
`--screen <id>`; custom plans are filter triples in the `FIELD:OP:VALUE` form the API accepts, with
the sort beside them. Show the plan with the results every time, so the user can loosen or tighten it.

| The user says | Run |
|---|---|
| "run the momentum screen", "what has momentum right now" | curated `momentum` |
| "oversold stocks people like", "beaten down but loved" | curated `oversold-with-positive-sentiment` |
| "where do analysts and the crowd disagree" | curated `crowd-vs-street` |
| "most bullish stocks right now", "high sentiment stocks" | curated `high-sentiment` |
| "small caps people are talking about", "small cap buzz" | curated `small-cap-buzz` |
| "golden cross stocks with bullish sentiment" | curated `golden-cross-bullish` |
| "stocks under $20 with bullish sentiment", "cheap stocks the crowd likes" | `PRICE:LTE:20`, `SENTIMENT_DIRECTION:EQ:1`, sort `SCORE_CHANGE_7D:DESC` (a handful of names on a typical day; `PRICE:LTE:10` often returns none, say so rather than loosening silently) |
| "large caps near their 52-week low with analyst upside" | `MARKET_CAP:GTE:10000000000`, `PCT_OFF_52W_LOW:LTE:10`, `ANALYST_TARGET_UPSIDE_PCT:GTE:20`, sort `ANALYST_TARGET_UPSIDE_PCT:DESC` (the CLI `--filter` wants a plain number here; `10B` is rejected with "expects a number") |
| "stocks analysts just upgraded", "recent analyst upgrades" | `ANALYST_RATING_MOMENTUM_30D:GTE:1`, sort `ANALYST_RATING_MOMENTUM_30D:DESC` (2 narrows to about a dozen names) |
| "strong buy consensus with upside left" | `ANALYST_BUY_RATIO_PCT:GTE:80`, `ANALYST_TARGET_UPSIDE_PCT:GTE:15`, sort `ANALYST_TARGET_UPSIDE_PCT:DESC` |
| "low volatility stocks the crowd likes", "calm names with bullish sentiment" | `VOLATILITY_30D:LTE:25`, `SENTIMENT_DIRECTION:EQ:1`, sort `SENTI_SCORE_7D:DESC` |
| "stocks 30% off their highs", "deep pullbacks" | `PCT_OFF_52W_HIGH:LTE:-30`, sort `PCT_OFF_52W_HIGH:ASC` |
| "mentions spiking", "unusual social volume" | `MENTION_VELOCITY:GTE:100`, sort `MENTION_VELOCITY:DESC`; for share of the whole conversation, curated `rising-share-of-voice` |
| "best performers this month that analysts still back" | `RETURN_1M:GTE:10`, `ANALYST_BUY_RATIO_PCT:GTE:70`, sort `RETURN_1M:DESC` |

Two habits keep these honest: say which window a field measures (the 7-day Score versus its 1-month
baseline, 3-day mention velocity, 30-day analyst momentum), and treat an empty result as the data,
not a broken filter; the fix is to loosen one threshold and say so, never to invent a row.

## Field semantics that produce wrong-but-plausible screens

These three are the known traps; getting them wrong yields a screen that runs fine and means nothing:

- **`ANALYST_RATING_MEAN` is inverted.** Vendor 1-to-5 scale where **1.0 is strong buy**. Bullish is `LTE 2.5`, not `GTE`. Prefer `ANALYST_BUY_RATIO_PCT`, which runs the intuitive direction.
- **Score fields are banded, not [-1, 1].** The SentiSense Score is unbounded (roughly -30 to +45 across the universe) with bands at 5, 13, and 23 either side of zero: above +5 bullish lean, +13 bullish, +23 strong. Filter on band edges; `GTE:0.5` is a polarity-scale habit that silently means "any positive score". `SENTI_SCORE_7D` and `SENTI_SCORE_1M` are window averages; `SCORE_CHANGE_7D` is the 7-day minus the 1-month baseline, so positive means strengthening.
- **Nulls never match, in either direction.** `RETURN_1Y >= 0` and `RETURN_1Y < 0` do not partition the universe: a recently listed stock is in neither. Sorting puts nulls last regardless of direction.

Two enum fields are used with `EQ`: `MA_CROSS_STATE` (`1` golden cross, `-1` death cross, `0` neither) and `SENTIMENT_DIRECTION` (`1` above +5, `-1` below -5, `0` the neutral band, where most of the universe sits on a typical day). The catalog lists `EQ` as their operator; stick to it even where other operators happen to evaluate.

**`SCORE_CHANGE_7D` and `SENTI_SCORE_TREND_7D` are different measurements, not aliases**, and mixing them up in an explanation is a common slip. `SCORE_CHANGE_7D` is a level difference: the 7-day Score minus the 1-month baseline, so positive means stronger than the longer window. `SENTI_SCORE_TREND_7D` is a slope: score points per day over the last 7 days, null when the week is too sparse to call. A stock can be positive on one and negative on the other (strong versus last month but fading this week). Use the field's own catalog description when explaining a screen, and name the field you actually filtered on. `ANALYST_COUNT` sums the rating buckets, which deliberately differs from the vendor's own analyst count.

**ETF universe:** `CONSTITUENTS_WEIGHTED_SENTISENSE` is the holdings-weighted Score across what the fund owns (usually the one you want); `DIRECT_SENTISENSE` is chatter about the fund's own ticker, mostly macro noise on an index fund. Check `WEIGHT_COVERED_PCT` before leaning on a weighted number, and use `IN`/`NOT_IN` on the string fields (`ISSUER`, `ASSET_CLASS`, `TRACKED_INDEX`), whose live values come back in the `--fields` catalog.

## Workflows

**1. Run a curated screen.** `--list`, pick by intent, `--screen <id>`. 17 stock screens and 11 ETF screens, all listed with what each finds in the appendix. Screen ids are stable and never reused, but a screen can be retired, so handle a missing id gracefully.

**2. Translate a fuzzy ask.** "Beaten-down names the crowd is warming to" becomes: `PCT_OFF_52W_HIGH:LTE:-30`, `SCORE_CHANGE_7D:GTE:5`, sort by `SCORE_CHANGE_7D:DESC`, with the plan shown alongside the results. Compare with the curated `oversold-with-positive-sentiment` and say if you diverged and why.

**3. Screen a watchlist.** Pass `--tickers` (CLI) or the top-level `tickers` array (REST) to run any plan against the user's own list instead of the universe.

**4. Hand off the results.** A screen finds candidates; it does not research them. For the names that survive, go deeper with `stock-sentiment` (the sentiment picture), `unusual-options-activity` (positioning), `insider-trading-tracker` (Form 4 activity), or `stocks-analysis` (the full thesis workflow; `us-stocks-analysis` on ClawHub).

## Reading results

Every row carries the full field set (nulls where uncovered) plus render-ready extras: `week52High`/`week52Low`, `lastUpdated` (epoch seconds), and three small series per ticker (`sentisenseScoreBars7D`, `sentisenseScoreBars30D`, `priceSparkline30D`), so results are chartable without a second call. Prices in rows come from the 20-minute snapshot: fine for screening, not for quoting; say "as of the latest screener snapshot" rather than presenting them as live.

<!-- screener-appendix:start -->
## Appendix: every field and every curated screen (snapshot)

Generated from the same catalog the API serves, refreshed with every release of this skill. The live `--fields` and `--list` output is authoritative and can be ahead of this table; use this appendix to plan, and the live catalog to execute. Field names are case-sensitive and go into plans verbatim. Numeric fields take GTE/GT/LTE/LT and are sortable; nulls never match a filter and always sort last.

### Stock fields (32)

| Field | Group | Type | Meaning |
|---|---|---|---|
| `SENTI_SCORE_7D` | Sentiment | number, Score | 7-day SentiSense score. Above +5 is bullish, +13 strongly so; below -5 is bearish. |
| `SENTI_SCORE_1M` | Sentiment | number, Score | 1-month SentiSense score. Above +5 is bullish, +13 strongly so; below -5 is bearish. |
| `SCORE_CHANGE_7D` | Sentiment | number, Score | 7-day SentiSense Score minus the 1-month baseline. Positive means the score is strengthening versus the longer window. |
| `SENTIMENT_DIRECTION` | Sentiment | enum, EQ only | Which side of the neutral band the 7-day SentiSense Score sits on. Bullish is above +5, bearish below -5, and anything between reads Neutral. Values: 1 = Bullish, 0 = Neutral, -1 = Bearish. |
| `SENTI_SCORE_TREND_7D` | Sentiment | number, Score | Slope of the daily SentiSense score over the last 7 days, in score points per day. Positive means the score is climbing. Blank when the week is too sparse to call. |
| `SENTI_SCORE_TREND_30D` | Sentiment | number, Score | Slope of the SentiSense score over the last 30 days, in score points per bucket (each bucket is about 4 days). Positive means the score is climbing. |
| `SENTI_SCORE_RISING_STREAK_30D` | Sentiment | number, count | How many buckets in a row the SentiSense score has risen, ending with the most recent (each bucket is about 4 days, so 3 is roughly two weeks). Unlike the trend slope, this cannot be satisfied by an old climb that has since stalled. |
| `SOCIAL_DOMINANCE` | Popularity | number, share of 1 | Share of social chatter across all tracked stocks. |
| `MENTION_SHARE` | Popularity | number, share of 1 | Share of total mentions across all tracked stocks. |
| `MENTION_VELOCITY` | Popularity | number, % | Change in mentions, last 3 days versus the prior 3 days, in percent. +100 means mentions doubled. |
| `DOMINANCE_CHANGE` | Popularity | number, share of 1 | Change in social dominance versus last week (share of voice). |
| `MARKET_CAP` | Price and size | number, USD (10B, 1.2T) | Company market capitalization. Accepts 500M, 10B, 1.2T. |
| `PRICE` | Price and size | number, USD | Latest share price in dollars. |
| `CHANGE_PERCENT` | Price and size | number, % | Price change today, in percent. |
| `CHANGE` | Price and size | number, USD | Price change today, in dollars. |
| `VOLUME` | Price and size | number, count | Shares traded today. Accepts 500K, 10M, 1B. |
| `PCT_OFF_52W_HIGH` | Price and size | number, % | Distance from the 52-week high. Negative below the high, e.g. -20 is 20% below. |
| `PCT_OFF_52W_LOW` | Price and size | number, % | Distance above the 52-week low. Positive above the low, e.g. 15 is 15% above. |
| `PRICE_TREND_30D` | Price and size | number, % | Slope of the price over the last 30 days, in percent per trading day. Near zero means a flat chart. Use with Score Trend to find stocks where attention is moving before the price is. |
| `ANALYST_BUY_RATIO_PCT` | Analyst | number, % | Percent of rating analysts saying buy or strong buy. Analysts skew bullish, so the average stock sits near 60: use 80 or more for a genuinely strong consensus. |
| `ANALYST_TARGET_UPSIDE_PCT` | Analyst | number, % | Percent from the current price to the mean analyst price target. Negative means the stock trades above the target. |
| `ANALYST_COUNT` | Analyst | number, count | How many analysts rate the stock. Pair this with a consensus filter: some stocks are covered by a single analyst, and one opinion is not a consensus. |
| `ANALYST_RATING_MOMENTUM_30D` | Analyst | number, count | Upgrades minus downgrades over the last 30 days. Moves in small numbers, and the drop-off is steep: a representative run of the whole universe returned 92 stocks at GTE 1, 11 at GTE 2, 2 at GTE 3 and 1 at GTE 4. So 1 is the threshold that gives a workable candidate list, 2 narrows to about a dozen, and 3 or higher is a handful of names rather than a screen. An empty result at 3 is the data, not a broken filter. |
| `PCT_OFF_200D_MA` | Technical | number, % | Percent above or below the 200-day moving average. Negative means trading under it. Blank for stocks with under 200 trading days of history. |
| `PCT_OFF_50D_MA` | Technical | number, % | Percent above or below the 50-day moving average. |
| `MA_CROSS_STATE` | Technical | enum, EQ only | Whether the 50-day average sits above or below the 200-day. Values: 1 = Golden cross, 0 = Neither, -1 = Death cross. |
| `RETURN_1M` | Technical | number, % | Percent price return over roughly the last month of trading. |
| `RETURN_3M` | Technical | number, % | Percent price return over roughly the last three months of trading. |
| `RETURN_6M` | Technical | number, % | Percent price return over roughly the last six months of trading. |
| `RETURN_1Y` | Technical | number, % | Percent price return over roughly the last year of trading. Blank for stocks with under a year of history. |
| `VOLATILITY_30D` | Technical | number, % | Annualized volatility from the last 30 sessions, in percent. The typical tracked stock sits near 50; under 25 is calm and over 80 is turbulent. |
| `ANALYST_RATING_MEAN` | Analyst | number, Score | Broker consensus rating on the standard 1 to 5 scale. THIS SCALE IS INVERTED: 1 is strong buy and 5 is strong sell, so bullish means a LOW value. Analyst Buy Ratio is the easier field for most filters. |

### ETF fields (16)

| Field | Group | Type | Meaning |
|---|---|---|---|
| `CONSTITUENTS_WEIGHTED_SENTISENSE` | Sentiment | number, Score | Holdings-weighted SentiSense score across the fund's constituents. Above +5 is bullish. |
| `DIRECT_SENTISENSE` | Sentiment | number, Score | SentiSense score from chatter about the fund itself. Above +5 is bullish. |
| `WEIGHTED_ANALYST_UPSIDE` | Analyst | number, % | Holdings-weighted analyst price-target upside, in percent. |
| `MARKET_CAP` | Price and size | number, USD (10B, 1.2T) | Assets under management. Accepts 500M, 10B, 1.2T. |
| `EXPENSE_RATIO` | Price and size | number, % | Annual expense ratio in percent, e.g. 0.09 for SPY. Screen <= to find cheap funds. |
| `CURRENT_PRICE` | Price and size | number, USD | Latest fund price in dollars. |
| `CHANGE_PERCENT` | Price and size | number, % | Price change today, in percent. |
| `PRICE_CHANGE` | Price and size | number, USD | Price change today, in dollars. |
| `VOLUME` | Price and size | number, count | Shares traded today. Accepts 500K, 10M, 1B. |
| `PCT_OFF_52W_HIGH` | Price and size | number, % | Distance from the 52-week high. Negative below the high, e.g. -20 is 20% below. |
| `PCT_OFF_52W_LOW` | Price and size | number, % | Distance above the 52-week low. Positive above the low, e.g. 15 is 15% above. |
| `WEIGHT_COVERED_PCT` | Coverage | number, % | Percent of fund weight covered by SentiSense constituent data. |
| `HOLDINGS_COUNT` | Coverage | number, count | Number of holdings in the fund. |
| `ISSUER` | Fund profile | text, IN/NOT_IN | Fund issuer, e.g. Vanguard or iShares. Pick one or more. Live values come from the fields catalog. |
| `ASSET_CLASS` | Fund profile | text, IN/NOT_IN | Broad asset class: Equity, Bond, Commodity. Live values come from the fields catalog. |
| `TRACKED_INDEX` | Fund profile | text, IN/NOT_IN | The index the fund tracks. Live values come from the fields catalog. |

### Curated stock screens (17)

Run with `--screen <id>` or `GET /api/v1/screener/screens` for the full plans.

| Id | Name | What it finds |
|---|---|---|
| `winners` | Winners | Stocks up today |
| `losers` | Losers | Stocks down today |
| `high-sentiment` | High Sentiment | 7-day SentiSense Score of +13 or higher, our strongly bullish band |
| `sentiment-divergence` | Sentiment Divergence | 7-day SentiSense Score has jumped 8 or more points above a 1-month baseline that is still neutral |
| `rising-share-of-voice` | Rising Share of Voice | Largest share of social conversation across the tracked universe |
| `mag-7` | Mag 7 | Mega-cap tech leaders |
| `large-caps-positive` | Large Caps Positive | $10B+ market cap with a bullish 7-day SentiSense Score |
| `high-volume` | High Volume | Stocks trading the most shares today |
| `small-cap-buzz` | Small-Cap Buzz | Under $2B market cap with a bullish 7-day SentiSense Score |
| `oversold-with-positive-sentiment` | Oversold + Bullish | Down more than 2% today while the 7-day SentiSense Score stays bullish |
| `momentum` | Momentum | 7-day SentiSense Score is 8 or more points above its own 1-month baseline |
| `sentisense-score-vs-price` | Score vs Price | SentiSense Score trending up over 30 days while price is flat or down |
| `crowd-vs-street` | Crowd vs Street | Bullish 7-day SentiSense Score where 30% or fewer analysts rate it a buy |
| `analyst-buys-quiet` | Analyst Buys + Quiet | 90% or more analyst buy ratings but almost no social conversation |
| `upgrades-rising` | Upgrades + Rising Score | More analyst upgrades than downgrades in 30 days, with the SentiSense Score rising |
| `below-200d-rising` | Below SMA 200 | Trading below its 200-day moving average while its SentiSense Score is rising |
| `golden-cross-bullish` | Golden Cross + Bullish | 50-day average above the 200-day, with a bullish 7-day SentiSense Score |

### Curated ETF screens (11)

| Id | Name | What it finds |
|---|---|---|
| `etf-winners` | Winners | ETFs up today |
| `etf-losers` | Losers | ETFs down today |
| `etf-sentiment-leaders` | Sentiment Leaders | Highest holdings-weighted SentiSense Score across fund constituents |
| `etf-analyst-upside` | High Analyst Upside | Holdings-weighted analyst upside of 15% or more |
| `etf-mega-funds` | Mega Funds | $100B+ in assets under management |
| `etf-high-volume` | High Volume | ETFs trading the most shares today |
| `etf-near-52w-high` | Near 52w High | Within 5% of the 52-week high |
| `etf-dip-bullish` | Dip + Bullish | Down today while the holdings-weighted SentiSense Score stays bullish |
| `etf-broad-funds` | Broad Funds | Diversified funds with 500+ holdings |
| `etf-low-cost-core` | Low-Cost Core | Expense ratio 0.15% or less with $10B+ in assets |
| `etf-direct-sentiment` | Direct Sentiment | Positive SentiSense Score from chatter about the fund itself, not its holdings |
<!-- screener-appendix:end -->

## Going further

**PRO ($15/mo)** lifts the monthly request cap (no monthly limit, just a 300/min rate) and unlocks full depth across the SentiSense API: institutional flows, insider detail, full congressional history, and AI insights. Apply coupon `AGENTS26` at checkout for a builder launch discount: https://app.sentisense.ai/pricing?coupon=AGENTS26

For the full REST reference, install the `sentisense` skill; for the complete CLI command set, install `sentisense-cli`.

**Install:** `npx skills add SentiSenseApp/skills` (add `-s stock-screener` for just this skill).

---

*SentiSense is a read-only financial intelligence API. This data is for informational and educational purposes only, not investment advice.*
