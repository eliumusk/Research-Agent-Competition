import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { AnimatedBackground } from '@/components/ui/animated-background';
import type { ReactNode } from 'react';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Global Background: Dot Pattern + Meteors */}
      <AnimatedBackground
        showDots={true}
        showMeteors={true}
        meteorCount={30}
        dotSpacing={20}
        dotSize={1.2}
        dotGlow={false}
      />

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar scroll={true} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
