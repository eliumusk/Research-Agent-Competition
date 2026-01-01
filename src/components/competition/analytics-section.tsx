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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const BI_REPORT_URL =
  'https://bi.aliyuncs.com/token3rd/dashboard/view/pc.htm?pageId=f253d1fe-2dc8-4016-b98b-aff79f0e11cc&accessTicket=a6c9ea3f-d8fb-4de3-bda0-1c8c818f49ff&dd_orientation=auto&qbi_version_param=1';

export default function AnalyticsSection() {
  const t = useTranslations('Competition.analytics');
  const { theme } = useTheme();
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadNowLabel = '加载实时数据';
  const loadedLabel = '实时数据已加载';
  const placeholderLabel = '点击上方按钮加载实时数据';

  useEffect(() => {
    const node = containerRef.current;
    if (!node || shouldLoad) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '0px 0px 200px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  useEffect(() => {
    document.body.style.overflow = isFullscreen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (shouldLoad) {
      setIsLoading(true);
    }
  }, [shouldLoad]);

  const handleOpenExternal = useCallback(() => {
    window.open(BI_REPORT_URL, '_blank', 'noopener,noreferrer');
  }, []);

  const handleLoadDashboard = useCallback(() => {
    if (!shouldLoad) {
      setShouldLoad(true);
    }
  }, [shouldLoad]);

  const handleFullscreenToggle = useCallback(() => {
    if (!shouldLoad) return;
    setIsFullscreen((prev) => !prev);
  }, [shouldLoad]);

  const containerClasses = useMemo(
    () =>
      cn(
        'relative transition-all duration-300',
        isFullscreen &&
          'fixed inset-0 z-50 flex items-center justify-center bg-background/95 px-4 py-8'
      ),
    [isFullscreen]
  );

  const frameHeight = isFullscreen
    ? 'h-full'
    : 'h-[500px] sm:h-[600px] lg:h-[700px]';

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

                <Card
                  className={cn(
                    'border-0 shadow-none relative z-10',
                    isFullscreen && 'w-full h-full'
                  )}
                >
                  <CardContent
                    ref={containerRef}
                    className={cn(
                      'p-4 sm:p-6 lg:p-8',
                      isFullscreen && 'h-full'
                    )}
                  >
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mb-4 gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BarChart3Icon className="size-4" />
                        <span className="hidden sm:inline">
                          {t('subtitle')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleLoadDashboard}
                          disabled={shouldLoad}
                          className="gap-2"
                        >
                          {shouldLoad ? loadedLabel : loadNowLabel}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleOpenExternal}
                          className="gap-2"
                        >
                          <ExternalLinkIcon className="size-4" />
                          <span className="hidden sm:inline">
                            {t('openExternal')}
                          </span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleFullscreenToggle}
                          className="gap-2"
                          disabled={!shouldLoad}
                        >
                          <MaximizeIcon className="size-4" />
                          <span className="hidden sm:inline">
                            {isFullscreen
                              ? t('exitFullscreen')
                              : t('fullscreen')}
                          </span>
                        </Button>
                      </div>
                    </div>

                    {/* iframe Container */}
                    <div
                      className={cn(
                        containerClasses,
                        'rounded-lg border-2 border-border/50 bg-muted/30'
                      )}
                    >
                      <div className={cn('relative w-full', frameHeight)}>
                        {!shouldLoad && (
                          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm">
                            <p className="text-sm text-muted-foreground">
                              {placeholderLabel}
                            </p>
                            <Button onClick={handleLoadDashboard}>
                              {loadNowLabel}
                            </Button>
                          </div>
                        )}

                        {shouldLoad ? (
                          <iframe
                            src={BI_REPORT_URL}
                            className="w-full h-full border-0"
                            title={t('title')}
                            onLoad={() => setIsLoading(false)}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted" />
                        )}

                        {shouldLoad && isLoading && (
                          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-4">
                              <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                              <p className="text-sm text-muted-foreground">
                                {t('loading')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
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
    </>
  );
}
