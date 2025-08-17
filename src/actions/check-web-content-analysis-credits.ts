'use server';

import { getWebContentAnalysisCost } from '@/ai/text/utils/web-content-analyzer-config';
import { getUserCredits, hasEnoughCredits } from '@/credits/credits';
import type { User } from '@/lib/auth-types';
import { userActionClient } from '@/lib/safe-action';

/**
 * Check if user has enough credits for web content analysis
 */
export const checkWebContentAnalysisCreditsAction = userActionClient.action(
  async ({ ctx }) => {
    const currentUser = (ctx as { user: User }).user;

    try {
      const requiredCredits = getWebContentAnalysisCost();
      const currentCredits = await getUserCredits(currentUser.id);
      const hasCredits = await hasEnoughCredits({
        userId: currentUser.id,
        requiredCredits,
      });

      return {
        success: true,
        hasEnoughCredits: hasCredits,
        currentCredits,
        requiredCredits,
      };
    } catch (error) {
      console.error('check web content analysis credits error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      };
    }
  }
);
