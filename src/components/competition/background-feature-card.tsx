'use client';

import { MagicCard } from '@/components/magicui/magic-card';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { Bot, Lightbulb, Network, Zap } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ComponentType } from 'react';

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  bot: Bot,
  zap: Zap,
  network: Network,
  lightbulb: Lightbulb,
};

interface BackgroundFeatureCardProps {
  icon: keyof typeof iconMap;
  title: string;
  description: string;
}

export default function BackgroundFeatureCard({
  icon,
  title,
  description,
}: BackgroundFeatureCardProps) {
  const { theme } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const Icon = iconMap[icon] ?? Bot;
  const gradientColor = theme === 'dark' ? '#262626' : '#D9D9D955';

  if (prefersReducedMotion) {
    return (
      <div className="rounded-3xl border bg-card p-6">
        <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-6" />
        </div>
        <h3 className="mb-2 font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    );
  }

  return (
    <MagicCard
      className="group relative overflow-hidden transition-all duration-300 p-6"
      gradientColor={gradientColor}
      gradientSize={300}
    >
      <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
        <Icon className="size-6" />
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </MagicCard>
  );
}
