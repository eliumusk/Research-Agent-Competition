'use client';

import { BookOpen, Code, FileText, Lightbulb } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface DocLink {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  category: string;
}

export default function DocsSection() {
  const t = useTranslations('Courses');

  const docLinks: DocLink[] = [
    {
      id: '1',
      title: t('docs.items.gettingStarted.title'),
      description: t('docs.items.gettingStarted.description'),
      icon: <BookOpen className="h-8 w-8" />,
      url: 'https://www.bohrium.com/courses/9912468816?tab=courses',
      category: t('docs.categories.tutorial'),
    },
    {
      id: '2',
      title: t('docs.items.apiReference.title'),
      description: t('docs.items.apiReference.description'),
      icon: <Code className="h-8 w-8" />,
      url: 'https://dptechnology.feishu.cn/wiki/VUArwS8crizjlGk0nsPctKg2ngf',
      category: t('docs.categories.reference'),
    },
    {
      id: '3',
      title: t('docs.items.bestPractices.title'),
      description: t('docs.items.bestPractices.description'),
      icon: <Lightbulb className="h-8 w-8" />,
      url: 'https://www.bohrium.com/courses/5920545182?tab=courses',
      category: t('docs.categories.guide'),
    },
  ];

  return (
    <section className="border-b-4 border-black bg-yellow-50 py-16 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-black text-gray-900 dark:text-white">
            {t('docs.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('docs.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {docLinks.map((doc) => (
            <Link
              key={doc.id}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group overflow-hidden rounded-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none dark:bg-gray-900"
            >
              {/* Category Badge */}
              <div className="mb-4">
                <span className="inline-block rounded-full border-2 border-black bg-yellow-300 px-3 py-1 text-xs font-bold text-gray-900">
                  {doc.category}
                </span>
              </div>

              {/* Icon */}
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg border-4 border-black bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                {doc.icon}
              </div>

              {/* Title */}
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                {doc.title}
              </h3>

              {/* Description */}
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {doc.description}
              </p>

              {/* Arrow */}
              <div className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                <span>{t('docs.readMore')}</span>
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
