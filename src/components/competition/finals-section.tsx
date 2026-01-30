import { Card, CardContent } from '@/components/ui/card';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal';
import { competitionResults } from '@/lib/competition-results';
import { ListChecks } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

function FinalistRow({ rank, name, score }: { rank: number; name: string; score: number }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-7 text-xs font-mono text-muted-foreground tabular-nums">
          {rank.toString().padStart(2, '0')}
        </div>
        <div className="truncate font-medium" title={name}>
          {name}
        </div>
      </div>
      <div className="font-mono text-sm tabular-nums">{score.toFixed(1)}</div>
    </div>
  );
}

export default async function FinalsSection() {
  const t = await getTranslations('Competition.finals');

  return (
    <section id="finals" className="relative px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal direction="up" delay={0.1}>
          <div className="mb-10 text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <ListChecks className="size-4" />
              <span>{t('badge')}</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('publishedAt', { date: competitionResults.publishedAt })}
            </p>
            <p className="mx-auto max-w-3xl text-xs leading-relaxed text-muted-foreground">
              {t('notice')}
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid gap-6 lg:grid-cols-2" staggerDelay={0.08}>
          {competitionResults.tracks.map((track) => (
            <StaggerItem key={track.key}>
              <Card className="border bg-background/80">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-lg font-semibold">{track.name}</div>
                    <div className="text-xs text-muted-foreground">{t('scoreLabel')}</div>
                  </div>
                  <div className="divide-y">
                    {track.finalists.map((finalist, index) => (
                      <FinalistRow
                        key={`${track.key}-${finalist.name}`}
                        rank={index + 1}
                        name={finalist.name}
                        score={finalist.score}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
