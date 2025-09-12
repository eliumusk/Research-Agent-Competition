'use server';

import { getDb } from '@/db';
import { payment } from '@/db/schema';
import { userActionClient } from '@/lib/safe-action';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const checkPaymentCompletionSchema = z.object({
  sessionId: z.string(),
});

/**
 * Check if a payment completion record exists for the given session ID
 */
export const checkPaymentCompletionAction = userActionClient
  .schema(checkPaymentCompletionSchema)
  .action(async ({ parsedInput: { sessionId } }) => {
    try {
      const db = await getDb();
      const paymentRecord = await db
        .select()
        .from(payment)
        .where(eq(payment.sessionId, sessionId))
        .limit(1);

      const hasPayment = paymentRecord.length > 0;
      console.log('Check payment completion success, hasPayment:', hasPayment);
      return {
        success: true,
        hasPayment, // TEST: return false to test polling behavior
        payment: paymentRecord[0] || null,
      };
    } catch (error) {
      console.error('Check payment completion error:', error);
      return {
        success: false,
        error: 'Failed to check payment completion',
      };
    }
  });
