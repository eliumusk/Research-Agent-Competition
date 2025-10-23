'use client';

import { MagicCard } from '@/components/magicui/magic-card';
import { ShineBorder } from '@/components/magicui/shine-border';
import { Card, CardContent } from '@/components/ui/card';
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from '@/components/ui/scroll-reveal';
import { cn } from '@/lib/utils';
import { Bot, Lightbulb, Network, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

export default function BackgroundSection() {
  const t = useTranslations('Competition.background');
  const { theme } = useTheme();

  const features = [
    {
      icon: Bot,
      title: t('feature1.title'),
      description: t('feature1.description'),
    },
    {
      icon: Zap,
      title: t('feature2.title'),
      description: t('feature2.description'),
    },
    {
      icon: Network,
      title: t('feature3.title'),
      description: t('feature3.description'),
    },
    {
      icon: Lightbulb,
      title: t('feature4.title'),
      description: t('feature4.description'),
    },
  ];

  return (
    <section id="background" className="px-4 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
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

        {/* Main Content */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="mb-12 relative">
            <Card className="border-2 relative overflow-hidden">
              <ShineBorder
                className="absolute inset-0"
                borderWidth={2}
                duration={14}
                shineColor={
                  theme === 'dark'
                    ? ['#A07CFE', '#FE8FB5', '#FFBE7B']
                    : ['#8B5CF6', '#EC4899', '#F59E0B']
                }
              />
              <CardContent className="p-8 lg:p-12 relative z-10">
                <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
                  <p>{t('paragraph1')}</p>
                  <p>{t('paragraph2')}</p>
                  <p className="text-foreground font-medium">
                    {t('paragraph3')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollReveal>

        {/* Features Grid */}
        <StaggerContainer
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          staggerDelay={0.1}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <StaggerItem key={index}>
                <MagicCard
                  className="group relative overflow-hidden transition-all duration-300 p-6"
                  gradientColor={theme === 'dark' ? '#262626' : '#D9D9D955'}
                  gradientSize={300}
                >
                  <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </MagicCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
