#!/usr/bin/env node
//
// prepare_data.mjs: fetch everything the payoff template needs, in one command.
//
//   SENTISENSE_API_KEY=... node scripts/prepare_data.mjs NVDA
//   SENTISENSE_API_KEY=... node scripts/prepare_data.mjs NVDA --out payoff_NVDA.html
//
// With no --out it emits one JSON object on stdout, shaped exactly for the template's data
// slot, and the caller binds it. With --out it does the binding too, writing the finished
// self-contained file in one step. Both paths produce the same artifact.
//
// Nothing is priced here. The Black-Scholes math, the skew interpolation and the payoff engine
// all live in the template, written once and reviewed once, so two renders of the same snapshot
// cannot disagree about what a contract is worth.
//
// Zero dependencies on purpose. Plain fetch, Node 18+, no install step, nothing to audit but
// this file.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.SENTISENSE_BASE_URL || "https://app.sentisense.ai";
const KEY = process.env.SENTISENSE_API_KEY;

const SKILL_SLUG = "options-payoff-calculator";
const MAX_IDENTITY = 32;

/**
 * Reduce a volunteered name to a single safe token, matching the official CLI's rule so the
 * same agent identifies the same way whichever path it takes.
 *
 * Order matters. Whitespace collapses to hyphens BEFORE the strip, so "research desk" stays
 * "research-desk" instead of becoming "researchdesk"; the length cap is applied BEFORE the
 * edge trim, so a truncation that lands on a hyphen does not leave one dangling. The strip is
 * a positive allowlist, which is what stops anything user-supplied from reshaping the header:
 * a value carrying a newline, a quote, a semicolon or a parenthesis cannot close the comment
 * or start a second header line, because none of those characters survive.
 */
function sanitizeIdentity(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9._-]/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, MAX_IDENTITY)
    .replace(/^-+|-+$/g, "");
}

// The skill slug leads as a bare token, and a volunteered agent name follows it inside the
// same parenthesized comment, exactly as the CLI composes it. Both are optional to the server
// and nothing is inferred when the name is absent, so with no SENTISENSE_AGENT_NAME set the
// comment carries the slug alone rather than an empty agent token.
const AGENT_NAME = sanitizeIdentity(process.env.SENTISENSE_AGENT_NAME);
const UA = "node/prepare_data (" + SKILL_SLUG + (AGENT_NAME ? "; agent/" + AGENT_NAME : "") + ")";

function die(message, hint) {
  process.stderr.write(`prepare_data: ${message}\n`);
  if (hint) process.stderr.write(`  ${hint}\n`);
  process.exit(1);
}

async function get(path, { allowNullData = false, tolerate400 = false } = {}) {
  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      headers: { "X-SentiSense-API-Key": KEY, Accept: "application/json", "User-Agent": UA },
    });
  } catch (cause) {
    die(`network error calling ${path}`, String(cause && cause.message ? cause.message : cause));
  }

  if (response.status === 401 || response.status === 403) {
    die(
      "the API rejected the key",
      "Check SENTISENSE_API_KEY. A free key comes from https://app.sentisense.ai/get-api-key",
    );
  }
  if (response.status === 429) {
    const wait = response.headers.get("Retry-After");
    die("rate limited", wait ? `Retry after ${wait}s.` : "Wait a minute and retry.");
  }
  // A 400 is sometimes routing advice rather than a failure: the quote endpoints are split by
  // instrument type and the stock one names the ETF path in its error. Hand the body back so the
  // caller can act on it instead of dying on a recoverable answer.
  if (response.status === 400 && tolerate400) {
    let err = {};
    try { err = await response.json(); } catch { /* not JSON, treat as opaque */ }
    return { data: null, isPreview: false, error: err };
  }
  if (!response.ok) {
    die(`${path} answered HTTP ${response.status}`);
  }

  const body = await response.json();
  // The preview envelope wraps some endpoints and not others. Unwrap when it is there, so the
  // rest of this script reads one shape.
  const enveloped = body && typeof body === "object" && "isPreview" in body && "data" in body;
  const data = enveloped ? body.data : body;
  if (!allowNullData && (data === null || data === undefined)) {
    die(`${path} returned no data`);
  }
  return { data, isPreview: enveloped ? body.isPreview === true : false };
}

function num(v) {
  return typeof v === "number" && isFinite(v) ? v : null;
}

const DATA_TOKEN = "/*__SENTISENSE_" + "DATA__*/";
const META_TOKEN = "/*__SENTISENSE_" + "META__*/";

/**
 * Bind a snapshot into the shipped template and return the finished document.
 *
 * The JSON lands inside a <script type="application/json"> block, where the parser ends the
 * block at the first literal `</script`, so `<` is escaped to its JSON unicode form. Nothing in
 * a market-data snapshot carries one today, and relying on that is exactly the assumption that
 * stops being true once a field starts carrying free text.
 */
function bind(template, payload, meta) {
  const json = (v) => JSON.stringify(v, null, 2).replace(/</g, "\\u003c");
  for (const [token, value] of [[DATA_TOKEN, payload], [META_TOKEN, meta]]) {
    const first = template.indexOf(token);
    if (first === -1 || template.indexOf(token, first + 1) !== -1) {
      die(
        `the template does not hold exactly one ${token} slot`,
        "Use the shipped scripts/template.html unmodified.",
      );
    }
    template = template.replace(token, json(value));
  }
  return template;
}

