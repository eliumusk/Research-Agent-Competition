import { getTranslations } from 'next-intl/server';
import CoursesHero from '@/components/courses/courses-hero';
import CoursesSection from '@/components/courses/courses-section';
import DocsSection from '@/components/courses/docs-section';
import PartnersCoursesSection from '@/components/courses/partners-courses-section';
import { constructMetadata } from '@/lib/metadata';

interface CoursesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata(props: CoursesPageProps) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'Courses' });

  return constructMetadata({
    title: t('metadata.title'),
    description: t('metadata.description'),
  });
}

export default async function CoursesPage(props: CoursesPageProps) {
  const params = await props.params;
  const { locale } = params;

  return (
    <div className="flex flex-col">
      <CoursesHero />
      <CoursesSection />
      <DocsSection />
      <PartnersCoursesSection />
    </div>
  );
}

