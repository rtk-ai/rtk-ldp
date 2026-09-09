import { T, type Lang } from '../data/translations'

export type { Lang }

export function t(key: string, lang: Lang): string {
  return T[key]?.[lang] ?? T[key]?.en ?? key
}

export const LOCALES: Lang[] = ['en', 'fr', 'es', 'de', 'zh', 'ja']
export const NON_DEFAULT_LOCALES: Lang[] = LOCALES.filter(l => l !== 'en')

/**
 * Which paths actually exist in every locale.
 *
 * Only the homepage, the benchmarks page and the Starlight docs are built per
 * locale (see src/pages/[locale]/ and the Starlight i18n config). /team/,
 * /blog/, /blog/<post>/ and /404 exist in English only.
 *
 * The language switcher used to prefix the current path blindly, so switching
 * language on /blog/ offered /fr/blog/, a 404. Route through localizedPath()
 * instead: a page with no translation sends you to that locale's homepage,
 * which is a real page, rather than to a dead end.
 */
const LOCALIZED_PREFIXES = ['/benchmarks/', '/docs/', '/guide/']

export function stripLocalePrefix(path: string): string {
  return path.replace(new RegExp(`^/(${NON_DEFAULT_LOCALES.join('|')})(?=/|$)`), '') || '/'
}

/** A path that is guaranteed to exist for `lang`. */
export function localizedPath(path: string): string {
  const p = stripLocalePrefix(path)
  if (p === '/' || LOCALIZED_PREFIXES.some(pre => p.startsWith(pre))) return p
  return '/'
}
