'use client';

import { BorderBeam } from '@/components/magicui/border-beam';
import { DotPattern } from '@/components/magicui/dot-pattern';
import { MagicCard } from '@/components/magicui/magic-card';
import { ShineBorder } from '@/components/magicui/shine-border';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { Card, CardContent } from '@/components/ui/card';
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from '@/components/ui/scroll-reveal';
import { cn } from '@/lib/utils';
import type { LeaderboardData } from '@/types/leaderboard';
import { Award, Trophy, UserPlus, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

function Medal({ rank }: { rank: number }) {
  const medals = ['🥇', '🥈', '🥉'];
  return <span className="text-xl mr-2">{medals[rank - 1] ?? rank}</span>;
}

function RewardPill({ amount }: { amount: number }) {
  return (
    <span className="ml-2 inline-flex items-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 text-[11px] font-medium">
      ¥{amount}
    </span>
  );
}

function RankRow({
  primary,
  secondary,
  value,
  reward,
  unit,
  rank,
}: {
  primary: string;
  secondary?: string;
  value: number;
  reward: number;
  unit?: string;
  rank: number;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3 min-w-0">
        <Medal rank={rank} />
        <div className="min-w-0">
          <div className="truncate font-medium">{primary}</div>
          {secondary ? (
            <div className="text-xs text-muted-foreground truncate">
              {secondary}
            </div>
          ) : null}
        </div>
      </div>
      <div className="ml-3 text-sm tabular-nums">
        <span className="font-mono">
          <AnimatedNumber value={value} />
        </span>
        {unit ? (
          <span className="ml-1 text-muted-foreground">{unit}</span>
        ) : null}
        <RewardPill amount={reward} />
      </div>
    </div>
  );
}

export default function LeaderboardClient({ data }: { data: LeaderboardData }) {
  const t = useTranslations('Competition.leaderboard');
  const m = useTranslations('Competition.milestones');

  return (
    <section id="leaderboard" className="relative px-4 pt-10 pb-8">
      {/* Elegant background */}
      <DotPattern
        className={cn(
          'text-neutral-300/60 dark:text-neutral-700/60',
          '[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]'
        )}
        glow
      />

      <div className="mx-auto max-w-7xl relative">
        {/* Header */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="mb-10 text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Trophy className="size-4" />
              <span>{t('badge')}</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('title')}
            </h2>
            {data.weekRange ? (
              <p className="text-sm text-muted-foreground">{data.weekRange}</p>
            ) : null}
          </div>
        </ScrollReveal>

        {/* Weekly Top cards */}
        <StaggerContainer
          className="grid gap-6 md:grid-cols-2"
          staggerDelay={0.08}
        >
          <StaggerItem>
            <ScrollReveal direction="up" delay={0.1}>
              <MagicCard
                className="relative overflow-hidden p-0"
                gradientColor="#00000022"
                gradientSize={400}
              >
                <ShineBorder
                  className="absolute inset-0"
                  borderWidth={2}
                  duration={14}
                />
                <Card className="border-0 shadow-none relative z-10">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <UserPlus className="size-4 text-primary" />
                      <h3 className="font-semibold">
                        {t('subscriptionGrowth.title')}
                      </h3>
                    </div>
                    {!data.subscriptionGrowthAvailable ? (
                      <div className="text-sm text-muted-foreground py-4">
                        {t('subscriptionGrowth.placeholder')}
                      </div>
                    ) : (
                      <div className="divide-y">
                        {data.subscriptionGrowthTop3.map((item) => (
                          <RankRow
                            key={item.appKey}
                            primary={item.teamName || item.appKey}
                            secondary={item.teamName ? item.appKey : undefined}
                            value={item.growth}
                            unit={'+人'}
                            reward={item.reward}
                            rank={item.rank}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </MagicCard>
            </ScrollReveal>
          </StaggerItem>

          <StaggerItem>
            <ScrollReveal direction="up" delay={0.15}>
              <MagicCard
                className="relative overflow-hidden p-0"
                gradientColor="#00000022"
                gradientSize={400}
              >
                <ShineBorder
                  className="absolute inset-0"
                  borderWidth={2}
                  duration={14}
                />
                <Card className="border-0 shadow-none relative z-10">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="size-4 text-primary" />
                      <h3 className="font-semibold">{t('photon.title')}</h3>
                    </div>
                    <div className="divide-y">
                      {data.photonTop3.map((item) => (
                        <RankRow
                          key={item.appKey}
                          primary={item.teamName || item.appKey}
                          secondary={item.teamName ? item.appKey : undefined}
                          value={item.photons}
                          unit={'⚡'}
                          reward={item.reward}
                          rank={item.rank}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </MagicCard>
            </ScrollReveal>
          </StaggerItem>
        </StaggerContainer>

        {/* Milestones */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="size-4 text-primary" />
              <h3 className="font-semibold">{m('title')}</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 items-stretch">
              <div className="relative h-full">
                <BorderBeam size={250} duration={12} />
                <MagicCard
                  className="relative overflow-hidden p-0 h-full"
                  gradientColor="#00000022"
                  gradientSize={300}
                >
                  <ShineBorder
                    className="absolute inset-0"
                    borderWidth={2}
                    duration={14}
                  />
                  <Card className="border-0 shadow-none relative z-10 h-full flex flex-col">
                    <CardContent className="p-5 flex-1">
                      <div className="text-sm font-medium mb-3">
                        {m('subscription500')}
                      </div>
                      {data.milestones.subscription500.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                          {m('empty')}
                        </div>
                      ) : (
                        <div className="grid gap-2">
                          {data.milestones.subscription500.map((x) => (
                            <div
                              key={`s-${x.appKey}`}
                              className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2"
                            >
                              <div className="min-w-0">
                                <div className="truncate font-medium">
                                  {x.teamName || x.appKey}
                                </div>
                                {x.teamName ? (
                                  <div className="text-xs text-muted-foreground truncate">
                                    {x.appKey}
                                  </div>
                                ) : null}
                              </div>
                              <span className="font-mono text-sm tabular-nums">
                                {x.subscriptions}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </MagicCard>
              </div>

              <div className="relative h-full">
                <BorderBeam size={250} duration={12} />
                <MagicCard
                  className="relative overflow-hidden p-0 h-full"
                  gradientColor="#00000022"
                  gradientSize={300}
                >
                  <ShineBorder
                    className="absolute inset-0"
                    borderWidth={2}
                    duration={14}
                  />
                  <Card className="border-0 shadow-none relative z-10 h-full flex flex-col">
                    <CardContent className="p-5 flex-1">
                      <div className="text-sm font-medium mb-3">
                        {m('photon10000')}
                      </div>
                      {data.milestones.photon10000.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                          {m('empty')}
                        </div>
                      ) : (
                        <div className="grid gap-2">
                          {data.milestones.photon10000.map((x) => (
                            <div
                              key={`p-${x.appKey}`}
                              className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2"
                            >
                              <div className="min-w-0">
                                <div className="truncate font-medium">
                                  {x.teamName || x.appKey}
                                </div>
                                {x.teamName ? (
                                  <div className="text-xs text-muted-foreground truncate">
                                    {x.appKey}
                                  </div>
                                ) : null}
                              </div>
                              <span className="font-mono text-sm tabular-nums">
                                {x.photons}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </MagicCard>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
