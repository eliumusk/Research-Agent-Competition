import AnalyticsSection from '@/components/competition/analytics-section';
import BackgroundSection from '@/components/competition/background-section';
import EvaluationSection from '@/components/competition/evaluation-section';
import PrizeSection from '@/components/competition/prize-section';
import RulesSection from '@/components/competition/rules-section';
import TimelineSection from '@/components/competition/timeline-section';
import TracksSection from '@/components/competition/tracks-section';
import VisionSection from '@/components/competition/vision-section';
import HomeBlogSection from '@/components/home/home-blog';
import HomeHeroSection from '@/components/home/home-hero';
import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

/**
 * https://next-intl.dev/docs/environments/actions-metadata-route-handlers#metadata-api
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    pathname: '/',
  });
}

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function HomePage(props: HomePageProps) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations('HomePage');

  return (
    <>
      <div className="flex flex-col">
        <HomeHeroSection />

        <BackgroundSection />

        <TracksSection />

        <PrizeSection />

        <EvaluationSection />

        <RulesSection />

        <TimelineSection />

        <VisionSection />

        <HomeBlogSection locale={locale} />

        <AnalyticsSection />
      </div>
    </>
  );
}
