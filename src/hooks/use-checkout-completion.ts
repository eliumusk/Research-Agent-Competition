'use client';

import { MAX_POLL_COUNT, POLL_INTERVAL } from '@/lib/constants';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { paymentKeys } from './use-payment';

interface UseCheckoutCompletionProps {
  userId: string | undefined;
  onPaymentProcessed?: () => void;
}

/**
 * Hook to handle checkout completion and wait for webhook processing
 *
 * When returning from Stripe checkout with session_id, this hook will:
 * 1. Detect the checkout completion
 * 2. Poll for payment data updates for a limited time
 * 3. Invalidate queries when payment is processed
 */
export function useCheckoutCompletion({
  userId,
  onPaymentProcessed,
}: UseCheckoutCompletionProps) {
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

      console.log('Checkout completed, waiting for webhook processing...');

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
          await new Promise(resolve => setTimeout(resolve, 200));

          // Get data from cache after invalidation triggered refetch
          const subscriptionData = queryClient.getQueryData(paymentKeys.subscription(userId));
          const lifetimeData = queryClient.getQueryData(paymentKeys.lifetime(userId));

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
  }, [searchParams, userId]); // Keep simple dependencies

  // component unmount, clean up polling
  useEffect(() => {
    return () => {
      console.log('Component unmounting, cleaning up polling');
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
