
export interface RepoFacts {
  stars: number
  starsLabel: string
  starsLive: boolean
  version: string
  versionTag: string
  versionLive: boolean
}

const STARS_FLOOR = 79000
const VERSION_FALLBACK = 'v0.48.0'

let cached: Promise<RepoFacts> | null = null

async function load(): Promise<RepoFacts> {
  let stars = STARS_FLOOR
  let starsLive = false
  let versionTag = VERSION_FALLBACK
  let versionLive = false

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
      if (data.tag_name) {
        versionTag = data.tag_name.startsWith('v') ? data.tag_name : `v${data.tag_name}`
        versionLive = true
      }
    }
  } catch {}

  if (!starsLive) {
    console.warn(
      `[rtk] GitHub stars unavailable — shipping the ${STARS_FLOOR} floor value. Check the API/token before release.`
    )
  }
  if (!versionLive) {
    console.warn(
      `[rtk] GitHub release unavailable — shipping the ${VERSION_FALLBACK} fallback, which goes stale on every release. ` +
        `Set GITHUB_TOKEN so the build can read the API.`
    )
  }

  return {
    stars,
    starsLabel: stars >= 1000 ? `${(stars / 1000).toFixed(1)}K` : String(stars),
    starsLive,
    version: versionTag.replace(/^v/, ''),
    versionTag,
    versionLive,
  }
}

export function getRepoFacts(): Promise<RepoFacts> {
  cached ??= load()
  return cached
}
