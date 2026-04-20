export type RssEntryType =
  | 'release'
  | 'new_page'
  | 'new_doc'
  | 'new_feature'
  | 'performance'

export interface RssEntry {
  type: RssEntryType
  title: string
  date: string         // format "Mar 19, 2026"
  description: string  // 1-3 phrases, pas de HTML
  link: string         // URL absolue
}

export const rssEntries: RssEntry[] = [
  {
    type: 'new_page',
    title: 'Vox — AI Voice Layer for Claude Code',
    date: 'Apr 5, 2026',
    description: 'Vox is a new RTK product that adds voice control to Claude Code. Issue voice commands, hear responses, and stay hands-free during long coding sessions.',
    link: 'https://www.rtk-ai.app/vox/',
  },
  {
    type: 'new_page',
    title: 'ICM — Infinite Context Memory',
    date: 'Apr 5, 2026',
    description: 'ICM is a persistent memory layer for Claude Code. Store decisions, patterns, and project context across sessions with semantic search and automatic decay.',
    link: 'https://www.rtk-ai.app/icm/',
  },
  {
    type: 'new_doc',
    title: 'Docs: Filter Workflow guide',
    date: 'Apr 5, 2026',
    description: 'New documentation page explaining how RTK filters work end-to-end — from raw command output to compressed token-efficient results.',
    link: 'https://www.rtk-ai.app/guide/filter-workflow/',
  },
  {
    type: 'new_doc',
    title: 'Docs: Technical architecture',
    date: 'Apr 5, 2026',
    description: 'Deep dive into RTK internals: proxy architecture, TOML filter format, token measurement methodology, and Rust implementation details.',
    link: 'https://www.rtk-ai.app/guide/technical/',
  },
  {
    type: 'release',
    title: 'RTK v0.34.3 released',
    date: 'Apr 1, 2026',
    description: 'Latest release of RTK with improved filtering for pnpm, cargo, and GitHub CLI commands. See the changelog for the full list of changes.',
    link: 'https://github.com/rtk-ai/rtk/releases/latest',
  },
]
