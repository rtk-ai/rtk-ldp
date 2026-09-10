import { T, type Lang } from '../data/translations'

export type { Lang }

export function t(key: string, lang: Lang): string {
  return T[key]?.[lang] ?? T[key]?.en ?? key
}

export const LOCALES: Lang[] = ['en', 'fr', 'es', 'de', 'zh', 'ja']
export const NON_DEFAULT_LOCALES: Lang[] = LOCALES.filter(l => l !== 'en')

const LOCALIZED_PREFIXES = ['/benchmarks/', '/docs/', '/guide/']

export function stripLocalePrefix(path: string): string {
  return path.replace(new RegExp(`^/(${NON_DEFAULT_LOCALES.join('|')})(?=/|$)`), '') || '/'
}

export function localizedPath(path: string): string {
  const p = stripLocalePrefix(path)
  if (p === '/' || LOCALIZED_PREFIXES.some(pre => p.startsWith(pre))) return p
  return '/'
}
