
export interface RepoFacts {
  stars: number
  starsLabel: string
  starsLive: boolean
  version: string
  versionTag: string
}

const STARS_FLOOR = 79000
const VERSION_FALLBACK = 'v0.37.1'

let cached: Promise<RepoFacts> | null = null

async function load(): Promise<RepoFacts> {
  let stars = STARS_FLOOR
  let starsLive = false
  let versionTag = VERSION_FALLBACK

  try {
    const headers: Record<string, string> = { 'User-Agent': 'rtk-landing' }
    const token = process.env.GITHUB_TOKEN
    if (token) headers['Authorization'] = `Bearer ${token}`

    const [repo, rel] = await Promise.all([
      fetch('https://api.github.com/repos/rtk-ai/rtk', { headers }),
      fetch('https://api.github.com/repos/rtk-ai/rtk/releases/latest', { headers }),
    ])
    if (repo.ok) {
      const data = await repo.json()
      if (data.stargazers_count) {
        stars = data.stargazers_count
        starsLive = true
      }
    }
    if (rel.ok) {
      const data = await rel.json()
      if (data.tag_name) versionTag = data.tag_name.startsWith('v') ? data.tag_name : `v${data.tag_name}`
    }
  } catch {}

  if (!starsLive) {
    console.warn(
      `[rtk] GitHub stars unavailable — shipping the ${STARS_FLOOR} floor value. Check the API/token before release.`
    )
  }

  return {
    stars,
    starsLabel: stars >= 1000 ? `${(stars / 1000).toFixed(1)}K` : String(stars),
    starsLive,
    version: versionTag.replace(/^v/, ''),
    versionTag,
  }
}

export function getRepoFacts(): Promise<RepoFacts> {
  cached ??= load()
  return cached
}
