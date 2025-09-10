import { getActiveSubscriptionAction } from '@/actions/get-active-subscription';
import { getLifetimeStatusAction } from '@/actions/get-lifetime-status';
import { PAYMENT_POLL_INTERVAL } from '@/lib/constants';
import { getAllPricePlans } from '@/lib/price-plan';
import type { PricePlan, Subscription } from '@/payment/types';
import { useQuery } from '@tanstack/react-query';
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
export function useActiveSubscription(userId: string | undefined, enablePolling = false) {
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
    refetchInterval: enablePolling ? PAYMENT_POLL_INTERVAL : false,
    refetchIntervalInBackground: false,
  });
}

// Hook to fetch lifetime status
export function useLifetimeStatus(userId: string | undefined, enablePolling = false) {
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
    refetchInterval: enablePolling ? PAYMENT_POLL_INTERVAL : false,
    refetchIntervalInBackground: false,
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
 * Uses TanStack Query's built-in polling capabilities
 */
export function usePaymentCompletion({
  userId,
  onPaymentProcessed,
}: UsePaymentCompletionProps) {
  const searchParams = useSearchParams();
  const [isWaitingForWebhook, setIsWaitingForWebhook] = useState(false);
  const hasHandledSession = useRef(false);

  // Detect if we're waiting for webhook (have session_id)
  const sessionId = searchParams.get('session_id');
  const shouldPoll = !!(sessionId && !hasHandledSession.current && userId);

  // Stable callback reference
  const stableOnPaymentProcessed = useCallback(() => {
    onPaymentProcessed?.();
  }, [onPaymentProcessed]);

  // Use existing hooks but enable polling when needed
  const { data: subscription } = useActiveSubscription(userId, shouldPoll);
  const { data: isLifetimeMember } = useLifetimeStatus(userId, shouldPoll);

  // Handle session_id detection
  useEffect(() => {
    if (sessionId && !hasHandledSession.current && userId) {
      console.log('Payment completed, starting to poll for webhook data...');
      setIsWaitingForWebhook(true);
      hasHandledSession.current = true;
    }
  }, [sessionId, userId]);

  // Check if payment data is available and stop waiting
  useEffect(() => {
    if (isWaitingForWebhook && (subscription || isLifetimeMember)) {
      console.log('Payment data detected, webhook processing completed');
      setIsWaitingForWebhook(false);
      stableOnPaymentProcessed();
    }
  }, [isWaitingForWebhook, subscription, isLifetimeMember, stableOnPaymentProcessed]);

  return {
    isWaitingForWebhook:
      isWaitingForWebhook && !subscription && !isLifetimeMember,
  };
}
