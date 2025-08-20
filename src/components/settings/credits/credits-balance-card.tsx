'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { websiteConfig } from '@/config/website';
import { useCreditBalance, useCreditStats } from '@/hooks/use-credits-query';
import { useMounted } from '@/hooks/use-mounted';
import { useCurrentPlan } from '@/hooks/use-payment-query';
import { useLocaleRouter } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';
import { formatDate } from '@/lib/formatter';
import { cn } from '@/lib/utils';
import { Routes } from '@/routes';
import { RefreshCwIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Credits balance card, show credit balance
 */
export default function CreditsBalanceCard() {
  // Don't render if credits are disabled - move this check before any hooks
  if (!websiteConfig.credits.enableCredits) {
    return null;
  }

  const t = useTranslations('Dashboard.settings.credits.balance');
  const searchParams = useSearchParams();
  const localeRouter = useLocaleRouter();
  const hasHandledSession = useRef(false);
  const mounted = useMounted();

  // Use TanStack Query hooks for credits
  const {
    data: balance = 0,
    isLoading: isLoadingBalance,
    error,
    refetch: refetchCredits,
  } = useCreditBalance();

  // Get payment info to check plan type
  const { data: session } = authClient.useSession();
  const { data: paymentData } = useCurrentPlan(session?.user?.id);
  const currentPlan = paymentData?.currentPlan;

  // TanStack Query hook for credit statistics
  const {
    data: creditStats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchCreditStats,
  } = useCreditStats();

  // Check for payment success and show success message
  useEffect(() => {
    const sessionId = searchParams.get('credits_session_id');
    if (sessionId && !hasHandledSession.current) {
      hasHandledSession.current = true;

      setTimeout(() => {
        // Show success toast and refresh data after payment
        toast.success(t('creditsAdded'));

        // Force refresh credits data to show updated balance
        refetchCredits();
        // Refresh credit stats
        refetchCreditStats();
      }, 0);

      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('credits_session_id');
      localeRouter.replace(Routes.SettingsCredits + url.search);
    }
  }, [searchParams, localeRouter, refetchCredits, refetchCreditStats, t]);

  // Retry all data fetching
  const handleRetry = useCallback(() => {
    // console.log('handleRetry, refetch credits data');
    // Force refresh credits balance (ignore cache)
    refetchCredits();
    // Refresh credit stats
    refetchCreditStats();
  }, [refetchCredits, refetchCreditStats]);

  // Render loading skeleton
  const isPageLoading = isLoadingBalance || isLoadingStats;
  if (!mounted || isPageLoading) {
    return (
      <Card className={cn('w-full overflow-hidden pt-6 pb-0 flex flex-col')}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          <div className="flex items-center justify-start space-x-4">
            <Skeleton className="h-6 w-1/5" />
          </div>
          <div className="text-sm text-muted-foreground space-y-2">
            <Skeleton className="h-6 w-3/5" />
          </div>
        </CardContent>
        <CardFooter className="">{/* show nothing */}</CardFooter>
      </Card>
    );
  }

  // Render error state
  if (error || statsError) {
    return (
      <Card className={cn('w-full overflow-hidden pt-6 pb-0 flex flex-col')}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          <div className="text-destructive text-sm">
            {error?.message || statsError?.message}
          </div>
        </CardContent>
        <CardFooter className="mt-2 px-6 py-4 flex justify-end items-center bg-background rounded-none">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={handleRetry}
          >
            <RefreshCwIcon className="size-4 mr-1" />
            {t('retry')}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full overflow-hidden pt-6 pb-0 flex flex-col')}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        {/* Credits balance display */}
        <div className="flex items-center justify-start space-x-4">
          <div className="flex items-center space-x-2">
            {/* <CoinsIcon className="h-6 w-6 text-muted-foreground" /> */}
            <div className="text-3xl font-medium">
              {balance.toLocaleString()}
            </div>
          </div>
          {/* <Badge variant="outline">available</Badge> */}
        </div>

        {/* Balance information */}
        <div className="text-sm text-muted-foreground space-y-2">
          {/* Plan-based credits info */}
          {!isLoadingStats && creditStats && (
            <>
              {/* Subscription credits (for paid plans) */}
              {!currentPlan?.isFree &&
                (creditStats.subscriptionCredits.amount > 0 ||
                  creditStats.lifetimeCredits.amount > 0) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>
                      {currentPlan?.isLifetime
                        ? t('lifetimeCredits', {
                            credits: creditStats.lifetimeCredits.amount,
                          })
                        : t('subscriptionCredits', {
                            credits: creditStats.subscriptionCredits.amount,
                          })}
                    </span>
                  </div>
                )}

              {/* Expiring credits warning */}
              {creditStats.expiringCredits.amount > 0 &&
                creditStats.expiringCredits.earliestExpiration && (
                  <div className="flex items-center gap-2 text-amber-600">
                    <span>
                      {t('expiringCredits', {
                        credits: creditStats.expiringCredits.amount,
                        date: formatDate(
                          new Date(
                            creditStats.expiringCredits.earliestExpiration
                          )
                        ),
                      })}
                    </span>
                  </div>
                )}
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="">
        {/* <Button variant="default" className="cursor-pointer" asChild>
          <LocaleLink href={Routes.SettingsCredits}>
            {t('viewTransactions')}
          </LocaleLink>
        </Button> */}
      </CardFooter>
    </Card>
  );
}
