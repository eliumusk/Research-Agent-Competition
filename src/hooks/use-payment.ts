import { getActiveSubscriptionAction } from '@/actions/get-active-subscription';
import { getLifetimeStatusAction } from '@/actions/get-lifetime-status';
import { MAX_POLL_COUNT, POLL_INTERVAL } from '@/lib/constants';
import { getAllPricePlans } from '@/lib/price-plan';
import type { PricePlan, Subscription } from '@/payment/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

// Query keys
export const paymentKeys = {
  all: ['payment'] as const,
  subscription: (userId: string) =>
    [...paymentKeys.all, 'subscription', userId] as const,
  lifetime: (userId: string) =>
    [...paymentKeys.all, 'lifetime', userId] as const,
  currentPlan: (userId: string) =>
    [...paymentKeys.all, 'currentPlan', userId] as const,
};

// Hook to fetch active subscription
export function useActiveSubscription(userId: string | undefined) {
  return useQuery({
    queryKey: paymentKeys.subscription(userId || ''),
    queryFn: async (): Promise<Subscription | null> => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      console.log('useActiveSubscription, userId', userId);
      const result = await getActiveSubscriptionAction({ userId });
      if (!result?.data?.success) {
        throw new Error(result?.data?.error || 'Failed to fetch subscription');
      }
      console.log('useActiveSubscription, result', result);
      return result.data.data || null;
    },
    enabled: !!userId,
  });
}

// Hook to fetch lifetime status
export function useLifetimeStatus(userId: string | undefined) {
  return useQuery({
    queryKey: paymentKeys.lifetime(userId || ''),
    queryFn: async (): Promise<boolean> => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      console.log('useLifetimeStatus, userId', userId);
      const result = await getLifetimeStatusAction({ userId });
      if (!result?.data?.success) {
        throw new Error(
          result?.data?.error || 'Failed to fetch lifetime status'
        );
      }
      console.log('useLifetimeStatus, result', result);
      return result.data.isLifetimeMember || false;
    },
    enabled: !!userId,
  });
}

// Hook to get current plan based on subscription and lifetime status
export function useCurrentPlan(userId: string | undefined) {
  const {
    data: subscription,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
  } = useActiveSubscription(userId);
  const {
    data: isLifetimeMember,
    isLoading: isLoadingLifetime,
    error: lifetimeError,
  } = useLifetimeStatus(userId);

  return useQuery({
    queryKey: paymentKeys.currentPlan(userId || ''),
    queryFn: async (): Promise<{
      currentPlan: PricePlan | null;
      subscription: Subscription | null;
    }> => {
      const plans: PricePlan[] = getAllPricePlans();
      const freePlan = plans.find((plan) => plan.isFree);
      const lifetimePlan = plans.find((plan) => plan.isLifetime);

      // If lifetime member, return lifetime plan
      if (isLifetimeMember) {
        console.log('useCurrentPlan, lifetimePlan');
        return {
          currentPlan: lifetimePlan || null,
          subscription: null,
        };
      }

      // If has active subscription, find the corresponding plan
      if (subscription) {
        console.log('useCurrentPlan, subscription');
        const plan =
          plans.find((p) =>
            p.prices.find((price) => price.priceId === subscription.priceId)
          ) || null;
        return {
          currentPlan: plan,
          subscription,
        };
      }

      // Default to free plan
      console.log('useCurrentPlan, freePlan');
      return {
        currentPlan: freePlan || null,
        subscription: null,
      };
    },
    enabled: !!userId && !isLoadingSubscription && !isLoadingLifetime,
  });
}

interface UsePaymentCompletionProps {
  userId: string | undefined;
  onPaymentProcessed?: () => void;
}

/**
 * Hook to handle payment completion and wait for webhook processing
 *
 * When returning from Stripe checkout with session_id, this hook will:
 * 1. Detect the checkout completion
 * 2. Poll for payment data updates for a limited time
 * 3. Invalidate queries when payment is processed
 */
export function usePaymentCompletion({
  userId,
  onPaymentProcessed,
}: UsePaymentCompletionProps) {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [isWaitingForWebhook, setIsWaitingForWebhook] = useState(false);
  const hasHandledSession = useRef(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollCountRef = useRef(0);

  // Stable callback reference
  const stableOnPaymentProcessed = useCallback(() => {
    onPaymentProcessed?.();
  }, [onPaymentProcessed]);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    // Only handle session_id once
    if (sessionId && !hasHandledSession.current && userId) {
      hasHandledSession.current = true;
      setIsWaitingForWebhook(true);
      pollCountRef.current = 0;

      console.log('Payment completed, waiting for webhook processing...');

      // Start polling for payment data
      const pollForPaymentData = async () => {
        try {
          console.log('Polling for payment data, count:', pollCountRef.current);

          // Invalidate queries to trigger fresh data fetch
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: paymentKeys.subscription(userId),
            }),
            queryClient.invalidateQueries({
              queryKey: paymentKeys.lifetime(userId),
            }),
            queryClient.invalidateQueries({
              queryKey: paymentKeys.currentPlan(userId),
            }),
          ]);

          // Wait a moment for queries to refetch
          await new Promise((resolve) => setTimeout(resolve, 200));

          // Get data from cache after invalidation triggered refetch
          const subscriptionData = queryClient.getQueryData(
            paymentKeys.subscription(userId)
          );
          const lifetimeData = queryClient.getQueryData(
            paymentKeys.lifetime(userId)
          );

          console.log('Fresh subscription data:', subscriptionData);
          console.log('Fresh lifetime status:', lifetimeData);

          // Check if we have valid payment data (subscription or lifetime membership)
          if (subscriptionData || lifetimeData) {
            console.log('Payment data detected, webhook processing completed');
            setIsWaitingForWebhook(false);
            stableOnPaymentProcessed();

            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            return;
          }

          console.log('Payment data not detected, continuing polling');

          pollCountRef.current++;

          // Stop polling after max attempts
          if (pollCountRef.current >= MAX_POLL_COUNT) {
            console.log('Webhook polling timeout, stopping...');
            setIsWaitingForWebhook(false);

            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          }
        } catch (error) {
          console.error('Error polling for payment data:', error);

          // Continue polling even on error, but increment counter
          pollCountRef.current++;

          if (pollCountRef.current >= MAX_POLL_COUNT) {
            console.log('Webhook polling timeout after error, stopping...');
            setIsWaitingForWebhook(false);

            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          }
        }
      };

      // Start polling
      pollIntervalRef.current = setInterval(pollForPaymentData, POLL_INTERVAL);

      // Also trigger immediate check
      pollForPaymentData();
    }

    // No cleanup needed since we don't modify URL and userId changes are rare
  }, [searchParams, userId]);

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      console.log('Component unmounting, cleaning up payment polling');
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, []);

  return {
    isWaitingForWebhook,
  };
}
