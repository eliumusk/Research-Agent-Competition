import { Card, CardContent } from '@/components/ui/card';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal';
import { competitionResults } from '@/lib/competition-results';
import { Trophy } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

function AwardRow({
  label,
  icon,
  winners,
}: {
  label: string;
  icon: string;
  winners: string[];
}) {
  return (
    <div className="grid gap-3 border-b border-border/60 pb-4 last:border-0 last:pb-0 sm:grid-cols-[auto,1fr] sm:items-start">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <span className="text-base">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-sm font-semibold text-foreground leading-relaxed break-words sm:text-right">
        {winners.join(' / ')}
      </div>
    </div>
  );
}

export default async function AwardsSection() {
  const t = await getTranslations('Competition.awards');

  return (
    <section id="awards" className="relative px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal direction="up" delay={0.1}>
          <div className="mb-10 text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Trophy className="size-4" />
              <span>{t('badge')}</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('title')}
            </h2>
            <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid gap-6 lg:grid-cols-2" staggerDelay={0.08}>
          {competitionResults.tracks.map((track) => (
            <StaggerItem key={track.key}>
              <Card className="relative overflow-hidden border border-border/60 bg-gradient-to-b from-background/90 to-background/60 shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
                <CardContent className="relative p-7">
                  <div className="mb-6">
                    <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                      {t('badge')}
                    </div>
                    <div className="text-lg font-semibold tracking-tight">
                      {track.name}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <AwardRow
                      icon="🥇"
                      label={t('gold')}
                      winners={track.awards.gold}
                    />
                    <AwardRow
                      icon="🥈"
                      label={t('silver')}
                      winners={track.awards.silver}
                    />
                    <AwardRow
                      icon="🥉"
                      label={t('bronze')}
                      winners={track.awards.bronze}
                    />
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <ScrollReveal direction="up" delay={0.2}>
          <div className="mt-10">
            <div className="mb-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {t('excellenceTitle')}
            </div>
            <div className="flex flex-wrap gap-3">
              {competitionResults.excellenceAwards.map((name) => (
                <div
                  key={name}
                  className="rounded-full border border-border/60 bg-gradient-to-b from-background/80 to-background/60 px-4 py-2 text-sm font-medium text-foreground/90 shadow-sm"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
