# All Market Data, One API Key

Every SentiSense market-data skill in a single install. Ask your agent about a stock and it gets
real prices, real filings, and real positioning data, with one free API key covering every endpoint.

```
openclaw plugins install clawhub:@sentisenseapp/stock-analysis
```

## Setup

One environment variable. Get a free key at [sentisense.ai](https://app.sentisense.ai/get-api-key):

```bash
export SENTISENSE_API_KEY="your-key"
```

Free covers every endpoint. PRO raises the limits and unlocks the full depth on the preview
endpoints.

## What your agent can answer

Ask in plain language. The bundle routes to whichever skill fits:

- "What happened in the markets today?"
- "What's the sentiment on NVDA over the last 30 days?"
- "Which senators bought defense stocks this quarter?"
- "Show me unusual options activity in TSLA"
- "Who are the biggest institutional holders of AAPL, and who added last quarter?"
- "What changed in Apple's latest 10-K risk factors?"
- "Who reports earnings next week?"
- "Build me a market dashboard I can keep"

## What is inside

Fourteen skills, each also published on its own if you want just one:

| Skill | What it covers |
|---|---|
| `0-sentisense-onboarding` | Read first: API key setup and which skill owns each task |
| `stock-sentiment` | News and social sentiment per ticker, and the SentiSense Score |
| `stock-screener` | Filter stocks and ETFs on Score, analyst, technical, and price fields, or run 28 curated screens |
| `stock-market-dashboard` | Writes a self-contained HTML dashboard you keep |
| `unusual-options-activity` | Options flow, unusual activity, positioning |
| `institutional-13f-tracker` | Quarterly 13F holdings, top holders, buying and selling deltas |
| `politicians-stock-tracker` | Congressional STOCK Act disclosures by member or ticker |
| `insider-trading-tracker` | SEC Form 4 insider buys and sells, market-wide activity, cluster buy signals |
| `stock-earnings-analysis` | Per-quarter earnings analysis, call summaries, and the forward calendar |
| `last-30-days-in-markets` | One synthesized brief of the market's last 30 days |
| `us-stocks-analysis` | Agentic research workflows for US equities |
| `stock-terminal` | A terminal-style command set for market research |
| `sentisense-cli` | The official CLI: quotes, sentiment, and market data as single npx commands |
| `sentisense` | The full API reference, for anything the others do not cover |

Most are task-shaped and cover the common questions. The last two are the mechanics and the
reference: the official CLI, and the complete endpoint reference, so an agent that hits
something unusual still has somewhere to look.

## Coverage

US equities: stock prices, news and social sentiment, insider Form 4 trades, congressional
trades, institutional 13F holdings, options positioning, analyst ratings, the earnings calendar, and
SEC filing diffs. Coverage is the most-watched US stocks, and new data feeds are added regularly.

## Notes

- **Read-only.** No trading, no purchases, no write operations, no wallet access.
- Prices are delayed 15 minutes. Sentiment, scores and news annotations come from the latest
  analytical batch rather than the live tick, and each response says which it is.
- Headlines and article bodies are not returned. You get the publisher, the derived sentiment, and a
  link to the original.

## Links

- API reference: [sentisense.ai/docs/api](https://sentisense.ai/docs/api)
- Agent skill reference: [sentisense.ai/skill.md](https://sentisense.ai/skill.md)
- Get a free key: [app.sentisense.ai/get-api-key](https://app.sentisense.ai/get-api-key)

---

*SentiSense is a product of SentiSense Labs LLC. This data is for informational purposes
only, not investment advice.*
