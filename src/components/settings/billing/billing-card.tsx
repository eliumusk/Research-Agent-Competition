'use client';

import { CustomerPortalButton } from '@/components/pricing/customer-portal-button';
import { Badge } from '@/components/ui/badge';
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
import { usePricePlans } from '@/config/price-config';
import { useMounted } from '@/hooks/use-mounted';
import { useCurrentPlan } from '@/hooks/use-payment';
import { usePaymentCompletion } from '@/hooks/use-payment-completion';
import { LocaleLink } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';
import { formatDate } from '@/lib/formatter';
import { cn } from '@/lib/utils';
import { Routes } from '@/routes';
import { CheckCircleIcon, ClockIcon, RefreshCwIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Billing card, show current plan and subscription status
 */
export default function BillingCard() {
  const t = useTranslations('Dashboard.settings.billing');
  const mounted = useMounted();
  const searchParams = useSearchParams();

  // Get user session for customer ID
  const { data: session, isPending: isLoadingSession } =
    authClient.useSession();
  const currentUser = session?.user;

  // Step 1: Handle payment completion checking (if there's a sessionId)
  const { isWaitingForWebhook } = usePaymentCompletion({
    onPaymentProcessed: () => {
      // Use setTimeout to avoid React rendering conflicts
      setTimeout(() => {
        console.log('payment success');
        toast.success(t('paymentSuccess'));
      }, 0);
    },
  });

  // Check for session_id to determine if we should wait for webhook
  const sessionId = searchParams.get('session_id');
  const shouldWaitForWebhook = !!sessionId || isWaitingForWebhook;

  // Step 2: Get current plan data (only when not waiting for webhook)
  const {
    data: paymentData,
    isLoading: isLoadingPayment,
    error: loadPaymentError,
    refetch: refetchPayment,
  } = useCurrentPlan(currentUser?.id, !shouldWaitForWebhook);

  const currentPlan = paymentData?.currentPlan;
  const subscription = paymentData?.subscription;

  // Get price plans with translations - must be called here to maintain hook order
  const pricePlans = usePricePlans();
  const plans = Object.values(pricePlans);

  // Convert current plan to a plan with translations
  const currentPlanWithTranslations = currentPlan
    ? plans.find((plan) => plan.id === currentPlan?.id)
    : null;
  const isFreePlan = currentPlanWithTranslations?.isFree || false;
  const isLifetimeMember = currentPlanWithTranslations?.isLifetime || false;

  // Get current period start date
  const currentPeriodStart = subscription?.currentPeriodStart
    ? formatDate(subscription.currentPeriodStart)
    : null;

  // Get current period end date
  const currentPeriodEnd = subscription?.currentPeriodEnd
    ? formatDate(subscription.currentPeriodEnd)
    : null;

  // Get current trial end date
  const trialEndDate = subscription?.trialEndDate
    ? formatDate(subscription.trialEndDate)
    : null;

  // Retry payment data fetching
  const handleRetry = useCallback(() => {
    // console.log('handleRetry, refetch payment info');
    refetchPayment();
  }, [refetchPayment]);

  // Render loading skeleton if not mounted or in a loading state
  console.log(
    'billing card, loading payment:',
    isLoadingPayment,
    'loading session:',
    isLoadingSession,
    'waiting for webhook:',
    shouldWaitForWebhook
  );
  if (
    !mounted ||
    isLoadingPayment ||
    isLoadingSession ||
    shouldWaitForWebhook
  ) {
    return (
      <Card className={cn('w-full overflow-hidden pt-6 pb-0 flex flex-col')}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {t('currentPlan.title')}
          </CardTitle>
          <CardDescription>{t('currentPlan.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          <div className="flex items-center justify-start space-x-4">
            <Skeleton className="h-8 w-1/5" />
          </div>
          <div className="text-sm text-muted-foreground space-y-2">
            <Skeleton className="h-6 w-3/5" />
          </div>
        </CardContent>
        <CardFooter className="mt-2 px-6 py-4 flex justify-end items-center bg-muted rounded-none">
          <Skeleton className="h-8 w-1/4" />
        </CardFooter>
      </Card>
    );
  }

  // Render error state
  if (loadPaymentError) {
    return (
      <Card className={cn('w-full overflow-hidden pt-6 pb-0 flex flex-col')}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {t('currentPlan.title')}
          </CardTitle>
          <CardDescription>{t('currentPlan.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          <div className="text-destructive text-sm">
            {loadPaymentError?.message}
          </div>
        </CardContent>
        <CardFooter className="mt-2 px-6 py-4 flex justify-end items-center bg-muted rounded-none">
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

  // currentPlan maybe null, so we need to check if it is null
  if (!currentPlanWithTranslations) {
    return (
      <Card className={cn('w-full overflow-hidden pt-6 pb-0 flex flex-col')}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {t('currentPlan.title')}
          </CardTitle>
          <CardDescription>{t('currentPlan.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {t('currentPlan.noPlan')}
          </div>
        </CardContent>
        <CardFooter className="mt-2 px-6 py-4 flex justify-end items-center bg-muted rounded-none">
          <Button variant="default" className="cursor-pointer" asChild>
            <LocaleLink href={Routes.Pricing}>{t('upgradePlan')}</LocaleLink>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // console.log('billing card, currentPlan', currentPlan);
  // console.log('billing card, subscription', subscription);
  // console.log('billing card, currentUser', currentUser);

  return (
    <Card className={cn('w-full overflow-hidden pt-6 pb-0 flex flex-col')}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {t('currentPlan.title')}
        </CardTitle>
        <CardDescription>{t('currentPlan.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        {/* Plan name and status */}
        <div className="flex items-center justify-start space-x-4">
          <div className="text-3xl font-medium">
            {currentPlanWithTranslations?.name}
          </div>
          {subscription &&
            (subscription.status === 'trialing' ||
              subscription.status === 'active') && (
              <Badge variant="outline" className="text-xs">
                {subscription.status === 'trialing' ? (
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="size-3 mr-1 text-amber-600" />
                    {t('status.trial')}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="size-3 mr-1 text-green-600" />
                    {t('status.active')}
                  </div>
                )}
              </Badge>
            )}
        </div>

        {/* Free plan message */}
        {isFreePlan && (
          <div className="text-sm text-muted-foreground">
            {t('freePlanMessage')}
          </div>
        )}

        {/* Lifetime plan message */}
        {isLifetimeMember && (
          <div className="text-sm text-muted-foreground">
            {t('lifetimeMessage')}
          </div>
        )}

        {/* Subscription plan message */}
        {subscription && (
          <div className="text-sm text-muted-foreground space-y-2">
            {currentPeriodStart && (
              <div className="text-muted-foreground">
                {t('periodStartDate')} {currentPeriodStart}
              </div>
            )}

            {currentPeriodEnd && (
              <div className="text-muted-foreground">
                {t('periodEndDate')} {currentPeriodEnd}
              </div>
            )}

            {subscription.status === 'trialing' && trialEndDate && (
              <div className="text-amber-600">
                {t('trialEnds')} {trialEndDate}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="mt-2 px-6 py-4 flex justify-end items-center bg-muted rounded-none">
        {/* user is on free plan, show upgrade plan button */}
        {isFreePlan && (
          <Button variant="default" className="cursor-pointer" asChild>
            <LocaleLink href={Routes.Pricing}>{t('upgradePlan')}</LocaleLink>
          </Button>
        )}

        {/* user is lifetime member, show manage billing button */}
        {isLifetimeMember && currentUser && (
          <CustomerPortalButton userId={currentUser.id} className="">
            {t('manageBilling')}
          </CustomerPortalButton>
        )}

        {/* user has subscription, show manage subscription button */}
        {subscription && currentUser && (
          <CustomerPortalButton userId={currentUser.id} className="">
            {t('manageSubscription')}
          </CustomerPortalButton>
        )}
      </CardFooter>
    </Card>
  );
}
