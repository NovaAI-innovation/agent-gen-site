/**
 * Single source of truth for site-wide switches.
 *
 * githubOrg: the GitHub org that will host agent-gen repos. It is `null` on day 1,
 * and while it is null NO repo/GitHub link renders anywhere. When Casey creates the
 * agents-specific org, set this to its slug (e.g. 'my-org') AND enable
 * siteSettings.github.linksEnabled + orgUrl in Sanity.
 */
export const site = {
  githubOrg: null as string | null,
  /** Canonical production origin (apex). Canonicals, sitemap and JSON-LD always use this. */
  productionUrl: 'https://agent-gen.ca',
  previewUrl: 'https://preview.agent-gen.ca',
  /** Default <html lang> if Sanity has none. */
  locale: 'en-CA',
  /** Seed for the hero agent graph (prerendered SVG and animation share it). */
  graphSeed: 20261111,
  /** Default share card (Design Lead R13). Canonicals and og:image use productionUrl. */
  og: {
    path: '/og-default.png',
    width: 1200,
    height: 630,
    type: 'image/png',
    alt: 'agent-gen wordmark beside a network of teal and amber nodes, some still open, with the line: An open hub for AI agents, growing as it goes.',
  },
  sanity: {
    projectId: 'jqsksqmz',
    dataset: 'production',
    apiVersion: '2025-02-19',
  },
} as const

export type SiteEnv = 'preview' | 'production'
