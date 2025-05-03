import HomeBlogSection from '@/components/home/home-blog';
import HomeHeroSection from '@/components/home/home-hero';
import HomeNewsletterSection from '@/components/home/home-newsletter';
import HomeProjectsSection from '@/components/home/home-projects';
import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
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
    canonicalUrl: getUrlWithLocale('/', locale),
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

        <HomeProjectsSection />

        <HomeBlogSection />

        <HomeNewsletterSection />

        {/* <HeroSection /> */}

        {/* <LogoCloud /> */}

        {/* <StatsSection /> */}

        {/* <IntegrationSection /> */}

        {/* <FeaturesSection /> */}

        {/* <Features2Section /> */}

        {/* <Features3Section /> */}

        {/* <Integration2Section /> */}

        {/* <PricingSection /> */}

        {/* <FaqSection /> */}

        {/* <CallToActionSection /> */}

        {/* <TestimonialsSection /> */}

        {/* <NewsletterCard /> */}
      </div>
    </>
  );
}
