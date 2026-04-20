import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import tailwind from '@astrojs/tailwind'
import { remarkDocsLinks } from './plugins/remark-docs-links.mjs'
import { readdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function hasContent(tab) {
  const dir = resolve(__dirname, `src/content/docs/${tab}`)
  if (!existsSync(dir)) return false
  return readdirSync(dir).some(f => f.endsWith('.md'))
}

export default defineConfig({
  site: 'https://www.rtk-ai.app',
  trailingSlash: 'always',
  redirects: {
    '/vox.html': '/vox/',
    '/icm.html': '/icm/',
    '/docs': '/guide/',
    // Post-refactor: preserve backlinks after moving pages to resources/
    '/guide/what-rtk-covers/': '/guide/resources/what-rtk-covers/',
    '/guide/troubleshooting/': '/guide/resources/troubleshooting/',
  },
  integrations: [
    starlight({
      title: 'RTK',
      description: 'RTK — Rust Token Killer. Reduce Claude Code token usage by 60-90%.',
      defaultLocale: 'en',
      disable404Route: true,
      head: [
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          content: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            publisher: {
              '@type': 'Organization',
              name: 'RTK AI',
              url: 'https://www.rtk-ai.app',
            },
            isPartOf: {
              '@type': 'WebSite',
              name: 'RTK',
              url: 'https://www.rtk-ai.app',
            },
          }),
        },
      ],
      expressiveCode: {
        themes: ['github-dark'],
      },
      customCss: [
        './src/styles/global.css',
        './src/styles/starlight-overrides.css',
      ],
      components: {
        Header: './src/components/starlight/Header.astro',
        Footer: './src/components/starlight/Footer.astro',
        Head: './src/components/starlight/Head.astro',
      },
      sidebar: [
        {
          label: 'Guide',
          autogenerate: { directory: 'guide' },
        },
        ...(hasContent('reference') ? [{
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        }] : []),
        ...(hasContent('architecture') ? [{
          label: 'Architecture',
          autogenerate: { directory: 'architecture' },
        }] : []),
      ],
    }),
    tailwind({ applyBaseStyles: false }),
  ],
  markdown: {
    remarkPlugins: [remarkDocsLinks],
    shikiConfig: {
      themes: { light: 'github-dark', dark: 'github-dark' },
    },
  },
})
