# SentiSense Skills

**The financial-analysis skill collection for AI agents.** Give any agent (Claude Code, Cursor, Codex, Gemini, Copilot, and more) real market intelligence: sentiment, smart-money positioning, insider and institutional flows, congressional trades, and an adversarial investment committee that forms a reasoned verdict, all on a single API key.

## Install

```bash
npx skills add SentiSenseApp/skills
```

Install just one skill:

```bash
npx skills add SentiSenseApp/skills -s stock-terminal
```

## Get a free API key

Every skill runs on a free SentiSense API key. Create one at https://app.sentisense.ai/get-api-key and set it as `SENTISENSE_API_KEY`. Read-only access: no trading, no purchases, no write operations.

## The collection

19 skills, one free key. Start with the first two.

### Start here

| Skill | What it does |
|-------|--------------|
| `0-sentisense-onboarding` | Read first: API key setup and which skill owns each task. |
| `sentisense` | The full read-only market-data reference: prices, sentiment, the SentiSense Score and daily A to F Rating, insider Form 4 trades, congressional trades, 13F holdings, options positioning, analyst ratings, the earnings calendar, and AI market insights. |
| `sentisense-cli` | The official CLI: quotes, sentiment, and market data in one `npx sentisense` command, for agents that prefer a shell. |

### Research and terminals

| Skill | What it does |
|-------|--------------|
| `stock-terminal` | Turns chat into a financial terminal. Typed commands like `open NVDA`, `screen smart-money`, `daily brief`, or plain questions like "what's hot today?" return composite reports across price, sentiment, insider and congressional trades, institutional flows, analyst ratings, and news. |
| `stocks-analysis` | An adversarial investment committee. Legendary-investor personas research a thesis, attack each other's cases against a shared evidence ledger (sentiment, smart money, SEC fundamentals), and reconcile into a verdict with recorded dissents. |
| `stock-market-dashboard` | A morning market briefing as one self-contained HTML file: fear-to-greed mood gauge, sentiment breadth, sector heat, and the day's leaders, from live data. |
| `last-30-days-in-markets` | What happened over the last 30 days as one synthesized brief: the mood arc, the biggest story themes ranked by impact, and which tickers and sectors dominated. |
| `stock-earnings-analysis` | Earnings the way a quarter actually reads: what was reported, marquee KPIs with year-over-year deltas, guidance language, and how analysts and the crowd reacted. |

### Signals and trackers

| Skill | What it does |
|-------|--------------|
| `stock-sentiment` | Sentiment and smart-money positioning for US stocks. |
| `stock-screener` | Filter US stocks and ETFs on the SentiSense Score and Rating, sentiment direction, analyst ratings and upside, technicals, momentum, price and market cap in one query, or run 28 curated screens. |
| `analyst-ratings-tracker` | Who covers a stock and where each firm stands, upgrades and downgrades by ticker and market-wide, one analyst's call history, the Street versus crowd comparison, and which firms moved after an earnings print. |
| `insider-trading-tracker` | SEC Form 4 insider buying and selling by ticker and market-wide, cluster-buy signals, and 10b5-1 plan detection. |
| `institutional-13f-tracker` | Quarterly 13F holdings by ticker or by manager: top holders, quarter-over-quarter buying and selling, and activist positions. |
| `politicians-stock-tracker` | Congressional STOCK Act trades from House Clerk and Senate eFD filings, by member or by ticker. |
| `unusual-options-activity` | End-of-day IV rank, options sentiment, put/call percentile, 25-delta skew, open-interest walls, and max pain, each ranked against the ticker's own history. |

### Visual tools and calculators (pre-filled with live data)

| Skill | What it does |
|-------|--------------|
| `market-heatmap` | Every stock in an index as a treemap tile, sized by market cap, grouped by sector, coloured by today's move, as one interactive HTML page. |
| `expected-move-visualizer` | Implied volatility turned into a 30, 60 and 90 day expected-move cone around the current price, skewed by put and call demand. |
| `options-payoff-calculator` | Profit and loss at expiry for common single-leg and spread strategies, loaded with the ticker's live chain instead of hand-typed inputs. |
| `position-size-calculator` | Share count and dollar risk from account size, risk percentage, and the ticker's real last price. |

## Why SentiSense

Free market data gets an agent prices and a few fundamentals. The questions people actually ask an agent need more than that. One free key adds:

- **Analyst ratings with names and dates.** Which firm said what, when, and who moved after the print. Free sources give you a monthly survey count with no firm names and no event dates.
- **Filings from the primary source.** Insider Form 4 trades with cluster-buy and 10b5-1 detection, congressional STOCK Act disclosures from the House Clerk and Senate eFD, and 13F holdings with quarter-over-quarter changes.
- **Sentiment a price feed cannot give you.** News, Reddit, X, YouTube and Substack scored per stock by our own model, rolled into the SentiSense Score and a daily A to F Rating, with the stories that drove it one call away.
- **Options positioning in context.** IV rank, skew, open-interest walls and max pain ranked against the ticker's own history, not a raw chain dump.
- **Built for agents, not dashboards.** Every skill maps what a user types to an exact call sequence and a fixed output template, so the same question returns the same-shaped report every run, with the source and as-of time on each number.

Read-only by design. About a thousand of the most-watched US stocks, 30 requests a minute on the free key, no card.

Built by SentiSense. Learn more at https://sentisense.ai.

## License

MIT. See [LICENSE](./LICENSE).
