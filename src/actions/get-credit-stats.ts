'use server';

import { CREDIT_TRANSACTION_TYPE } from '@/credits/types';
import { getDb } from '@/db';
import { creditTransaction } from '@/db/schema';
import type { User } from '@/lib/auth-types';
import { userActionClient } from '@/lib/safe-action';
import { addDays } from 'date-fns';
import { and, eq, gte, isNotNull, lte, sql, sum } from 'drizzle-orm';

const CREDITS_EXPIRATION_DAYS = 31;
const CREDITS_MONTHLY_DAYS = 31;

/**
 * Get credit statistics for a user
 */
export const getCreditStatsAction = userActionClient.action(async ({ ctx }) => {
  try {
    const currentUser = (ctx as { user: User }).user;
    const userId = currentUser.id;

    const db = await getDb();
    // Get credits expiring in the next CREDITS_EXPIRATION_DAYS days
    const expirationDaysFromNow = addDays(new Date(), CREDITS_EXPIRATION_DAYS);
    const expiringCredits = await db
      .select({
        amount: sum(creditTransaction.remainingAmount),
        earliestExpiration: sql<Date>`MIN(${creditTransaction.expirationDate})`,
      })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          isNotNull(creditTransaction.expirationDate),
          isNotNull(creditTransaction.remainingAmount),
          gte(creditTransaction.remainingAmount, 1),
          lte(creditTransaction.expirationDate, expirationDaysFromNow),
          gte(creditTransaction.expirationDate, new Date())
        )
      );

    // Get credits from subscription renewals (recent CREDITS_MONTHLY_DAYS days)
    const monthlyRefreshDaysAgo = addDays(new Date(), -CREDITS_MONTHLY_DAYS);
    const subscriptionCredits = await db
      .select({
        amount: sum(creditTransaction.amount),
      })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          eq(
            creditTransaction.type,
            CREDIT_TRANSACTION_TYPE.SUBSCRIPTION_RENEWAL
          ),
          gte(creditTransaction.createdAt, monthlyRefreshDaysAgo)
        )
      );

    // Get credits from monthly lifetime distribution (recent CREDITS_MONTHLY_DAYS days)
    const lifetimeCredits = await db
      .select({
        amount: sum(creditTransaction.amount),
      })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          eq(creditTransaction.type, CREDIT_TRANSACTION_TYPE.LIFETIME_MONTHLY),
          gte(creditTransaction.createdAt, monthlyRefreshDaysAgo)
        )
      );

    return {
      success: true,
      data: {
        expiringCredits: {
          amount: Number(expiringCredits[0]?.amount) || 0,
          earliestExpiration: expiringCredits[0]?.earliestExpiration || null,
        },
        subscriptionCredits: {
          amount: Number(subscriptionCredits[0]?.amount) || 0,
        },
        lifetimeCredits: {
          amount: Number(lifetimeCredits[0]?.amount) || 0,
        },
      },
    };
  } catch (error) {
    console.error('get credit stats error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch credit statistics',
    };
  }
});
