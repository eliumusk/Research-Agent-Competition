import { MagicCard } from '@/components/magicui/magic-card';
import { ShineBorder } from '@/components/magicui/shine-border';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { getLeaderboardData } from '@/lib/leaderboard';
import type { LeaderboardData } from '@/types/leaderboard';
import { Award, Trophy, UserPlus, Zap } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import LeaderboardClient from './leaderboard-client';

function Medal({ rank }: { rank: number }) {
  const medals = ['🥇', '🥈', '🥉'];
  return <span className="text-xl mr-2">{medals[rank - 1] ?? rank}</span>;
}

function ListItem({
  primary,
  secondary,
  value,
}: { primary: string; secondary?: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="min-w-0">
        <div className="truncate font-medium">{primary}</div>
        {secondary ? (
          <div className="text-xs text-muted-foreground truncate">
            {secondary}
          </div>
        ) : null}
      </div>
      <div className="ml-3 text-sm tabular-nums">{value}</div>
    </div>
  );
}

export default async function LeaderboardSection() {
  const t = await getTranslations('Competition.leaderboard');
  const m = await getTranslations('Competition.milestones');
  const data: LeaderboardData = await getLeaderboardData();

  // Client UI wrapper (premium visuals)
  if (true) {
    return <LeaderboardClient data={data} />;
  }

  return (
    <section id="leaderboard" className="relative px-4 pt-8 pb-6">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal direction="up" delay={0.1}>
          <div className="mb-10 text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
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
        <div className="grid gap-6 md:grid-cols-2">
          {/* Subscription Growth */}
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
                        <div
                          key={item.appKey}
                          className="flex items-center gap-3 py-2"
                        >
                          <Medal rank={item.rank} />
                          <ListItem
                            primary={item.teamName || item.appKey}
                            secondary={item.teamName ? item.appKey : undefined}
                            value={`${item.growth}  +  💰${item.reward}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </MagicCard>
          </ScrollReveal>

          {/* Photon Consumption */}
          <ScrollReveal direction="up" delay={0.2}>
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
                      <div
                        key={item.appKey}
                        className="flex items-center gap-3 py-2"
                      >
                        <Medal rank={item.rank} />
                        <ListItem
                          primary={item.teamName || item.appKey}
                          secondary={item.teamName ? item.appKey : undefined}
                          value={`${item.photons}  ⚡  💰${item.reward}`}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </MagicCard>
          </ScrollReveal>
        </div>

        {/* Milestones */}
        <ScrollReveal direction="up" delay={0.25}>
          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="size-4 text-primary" />
              <h3 className="font-semibold">{m('title')}</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Subscriptions >= 500 */}
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
                          <ListItem
                            key={`s-${x.appKey}`}
                            primary={x.teamName || x.appKey}
                            secondary={x.teamName ? x.appKey : undefined}
                            value={`${x.subscriptions}`}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </MagicCard>

              {/* Photons >= 10000 */}
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
                          <ListItem
                            key={`p-${x.appKey}`}
                            primary={x.teamName || x.appKey}
                            secondary={x.teamName ? x.appKey : undefined}
                            value={`${x.photons}`}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </MagicCard>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
