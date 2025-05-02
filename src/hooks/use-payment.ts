import { websiteConfig } from '@/config/website';
import { authClient } from '@/lib/auth-client';
import { usePaymentStore } from '@/stores/payment-store';
import { useEffect } from 'react';

/**
 * Hook for accessing and managing payment state
 *
 * This hook provides access to the payment state and methods to manage it.
 * It also automatically fetches payment information when the user changes.
 */
export function usePayment() {
  const disableAuth = websiteConfig.auth.disabled;
  if (disableAuth) {
    return {
      currentPlan: null,
      subscription: null,
      isLoading: false,
      error: null,
      refetch: () => {},
    };
  }
  
  const { currentPlan, subscription, isLoading, error, fetchPayment } =
    usePaymentStore();

  const { data: session } = authClient.useSession();

  useEffect(() => {
    const currentUser = session?.user;
    // Fetch payment data whenever the user session changes
    if (currentUser) {
      console.log('fetching payment info for user', currentUser.id);
      fetchPayment(currentUser);
    }
  }, [session, fetchPayment]);

  return {
    currentPlan,
    subscription,
    isLoading,
    error,
    refetch: () => {
      const currentUser = session?.user;
      if (currentUser) {
        console.log('refetching payment info for user', currentUser.id);
        fetchPayment(currentUser);
      }
    },
  };
}
