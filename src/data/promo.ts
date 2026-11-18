/**
 * Top banner on the landing page (NavV3, `promo` prop).
 *
 * 'black-friday' shows the 2026 Black Friday offer in place of the RTK Pro bar.
 * Set it back to 'pro' when the offer ends: the RTK Pro bar returns unchanged.
 * The offer copy is in translations.ts, keys v3.bf.*.
 */
export const TOP_BANNER: 'pro' | 'black-friday' = 'black-friday'

/** Shown as a small tag before the offer name. */
export const BLACK_FRIDAY_YEAR = '2026'

/**
 * The discount, shown after the coupon as "−90%" (translations.ts,
 * v3.bf.off). Placeholder until the offer is final.
 * Keep in sync with rtk-cloud-ldp (src/lib/promo.ts).
 */
export const BLACK_FRIDAY_DISCOUNT = 90

/** Where the Black Friday bar links. */
export const BLACK_FRIDAY_HREF = 'https://pro.rtk-ai.app/pricing'
