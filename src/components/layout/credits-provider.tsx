'use client';

import { websiteConfig } from '@/config/website';
import { authClient } from '@/lib/auth-client';
import { useCreditsStore } from '@/stores/credits-store';
import { useEffect } from 'react';

/**
 * Credits Provider Component
 *
 * This component initializes the credits store when the user is authenticated
 * and handles cleanup when the user logs out.
 * Only renders when credits are enabled in the website configuration.
 */
export function CreditsProvider({ children }: { children: React.ReactNode }) {
  // Only initialize credits store if credits are enabled
  if (!websiteConfig.credits.enableCredits) {
    return <>{children}</>;
  }

  const { fetchCredits } = useCreditsStore();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      fetchCredits(session.user);
    }
  }, [session?.user, fetchCredits]);

  return <>{children}</>;
}
