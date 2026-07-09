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

| Skill | What it does |
|-------|--------------|
| `stock-terminal` | Turns chat into a financial terminal. Typed commands like `open NVDA`, `screen smart-money`, `daily brief`, or plain questions like "what's hot today?" return composite reports across price, sentiment, insider and congressional trades, institutional flows, analyst ratings, and news. |
| `stocks-analysis` | An adversarial investment committee. Legendary-investor personas research a thesis, attack each other's cases against a shared evidence ledger (sentiment, smart money, SEC fundamentals), and reconcile into a verdict with recorded dissents. Structured rubrics keep every number sourced, on any model. |
| `stock-sentiment` | Sentiment and smart-money positioning for US stocks. |
| `sentisense` | The full read-only market-data API reference: prices, sentiment, insider trading, institutional flows, politician trades, and AI insights. |

More skills are on the way: congressional-trade tracking, options flow, 13F institutional ownership, insider buying, and market mood, each built on primary-source data.

## Why SentiSense

Most financial agent tools hand you commodity numbers and make you bring your own paid data keys. These skills run out of the box on one free SentiSense key and lead with data you cannot get elsewhere: proprietary sentiment scoring, smart-money positioning, and primary-source filings. Your agent does not just see the data. It forms a verdict.

Built by SentiSense. Learn more at https://sentisense.ai.

## License

MIT. See [LICENSE](./LICENSE).
