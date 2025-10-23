'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface GeometricBackgroundProps {
  className?: string;
}

export function GeometricBackground({ className }: GeometricBackgroundProps) {
  // Memphis-style geometric shapes with random positions
  const shapes = [
    // Circles
    { type: 'circle', size: 120, x: '10%', y: '15%', color: 'bg-blue-500/10', delay: 0 },
    { type: 'circle', size: 80, x: '85%', y: '25%', color: 'bg-purple-500/10', delay: 0.2 },
    { type: 'circle', size: 60, x: '75%', y: '70%', color: 'bg-pink-500/10', delay: 0.4 },

    // Squares
    { type: 'square', size: 100, x: '20%', y: '60%', color: 'bg-yellow-500/10', delay: 0.1 },
    { type: 'square', size: 70, x: '90%', y: '50%', color: 'bg-green-500/10', delay: 0.3 },

    // Triangles (using border trick)
    { type: 'triangle', size: 90, x: '15%', y: '80%', color: 'border-orange-500/20', delay: 0.5 },
    { type: 'triangle', size: 110, x: '80%', y: '10%', color: 'border-cyan-500/20', delay: 0.15 },

    // Lines/Rectangles
    { type: 'line', width: 150, height: 4, x: '30%', y: '40%', color: 'bg-red-500/20', delay: 0.25 },
    { type: 'line', width: 100, height: 4, x: '60%', y: '85%', color: 'bg-indigo-500/20', delay: 0.35 },
  ];

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {shapes.map((shape, index) => {
        if (shape.type === 'circle') {
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 1,
                delay: shape.delay,
                ease: 'easeOut',
              }}
              className={cn(
                'absolute rounded-full',
                shape.color
              )}
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
              key={index}
              initial={{ opacity: 0, rotate: -45 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{
                duration: 1,
                delay: shape.delay,
                ease: 'easeOut',
              }}
              className={cn(
                'absolute',
                shape.color
              )}
              style={{
                width: shape.size,
                height: shape.size,
                left: shape.x,
                top: shape.y,
              }}
            />
          );
        }

        if (shape.type === 'triangle') {
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 1,
                delay: shape.delay,
                ease: 'easeOut',
              }}
              className="absolute"
              style={{
                left: shape.x,
                top: shape.y,
                width: 0,
                height: 0,
                borderLeft: `${shape.size / 2}px solid transparent`,
                borderRight: `${shape.size / 2}px solid transparent`,
                borderBottom: `${shape.size}px solid currentColor`,
              }}
            >
              <div className={cn('absolute', shape.color)} />
            </motion.div>
          );
        }

        if (shape.type === 'line') {
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{
                duration: 1,
                delay: shape.delay,
                ease: 'easeOut',
              }}
              className={cn(
                'absolute',
                shape.color
              )}
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
    </div>
  );
}

