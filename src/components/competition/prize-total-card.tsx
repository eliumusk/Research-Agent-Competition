'use client';

import { BorderBeam } from '@/components/magicui/border-beam';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { Card, CardContent } from '@/components/ui/card';

interface PrizeTotalCardProps {
  label: string;
  amount: number;
}

export default function PrizeTotalCard({ label, amount }: PrizeTotalCardProps) {
  return (
    <Card className="group border-2 bg-gradient-to-br from-primary/5 via-background to-background transition-all hover:shadow-xl hover:scale-[1.02] relative overflow-hidden">
      <BorderBeam size={300} duration={15} delay={0} />
      <CardContent className="py-8 text-center relative z-10">
        <div className="mb-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="font-mono text-5xl font-bold tracking-tight lg:text-6xl">
          ¥<AnimatedNumber value={amount} duration={3} />
        </div>
      </CardContent>
    </Card>
  );
}
