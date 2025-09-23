import { getLocalePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import type { Locale } from 'next-intl';
import { getBaseUrl } from './urls/urls';

type Href = Parameters<typeof getLocalePathname>[0]['href'];

/**
 * Language code mapping to proper hreflang format
 * Following ISO 639-1 for language codes and ISO 3166-1 Alpha 2 for region codes
 *
 * For Chinese:
 * - Use 'zh-CN' if targeting China specifically (geographic targeting)
 * - Use 'zh-Hans' if targeting simplified Chinese readers globally (script-based targeting)
 *
 * Current choice: zh-CN for better geographic targeting to mainland China
 */
const HREFLANG_MAPPING: Record<string, string> = {
  en: 'en', // English (global)
  zh: 'zh-CN', // Chinese (China) - better for geographic targeting
};

/**
 * Get the proper hreflang value for a locale
 */
export function getHreflangValue(locale: Locale): string {
  return HREFLANG_MAPPING[locale] || locale;
}

/**
 * Generate hreflang URLs for all locales for a given path
 * Following Google's best practices:
 * 1. Self-referencing hreflang tag
 * 2. Identical set of hreflang tags across all page versions
 * 3. x-default tag for unmatched languages
 */
export function generateHreflangUrls(href: Href): Record<string, string> {
  const hreflangUrls: Record<string, string> = {};

  // Generate URLs for each supported locale
  routing.locales.forEach((locale) => {
    const pathname = getLocalePathname({ locale, href });
    const fullUrl = getBaseUrl() + pathname;
    const hreflangValue = getHreflangValue(locale);

    hreflangUrls[hreflangValue] = fullUrl;
  });

  // Add x-default pointing to the default locale
  const defaultPathname = getLocalePathname({
    locale: routing.defaultLocale,
    href,
  });
  const defaultUrl = getBaseUrl() + defaultPathname;
  hreflangUrls['x-default'] = defaultUrl;

  return hreflangUrls;
}

/**
 * Get current locale's hreflang value
 */
export function getCurrentHreflang(locale: Locale): string {
  return getHreflangValue(locale);
}

/**
 * Generate alternates object for Next.js metadata
 * https://nextjs.org/docs/app/api-reference/functions/generate-metadata#alternates
 */
export function generateAlternates(href: Href) {
  const hreflangUrls = generateHreflangUrls(href);

  return {
    canonical: hreflangUrls['x-default'],
    languages: Object.fromEntries(
      Object.entries(hreflangUrls).filter(([key]) => key !== 'x-default')
    ),
  };
}
