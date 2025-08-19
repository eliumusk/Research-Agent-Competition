import { websiteConfig } from '@/config/website';
import { DiscordIcon } from '../icons/discord';
import { HeaderSection } from '../layout/header-section';
import { Button } from '../ui/button';

export default function HomeDiscordSection() {
  return (
    <section id="community" className="p-16 rounded-lg bg-muted/50">
      <div className="flex flex-col items-center justify-center gap-8">
        {/* Header */}
        <HeaderSection
          title="Community"
          subtitle="Join the Discord community"
          description="1600+ excellent indie makers are cooking here"
          className="text-center"
        />

        <Button variant="default" size="lg" className="cursor-pointer" asChild>
          <a
            href={websiteConfig.metadata.social?.discord}
            target="_blank"
            rel="noreferrer"
          >
            <DiscordIcon className="w-4 h-4" />
            Join Discord server for free
          </a>
        </Button>
      </div>
    </section>
  );
}
