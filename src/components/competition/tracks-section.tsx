import TrackCard from '@/components/competition/track-card';
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from '@/components/ui/scroll-reveal';
import { getTranslations } from 'next-intl/server';

export default async function TracksSection() {
  const t = await getTranslations('Competition.tracks');

  const tracks = [
    {
      icon: 'atom',
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
      icon: 'book',
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

        <StaggerContainer
          className="grid gap-8 lg:grid-cols-2"
          staggerDelay={0.2}
        >
          {tracks.map((track, index) => (
            <StaggerItem key={`${track.icon}-${index}`}>
              <TrackCard
                icon={track.icon as 'atom' | 'book'}
                title={track.title}
                subtitle={track.subtitle}
                description={track.description}
                examples={track.examples}
                colorClass={track.color}
                iconBg={track.iconBg}
                examplesLabel={t('examplesLabel')}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
