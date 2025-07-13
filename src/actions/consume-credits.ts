'use server';

import { consumeCredits } from '@/credits/credits';
import { getSession } from '@/lib/server';
import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';

const actionClient = createSafeActionClient();

// consume credits schema
const consumeSchema = z.object({
  amount: z.number().min(1),
  description: z.string().optional(),
});

/**
 * Consume credits
 */
export const consumeCreditsAction = actionClient
  .schema(consumeSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session) {
      console.warn('unauthorized request to consume credits');
      return { success: false, error: 'Unauthorized' };
    }

    try {
      await consumeCredits({
        userId: session.user.id,
        amount: parsedInput.amount,
        description:
          parsedInput.description || `Consume credits: ${parsedInput.amount}`,
      });
      return { success: true };
    } catch (error) {
      console.error('consume credits error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      };
    }
  });
