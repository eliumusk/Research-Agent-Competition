import { consumeCreditsAction } from '@/actions/consume-credits';
import { getCreditBalanceAction } from '@/actions/get-credit-balance';
import type { Session } from '@/lib/auth-types';
import { create } from 'zustand';

// Cache duration: 2 minutes (optimized for better UX)
const CACHE_DURATION = 2 * 60 * 1000;

/**
 * Credits state interface
 */
export interface CreditsState {
  // Current credit balance
  balance: number;
  // Loading state
  isLoading: boolean;
  // Error state
  error: string | null;
  // Last fetch timestamp to avoid frequent requests
  lastFetchTime: number | null;

  // Actions
  fetchCredits: (
    user: Session['user'] | null | undefined,
    force?: boolean
  ) => Promise<void>;
  consumeCredits: (amount: number, description: string) => Promise<boolean>;
}

/**
 * Credits store using Zustand
 * Manages the user's credit balance globally with caching and optimistic updates
 */
export const useCreditsStore = create<CreditsState>((set, get) => ({
  // Initial state
  balance: 0,
  isLoading: false,
  error: null,
  lastFetchTime: null,

  /**
   * Fetch credit balance for the current user with optional cache bypass
   * @param user Current user from auth session
   * @param force Whether to force refresh and ignore cache
   */
  fetchCredits: async (user, force = false) => {
    // Skip if already loading
    if (get().isLoading) return;

    // Skip if no user is provided
    if (!user) {
      set({
        balance: 0,
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
        return; // Use cached data
      }
    }

    console.log(`fetchCredits, ${force ? 'force fetch' : 'fetch'} credits`);
    set({
      isLoading: true,
      error: null,
      // Clear cache if force refresh
      lastFetchTime: force ? null : get().lastFetchTime,
    });

    try {
      const result = await getCreditBalanceAction();
      if (result?.data?.success) {
        const newBalance = result.data.credits || 0;
        console.log('fetchCredits, set new balance', newBalance);
        set({
          balance: newBalance,
          isLoading: false,
          error: null,
          lastFetchTime: Date.now(),
        });
      } else {
        console.warn('fetchCredits, failed to fetch credit balance', result);
        set({
          error: result?.data?.error || 'Failed to fetch credit balance',
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('fetchCredits, error:', error);
      set({
        error: 'Failed to fetch credit balance',
        isLoading: false,
      });
    }
  },

  /**
   * Consume credits with optimistic updates
   * @param amount Amount of credits to consume
   * @param description Description for the transaction
   * @returns Promise<boolean> Success status
   */
  consumeCredits: async (amount: number, description: string) => {
    const { balance } = get();

    // Check if we have enough credits
    if (balance < amount) {
      console.log('consumeCredits, insufficient credits', balance, amount);
      set({
        error: 'Insufficient credits',
      });
      return false;
    }

    // Optimistically update the balance
    set({
      balance: balance - amount,
      error: null,
      isLoading: true,
    });

    try {
      const result = await consumeCreditsAction({
        amount,
        description,
      });

      if (result?.data?.success) {
        set({
          isLoading: false,
          error: null,
        });
        return true;
      }

      // Revert optimistic update on failure
      console.warn('consumeCredits, reverting optimistic update');
      set({
        balance: balance, // Revert to original balance
        error: result?.data?.error || 'Failed to consume credits',
        isLoading: false,
      });
      return false;
    } catch (error) {
      console.error('consumeCredits, error:', error);
      // Revert optimistic update on error
      set({
        balance: balance, // Revert to original balance
        error: 'Failed to consume credits',
        isLoading: false,
      });
      return false;
    }
  },
}));
