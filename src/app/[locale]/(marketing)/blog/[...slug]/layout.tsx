import HomeDiscordSection from '@/components/home/home-discord';
import HomeNewsletterSection from '@/components/home/home-newsletter';
import HomeProjectsSection from '@/components/home/home-projects';
import Container from '@/components/layout/container';
import type { PropsWithChildren } from 'react';

export default function BlogPostLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col gap-8">
      <Container className="py-8 px-4">{children}</Container>

      {/* projects section */}
      <HomeProjectsSection />

      {/* newsletter */}
      {/* <HomeNewsletterSection /> */}

      {/* discord */}
      <HomeDiscordSection />
    </div>
  );
}
