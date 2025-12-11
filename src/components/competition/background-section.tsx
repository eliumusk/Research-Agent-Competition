import BackgroundFeatureCard from '@/components/competition/background-feature-card';
import { ShineBorder } from '@/components/magicui/shine-border';
import { Card, CardContent } from '@/components/ui/card';
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from '@/components/ui/scroll-reveal';
import { getTranslations } from 'next-intl/server';

export default async function BackgroundSection() {
  const t = await getTranslations('Competition.background');

  const features = [
    {
      icon: 'bot',
      title: t('feature1.title'),
      description: t('feature1.description'),
    },
    {
      icon: 'zap',
      title: t('feature2.title'),
      description: t('feature2.description'),
    },
    {
      icon: 'network',
      title: t('feature3.title'),
      description: t('feature3.description'),
    },
    {
      icon: 'lightbulb',
      title: t('feature4.title'),
      description: t('feature4.description'),
    },
  ] as const;

  return (
    <section id="background" className="px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal direction="up" delay={0.1}>
          <div className="mb-12 text-center">
            <div className="mb-4 inline-block rounded-full border bg-muted px-4 py-1.5 text-sm font-medium">
              {t('badge')}
            </div>
            <h2 className="mb-4 text-balance text-4xl font-semibold tracking-tight lg:text-5xl">
              {t('title')}
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.2}>
          <div className="mb-12 relative">
            <Card className="border-2 relative overflow-hidden">
              <ShineBorder
                className="absolute inset-0"
                borderWidth={2}
                duration={14}
                shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']}
              />
              <CardContent className="p-8 lg:p-12 relative z-10">
                <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
                  <p>{t('paragraph1')}</p>
                  <p>{t('paragraph2')}</p>
                  <p className="text-foreground font-medium">{t('paragraph3')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollReveal>

        <StaggerContainer
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          staggerDelay={0.1}
        >
          {features.map((feature, index) => (
            <StaggerItem key={feature.icon + index}>
              <BackgroundFeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
