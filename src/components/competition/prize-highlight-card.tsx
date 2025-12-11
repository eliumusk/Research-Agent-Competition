'use client';

import { MagicCard } from '@/components/magicui/magic-card';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { useTheme } from 'next-themes';

interface PrizeHighlightCardProps {
  label: string;
  description: string;
  amount: string;
}

export default function PrizeHighlightCard({
  label,
  description,
  amount,
}: PrizeHighlightCardProps) {
  const { theme } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const gradientColor = theme === 'dark' ? '#262626' : '#D9D9D955';

  if (prefersReducedMotion) {
    return (
      <div className="rounded-3xl border p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-1 font-semibold">{label}</div>
            <div className="text-sm text-muted-foreground">{description}</div>
          </div>
          <div className="font-mono text-2xl font-semibold">{amount}</div>
        </div>
      </div>
    );
  }

  return (
    <MagicCard className="py-6 px-6" gradientColor={gradientColor}>
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1 font-semibold">{label}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
        <div className="font-mono text-2xl font-semibold">{amount}</div>
      </div>
    </MagicCard>
  );
}
