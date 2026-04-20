import { DOCS_SEARCH_ENTRIES } from './docs-search-entries'

export interface SearchEntry {
  id: string
  title: string
  keywords: string
  category: string
  url: string
  source: 'landing' | 'docs'
}

const LANDING_ENTRIES: SearchEntry[] = [
  // Sections
  { id: 'landing-why', title: 'Why RTK?', keywords: 'why tokens problem cost expensive context window overflow cli noise', category: 'Landing', url: '/#problem', source: 'landing' },
  { id: 'landing-demo', title: 'Demo — Before/After', keywords: 'demo before after comparison cargo test pytest git diff go test grep savings slideshow', category: 'Landing', url: '/#demo', source: 'landing' },
  { id: 'landing-tools', title: 'AI Tool Comparison', keywords: 'compare tools claude code cursor codex windsurf gemini aider copilot cline limits credits tokens context', category: 'Landing', url: '/#compare', source: 'landing' },
  { id: 'landing-cloud', title: 'RTK Cloud Waitlist', keywords: 'cloud team analytics waitlist enterprise dashboard token usage savings reports rate limit sso audit', category: 'Landing', url: '/#cloud', source: 'landing' },
  { id: 'landing-install', title: 'Install RTK', keywords: 'install curl brew cargo homebrew setup hook rtk init global transparent zero config', category: 'Landing', url: '/#install', source: 'landing' },
  { id: 'landing-share', title: 'Share Your rtk gain', keywords: 'share gain stats tokens saved twitter x bluesky linkedin social post flex timeline', category: 'Landing', url: '/#share-gain', source: 'landing' },

  // Products
  { id: 'product-vox', title: 'Vox — Voice for Claude Code', keywords: 'vox voice speech whisper dictation audio microphone claude code voice input', category: 'Products', url: '/vox/', source: 'landing' },
  { id: 'product-icm', title: 'ICM — Infinite Context Memory', keywords: 'icm memory context persist cross-session knowledge graph recall topics store forget', category: 'Products', url: '/icm/', source: 'landing' },

  // RTK commands
  { id: 'cmd-cargo', title: 'rtk cargo — Rust builds', keywords: 'cargo test build clippy check nextest rust 90% savings', category: 'Commands', url: '/#install', source: 'landing' },
  { id: 'cmd-git', title: 'rtk git — Git output', keywords: 'git status diff log branch compressed 80% savings', category: 'Commands', url: '/#install', source: 'landing' },
  { id: 'cmd-test', title: 'rtk test — Test proxy', keywords: 'test pytest go test jest vitest playwright generic runner', category: 'Commands', url: '/#install', source: 'landing' },
  { id: 'cmd-gh', title: 'rtk gh — GitHub CLI', keywords: 'gh pr checks run list github workflow actions', category: 'Commands', url: '/#install', source: 'landing' },
  { id: 'cmd-pnpm', title: 'rtk pnpm — Package manager', keywords: 'pnpm npm yarn list outdated packages node', category: 'Commands', url: '/#install', source: 'landing' },
  { id: 'cmd-gain', title: 'rtk gain — Token savings stats', keywords: 'gain stats savings tokens percentage history analytics report per-project', category: 'Commands', url: '/#share-gain', source: 'landing' },
  { id: 'cmd-init', title: 'rtk init — Hook setup', keywords: 'init hook global automatic transparent settings.json patch zero config', category: 'Commands', url: '/#install', source: 'landing' },
  { id: 'cmd-docker', title: 'rtk docker — Container output', keywords: 'docker compose kubectl kubernetes infra container build run', category: 'Commands', url: '/#install', source: 'landing' },
  { id: 'cmd-next', title: 'rtk next / tsc / lint', keywords: 'next nextjs typescript tsc eslint lint prettier build', category: 'Commands', url: '/#install', source: 'landing' },

  // Docs
  { id: 'docs-home', title: 'RTK Documentation', keywords: 'docs documentation guide reference technical features filters', category: 'Docs', url: '/guide/', source: 'docs' },

  // Links
  { id: 'github-repo', title: 'RTK on GitHub', keywords: 'github repo source code open source mit stars fork', category: 'Links', url: 'https://github.com/rtk-ai/rtk', source: 'landing' },
  { id: 'discord', title: 'Discord Community', keywords: 'discord community chat support help questions', category: 'Links', url: 'https://discord.gg/RySmvNF5kF', source: 'landing' },
  { id: 'kofi', title: 'Support RTK (ko-fi)', keywords: 'support donate kofi sponsor coffee', category: 'Links', url: 'https://ko-fi.com/patrickszymkowiak', source: 'landing' },
]

const docsEntries: SearchEntry[] = DOCS_SEARCH_ENTRIES.map(e => ({ ...e, source: 'docs' as const }))

export const SEARCH_INDEX: SearchEntry[] = [...LANDING_ENTRIES, ...docsEntries]
