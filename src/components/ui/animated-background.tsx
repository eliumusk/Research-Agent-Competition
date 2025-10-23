'use client';

import { DotPattern } from '@/components/magicui/dot-pattern';
import { Meteors } from '@/components/magicui/meteors';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
  className?: string;
  showDots?: boolean;
  showMeteors?: boolean;
  meteorCount?: number;
  dotSpacing?: number;
  dotSize?: number;
  dotGlow?: boolean;
}

/**
 * AnimatedBackground Component
 *
 * Combines Dot Pattern and Meteors for a sophisticated sci-fi background effect.
 *
 * Features:
 * - Dot Pattern: Subtle grid of dots as base layer
 * - Meteors: Dynamic shooting stars that add movement
 * - Optimized for performance with proper layering
 * - Respects reduced motion preferences
 *
 * @param showDots - Enable/disable dot pattern (default: true)
 * @param showMeteors - Enable/disable meteors (default: true)
 * @param meteorCount - Number of meteors (default: 20)
 * @param dotSpacing - Spacing between dots in pixels (default: 20)
 * @param dotSize - Size of each dot (default: 1)
 * @param dotGlow - Enable glowing animation on dots (default: false)
 */
export function AnimatedBackground({
  className,
  showDots = true,
  showMeteors = true,
  meteorCount = 20,
  dotSpacing = 20,
  dotSize = 1,
  dotGlow = false,
}: AnimatedBackgroundProps) {
  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 z-0 overflow-hidden',
        className
      )}
    >
      {/* Base Layer: Dot Pattern */}
      {showDots && (
        <DotPattern
          width={dotSpacing}
          height={dotSpacing}
          cr={dotSize}
          glow={dotGlow}
          className={cn(
            'opacity-40',
            '[mask-image:radial-gradient(ellipse_at_center,white,transparent_85%)]'
          )}
        />
      )}

      {/* Dynamic Layer: Meteors */}
      {showMeteors && (
        <div className="absolute inset-0">
          <Meteors
            number={meteorCount}
            className={cn(
              // Fade meteors when they overlap with content areas
              // This creates a subtle "collision" effect
              '[mask-image:radial-gradient(ellipse_at_center,white,transparent_90%)]'
            )}
          />
        </div>
      )}

      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50 pointer-events-none" />
    </div>
  );
}

