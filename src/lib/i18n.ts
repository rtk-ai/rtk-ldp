import { T, type Lang } from '../data/translations'

export type { Lang }

export function t(key: string, lang: Lang): string {
  return T[key]?.[lang] ?? T[key]?.en ?? key
}

export const LOCALES: Lang[] = ['en', 'fr', 'es', 'de', 'zh', 'ja']
export const NON_DEFAULT_LOCALES: Lang[] = LOCALES.filter(l => l !== 'en')
