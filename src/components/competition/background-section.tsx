'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Bot, Lightbulb, Network, Zap } from 'lucide-react';

export default function BackgroundSection() {
  const t = useTranslations('Competition.background');

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
        <div className="mb-12 text-center">
          <div className="mb-4 inline-block rounded-full border bg-muted px-4 py-1.5 text-sm font-medium">
            {t('badge')}
          </div>
          <h2 className="mb-4 text-balance text-4xl font-semibold tracking-tight lg:text-5xl">
            {t('title')}
          </h2>
        </div>

        {/* Main Content */}
        <div className="mb-12">
          <Card className="border-2">
            <CardContent className="p-8 lg:p-12">
              <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
                <p>{t('paragraph1')}</p>
                <p>{t('paragraph2')}</p>
                <p className="text-foreground font-medium">{t('paragraph3')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className={cn(
                  'group relative overflow-hidden transition-all duration-300 hover:shadow-lg',
                  'hover:border-primary/50'
                )}
              >
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

