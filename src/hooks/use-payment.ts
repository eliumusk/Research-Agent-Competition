import { authClient } from '@/lib/auth-client';
import { usePaymentStore } from '@/stores/payment-store';
import { useCallback, useEffect } from 'react';

/**
 * Hook for accessing and managing payment state
 *
 * This hook provides access to the payment state and methods to manage it.
 * It also automatically fetches payment information when the user changes.
 */
export function usePayment() {
  const {
    currentPlan,
    subscription,
    isLoading,
    error,
    fetchPayment: fetchPaymentFromStore,
  } = usePaymentStore();

  const { data: session } = authClient.useSession();

  const fetchPayment = useCallback(
    (force = false) => {
      const currentUser = session?.user;
      if (currentUser) {
        fetchPaymentFromStore(currentUser, force);
      }
    },
    [session?.user, fetchPaymentFromStore]
  );

  useEffect(() => {
    const currentUser = session?.user;
    if (currentUser) {
      fetchPaymentFromStore(currentUser);
    }
  }, [session?.user, fetchPaymentFromStore]);

  return {
    // State
    currentPlan,
    subscription,
    isLoading,
    error,

    // Methods
    fetchPayment,
  };
}
