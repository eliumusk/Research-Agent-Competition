'use client';

import { authClient } from '@/lib/auth-client';
import { useCreditsStore } from '@/stores/credits-store';
import { useEffect } from 'react';

/**
 * Credits Provider Component
 *
 * This component initializes the credits store when the user is authenticated
 * and handles cleanup when the user logs out.
 */
export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const { fetchCredits } = useCreditsStore();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      fetchCredits(session.user);
    }
  }, [session?.user, fetchCredits]);

  return <>{children}</>;
}
