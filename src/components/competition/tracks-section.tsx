'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Atom, BookOpen } from 'lucide-react';

export default function TracksSection() {
  const t = useTranslations('Competition.tracks');

  const tracks = [
    {
      icon: Atom,
      title: t('deep.title'),
      subtitle: t('deep.subtitle'),
      description: t('deep.description'),
      examples: [
        t('deep.example1'),
        t('deep.example2'),
        t('deep.example3'),
        t('deep.example4'),
      ],
      color: 'from-blue-500/10 to-cyan-500/10',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      icon: BookOpen,
      title: t('general.title'),
      subtitle: t('general.subtitle'),
      description: t('general.description'),
      examples: [
        t('general.example1'),
        t('general.example2'),
        t('general.example3'),
        t('general.example4'),
      ],
      color: 'from-purple-500/10 to-pink-500/10',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <section id="tracks" className="px-4 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-block rounded-full border bg-muted px-4 py-1.5 text-sm font-medium">
            {t('badge')}
          </div>
          <h2 className="mb-4 text-balance text-4xl font-semibold tracking-tight lg:text-5xl">
            {t('title')}
          </h2>
          <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground">
            {t('description')}
          </p>
        </div>

        {/* Tracks Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {tracks.map((track, index) => {
            const Icon = track.icon;
            return (
              <Card
                key={index}
                className={cn(
                  'group relative overflow-hidden border-2 transition-all duration-300',
                  'hover:shadow-xl hover:border-primary/50'
                )}
              >
                {/* Gradient Background */}
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-70',
                    track.color
                  )}
                />

                <CardHeader className="relative">
                  <div
                    className={cn(
                      'mb-4 inline-flex size-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110',
                      track.iconBg
                    )}
                  >
                    <Icon className="size-7" />
                  </div>
                  <CardTitle className="text-2xl">{track.title}</CardTitle>
                  <p className="text-sm font-medium text-primary">
                    {track.subtitle}
                  </p>
                </CardHeader>

                <CardContent className="relative space-y-6">
                  <p className="text-muted-foreground">{track.description}</p>

                  <div>
                    <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('examplesLabel')}
                    </div>
                    <div className="space-y-2">
                      {track.examples.map((example, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 rounded-lg bg-background/80 p-3 text-sm backdrop-blur-sm"
                        >
                          <div className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{example}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Note */}
        <div className="mt-8">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t('note')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

