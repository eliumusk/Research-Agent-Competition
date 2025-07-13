'use server';

import { getUserCredits } from '@/credits/credits';
import { getSession } from '@/lib/server';
import { createSafeActionClient } from 'next-safe-action';

const actionClient = createSafeActionClient();

/**
 * Get current user's credits
 */
export const getCreditBalanceAction = actionClient.action(async () => {
  const session = await getSession();
  if (!session) {
    console.warn('unauthorized request to get credit balance');
    return { success: false, error: 'Unauthorized' };
  }

  const credits = await getUserCredits(session.user.id);
  return { success: true, credits };
});
