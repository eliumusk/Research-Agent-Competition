'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { websiteConfig } from '@/config/website';
import { LocaleLink } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { DiscordIcon } from '../icons/discord';

export function DiscordCard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Card className="shadow-none">
      <CardHeader className="gap-2">
        <CardTitle className="flex items-center gap-2">
          <DiscordIcon className="size-4" />
          Discord Community
        </CardTitle>
        <CardDescription>
          Join our Discord community to get help, share your ideas, and connect
          with other users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="cursor-pointer w-full shadow-none" size="sm" asChild>
          <LocaleLink
            href={websiteConfig.metadata.social?.discord!}
            target="_blank"
          >
            Join Discord
          </LocaleLink>
        </Button>
      </CardContent>
    </Card>
  );
}
