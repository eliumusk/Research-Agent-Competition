'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { useCurrentPlan } from '@/hooks/use-payment';
import type { ReactNode } from 'react';

interface PremiumContentProps {
  children: ReactNode;
}

/**
 * This component will now rely on server-side filtering
 * The <PremiumContent> tags will be removed server-side for non-premium users
 * This component only serves as a marker for premium sections
 */
export function PremiumContent({ children }: PremiumContentProps) {
  return <div className="premium-content-section">{children}</div>;
}
