import { websiteConfig } from '@/config/website';
import { authClient } from '@/lib/auth-client';
import { useCreditsStore } from '@/stores/credits-store';
import { useCallback, useEffect } from 'react';

/**
 * Hook for accessing and managing credits state
 *
 * This hook provides access to the credits state and methods to manage it.
 * It also automatically fetches credits information when the user changes.
 * Only works when credits are enabled in the website configuration.
 */
export function useCredits() {
  // Return default values if credits are disabled
  if (!websiteConfig.credits.enableCredits) {
    return {
      balance: 0,
      isLoading: false,
      error: null,
      fetchCredits: () => Promise.resolve(),
      consumeCredits: () => Promise.resolve(false),
      hasEnoughCredits: () => false,
    };
  }

  const {
    balance,
    isLoading,
    error,
    fetchCredits: fetchCreditsFromStore,
    consumeCredits,
  } = useCreditsStore();

  const { data: session } = authClient.useSession();

  const fetchCredits = useCallback(
    (force = false) => {
      const currentUser = session?.user;
      if (currentUser) {
        fetchCreditsFromStore(currentUser, force);
      }
    },
    [session?.user, fetchCreditsFromStore]
  );

  useEffect(() => {
    const currentUser = session?.user;
    if (currentUser) {
      fetchCreditsFromStore(currentUser);
    }
  }, [session?.user, fetchCreditsFromStore]);

  return {
    // State
    balance,
    isLoading,
    error,

    // Methods
    fetchCredits,
    consumeCredits,

    // Helper methods
    hasEnoughCredits: (amount: number) => balance >= amount,
  };
}
