'use client';

import { MagicCard } from '@/components/magicui/magic-card';
import { ShineBorder } from '@/components/magicui/shine-border';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { cn } from '@/lib/utils';
import { BarChart3Icon, ExternalLinkIcon, MaximizeIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useState } from 'react';

const BI_REPORT_URL =
  'https://bi.aliyuncs.com/token3rd/dashboard/view/pc.htm?pageId=f253d1fe-2dc8-4016-b98b-aff79f0e11cc&accessTicket=947c45a7-e4e8-4427-aaa5-7958a5066c6f&dd_orientation=auto';

export default function AnalyticsSection() {
  const t = useTranslations('Competition.analytics');
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleOpenExternal = () => {
    window.open(BI_REPORT_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <section
        id="analytics"
        className="relative px-4 pb-16 pt-8 overflow-hidden"
      >
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <ScrollReveal direction="up" delay={0.1}>
            <div className="mb-12 text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <BarChart3Icon className="size-4" />
                <span>{t('badge')}</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                {t('title')}
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                {t('description')}
              </p>
            </div>
          </ScrollReveal>

          {/* BI Report Container */}
          <ScrollReveal direction="up" delay={0.2}>
            <div className="relative">
              <MagicCard
                className="relative overflow-hidden p-0"
                gradientColor={theme === 'dark' ? '#262626' : '#D9D9D955'}
                gradientSize={400}
              >
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

                <Card className="border-0 shadow-none relative z-10">
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mb-4 gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BarChart3Icon className="size-4" />
                        <span className="hidden sm:inline">{t('subtitle')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleOpenExternal}
                          className="gap-2"
                        >
                          <ExternalLinkIcon className="size-4" />
                          <span className="hidden sm:inline">{t('openExternal')}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleFullscreen}
                          className="gap-2"
                        >
                          <MaximizeIcon className="size-4" />
                          <span className="hidden sm:inline">
                            {isFullscreen ? t('exitFullscreen') : t('fullscreen')}
                          </span>
                        </Button>
                      </div>
                    </div>

                    {/* iframe Container */}
                    <div
                      className={cn(
                        'relative rounded-lg overflow-hidden bg-muted/30',
                        'border-2 border-border/50',
                        'transition-all duration-300'
                      )}
                    >
                      {/* Loading Overlay */}
                      {isLoading && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                          <div className="flex flex-col items-center gap-4">
                            <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            <p className="text-sm text-muted-foreground">
                              {t('loading')}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* iframe */}
                      <iframe
                        src={BI_REPORT_URL}
                        className={cn(
                          'w-full border-0 transition-all duration-300',
                          isFullscreen
                            ? 'h-[calc(100vh-12rem)]'
                            : 'h-[500px] sm:h-[600px] lg:h-[700px]'
                        )}
                        title={t('title')}
                        onLoad={() => setIsLoading(false)}
                        allow="fullscreen"
                        loading="lazy"
                      />
                    </div>

                    {/* Info Footer */}
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <span>{t('footer')}</span>
                    </div>
                  </CardContent>
                </Card>
              </MagicCard>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
          onClick={handleFullscreen}
        >
          <div className="container mx-auto h-full py-8 px-4">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t('title')}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFullscreen}
                  className="gap-2"
                >
                  <MaximizeIcon className="size-4" />
                  {t('exitFullscreen')}
                </Button>
              </div>
              <div className="flex-1 rounded-lg overflow-hidden border-2 border-border">
                <iframe
                  src={BI_REPORT_URL}
                  className="w-full h-full border-0"
                  title={t('title')}
                  allow="fullscreen"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

