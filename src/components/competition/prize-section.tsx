'use client';

import { BorderBeam } from '@/components/magicui/border-beam';
import { DotPattern } from '@/components/magicui/dot-pattern';
import { MagicCard } from '@/components/magicui/magic-card';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from '@/components/ui/scroll-reveal';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

interface PrizeCardProps {
  track: string;
  prizes: {
    rank: string;
    amount: string;
    count?: string;
  }[];
  className?: string;
}

function PrizeCard({ track, prizes, className }: PrizeCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardHeader className="border-b">
        <CardTitle className="text-center text-xl">{track}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {prizes.map((prize, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{prize.rank}</span>
                <span className="text-sm text-muted-foreground">
                  {prize.count}
                </span>
              </div>
              <span className="font-mono text-lg font-semibold">
                {prize.amount}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PrizeSection() {
  const t = useTranslations('Competition.prizes');
  const { theme } = useTheme();

  const deepTrackPrizes = [
    { rank: '🥇', amount: '¥100,000', count: t('gold') },
    { rank: '🥈', amount: '¥30,000', count: t('silver') },
    { rank: '🥉', amount: '¥5,000', count: t('bronze') },
  ];

  const generalTrackPrizes = [
    { rank: '🥇', amount: '¥100,000', count: t('gold') },
    { rank: '🥈', amount: '¥30,000', count: t('silver') },
    { rank: '🥉', amount: '¥5,000', count: t('bronze') },
  ];

  return (
    <section id="prizes" className="relative px-4 py-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <DotPattern
          className={cn(
            'opacity-20',
            '[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]'
          )}
        />
      </div>

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
            <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground">
              {t('description')}
            </p>
          </div>
        </ScrollReveal>

        {/* Total Prize Pool */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="mb-12 relative">
            <Card className="group border-2 bg-gradient-to-br from-primary/5 via-background to-background transition-all hover:shadow-xl hover:scale-[1.02] relative overflow-hidden">
              <BorderBeam size={300} duration={15} delay={0} />
              <CardContent className="py-8 text-center relative z-10">
                <div className="mb-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {t('totalPool')}
                </div>
                <div className="font-mono text-5xl font-bold tracking-tight lg:text-6xl">
                  ¥<AnimatedNumber value={1000000} duration={3} />
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollReveal>

        {/* Prize Tracks */}
        <StaggerContainer
          className="grid gap-6 lg:grid-cols-2"
          staggerDelay={0.15}
        >
          <StaggerItem>
            <PrizeCard track={t('deepTrack')} prizes={deepTrackPrizes} />
          </StaggerItem>
          <StaggerItem>
            <PrizeCard track={t('generalTrack')} prizes={generalTrackPrizes} />
          </StaggerItem>
        </StaggerContainer>

        {/* Additional Prizes */}
        <StaggerContainer
          className="mt-6 grid gap-6 md:grid-cols-2"
          staggerDelay={0.1}
        >
          <StaggerItem>
            <MagicCard
              className="py-6 px-6"
              gradientColor={theme === 'dark' ? '#262626' : '#D9D9D955'}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="mb-1 font-semibold">{t('excellence')}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('excellenceDesc')}
                  </div>
                </div>
                <div className="font-mono text-2xl font-semibold">¥40,000</div>
              </div>
            </MagicCard>
          </StaggerItem>

          <StaggerItem>
            <MagicCard
              className="py-6 px-6"
              gradientColor={theme === 'dark' ? '#262626' : '#D9D9D955'}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="mb-1 font-semibold">{t('iteration')}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('iterationDesc')}
                  </div>
                </div>
                <div className="font-mono text-2xl font-semibold">¥200,000</div>
              </div>
            </MagicCard>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}
