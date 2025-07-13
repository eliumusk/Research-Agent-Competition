'use client';

import { authClient } from '@/lib/auth-client';
import { usePaymentStore } from '@/stores/payment-store';
import { useEffect } from 'react';

/**
 * Payment provider component
 *
 * This component is responsible for initializing the payment state
 * by fetching the current user's subscription and payment information when the app loads.
 */
export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const { fetchPayment } = usePaymentStore();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      fetchPayment(session.user);
    }
  }, [session?.user, fetchPayment]);

  return <>{children}</>;
}
