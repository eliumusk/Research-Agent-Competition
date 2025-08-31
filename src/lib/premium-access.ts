import { getDb } from '@/db';
import { payment } from '@/db/schema';
import { findPlanByPriceId, getAllPricePlans } from '@/lib/price-plan';
import { PaymentTypes } from '@/payment/types';
import { and, eq, gt, isNull, or } from 'drizzle-orm';

/**
 * Check premium access for a specific user ID
 *
 * This function combines the logic from getLifetimeStatusAction and getActiveSubscriptionAction
 * but optimizes it for a single database query to check premium access.
 */
export async function checkPremiumAccess(userId: string): Promise<boolean> {
  try {
    const db = await getDb();

    // Get lifetime plan IDs for efficient checking
    const plans = getAllPricePlans();
    const lifetimePlanIds = plans
      .filter((plan) => plan.isLifetime)
      .map((plan) => plan.id);

    // Single optimized query to check both lifetime and active subscriptions
    const result = await db
      .select({
        id: payment.id,
        priceId: payment.priceId,
        type: payment.type,
        status: payment.status,
        periodEnd: payment.periodEnd,
        cancelAtPeriodEnd: payment.cancelAtPeriodEnd,
      })
      .from(payment)
      .where(
        and(
          eq(payment.userId, userId),
          or(
            // Check for completed lifetime payments
            and(
              eq(payment.type, PaymentTypes.ONE_TIME),
              eq(payment.status, 'completed')
            ),
            // Check for active subscriptions that haven't expired
            and(
              eq(payment.type, PaymentTypes.SUBSCRIPTION),
              eq(payment.status, 'active'),
              or(
                // Either period hasn't ended yet
                gt(payment.periodEnd, new Date()),
                // Or period end is null (ongoing subscription)
                isNull(payment.periodEnd)
              )
            )
          )
        )
      );

    if (!result || result.length === 0) {
      return false;
    }

    // Check if any payment grants premium access
    return result.some((p) => {
      // For one-time payments, check if it's a lifetime plan
      if (p.type === PaymentTypes.ONE_TIME && p.status === 'completed') {
        const plan = findPlanByPriceId(p.priceId);
        return plan && lifetimePlanIds.includes(plan.id);
      }

      // For subscriptions, check if they're active and not expired
      if (p.type === PaymentTypes.SUBSCRIPTION && p.status === 'active') {
        // If periodEnd is null, it's an ongoing subscription
        if (!p.periodEnd) {
          return true;
        }

        // Check if the subscription period hasn't ended yet
        const now = new Date();
        const periodEnd = new Date(p.periodEnd);
        return periodEnd > now;
      }

      return false;
    });
  } catch (error) {
    console.error('Error checking premium access for user:', error);
    return false;
  }
}
