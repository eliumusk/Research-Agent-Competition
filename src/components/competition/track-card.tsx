'use client';

import { MagicCard } from '@/components/magicui/magic-card';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { Atom, BookOpen } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ComponentType } from 'react';

const iconMap: Record<string, ComponentType<{ className?: string; strokeWidth?: number }>> = {
  atom: Atom,
  book: BookOpen,
};

interface TrackCardProps {
  icon: keyof typeof iconMap;
  title: string;
  subtitle: string;
  description: string;
  examples: string[];
  colorClass: string;
  iconBg: string;
  examplesLabel: string;
}

export default function TrackCard({
  icon,
  title,
  subtitle,
  description,
  examples,
  colorClass,
  iconBg,
  examplesLabel,
}: TrackCardProps) {
  const { theme } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const Icon = iconMap[icon] ?? Atom;
  const gradientColor = theme === 'dark' ? '#262626' : '#D9D9D955';

  if (prefersReducedMotion) {
    return (
      <div className="relative overflow-hidden border rounded-3xl p-8 lg:p-10">
        <div className={cn('mb-6 inline-flex size-16 items-center justify-center rounded-2xl shadow-lg', iconBg)}>
          <Icon className="size-8" strokeWidth={2} />
        </div>
        <div className="mb-6 space-y-2">
          <h3 className="text-3xl font-bold tracking-tight">{title}</h3>
          <p className="text-base font-semibold text-primary">{subtitle}</p>
        </div>
        <p className="mb-8 text-base leading-relaxed text-muted-foreground">{description}</p>
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {examplesLabel}
          </span>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {examples.map((example, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-background/60 p-4">
                <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span className="text-sm leading-relaxed">{example}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <MagicCard
      className="group relative overflow-hidden border transition-all duration-500 hover:border-primary/50 p-0 h-full"
      gradientColor={gradientColor}
      gradientSize={500}
    >
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-30 transition-opacity duration-500 group-hover:opacity-50',
          colorClass
        )}
      />
      <div className="absolute -right-6 -top-6 size-32 opacity-10 transition-all duration-500 group-hover:scale-110 group-hover:opacity-20">
        <Icon className="size-full" strokeWidth={1} />
      </div>
      <div className="relative p-8 lg:p-10">
        <div
          className={cn(
            'mb-6 inline-flex size-16 items-center justify-center rounded-2xl shadow-lg transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl',
            iconBg
          )}
        >
          <Icon className="size-8" strokeWidth={2} />
        </div>
        <div className="mb-6 space-y-2">
          <h3 className="text-3xl font-bold tracking-tight">{title}</h3>
          <p className="text-base font-semibold text-primary">{subtitle}</p>
        </div>
        <p className="mb-8 text-base leading-relaxed text-muted-foreground">{description}</p>
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {examplesLabel}
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-primary/50 to-transparent" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {examples.map((example, i) => (
              <div
                key={i}
                className="group/item flex items-start gap-3 rounded-xl bg-background/60 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-background/80 hover:shadow-md"
              >
                <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary ring-4 ring-primary/20 transition-all duration-300 group-hover/item:scale-150" />
                <span className="text-sm leading-relaxed">{example}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MagicCard>
  );
}
