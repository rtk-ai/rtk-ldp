import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'
import data from '../../data/pipelines.json'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export const GET: APIRoute = (context) => {
  const items = (data.pipelines as any[])
    .filter((p) => p.approvedAt && !isNaN(Date.parse(p.approvedAt)))
    .sort((a, b) => Date.parse(b.approvedAt) - Date.parse(a.approvedAt))
    .slice(0, 50)
    .map((p) => ({
      title: `${p.name} by ${p.owner} (${p.tier})`,
      pubDate: new Date(p.approvedAt),
      description: `<p>Reviewed RTK pipeline at commit ${esc(p.sha7)}.</p><p><code>${esc(p.install)}</code></p>`,
      link: new URL(`/pipelines/${p.owner}/${p.repo}/`, context.site).href,
    }))

  return rss({
    title: 'RTK Pipelines — newly reviewed',
    description: 'Community RTK pipelines reviewed by RTK maintainers, pinned to the reviewed commit.',
    site: context.site!,
    items,
    customData: '<language>en-us</language>',
  })
}
