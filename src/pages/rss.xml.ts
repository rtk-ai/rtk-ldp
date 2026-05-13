import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'
import { rssEntries, type RssEntry } from '../data/rss-entries'

function parseDate(dateStr: string): Date {
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? new Date() : d
}

const TYPE_LABELS: Record<RssEntry['type'], string> = {
  release: 'Release',
  new_page: 'New Page',
  new_doc: 'New Doc',
  new_feature: 'New Feature',
  performance: 'Performance',
}

export const GET: APIRoute = async (context) => {
  const manualItems = rssEntries.map((entry) => ({
    title: `[${TYPE_LABELS[entry.type]}] ${entry.title}`,
    pubDate: parseDate(entry.date),
    description: `<p>${entry.description}</p>`,
    link: entry.link,
  }))

  const allItems = [...manualItems]
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, 50)

  return rss({
    title: 'RTK — Rust Token Killer',
    description: 'Updates, releases and new features for RTK: reduce Claude Code token usage by 60-90%.',
    site: context.site!,
    items: allItems,
    customData: `<language>en-us</language>`,
  })
}
