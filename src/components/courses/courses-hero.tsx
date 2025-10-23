'use client';

import { BookOpen, Users, Video } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function CoursesHero() {
  const t = useTranslations('Courses');

  return (
    <section className="relative overflow-hidden border-b-4 border-black bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-black tracking-tight text-gray-900 dark:text-white md:text-6xl">
            {t('hero.title')}
          </h1>
          <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
            {t('hero.subtitle')}
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:bg-gray-800">
              <div className="mb-2 flex justify-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                12+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('hero.stats.courses')}
              </div>
            </div>

            <div className="rounded-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:bg-gray-800">
              <div className="mb-2 flex justify-center">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                500+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('hero.stats.students')}
              </div>
            </div>

            <div className="rounded-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:bg-gray-800">
              <div className="mb-2 flex justify-center">
                <Video className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                24+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('hero.stats.hours')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
