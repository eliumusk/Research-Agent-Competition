import PrizeHighlightCard from '@/components/competition/prize-highlight-card';
import PrizeTotalCard from '@/components/competition/prize-total-card';
import { DotPattern } from '@/components/magicui/dot-pattern';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from '@/components/ui/scroll-reveal';
import { cn } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';

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

export default async function PrizeSection() {
  const t = await getTranslations('Competition.prizes');

  const deepTrackPrizes = [
    { rank: '🥇', amount: '¥100,000', count: t('gold') },
    { rank: '🥈', amount: '¥50,000', count: t('silver') },
    { rank: '🥉', amount: '¥20,000', count: t('bronze') },
  ];

  const generalTrackPrizes = [
    { rank: '🥇', amount: '¥100,000', count: t('gold') },
    { rank: '🥈', amount: '¥50,000', count: t('silver') },
    { rank: '🥉', amount: '¥20,000', count: t('bronze') },
  ];

  return (
    <section id="prizes" className="relative px-4 py-16">
      <div className="absolute inset-0 -z-10">
        <DotPattern
          className={cn(
            'opacity-20',
            '[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]'
          )}
        />
      </div>

      <div className="mx-auto max-w-7xl">
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

        <ScrollReveal direction="up" delay={0.2}>
          <div className="mb-12 relative">
            <PrizeTotalCard label={t('totalPool')} amount={1000000} />
          </div>
        </ScrollReveal>

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

        <StaggerContainer
          className="mt-6 grid gap-6 md:grid-cols-2"
          staggerDelay={0.1}
        >
          <StaggerItem>
            <PrizeHighlightCard
              label={t('excellence')}
              description={t('excellenceDesc')}
              amount="¥80,000"
            />
          </StaggerItem>
          <StaggerItem>
            <PrizeHighlightCard
              label={t('iteration')}
              description={t('iterationDesc')}
              amount="¥200,000"
            />
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}
