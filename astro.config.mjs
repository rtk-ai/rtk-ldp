import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import starlight from '@astrojs/starlight'
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
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'es', 'de', 'zh', 'ja'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  redirects: {
    // RTK Cloud waitlist page → RTK Pro site
    '/cloud/': 'https://pro.rtk-ai.app',
    // Backcompat: old /guide/ URLs → new /docs/
    '/guide/': '/docs/',
    '/guide/what-rtk-covers/': '/docs/resources/what-rtk-covers/',
    '/guide/troubleshooting/': '/docs/resources/troubleshooting/',
    '/guide/getting-started/installation/': '/docs/getting-started/installation/',
    '/guide/getting-started/quick-start/': '/docs/getting-started/quick-start/',
    '/guide/analytics/gain/': '/docs/analytics/gain/',
    '/guide/analytics/discover/': '/docs/analytics/discover/',
    '/guide/filter-workflow/': '/docs/filter-workflow/',
    '/guide/technical/': '/docs/technical/',
    '/guide/resources/what-rtk-covers/': '/docs/resources/what-rtk-covers/',
    '/guide/resources/troubleshooting/': '/docs/resources/troubleshooting/',
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
          fr: 'fr-FR',
          es: 'es-ES',
          de: 'de-DE',
          zh: 'zh-CN',
          ja: 'ja-JP',
        },
      },
    }),
    starlight({
      title: 'RTK',
      description: 'RTK — Rust Token Killer. Reduce Claude Code token usage by 60-90%.',
      defaultLocale: 'en',
      disable404Route: true,
      favicon: '/brand/favicon/favicon-32.png',
      head: [
        {
          tag: 'link',
          attrs: { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/brand/favicon/favicon-16.png' },
        },
        {
          tag: 'link',
          attrs: { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/brand/favicon/favicon-192.png' },
        },
        {
          tag: 'link',
          attrs: { rel: 'apple-touch-icon', sizes: '180x180', href: '/brand/favicon/apple-touch-icon.png' },
        },
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          content: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            name: 'RTK Documentation',
            datePublished: '2025-01-01',
            author: {
              '@type': 'Organization',
              name: 'RTK AI',
              url: 'https://www.rtk-ai.app',
            },
            publisher: {
              '@type': 'Organization',
              name: 'RTK AI',
              url: 'https://www.rtk-ai.app',
              logo: { '@type': 'ImageObject', url: 'https://www.rtk-ai.app/brand/logo.png' },
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
          autogenerate: { directory: 'docs' },
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
  ],
  markdown: {
    remarkPlugins: [remarkDocsLinks],
    shikiConfig: {
      themes: { light: 'github-dark', dark: 'github-dark' },
    },
  },
})
