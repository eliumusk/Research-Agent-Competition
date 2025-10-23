'use client';

import { MagicCard } from '@/components/magicui/magic-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from '@/components/ui/scroll-reveal';
import { cn } from '@/lib/utils';
import { Atom, BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

export default function TracksSection() {
  const t = useTranslations('Competition.tracks');
  const { theme } = useTheme();

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
    <section id="tracks" className="px-4 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="mb-16 text-center">
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
        </ScrollReveal>

        {/* Tracks Grid - Redesigned */}
        <StaggerContainer
          className="grid gap-8 lg:grid-cols-2"
          staggerDelay={0.2}
        >
          {tracks.map((track, index) => {
            const Icon = track.icon;
            return (
              <StaggerItem key={index}>
                <MagicCard
                  className="group relative overflow-hidden border transition-all duration-500 hover:border-primary/50 p-0 h-full"
                  gradientColor={theme === 'dark' ? '#262626' : '#D9D9D955'}
                  gradientSize={500}
                >
                  {/* Gradient Background - More Subtle */}
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-br opacity-30 transition-opacity duration-500 group-hover:opacity-50',
                      track.color
                    )}
                  />

                  {/* Icon - Positioned at Top Right Corner */}
                  <div className="absolute -right-6 -top-6 size-32 opacity-10 transition-all duration-500 group-hover:scale-110 group-hover:opacity-20">
                    <Icon className="size-full" strokeWidth={1} />
                  </div>

                  <div className="relative p-8 lg:p-10">
                    {/* Icon Badge - Smaller and Contained */}
                    <div
                      className={cn(
                        'mb-6 inline-flex size-16 items-center justify-center rounded-2xl shadow-lg transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl',
                        track.iconBg
                      )}
                    >
                      <Icon className="size-8" strokeWidth={2} />
                    </div>

                    {/* Title and Subtitle */}
                    <div className="mb-6 space-y-2">
                      <h3 className="text-3xl font-bold tracking-tight">
                        {track.title}
                      </h3>
                      <p className="text-base font-semibold text-primary">
                        {track.subtitle}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="mb-8 text-base leading-relaxed text-muted-foreground">
                      {track.description}
                    </p>

                    {/* Examples - More Elegant Design */}
                    <div>
                      <div className="mb-4 flex items-center gap-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          {t('examplesLabel')}
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-l from-primary/50 to-transparent" />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {track.examples.map((example, i) => (
                          <div
                            key={i}
                            className="group/item flex items-start gap-3 rounded-xl bg-background/60 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-background/80 hover:shadow-md"
                          >
                            <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary ring-4 ring-primary/20 transition-all duration-300 group-hover/item:scale-150" />
                            <span className="text-sm leading-relaxed">
                              {example}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </MagicCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
