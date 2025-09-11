import { checkPaymentBySessionAction } from '@/actions/check-payment-by-session';
import { PAYMENT_MAX_POLL_TIME, PAYMENT_POLL_INTERVAL } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Query keys for payment completion
export const paymentCompletionKeys = {
  all: ['paymentCompletion'] as const,
  session: (sessionId: string) =>
    [...paymentCompletionKeys.all, 'session', sessionId] as const,
};

// Hook to check if payment exists by session ID
export function usePaymentBySession(
  sessionId: string | null,
  enablePolling = false
) {
  return useQuery({
    queryKey: paymentCompletionKeys.session(sessionId || ''),
    queryFn: async () => {
      if (!sessionId) {
        return { hasPayment: false, payment: null };
      }
      console.log('>>> Check payment by session');
      const result = await checkPaymentBySessionAction({ sessionId });
      if (!result?.data?.success) {
        console.log('<<< Check payment failed');
        throw new Error(
          result?.data?.error || 'Failed to check payment by session'
        );
      }
      console.log(
        '<<< Check payment success, hasPayment:',
        result.data.hasPayment
      );
      return {
        hasPayment: result.data.hasPayment,
        payment: result.data.payment,
      };
    },
    enabled: !!sessionId,
    refetchInterval: enablePolling ? PAYMENT_POLL_INTERVAL : false,
    refetchIntervalInBackground: false,
  });
}

interface UsePaymentCompletionProps {
  onPaymentProcessed?: () => void;
}

/**
 * Unified hook to handle payment completion and wait for webhook processing
 *
 * Works for both subscriptions and one-time payments (credits, lifetime)
 * Uses session_id parameter to detect completion and poll for payment records
 */
export function usePaymentCompletion({
  onPaymentProcessed,
}: UsePaymentCompletionProps = {}) {
  const searchParams = useSearchParams();
  const [isWaitingForWebhook, setIsWaitingForWebhook] = useState(false);
  const hasHandledSession = useRef(false);
  const pollStartTime = useRef<number | undefined>(undefined);
  const isMountedRef = useRef(true);

  // Detect if we're waiting for webhook (have session_id)
  const sessionId = searchParams.get('session_id');

  // Initialize waiting state immediately if session_id exists
  useEffect(() => {
    if (sessionId && !hasHandledSession.current) {
      console.log('Payment completed, starting to poll for webhook data...');
      pollStartTime.current = Date.now();
      setIsWaitingForWebhook(true);
      hasHandledSession.current = true;
    }
  }, [sessionId]);

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      pollStartTime.current = undefined;
      hasHandledSession.current = false;
    };
  }, []);

  // Control polling: only poll if waiting for webhook and within timeout
  const shouldPoll = useMemo(() => {
    if (
      !sessionId ||
      hasHandledSession.current === false ||
      !isWaitingForWebhook ||
      !isMountedRef.current
    ) {
      return false;
    }

    // Check timeout
    if (pollStartTime.current) {
      const pollDuration = Date.now() - pollStartTime.current;
      const maxPollTime = PAYMENT_MAX_POLL_TIME;
      if (pollDuration > maxPollTime) {
        console.log(
          `Payment polling timeout after ${pollDuration}ms, stopping poll`
        );
        return false;
      }
    }

    return true;
  }, [sessionId, isWaitingForWebhook]);

  // Stable callback reference
  const stableOnPaymentProcessed = useCallback(() => {
    onPaymentProcessed?.();
  }, [onPaymentProcessed]);

  // Clean up session_id from URL after payment processing
  const cleanupUrl = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('session_id');
    window.history.replaceState({}, '', url.toString());
  }, []);

  // Check if payment record exists for this session (indicates webhook processed)
  const { data: paymentCheck } = usePaymentBySession(sessionId, shouldPoll);

  // Check if payment record exists or timeout
  useEffect(() => {
    if (isWaitingForWebhook && sessionId && isMountedRef.current) {
      const currentTime = Date.now();
      const pollDuration = currentTime - (pollStartTime.current || 0);
      const maxPollTime = PAYMENT_MAX_POLL_TIME;

      // If payment record exists, webhook processed
      if (paymentCheck?.hasPayment) {
        console.log('Payment record found, webhook processing completed');
        if (isMountedRef.current) {
          setIsWaitingForWebhook(false);
          stableOnPaymentProcessed();

          // Clean up URL parameters to prevent duplicate processing
          cleanupUrl();

          // Reset tracking variables
          pollStartTime.current = undefined;
        }
      }
      // Check timeout
      else if (pollDuration > maxPollTime) {
        console.log(
          `Payment polling timeout after ${pollDuration}ms, stopping webhook wait`
        );
        if (isMountedRef.current) {
          setIsWaitingForWebhook(false);

          // Clean up URL parameters even on timeout
          cleanupUrl();

          // Reset tracking variables
          pollStartTime.current = undefined;
        }
      }
    }
  }, [
    isWaitingForWebhook,
    sessionId,
    paymentCheck,
    stableOnPaymentProcessed,
    cleanupUrl,
  ]);

  return {
    isWaitingForWebhook: isWaitingForWebhook && !paymentCheck?.hasPayment,
  };
}
