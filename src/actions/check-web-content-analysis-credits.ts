'use server';

import { getWebContentAnalysisCost } from '@/ai/text/utils/web-content-analyzer-config';
import { getUserCredits, hasEnoughCredits } from '@/credits/credits';
import { getSession } from '@/lib/server';
import { createSafeActionClient } from 'next-safe-action';

const actionClient = createSafeActionClient();

/**
 * Check if user has enough credits for web content analysis
 */
export const checkWebContentAnalysisCreditsAction = actionClient.action(
  async () => {
    const session = await getSession();
    if (!session) {
      console.warn(
        'unauthorized request to check web content analysis credits'
      );
      return { success: false, error: 'Unauthorized' };
    }

    try {
      const requiredCredits = getWebContentAnalysisCost();
      const currentCredits = await getUserCredits(session.user.id);
      const hasCredits = await hasEnoughCredits({
        userId: session.user.id,
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
