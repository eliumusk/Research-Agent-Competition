'use client';

import { getCreditStatsAction } from '@/actions/get-credit-stats';
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
import { useCredits } from '@/hooks/use-credits';
import { useMounted } from '@/hooks/use-mounted';
import { usePayment } from '@/hooks/use-payment';
import { LocaleLink, useLocaleRouter } from '@/i18n/navigation';
import { formatDate } from '@/lib/formatter';
import { cn } from '@/lib/utils';
import { Routes } from '@/routes';
import { RefreshCwIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

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

  // Use the credits hook to get balance
  const {
    balance,
    isLoading: isLoadingBalance,
    error,
    fetchCredits,
  } = useCredits();

  // Get payment info to check plan type
  const { currentPlan } = usePayment();

  // State for credit statistics
  const [creditStats, setCreditStats] = useState<{
    expiringCredits: {
      amount: number;
      earliestExpiration: string | Date | null;
    };
    subscriptionCredits: { amount: number };
    lifetimeCredits: { amount: number };
  } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Fetch credit statistics
  const fetchCreditStats = useCallback(async () => {
    console.log('fetchCreditStats, fetch start');
    setIsLoadingStats(true);
    try {
      const result = await getCreditStatsAction();
      if (result?.data?.success && result.data.data) {
        setCreditStats(result.data.data);
      } else {
        console.error('fetchCreditStats, failed to fetch credit stats', result);
      }
    } catch (error) {
      console.error('fetchCreditStats, error:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Fetch stats on component mount
  useEffect(() => {
    fetchCreditStats();
  }, []);

  // Check for payment success and show success message
  useEffect(() => {
    const sessionId = searchParams.get('credits_session_id');
    if (sessionId && !hasHandledSession.current) {
      hasHandledSession.current = true;

      setTimeout(() => {
        // Show success toast and refresh data after payment
        toast.success(t('creditsAdded'));

        // Force refresh credits data to show updated balance
        fetchCredits(true);
        // Refresh credit stats
        fetchCreditStats();
      }, 0);

      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('credits_session_id');
      localeRouter.replace(Routes.SettingsBilling + url.search);
    }
  }, [searchParams, localeRouter, fetchCredits, fetchCreditStats, t]);

  // Retry all data fetching
  const handleRetry = useCallback(() => {
    // console.log('handleRetry, refetch credits data');
    // Force refresh credits balance (ignore cache)
    fetchCredits(true);
    // Refresh credit stats
    fetchCreditStats();
  }, [fetchCredits, fetchCreditStats]);

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
            <Skeleton className="h-6 w-2/5" />
            <Skeleton className="h-6 w-3/5" />
          </div>
        </CardContent>
        <CardFooter className="mt-2 px-6 py-4 flex justify-end items-center bg-background rounded-none">
          <Skeleton className="h-10 w-1/2" />
        </CardFooter>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className={cn('w-full overflow-hidden pt-6 pb-0 flex flex-col')}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          <div className="text-destructive text-sm">{error}</div>
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
      <CardFooter className="mt-2 px-6 py-4 flex justify-end items-center bg-background rounded-none">
        <Button variant="default" className="cursor-pointer" asChild>
          <LocaleLink href={Routes.SettingsCredits}>
            {t('viewTransactions')}
          </LocaleLink>
        </Button>
      </CardFooter>
    </Card>
  );
}
