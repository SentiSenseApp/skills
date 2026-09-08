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
SentiSense CLI. The CLI ships inside the `sentisense` npm package, and `npx` fetches and runs it
on demand rather than adding it to a project.

**That is a download and an execution, not a zero-install trick.** `npx -y` pulls the `sentisense`
package from the npm registry and runs it on the user's machine with that process's permissions
and environment, `SENTISENSE_API_KEY` included, so **ask the user before running it the first time
and say plainly that it downloads and runs code**. Every command below also has a plain HTTPS
equivalent documented in the `sentisense` skill, and REST is the path to prefer when the user did
not ask for a shell command. Commands here pin version 0.52.0 deliberately: pinning prevents version drift, but it does not verify the artifact.
Install via your package manager's normal review process.

## Permissions

- Network: HTTPS to app.sentisense.ai only.
- Credentials: SENTISENSE_API_KEY from the environment.
- Shell: none required.
- Files: none.

## Quickstart

```bash
npx -y sentisense@0.52.0 health --base-url https://app.sentisense.ai
npx -y sentisense@0.52.0 quote --base-url https://app.sentisense.ai NVDA
npx -y sentisense@0.52.0 sentiment --base-url https://app.sentisense.ai TSLA --days 30
npx -y sentisense@0.52.0 mood --base-url https://app.sentisense.ai --json
```

Auth: set `SENTISENSE_API_KEY` in the environment; commands read it directly, without a secret in argv.
In version 0.52.0, saving a key with `auth` accepts it as a positional argument, not an environment-input option.
Prefer the environment path and skip key persistence. An argument-free `auth` inspects the resolved configuration;
it does not save the environment key. `health` confirms reachability, key validity, and latency in one call.

The permission block describes the REST fallback, which needs no shell or file writes.
Explicit CLI use downloads and executes a package and may use the package manager's local cache as disclosed above.
Every data command in this file sets `--base-url https://app.sentisense.ai` explicitly, overriding stored or environment base settings.
Keep that flag when adapting examples; never send the key to another origin.

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
| `analysts <ticker> --coverage` | Who covers the stock: whole-book Buy / Hold / Sell / Unrated counts, then one row per firm with the named analyst and slug |
| `analyst <slug> [--calls]` | One analyst: firms with note windows, coverage book, and with `--calls` the published call history (slug only, from a coverage row) |
| `search <name> [--type company]` | Resolve a company, fund, person or product name to the symbol and slug the other commands take; no match exits 4 |
| `earnings [ticker]` | Upcoming report dates, or one ticker's reported quarters |
| `insiders <ticker>` | Form 4 insider transactions |
| `insights <ticker>` | Generated signals, most urgent first |
| `congress [ticker]` | Congressional stock disclosures |
| `news [ticker]` | Clustered news stories |
| `flows [ticker]` | Institutional 13F flows, or one ticker's holders |
| `options <ticker>` | End-of-day options positioning |
| `screen --filter ...` | Filter the tracked universe on Score, analyst, and price fields |

Run `npx -y sentisense@0.52.0 --help` for the full list, and `help <command>` for flags and
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
npx -y sentisense@0.52.0 insiders --base-url https://app.sentisense.ai "$TICKER" || echo "exit $? tells you which way it failed"
```

## Scripting patterns

```bash
# One call, several tickers
npx -y sentisense@0.52.0 quote --base-url https://app.sentisense.ai NVDA AMD AVGO

# Feed a field into another tool
npx -y sentisense@0.52.0 quote --base-url https://app.sentisense.ai NVDA --json | jq .changePercent

# Screen, then inspect the top hit
npx -y sentisense@0.52.0 screen --base-url https://app.sentisense.ai --filter SENTI_SCORE_7D:GTE:13 --limit 5
```

## Without the CLI

Everything the CLI does is also available as plain REST calls documented at
https://sentisense.ai/skill.md; the CLI is a convenience, not a requirement.

## Use & Disclaimer

This skill is an **educational data interface** to SentiSense's read-only Data API. Output is informational only. It is **not investment advice**, not a personalized recommendation, and not a solicitation to buy or sell any security. The user is responsible for their own decisions. Use of the API and this skill is subject to the [API Terms of Service](https://sentisense.ai/agreement/API-Terms-of-Service.pdf) and [Terms of Service](https://sentisense.ai/agreement/Terms-of-Service.pdf).
