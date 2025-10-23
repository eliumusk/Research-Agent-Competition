'use client';

import { Card, CardContent } from '@/components/ui/card';
import { EnhancedBackground } from '@/components/ui/enhanced-background';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
}

export default function TimelineSection() {
  const t = useTranslations('Competition.timeline');

  const events: TimelineEvent[] = [
    {
      date: t('event1.date'),
      title: t('event1.title'),
      description: t('event1.description'),
      status: 'completed',
    },
    {
      date: t('event2.date'),
      title: t('event2.title'),
      description: t('event2.description'),
      status: 'current',
    },
    {
      date: t('event3.date'),
      title: t('event3.title'),
      description: t('event3.description'),
      status: 'upcoming',
    },
    {
      date: t('event4.date'),
      title: t('event4.title'),
      description: t('event4.description'),
      status: 'upcoming',
    },
  ];

  return (
    <section id="timeline" className="relative px-4 py-16">
      {/* Background */}
      <EnhancedBackground variant="section" />

      <div className="mx-auto max-w-7xl">
        {/* Header */}
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

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 h-full w-px bg-border md:left-1/2" />

          {/* Events */}
          <div className="space-y-8">
            {events.map((event, index) => (
              <div
                key={index}
                className={cn(
                  'relative flex items-start gap-8',
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                )}
              >
                {/* Date (hidden on mobile, shown on desktop) */}
                <div className="hidden flex-1 md:block">
                  {index % 2 === 0 && (
                    <div className="pr-8 text-right">
                      <div className="font-mono text-sm font-medium text-muted-foreground">
                        {event.date}
                      </div>
                    </div>
                  )}
                </div>

                {/* Timeline dot */}
                <div className="relative z-10 flex size-16 shrink-0 items-center justify-center">
                  <div
                    className={cn(
                      'size-4 rounded-full border-4 border-background',
                      event.status === 'completed' && 'bg-muted-foreground',
                      event.status === 'current' && 'bg-primary',
                      event.status === 'upcoming' && 'bg-muted'
                    )}
                  />
                  {event.status === 'current' && (
                    <div className="absolute size-4 animate-ping rounded-full bg-primary opacity-75" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  {index % 2 !== 0 && (
                    <div className="mb-2 hidden md:block">
                      <div className="font-mono text-sm font-medium text-muted-foreground">
                        {event.date}
                      </div>
                    </div>
                  )}

                  <Card
                    className={cn(
                      'transition-all duration-300',
                      event.status === 'current' &&
                        'border-primary/50 bg-primary/5'
                    )}
                  >
                    <CardContent className="p-6">
                      {/* Date on mobile */}
                      <div className="mb-2 font-mono text-sm font-medium text-muted-foreground md:hidden">
                        {event.date}
                      </div>

                      <h3 className="mb-2 text-xl font-semibold">
                        {event.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>

                      {event.status === 'current' && (
                        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex size-2 rounded-full bg-primary" />
                          </span>
                          {t('currentStage')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
