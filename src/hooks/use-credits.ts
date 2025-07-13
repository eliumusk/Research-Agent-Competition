import { authClient } from '@/lib/auth-client';
import { useCreditsStore } from '@/stores/credits-store';
import { useCallback, useEffect } from 'react';

/**
 * Hook for accessing and managing credits state
 *
 * This hook provides access to the credits state and methods to manage it.
 * It also automatically fetches credits information when the user changes.
 */
export function useCredits() {
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
