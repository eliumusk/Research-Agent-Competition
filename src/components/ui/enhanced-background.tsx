'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { DotPattern } from '@/components/magicui/dot-pattern';
import { GridPattern } from '@/components/magicui/grid-pattern';

interface EnhancedBackgroundProps {
  className?: string;
  variant?: 'hero' | 'section' | 'minimal';
  showGeometric?: boolean;
  showGrid?: boolean;
  showDots?: boolean;
}

export function EnhancedBackground({
  className,
  variant = 'section',
  showGeometric = true,
  showGrid = true,
  showDots = true,
}: EnhancedBackgroundProps) {
  // Memphis-style geometric shapes
  const geometricShapes = [
    // Hero variant - more shapes
    ...(variant === 'hero'
      ? [
          { type: 'circle', size: 150, x: '8%', y: '12%', color: 'bg-blue-500/8', delay: 0 },
          { type: 'circle', size: 100, x: '88%', y: '20%', color: 'bg-purple-500/8', delay: 0.2 },
          { type: 'circle', size: 80, x: '78%', y: '75%', color: 'bg-pink-500/8', delay: 0.4 },
          { type: 'square', size: 120, x: '15%', y: '65%', color: 'bg-yellow-500/8', delay: 0.1 },
          { type: 'square', size: 90, x: '92%', y: '55%', color: 'bg-green-500/8', delay: 0.3 },
          { type: 'line', width: 180, height: 5, x: '25%', y: '35%', color: 'bg-red-500/15', delay: 0.25 },
          { type: 'line', width: 120, height: 5, x: '65%', y: '88%', color: 'bg-indigo-500/15', delay: 0.35 },
        ]
      : []),
    // Section variant - moderate shapes
    ...(variant === 'section'
      ? [
          { type: 'circle', size: 100, x: '10%', y: '15%', color: 'bg-blue-500/6', delay: 0 },
          { type: 'circle', size: 70, x: '85%', y: '25%', color: 'bg-purple-500/6', delay: 0.2 },
          { type: 'square', size: 80, x: '20%', y: '70%', color: 'bg-yellow-500/6', delay: 0.1 },
          { type: 'line', width: 120, height: 4, x: '60%', y: '80%', color: 'bg-indigo-500/12', delay: 0.3 },
        ]
      : []),
    // Minimal variant - few shapes
    ...(variant === 'minimal'
      ? [
          { type: 'circle', size: 80, x: '12%', y: '20%', color: 'bg-blue-500/5', delay: 0 },
          { type: 'square', size: 60, x: '85%', y: '75%', color: 'bg-purple-500/5', delay: 0.2 },
        ]
      : []),
  ];

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {/* Dot Pattern */}
      {showDots && (
        <DotPattern
          className={cn(
            variant === 'hero' && 'opacity-30 [mask-image:radial-gradient(700px_circle_at_center,white,transparent)]',
            variant === 'section' && 'opacity-20 [mask-image:radial-gradient(500px_circle_at_center,white,transparent)]',
            variant === 'minimal' && 'opacity-15 [mask-image:radial-gradient(400px_circle_at_center,white,transparent)]'
          )}
        />
      )}

      {/* Grid Pattern */}
      {showGrid && (
        <GridPattern
          width={variant === 'hero' ? 60 : 50}
          height={variant === 'hero' ? 60 : 50}
          className={cn(
            variant === 'hero' && 'opacity-20 [mask-image:linear-gradient(to_bottom,white,transparent,transparent)]',
            variant === 'section' && 'opacity-15 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]',
            variant === 'minimal' && 'opacity-10 [mask-image:radial-gradient(400px_circle_at_center,white,transparent)]'
          )}
        />
      )}

      {/* Geometric Shapes */}
      {showGeometric &&
        geometricShapes.map((shape, index) => {
          if (shape.type === 'circle') {
            return (
              <motion.div
                key={`circle-${index}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 1.2,
                  delay: shape.delay,
                  ease: 'easeOut',
                }}
                className={cn('absolute rounded-full', shape.color)}
                style={{
                  width: shape.size,
                  height: shape.size,
                  left: shape.x,
                  top: shape.y,
                }}
              />
            );
          }

          if (shape.type === 'square') {
            return (
              <motion.div
                key={`square-${index}`}
                initial={{ opacity: 0, rotate: -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{
                  duration: 1.2,
                  delay: shape.delay,
                  ease: 'easeOut',
                }}
                className={cn('absolute rounded-sm', shape.color)}
                style={{
                  width: shape.size,
                  height: shape.size,
                  left: shape.x,
                  top: shape.y,
                }}
              />
            );
          }

          if (shape.type === 'line') {
            return (
              <motion.div
                key={`line-${index}`}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{
                  duration: 1.2,
                  delay: shape.delay,
                  ease: 'easeOut',
                }}
                className={cn('absolute rounded-full', shape.color)}
                style={{
                  width: shape.width,
                  height: shape.height,
                  left: shape.x,
                  top: shape.y,
                }}
              />
            );
          }

          return null;
        })}

      {/* Gradient Overlays */}
      <div
        className={cn(
          'absolute inset-0',
          variant === 'hero' && 'bg-gradient-to-b from-transparent via-background/50 to-background',
          variant === 'section' && 'bg-gradient-to-b from-transparent via-background/30 to-transparent',
          variant === 'minimal' && 'bg-gradient-to-b from-transparent via-background/20 to-transparent'
        )}
      />
    </div>
  );
}

