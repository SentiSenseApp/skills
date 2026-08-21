---
name: stock-screener
description: "Stock screener for AI agents: filter US stocks and ETFs on the SentiSense Score, sentiment direction, analyst ratings and upside, technicals, momentum, price and market cap in one query, or run 28 curated screens like Crowd vs Street and Golden Cross + Bullish. Translates plain-language asks such as find oversold stocks with bullish sentiment into valid screen plans. Use for stock screener API, ETF screener, stock scanner, find stocks by sentiment, momentum screener, analyst rating screener, oversold stocks, unusual social volume. Read-only. No trading, no purchases, no write operations, no wallet access."
license: MIT
metadata:
  homepage: https://sentisense.ai
  requires_env: SENTISENSE_API_KEY
---
# Stock Screener (SentiSense)

Filter the tracked US stock and ETF universe in one query. This is the only surface where SentiSense's own signals, the SentiSense Score and social attention, sit in the same `WHERE` clause as analyst consensus, technicals, momentum, and price. A screen on analyst ratings alone is something a dozen free tools already do; a screen on *analyst ratings where the Score disagrees* is not. Twenty-eight curated screens ship ready to run, and every field is available for custom plans.

This skill's job is translation: turning what the user actually asked ("find me oversold stocks people are turning bullish on") into a valid, honest screen plan, running it, and presenting the results with the plan visible so the user can tighten or loosen it.

Read-only educational data interface. Output is informational context, never a personalized buy or sell recommendation.

## When to Use

- "Find me stocks that..." or "which stocks are..." in any combination of sentiment, analyst, price, momentum, or size conditions
- "Screen for unusual social volume", "what is oversold but loved", "where do analysts and the crowd disagree"
- "Run the momentum screen", "what are the curated screens?"
- "Screen my watchlist": the same plans run against a fixed ticker list
- ETF questions in the same shape: "low-cost broad funds with bullish holdings"

Not this skill: single-ticker deep dives (`stock-sentiment`, `us-stocks-analysis`), options positioning (`unusual-options-activity`), price quotes (the `sentisense` reference). Screener rows read a snapshot refreshed every 20 minutes; it is a research surface, not a quote feed.

## Prerequisites

