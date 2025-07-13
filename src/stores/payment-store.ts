import { getActiveSubscriptionAction } from '@/actions/get-active-subscription';
import { getLifetimeStatusAction } from '@/actions/get-lifetime-status';
import type { Session } from '@/lib/auth-types';
import { getAllPricePlans } from '@/lib/price-plan';
import type { PricePlan, Subscription } from '@/payment/types';
import { create } from 'zustand';

// Cache duration: 2 minutes (optimized for better UX)
const CACHE_DURATION = 2 * 60 * 1000;

/**
 * Payment state interface
 */
export interface PaymentState {
  // Current plan
  currentPlan: PricePlan | null;
  // Active subscription
  subscription: Subscription | null;
  // Loading state
  isLoading: boolean;
  // Error state
  error: string | null;
  // Last fetch timestamp to avoid frequent requests
  lastFetchTime: number | null;

  // Actions
  fetchPayment: (
    user: Session['user'] | null | undefined,
    force?: boolean
  ) => Promise<void>;
  resetState: () => void;
}

/**
 * Payment store using Zustand
 * Manages the user's payment and subscription data globally
 */
export const usePaymentStore = create<PaymentState>((set, get) => ({
  // Initial state
  currentPlan: null,
  subscription: null,
  isLoading: false,
  error: null,
  lastFetchTime: null,

  /**
   * Fetch payment and subscription data for the current user
   * @param user Current user from auth session
   */
  fetchPayment: async (user, force = false) => {
    // Skip if already loading
    if (get().isLoading) return;

    // Skip if no user is provided
    if (!user) {
      set({
        currentPlan: null,
        subscription: null,
        error: null,
        lastFetchTime: null,
      });
      return;
    }

    // Check if we have recent data (within cache duration) unless force refresh
    if (!force) {
      const { lastFetchTime } = get();
      const now = Date.now();
      if (lastFetchTime && now - lastFetchTime < CACHE_DURATION) {
        console.log('fetchPayment, use cached data');
        return; // Use cached data
      }
    }

    // Fetch subscription data
    set({ isLoading: true, error: null });

    // Get all price plans
    const plans: PricePlan[] = getAllPricePlans();
    const freePlan = plans.find((plan) => plan.isFree);
    const lifetimePlan = plans.find((plan) => plan.isLifetime);

    // Check if user is a lifetime member directly from the database
    let isLifetimeMember = false;
    try {
      const result = await getLifetimeStatusAction({ userId: user.id });
      if (result?.data?.success) {
        isLifetimeMember = result.data.isLifetimeMember || false;
        console.log('fetchPayment, lifetime status', isLifetimeMember);
      } else {
        console.warn(
          'fetchPayment, lifetime status error',
          result?.data?.error
        );
      }
    } catch (error) {
      console.error('fetchPayment, lifetime status error:', error);
    }

    // If lifetime member, set the lifetime plan
    if (isLifetimeMember) {
      console.log('fetchPayment, set lifetime plan');
      set({
        currentPlan: lifetimePlan || null,
        subscription: null,
        isLoading: false,
        error: null,
        lastFetchTime: Date.now(),
      });
      return;
    }

    try {
      // Check if user has an active subscription
      const result = await getActiveSubscriptionAction({ userId: user.id });
      if (result?.data?.success) {
        const activeSubscription = result.data.data;

        // Set subscription state
        if (activeSubscription) {
          const plan =
            plans.find((p) =>
              p.prices.find(
                (price) => price.priceId === activeSubscription.priceId
              )
            ) || null;
          console.log('fetchPayment, subscription found, set pro plan');
          set({
            currentPlan: plan,
            subscription: activeSubscription,
            isLoading: false,
            error: null,
            lastFetchTime: Date.now(),
          });
        } else {
          // No subscription found - set to free plan
          console.log('fetchPayment, no subscription found, set free plan');
          set({
            currentPlan: freePlan || null,
            subscription: null,
            isLoading: false,
            error: null,
            lastFetchTime: Date.now(),
          });
        }
      } else {
        // Failed to fetch subscription
        console.error(
          'fetchPayment, subscription for user failed',
          result?.data?.error
        );
        set({
          error: result?.data?.error || 'Failed to fetch payment data',
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('fetchPayment, error:', error);
      set({
        error: 'Failed to fetch payment data',
        isLoading: false,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Reset payment state
   */
  resetState: () => {
    set({
      currentPlan: null,
      subscription: null,
      isLoading: false,
      error: null,
      lastFetchTime: null,
    });
  },
}));
