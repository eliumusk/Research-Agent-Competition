'use client';

import { ExternalLink, GraduationCap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function PartnersCoursesSection() {
  const t = useTranslations('Courses');

  return (
    <section className="bg-gradient-to-br from-purple-50 via-white to-blue-50 py-16 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-black text-gray-900 dark:text-white">
            {t('partners.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('partners.subtitle')}
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <Link
            href="https://www.bohrium.com/courses"
            target="_blank"
            rel="noopener noreferrer"
            className="group block overflow-hidden rounded-lg border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[6px] hover:translate-y-[6px] hover:shadow-none dark:bg-gray-800"
          >
            <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2 md:items-center">
              {/* Left: Icon and Info */}
              <div>
                <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-lg border-4 border-black bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <GraduationCap className="h-10 w-10" />
                </div>

                <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                  {t('partners.bohrium.title')}
                </h3>

                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  {t('partners.bohrium.description')}
                </p>

                <div className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                  <span>{t('partners.bohrium.cta')}</span>
                  <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:translate-y-[-2px]" />
                </div>
              </div>

              {/* Right: Features */}
              <div className="space-y-3">
                <div className="rounded-lg border-2 border-black bg-blue-100 p-4 dark:bg-blue-900/30">
                  <div className="font-bold text-gray-900 dark:text-white">
                    ✨ {t('partners.bohrium.features.comprehensive')}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('partners.bohrium.features.comprehensiveDesc')}
                  </div>
                </div>

                <div className="rounded-lg border-2 border-black bg-purple-100 p-4 dark:bg-purple-900/30">
                  <div className="font-bold text-gray-900 dark:text-white">
                    🎯 {t('partners.bohrium.features.practical')}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('partners.bohrium.features.practicalDesc')}
                  </div>
                </div>

                <div className="rounded-lg border-2 border-black bg-green-100 p-4 dark:bg-green-900/30">
                  <div className="font-bold text-gray-900 dark:text-white">
                    🚀 {t('partners.bohrium.features.free')}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('partners.bohrium.features.freeDesc')}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
