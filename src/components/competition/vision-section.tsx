'use client';

import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';

export default function VisionSection() {
  const t = useTranslations('Competition.vision');

  return (
    <section id="vision" className="relative overflow-hidden px-4 py-24">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
      
      {/* Decorative elements */}
      <div className="absolute left-0 top-0 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 right-0 size-64 translate-x-1/2 translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="mb-6 inline-block rounded-full border bg-background px-4 py-1.5 text-sm font-medium shadow-sm">
          {t('badge')}
        </div>

        {/* Main quote */}
        <blockquote className="mb-8 space-y-6">
          <p className="text-balance text-3xl font-semibold leading-tight tracking-tight lg:text-5xl">
            {t('quote')}
          </p>
          <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground lg:text-xl">
            {t('description')}
          </p>
        </blockquote>

        {/* Key points */}
        <div className="mb-12 grid gap-4 text-left sm:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-2 text-sm font-medium uppercase tracking-wider text-primary">
              {t('point1.label')}
            </div>
            <p className="text-sm text-muted-foreground">
              {t('point1.description')}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-2 text-sm font-medium uppercase tracking-wider text-primary">
              {t('point2.label')}
            </div>
            <p className="text-sm text-muted-foreground">
              {t('point2.description')}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="group rounded-xl px-8">
            <LocaleLink
              href="https://www.bohrium.com/competitions/8831838064?tab=introduce"
              target="_blank"
            >
              {t('cta')}
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </LocaleLink>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-xl px-8">
            <LocaleLink href="#prizes">
              {t('learnMore')}
            </LocaleLink>
          </Button>
        </div>
      </div>
    </section>
  );
}

