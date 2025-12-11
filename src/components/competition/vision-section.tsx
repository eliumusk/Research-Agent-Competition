import VisionCTA from '@/components/competition/vision-cta';
import { getTranslations } from 'next-intl/server';

export default async function VisionSection() {
  const t = await getTranslations('Competition.vision');

  return (
    <section id="vision" className="relative overflow-hidden px-4 py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
      <div className="absolute left-0 top-0 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 right-0 size-64 translate-x-1/2 translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-block rounded-full border bg-background px-4 py-1.5 text-sm font-medium shadow-sm">
          {t('badge')}
        </div>

        <blockquote className="mb-8 space-y-6">
          <p className="text-balance text-3xl font-semibold leading-tight tracking-tight lg:text-5xl">
            {t('quote')}
          </p>
          <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground lg:text-xl">
            {t('description')}
          </p>
        </blockquote>

        <div className="mb-12 grid gap-4 text-left sm:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-2 text-sm font-medium uppercase tracking-wider text-primary">
              {t('point1.label')}
            </div>
            <p className="text-sm text-muted-foreground">{t('point1.description')}</p>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-2 text-sm font-medium uppercase tracking-wider text-primary">
              {t('point2.label')}
            </div>
            <p className="text-sm text-muted-foreground">{t('point2.description')}</p>
          </div>
        </div>

        <VisionCTA primaryLabel={t('cta')} secondaryLabel={t('learnMore')} />
      </div>
    </section>
  );
}
