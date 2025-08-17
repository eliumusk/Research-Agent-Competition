'use server';

import { getUserCredits } from '@/credits/credits';
import type { User } from '@/lib/auth-types';
import { userActionClient } from '@/lib/safe-action';

/**
 * Get current user's credits
 */
export const getCreditBalanceAction = userActionClient.action(
  async ({ ctx }) => {
    const currentUser = (ctx as { user: User }).user;
    const credits = await getUserCredits(currentUser.id);
    return { success: true, credits };
  }
);