- A free `SENTISENSE_API_KEY`. Get one at https://app.sentisense.ai/get-api-key. The key is required on every call; anonymous requests return `401 api_key_required`.
- Any HTTP client, or no install at all via the official CLI (`npx -y sentisense@0.46.0`).
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
npx -y sentisense@0.46.0 screen --list                # the 28 curated screens
npx -y sentisense@0.46.0 screen --fields              # every filterable field, with operators
npx -y sentisense@0.46.0 screen --screen crowd-vs-street
npx -y sentisense@0.46.0 screen --filter SENTI_SCORE_7D:GTE:13 --filter ANALYST_COUNT:GTE:5 --sort SENTI_SCORE_7D:DESC --limit 25
npx -y sentisense@0.46.0 screen --etf --filter ISSUER:IN:Vanguard,iShares
```

Filters are `FIELD:OP:VALUE` and are ANDed; operators are `GTE`, `LTE`, `GT`, `LT`, `EQ`, `NEQ`, `IN`, `NOT_IN`. Add `--json` for the exact API response, and `--tickers NVDA,AMD,AVGO` to screen a watchlist instead of the universe. Auth: `SENTISENSE_API_KEY` in the environment, or store it once with `npx -y sentisense@0.46.0 auth "$SENTISENSE_API_KEY"` (saved to `~/.config/sentisense/`, file mode 600, local to your machine, removable with `auth --remove`). The version is pinned deliberately: a pinned version runs reviewed, immutable code.

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
2. **Get the field catalog** (`--fields`) rather than guessing names. The catalog carries units, operators, and descriptions, and grows without notice; a guessed field name is a 400, never a silent wrong answer.
3. **Map intent words to field groups.** "Loved / bullish / mood improving" is the Score group; "everyone is talking about it" is popularity (`SOCIAL_DOMINANCE`, `MENTION_VELOCITY`); "cheap lately / beaten down" is `PCT_OFF_52W_HIGH` or the moving-average distances; "analysts like it" is the analyst group; "big / liquid" is `MARKET_CAP` and `VOLUME`.
4. **Add a coverage guard when a ratio can be thin.** `ANALYST_BUY_RATIO_PCT` from one analyst is noise: pair it with `ANALYST_COUNT GTE 5`. If a screen returns fewer rows than expected, check field coverage before loosening thresholds.
5. **Show the plan with the results.** The user can only correct a translation they can see. State filters, sort, and `matched` count; `matched` is the pre-limit total, so truncation is visible.
6. **There is no OR.** Filters AND together; for an OR, run two screens and merge client-side, saying so.

## Field semantics that produce wrong-but-plausible screens

These three are the known traps; getting them wrong yields a screen that runs fine and means nothing:

- **`ANALYST_RATING_MEAN` is inverted.** Vendor 1-to-5 scale where **1.0 is strong buy**. Bullish is `LTE 2.5`, not `GTE`. Prefer `ANALYST_BUY_RATIO_PCT`, which runs the intuitive direction.
- **Score fields are banded, not [-1, 1].** The SentiSense Score is unbounded (roughly -30 to +45 across the universe) with bands at 5, 13, and 23 either side of zero: above +5 bullish lean, +13 bullish, +23 strong. Filter on band edges; `GTE:0.5` is a polarity-scale habit that silently means "any positive score". `SENTI_SCORE_7D` and `SENTI_SCORE_1M` are window averages; `SCORE_CHANGE_7D` is the 7-day minus the 1-month baseline, so positive means strengthening.
- **Nulls never match, in either direction.** `RETURN_1Y >= 0` and `RETURN_1Y < 0` do not partition the universe: a recently listed stock is in neither. Sorting puts nulls last regardless of direction.

Two enum fields are used with `EQ`: `MA_CROSS_STATE` (`1` golden cross, `-1` death cross, `0` neither) and `SENTIMENT_DIRECTION` (`1` above +5, `-1` below -5, `0` the neutral band, where most of the universe sits on a typical day). The catalog lists `EQ` as their operator; stick to it even where other operators happen to evaluate. `ANALYST_COUNT` sums the rating buckets, which deliberately differs from the vendor's own analyst count.

**ETF universe:** `CONSTITUENTS_WEIGHTED_SENTISENSE` is the holdings-weighted Score across what the fund owns (usually the one you want); `DIRECT_SENTISENSE` is chatter about the fund's own ticker, mostly macro noise on an index fund. Check `WEIGHT_COVERED_PCT` before leaning on a weighted number, and use `IN`/`NOT_IN` on the string fields (`ISSUER`, `ASSET_CLASS`, `TRACKED_INDEX`), whose live values come back in the `--fields` catalog.

## Workflows

**1. Run a curated screen.** `--list`, pick by intent, `--screen <id>`. Seventeen stock screens (`winners`, `momentum`, `high-sentiment`, `crowd-vs-street`, `oversold-with-positive-sentiment`, `golden-cross-bullish`, `small-cap-buzz`, ...) and eleven ETF screens (`etf-low-cost-core`, `etf-sentiment-leaders`, `etf-dip-bullish`, ...). Screen ids are stable and never reused, but a screen can be retired, so handle a missing id gracefully.

**2. Translate a fuzzy ask.** "Beaten-down names the crowd is warming to" becomes: `PCT_OFF_52W_HIGH:LTE:-30`, `SCORE_CHANGE_7D:GTE:5`, sort by `SCORE_CHANGE_7D:DESC`, with the plan shown alongside the results. Compare with the curated `oversold-with-positive-sentiment` and say if you diverged and why.

**3. Screen a watchlist.** Pass `--tickers` (CLI) or the top-level `tickers` array (REST) to run any plan against the user's own list instead of the universe.

**4. Hand off the results.** A screen finds candidates; it does not research them. For the names that survive, go deeper with `stock-sentiment` (the sentiment picture), `unusual-options-activity` (positioning), `insider-trading-tracker` (Form 4 activity), or `us-stocks-analysis` (the full thesis workflow).

## Reading results

Every row carries the full field set (nulls where uncovered) plus render-ready extras: `week52High`/`week52Low`, `lastUpdated` (epoch seconds), and three small series per ticker (`sentisenseScoreBars7D`, `sentisenseScoreBars30D`, `priceSparkline30D`), so results are chartable without a second call. Prices in rows come from the 20-minute snapshot: fine for screening, not for quoting; say "as of the latest screener snapshot" rather than presenting them as live.

## Going further

**PRO ($15/mo)** lifts the monthly request cap (no monthly limit, just a 300/min rate) and unlocks full depth across the SentiSense API: institutional flows, insider detail, full congressional history, and AI insights. Apply coupon `AGENTS26` at checkout for a builder launch discount: https://app.sentisense.ai/pricing?coupon=AGENTS26

For the full REST reference, install the `sentisense` skill; for the complete CLI command set, install `sentisense-cli`.

**Install:** `npx skills add SentiSenseApp/skills` (add `-s stock-screener` for just this skill).

---

*SentiSense is a read-only financial intelligence API. This data is for informational and educational purposes only, not investment advice.*
