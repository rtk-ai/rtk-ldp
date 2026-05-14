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
    title: 'RTK Cloud waitlist page is live',
    date: 'May 9, 2026',
    description: 'The RTK Cloud page is now live with a waitlist signup and a share-your-savings section. Cloud features will bring team dashboards and org-wide hook deployment.',
    link: 'https://www.rtk-ai.app/cloud/',
  },
  {
    type: 'new_page',
    title: 'RTK vs AI coding tools: comparison page',
    date: 'May 9, 2026',
    description: 'New comparison page showing RTK token savings across Claude Code, Cursor, Gemini CLI, Copilot, Aider, and other AI assistants. RTK compresses CLI output at the proxy layer, so any tool benefits.',
    link: 'https://www.rtk-ai.app/vs/',
  },
  {
    type: 'new_page',
    title: 'RTK token savings data: dedicated page',
    date: 'May 9, 2026',
    description: 'Proof page with measured savings across 2,900+ real commands. cargo test at 91.8%, git status at 80.8%, grep at 49.5%. One developer tracked 138 million tokens saved over several weeks.',
    link: 'https://www.rtk-ai.app/savings/',
  },
  {
    type: 'new_doc',
    title: 'Docs: Filter Workflow guide',
    date: 'Apr 5, 2026',
    description: 'New documentation page explaining how RTK filters work end-to-end, from raw command output to compressed token-efficient results.',
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
