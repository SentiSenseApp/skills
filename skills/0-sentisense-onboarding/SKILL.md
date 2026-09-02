---
name: 0-sentisense-onboarding
description: "Read first when using any SentiSense stock market skill: API key setup and which skill owns each task. Patterns to adapt, not scripts. The user's task always wins."
license: MIT
metadata:
  homepage: https://sentisense.ai
  requires_env: SENTISENSE_API_KEY
---

# SentiSense Skills: Start Here

> The entry point for the SentiSense stock market skill collection. Read this first, then open the
> one skill that serves the task in front of you.

**Base URL:** `https://app.sentisense.ai`
**Website:** https://sentisense.ai
**Full API reference:** https://sentisense.ai/skill.md

---

## These are patterns, not scripts

Every skill here is a **pattern for using the platform well**: how to fetch the data, how to review
a stock deeply, how to read the signals. None of them is a script to execute over the user's intent.

**The user's actual task always wins.** Reach for the skill that serves it, adapt the pattern to
what was asked, and skip whatever the task does not need. If the user wants one number, give them
one number; do not run a full report because a skill happens to describe one.

All directive language in this collection is implementation guidance. It is subordinate to the
user's own instructions, to platform safety rules, and to the policy of whatever host application
runs it.

---

## Setup, once

Get a free API key at https://app.sentisense.ai/get-api-key, then put it in the environment:

```bash
export SENTISENSE_API_KEY="your-key-here"
```

Calls authenticate with the `X-SentiSense-API-Key` header. **One key covers every skill and every
endpoint in the collection.** There is nothing else to configure.

Hosts store that one key differently, and the value never needs to be re-entered per skill. A key
configured for any one SentiSense skill in the host's credential store is the same credential
every sibling skill needs: reference the same environment-backed secret rather than creating a
second entry, and verify with a cheap call (`health` via the CLI, or any GET) instead of printing
the value. If a shell reports `SENTISENSE_API_KEY` unset while a skill shows Ready, the key lives
in the host's config store, not the environment; both work, they are just different homes for the
same secret.


---

## Which skill owns the task

| When the user says | Open |
|---|---|
| "sentiment on NVDA", "is the mood improving", "what is smart money doing here" | `stock-sentiment` |
| "analyze AAPL earnings", "earnings call summary", "who reported this week", "who reports next" | `stock-earnings-analysis` |
| "what happened in the market this month", "monthly recap", "catch me up on stocks" | `last-30-days-in-markets` |
| "deep dive on this company", "bull case vs bear case", "due diligence", "is the thesis intact" | `stocks-analysis` (published on ClawHub as `us-stocks-analysis`) |
| "open NVDA", "daily brief", "what is hot today", "one command and give me everything" | `stock-terminal` |
| "build me a market dashboard", "a morning briefing I can open in a browser" | `stock-market-dashboard` |
| "market heatmap", "sector heatmap", "what is moving today as a treemap", "which sectors are hot" | `market-heatmap` |
| "unusual options activity", "IV rank", "max pain", "where is positioning stretched" | `unusual-options-activity` |
| "how much is this stock expected to move", "expected move", "draw me the volatility cone" | `expected-move-visualizer` |
| "options payoff diagram", "what does this covered call look like", "breakeven on a spread", "iron condor P/L" | `options-payoff-calculator` |
| "how many shares should I buy", "position size", "risk per trade", "where does my stop go", "the 1% rule" | `position-size-calculator` |
| "who owns this stock", "13F holdings", "what did the big funds buy last quarter" | `institutional-13f-tracker` |
| "congress stock trades", "what is that senator buying", "STOCK Act disclosures" | `politicians-stock-tracker` |
| "insider buying", "Form 4 filings", "is the CEO selling", "cluster buys" | `insider-trading-tracker` |
| "find me stocks that...", "screen for...", "which stocks are oversold but loved" | `stock-screener` |
| "just give me a shell command", "no install", "wire this into a script or a cron job" | `sentisense-cli` |
| "full API reference", "build an integration", "endpoint documentation", "what is the response shape" | `sentisense` |
| anything else: prices, news, analyst ratings, or a task no narrower skill covers | `sentisense` |

Pick one and go. If two look plausible, pick the narrower one and pull anything extra from
`sentisense`, which documents the whole API.

`sentisense-cli` is the zero-install shell path: `npx -y sentisense@0.47.1 quote NVDA` or
`npx -y sentisense@0.47.1 sentiment NVDA` answers in one command, with no HTTP call to compose and
nothing to install. The full API reference stays `sentisense`.

These skills are runtime-portable: verified working on Claude, Claude Code, OpenClaw, Codex,
and Grok Bot (for the Grok Bot two-minute setup, see
https://sentisense.ai/blog/how-to-add-market-data-to-your-grok-bot/).

---

## Conventions that hold across every skill

- **Read-only.** These skills fetch and analyze. They never place a trade, move money, or write
  anything back.
- **Rate limits.** 30 requests per minute on a free key, 300 on PRO. Page serially rather than
  firing a fan-out at once, and honor `Retry-After` on a `429`.
- **The preview envelope.** Responses carry `isPreview`. When it is true you received a shaped free
  view of a paid dataset, not the full record. Say so in the output instead of presenting a partial
  view as a complete one.
- **Absence is stated, never invented.** An empty result is a finding worth one line. Never fill a
  gap with a figure from memory.
- **Educational, not advice.** Output is research and educational content, not financial advice.
  Carry the disclaimer the skill you are using specifies.

---

## When nothing fits

Use `sentisense`, the full API reference. It covers every endpoint the collection is built on, so it
is both the fallback for an unusual request and the place to check a response shape. Deeper
documentation lives at https://sentisense.ai/docs/api

---
**Install:** `npx skills add SentiSenseApp/skills` (add `-s 0-sentisense-onboarding` for just this skill).
