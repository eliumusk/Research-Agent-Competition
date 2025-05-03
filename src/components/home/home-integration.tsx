import { NextjsIcon } from '@/components/icons/nextjs';
import { ShadcnuiIcon } from '@/components/icons/shadcnui';
import { Card } from '@/components/ui/card';
import { LocaleLink } from '@/i18n/navigation';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type * as React from 'react';
import { HeaderSection } from '../layout/header-section';
import { Logo } from '../layout/logo';
import { Button } from '../ui/button';

export default function HomeIntegrationSection() {
  const t = useTranslations('HomePage.integration');

  return (
    <section id="integration" className="px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <HeaderSection
          title="Tech Stack"
          subtitle="Build with your favorite tech stack"
          description="Use the latest industry-standard tech stack for your next project"
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <IntegrationCard
            link="https://mksaas.com/"
            title="MkSaaS"
            description="Make your AI SaaS Product in a Weekend"
          >
            <img
              src="/images/logos/mksaas.png"
              alt="MkSaaS"
              className="rounded-lg w-10 h-10"
            />
          </IntegrationCard>

          <IntegrationCard
            link="https://mkdirs.com/"
            title="Mkdirs"
            description="The Best Directory Boilerplate with AI"
          >
            <img
              src="/images/logos/mkdirs.png"
              alt="Mkdirs"
              className="rounded-lg w-10 h-10"
            />
          </IntegrationCard>

          <IntegrationCard
            link="https://indiehub.best/"
            title="IndieHub"
            description="The Best Directory for Indie Hackers"
          >
            <img
              src="/images/logos/indiehub.png"
              alt="IndieHub"
              className="rounded-lg w-10 h-10"
            />
          </IntegrationCard>

          <IntegrationCard
            link="https://haitang.app/"
            title="Haitang"
            description="Learn Chinese Ancient Poetries Online"
          >
            <img
              src="/images/logos/haitang.png"
              alt="Haitang"
              className="rounded-lg w-10 h-10"
            />
          </IntegrationCard>

          <IntegrationCard
            link="https://boilerplatehunt.com/"
            title="Boilerplate Hunt"
            description="Find the Best Boilerplates to Ship Faster"
          >
            <img
              src="/images/logos/boilerplatehunt.png"
              alt="Boilerplate Hunt"
              className="rounded-lg w-10 h-10"
            />
          </IntegrationCard>

          <IntegrationCard
            link="https://og.indiehub.best/"
            title="OG Generator"
            description="Generate beautiful Open Graph images with zero effort"
          >
            <img
              src="/images/logos/og.png"
              alt="OG Generator"
              className="rounded-lg w-10 h-10"
            />
          </IntegrationCard>
        </div>
      </div>
    </section>
  );
}

const IntegrationCard = ({
  title,
  description,
  children,
  link = '#',
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
  link?: string;
}) => {
  const t = useTranslations('HomePage.integration');

  return (
    <a href={link} target="_blank" rel="noreferrer">
      <Card className="p-6 group cursor-pointer transition-all duration-300 ease-in-out hover:scale-105">
        <div className="relative overflow-hidden">
          <div className="flex items-center justify-start gap-4">
            <div className="*:size-10">{children}</div>
            <h3 className="text-base font-medium">{title}</h3>
          </div>

          <div className="space-y-2 pt-3">
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {description}
            </p>
          </div>

          {/* <div className="flex gap-3 border-t border-dashed mt-4 pt-6">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1 pr-2 shadow-none"
            >
              <LocaleLink href={link}>
                {t('learnMore')}
                <ChevronRight className="ml-0 !size-3.5 opacity-50" />
              </LocaleLink>
            </Button>
          </div> */}
        </div>
      </Card>
    </a>
  );
};
