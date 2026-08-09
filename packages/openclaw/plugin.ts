// Runtime-free plugin entry point.
//
// This bundle ships skills and no runtime behaviour, so `register` is
// deliberately empty: the skills and the setup metadata do all the work. OpenClaw
// still wants an entry point declared (`openclaw.extensions` in package.json), and
// without one ClawHub raises package-openclaw-entry-missing and does not list the
// bundled skills on the plugin page.
//
// Keep this file inert. Anything that actually executes belongs in a skill, not here.
import { definePluginEntry } from 'openclaw/plugin-sdk/plugin-entry'

export default definePluginEntry({
  id: 'stock-analysis',
  name: 'All Market Data, One API Key',
  description: 'SentiSense market-data skills: prices, sentiment, insider and congressional trades, 13F holdings, options, earnings, and SEC filing diffs.',
  register: () => {},
})
