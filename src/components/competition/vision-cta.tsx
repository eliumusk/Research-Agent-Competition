'use client';

import { PulsatingButton } from '@/components/magicui/pulsating-button';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { useTheme } from 'next-themes';

interface VisionCTAProps {
  primaryLabel: string;
  secondaryLabel: string;
}

export default function VisionCTA({ primaryLabel, secondaryLabel }: VisionCTAProps) {
  const { theme } = useTheme();
  const pulseColor = theme === 'dark' ? '#ffffff40' : '#00000040';

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <LocaleLink href="https://www.bohrium.com/competitions/8831838064?tab=introduce" target="_blank">
        <PulsatingButton className="rounded-xl px-8" pulseColor={pulseColor} duration="2s">
          {primaryLabel}
        </PulsatingButton>
      </LocaleLink>
      <Button asChild size="lg" variant="outline" className="rounded-xl px-8">
        <LocaleLink href="#prizes">{secondaryLabel}</LocaleLink>
      </Button>
    </div>
  );
}