async function main() {
  const args = process.argv.slice(2);
  const outIndex = args.indexOf("--out");
  const outPath = outIndex === -1 ? null : args[outIndex + 1];
  if (outIndex !== -1 && !outPath) {
    die("--out needs a file path", "Usage: node scripts/prepare_data.mjs NVDA --out payoff.html");
  }
  // Drop the flag and its value before reading the ticker, but only when the flag is actually
  // present: with outIndex at -1, `outIndex + 1` is 0 and a naive filter would discard the
  // ticker itself on every run that does not pass --out.
  const rest = outIndex === -1 ? args : args.filter((a, i) => i !== outIndex && i !== outIndex + 1);
  const ticker = (rest[0] || "").trim().toUpperCase();
  if (!ticker) {
    die("no ticker given", "Usage: node scripts/prepare_data.mjs NVDA [--out payoff.html]");
  }
  if (!/^[A-Z][A-Z0-9.\-]{0,9}$/.test(ticker)) {
    die(`"${ticker}" does not look like a ticker`, "Use a symbol such as NVDA, SPY or BRK.B");
  }
  if (!KEY) {
    die(
      "SENTISENSE_API_KEY is not set",
      "Get a free key at https://app.sentisense.ai/get-api-key, then export SENTISENSE_API_KEY",
    );
  }

  // The options dossier is the one call that can legitimately answer "no coverage", and it is
  // also the only source of the implied volatility every premium on the diagram rests on. Check
  // it first so an uncovered ticker fails in one call instead of three.
  const options = await get(`/api/v1/stocks/${encodeURIComponent(ticker)}/options/summary`, {
    allowNullData: true,
  });
  if (!options.data) {
    die(
      `${ticker} has no options coverage`,
      "Coverage is the most actively optioned US names plus the tracked ETFs. Try a larger name.",
    );
  }
  const latest = options.data.latest || {};
  const context = options.data.context || {};
  if (typeof latest.atmIv !== "number") {
    die(
      `${ticker} has no at-the-money implied volatility in its latest session`,
      "Without it there is nothing to price a contract from. Usually a still-building baseline.",
    );
  }

  // Quotes are split by instrument type. The stock endpoint answers 400 `ticker_is_etf` for a
  // fund and names the ETF path in the message, so an ETF is one redirect away rather than a
  // failure: both return the same `currentPrice`, and options coverage includes the tracked ETFs.
  let quote = await get(`/api/v1/stocks/${encodeURIComponent(ticker)}/quote`, { tolerate400: true });
  if (!quote.data) {
    if (quote.error && quote.error.error === "ticker_is_etf") {
      quote = await get(`/api/v1/etfs/${encodeURIComponent(ticker)}/quote`);
    } else {
      die(
        `${ticker} has no quote`,
        quote.error && quote.error.message ? String(quote.error.message) : undefined,
      );
    }
  }
  const spot = quote.data.currentPrice;
  if (typeof spot !== "number" || !(spot > 0)) {
    die(`${ticker} has no usable current price`);
  }

  // The calendar is context, not load-bearing: an unscheduled next report should soften the
  // artifact (no event marker, no "the tenor you picked spans a report" warning), never fail it.
  let nextEarnings = null;
  try {
    const cal = (await get(`/api/v1/calendar/earnings?ticker=${encodeURIComponent(ticker)}`)).data;
    const event = cal && Array.isArray(cal.earnings) ? cal.earnings[0] : null;
    if (event && event.earningsDate) {
      nextEarnings = {
        date: event.earningsDate,
        // `earningsTime` is always one of before_open, after_close, during_market or unknown.
        // "unknown" is a real reading (timing not published, or a weekend release that has no
        // session to sit against), so it is passed through rather than smoothed to null.
        timing: event.earningsTime || "unknown",
        confirmed: event.confirmed === true,
        estimatedEps: num(event.estimatedEps),
      };
    }
  } catch {
    nextEarnings = null;
  }

  const payload = {
    ticker,
    asOf: options.data.asOf || null,
    generatedAt: new Date().toISOString(),
    spot,
    // Every IV here is annualized and expressed as a fraction, so 0.4051 is 40.51%. The template
    // prices each strike off the tenor's at-the-money level, bent toward the 25 delta legs.
    iv: {
      atm30: latest.atmIv,
      atm60: num(latest.atmIv60),
      atm90: num(latest.atmIv90),
      // The 25-delta legs are what give the surface a shape. skew25d == iv25p - iv25c, so a
      // positive skew means puts carry richer volatility than calls and downside strikes price
      // above upside ones at the same distance from spot.
      call25: num(latest.iv25c),
      put25: num(latest.iv25p),
      skew25d: num(latest.skew25d),
      rank1y: num(context.ivRank1y),
    },
    nextEarnings,
    isPreview: options.isPreview,
  };

  if (!outPath) {
    process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
    return;
  }

  const templatePath = resolve(dirname(fileURLToPath(import.meta.url)), "template.html");
  let template;
  try {
    template = readFileSync(templatePath, "utf8");
  } catch {
    die(`could not read the template at ${templatePath}`, "It ships beside this script.");
  }
  const meta = {
    title: `Options payoff: ${ticker}`,
    subtitle:
      "Profit and loss at expiry, priced from end of day implied volatility rather than " +
      "quoted from a live options chain.",
  };
  try {
    writeFileSync(outPath, bind(template, payload, meta));
  } catch (cause) {
    die(`could not write ${outPath}`, String(cause && cause.message ? cause.message : cause));
  }
  process.stdout.write(outPath + "\n");
}

main();
