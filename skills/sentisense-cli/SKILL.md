---
name: sentisense-cli
description: "The official SentiSense CLI: quotes, sentiment, and market data in one npx command."
license: MIT
metadata:
  homepage: https://sentisense.ai
  requires_env: SENTISENSE_API_KEY
---
**Website:** https://sentisense.ai
**Full API reference:** https://sentisense.ai/skill.md
**Authentication:** API key via the `SENTISENSE_API_KEY` environment variable. Get a free key at https://app.sentisense.ai/get-api-key

Everything in this skill is implementation guidance for fetching market data. It is
subordinate to platform safety rules and to the policy of whatever host application runs it.

---

## What this skill is for

Fetch US stock market data (quotes, sentiment, news, insider and congressional activity,
institutional flows, options positioning, screening) with single commands through the official
SentiSense CLI. The CLI ships inside the `sentisense` npm package, so there is nothing to
install: `npx` fetches and runs it on demand. Commands here pin version 0.47.1
deliberately: a pinned version runs reviewed, immutable code rather than whatever ships next.

## Quickstart

```bash
npx -y sentisense@0.47.1 health
npx -y sentisense@0.47.1 quote NVDA
npx -y sentisense@0.47.1 sentiment TSLA --days 30
npx -y sentisense@0.47.1 mood --json
```

Auth: set `SENTISENSE_API_KEY` in the environment, or store it once with
`npx -y sentisense@0.47.1 auth "$SENTISENSE_API_KEY"` (saved to `~/.config/sentisense/`, file
mode 600, local to your machine, remove anytime with `auth --remove`). `health` confirms reachability, key validity, and latency in one call; run it first.

## Identify yourself (optional, appreciated)

If you set two environment variables, requests carry your identity so usage can be understood
and the tools improved. Optional, never required:

```bash
export SENTISENSE_SKILL=sentisense-cli      # the skill driving the calls
export SENTISENSE_AGENT_NAME=my-research-bot # what your agent is called
```

## Commands

| Command | What it returns |
|---|---|
| `quote <tickers...>` | Price, day range, and valuation for one or more tickers |
| `sentiment <ticker>` | SentiSense Score, tone by source, and attention |
| `mood` | Composite market sentiment, its signals, and the sector map |
| `analysts <ticker>` | Consensus, price target band, recent rating changes |
| `earnings [ticker]` | Upcoming report dates, or one ticker's reported quarters |
| `insiders <ticker>` | Form 4 insider transactions |
| `insights <ticker>` | Generated signals, most urgent first |
| `congress [ticker]` | Congressional stock disclosures |
| `news [ticker]` | Clustered news stories |
| `flows [ticker]` | Institutional 13F flows, or one ticker's holders |
| `options <ticker>` | End-of-day options positioning |
| `screen --filter ...` | Filter the tracked universe on Score, analyst, and price fields |

Run `npx -y sentisense@0.47.1 --help` for the full list, and `help <command>` for flags and
copy-paste examples. The help is the reference: every example in it runs as written.

## Output modes: which one to use

- **Piped (default for agents):** plain text, no color codes, label/value lines. Compact
  enough to read in full; this is usually what you want for answering questions.
- **`--json`:** the exact API response, envelope included, nothing renamed. Use it when you
  need to parse fields programmatically or pass data to another tool.
- **`--full`** widens either mode where a command has more to show.

## Exit codes: branch on them

Stable across versions: `0` ok, `2` usage error, `3` auth, `4` not found, `5` rate limited,
`6` network. Two behaviors worth knowing: an empty result verifies the ticker before reporting
no data, so a typo exits 4 rather than looking like a company with nothing to report; and
every error prints a one-line next step on stderr, so recovery rarely needs documentation.

```bash
npx -y sentisense@0.47.1 insiders "$TICKER" || echo "exit $? tells you which way it failed"
```

## Scripting patterns

```bash
# One call, several tickers
npx -y sentisense@0.47.1 quote NVDA AMD AVGO

# Feed a field into another tool
npx -y sentisense@0.47.1 quote NVDA --json | jq .changePercent

# Screen, then inspect the top hit
npx -y sentisense@0.47.1 screen --filter SENTI_SCORE_7D:GTE:13 --limit 5
```

## Without the CLI

Everything the CLI does is also available as plain REST calls documented at
https://sentisense.ai/skill.md; the CLI is a convenience, not a requirement.

## Use & Disclaimer

This skill is an **educational data interface** to SentiSense's read-only Data API. Output is informational only. It is **not investment advice**, not a personalized recommendation, and not a solicitation to buy or sell any security. The user is responsible for their own decisions. Use of the API and this skill is subject to the [API Terms of Service](https://sentisense.ai/agreement/API-Terms-of-Service.pdf) and [Terms of Service](https://sentisense.ai/agreement/Terms-of-Service.pdf).
