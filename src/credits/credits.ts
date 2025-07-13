import { randomUUID } from 'crypto';
import { websiteConfig } from '@/config/website';
import { getDb } from '@/db';
import { creditTransaction, payment, user, userCredit } from '@/db/schema';
import { findPlanByPriceId } from '@/lib/price-plan';
import { addDays, isAfter } from 'date-fns';
import { and, asc, desc, eq, gt, isNull, not, or } from 'drizzle-orm';
import { CREDIT_TRANSACTION_TYPE } from './types';

/**
 * Get user's current credit balance
 * @param userId - User ID
 * @returns User's current credit balance
 */
export async function getUserCredits(userId: string): Promise<number> {
  const db = await getDb();
  const record = await db
    .select()
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);
  return record[0]?.currentCredits || 0;
}

/**
 * Update user's current credit balance
 * @param userId - User ID
 * @param credits - New credit balance
 */
export async function updateUserCredits(userId: string, credits: number) {
  const db = await getDb();
  await db
    .update(userCredit)
    .set({ currentCredits: credits, updatedAt: new Date() })
    .where(eq(userCredit.userId, userId));
}

/**
 * Update user's last refresh time
 * @param userId - User ID
 * @param date - Last refresh time
 */
export async function updateUserLastRefreshAt(userId: string, date: Date) {
  const db = await getDb();
  await db
    .update(userCredit)
    .set({ lastRefreshAt: date, updatedAt: new Date() })
    .where(eq(userCredit.userId, userId));
}

/**
 * Write a credit transaction record
 * @param params - Credit transaction parameters
 */
export async function saveCreditTransaction({
  userId,
  type,
  amount,
  description,
  paymentId,
  expirationDate,
}: {
  userId: string;
  type: string;
  amount: number;
  description: string;
  paymentId?: string;
  expirationDate?: Date;
}) {
  if (!userId || !type || !description) {
    console.error(
      'saveCreditTransaction, invalid params',
      userId,
      type,
      description
    );
    throw new Error('saveCreditTransaction, invalid params');
  }
  if (!Number.isFinite(amount) || amount === 0) {
    console.error('saveCreditTransaction, invalid amount', userId, amount);
    throw new Error('saveCreditTransaction, invalid amount');
  }
  const db = await getDb();
  await db.insert(creditTransaction).values({
    id: randomUUID(),
    userId,
    type,
    amount,
    // remaining amount is the same as amount for earn transactions
    // remaining amount is null for spend transactions
    remainingAmount: amount > 0 ? amount : null,
    description,
    paymentId,
    expirationDate,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

/**
 * Add credits (registration, monthly, purchase, etc.)
 * @param params - Credit creation parameters
 */
export async function addCredits({
  userId,
  amount,
  type,
  description,
  paymentId,
  expireDays,
}: {
  userId: string;
  amount: number;
  type: string;
  description: string;
  paymentId?: string;
  expireDays?: number;
}) {
  if (!userId || !type || !description) {
    console.error('addCredits, invalid params', userId, type, description);
    throw new Error('Invalid params');
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    console.error('addCredits, invalid amount', userId, amount);
    throw new Error('Invalid amount');
  }
  if (
    expireDays !== undefined &&
    (!Number.isFinite(expireDays) || expireDays <= 0)
  ) {
    console.error('addCredits, invalid expire days', userId, expireDays);
    throw new Error('Invalid expire days');
  }
  // Process expired credits first
  await processExpiredCredits(userId);
  // Update user credit balance
  const db = await getDb();
  const current = await db
    .select()
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);
  // const newBalance = (current[0]?.currentCredits || 0) + amount;
  if (current.length > 0) {
    const newBalance = (current[0]?.currentCredits || 0) + amount;
    console.log('addCredits, update user credit', userId, newBalance);
    await db
      .update(userCredit)
      .set({
        currentCredits: newBalance,
        // lastRefreshAt: new Date(), // NOTE: we can not update this field here
        updatedAt: new Date(),
      })
      .where(eq(userCredit.userId, userId));
  } else {
    const newBalance = amount;
    console.log('addCredits, insert user credit', userId, newBalance);
    await db.insert(userCredit).values({
      id: randomUUID(),
      userId,
      currentCredits: newBalance,
      // lastRefreshAt: new Date(), // NOTE: we can not update this field here
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  // Write credit transaction record
  await saveCreditTransaction({
    userId,
    type,
    amount,
    description,
    paymentId,
    expirationDate: expireDays ? addDays(new Date(), expireDays) : undefined,
  });
}

export async function hasEnoughCredits({
  userId,
  requiredCredits,
}: {
  userId: string;
  requiredCredits: number;
}) {
  const balance = await getUserCredits(userId);
  return balance >= requiredCredits;
}

/**
 * Consume credits (FIFO, by expiration)
 * @param params - Credit consumption parameters
 */
export async function consumeCredits({
  userId,
  amount,
  description,
}: {
  userId: string;
  amount: number;
  description: string;
}) {
  if (!userId || !description) {
    console.error('consumeCredits, invalid params', userId, description);
    throw new Error('Invalid params');
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    console.error('consumeCredits, invalid amount', userId, amount);
    throw new Error('Invalid amount');
  }
  // Process expired credits first
  await processExpiredCredits(userId);
  // Check balance
  if (!(await hasEnoughCredits({ userId, requiredCredits: amount }))) {
    console.error(
      `consumeCredits, insufficient credits for user ${userId}, required: ${amount}`
    );
    throw new Error('Insufficient credits');
  }
  // FIFO consumption: consume from the earliest unexpired credits first
  const db = await getDb();
  const now = new Date();
  const transactions = await db
    .select()
    .from(creditTransaction)
    .where(
      and(
        eq(creditTransaction.userId, userId),
        // Exclude usage and expire records (these are consumption/expiration logs)
        not(eq(creditTransaction.type, CREDIT_TRANSACTION_TYPE.USAGE)),
        not(eq(creditTransaction.type, CREDIT_TRANSACTION_TYPE.EXPIRE)),
        // Only include transactions with remaining amount > 0
        gt(creditTransaction.remainingAmount, 0),
        // Only include unexpired credits (either no expiration date or not yet expired)
        or(
          isNull(creditTransaction.expirationDate),
          gt(creditTransaction.expirationDate, now)
        )
      )
    )
    .orderBy(
      asc(creditTransaction.expirationDate),
      asc(creditTransaction.createdAt)
    );
  // Consume credits
  let remainingToDeduct = amount;
  for (const transaction of transactions) {
    if (remainingToDeduct <= 0) break;
    const remainingAmount = transaction.remainingAmount || 0;
    if (remainingAmount <= 0) continue;
    // credits to consume at most in this transaction
    const deductFromThis = Math.min(remainingAmount, remainingToDeduct);
    await db
      .update(creditTransaction)
      .set({
        remainingAmount: remainingAmount - deductFromThis,
        updatedAt: new Date(),
      })
      .where(eq(creditTransaction.id, transaction.id));
    remainingToDeduct -= deductFromThis;
  }
  // Update balance
  const current = await db
    .select()
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);
  const newBalance = (current[0]?.currentCredits || 0) - amount;
  await db
    .update(userCredit)
    .set({ currentCredits: newBalance, updatedAt: new Date() })
    .where(eq(userCredit.userId, userId));
  // Write usage record
  await saveCreditTransaction({
    userId,
    type: CREDIT_TRANSACTION_TYPE.USAGE,
    amount: -amount,
    description,
  });
}

/**
 * Process expired credits
 * @param userId - User ID
 */
export async function processExpiredCredits(userId: string) {
  const now = new Date();
  // Get all credit transactions that can expire (have expirationDate and not yet processed)
  const db = await getDb();
  const transactions = await db
    .select()
    .from(creditTransaction)
    .where(
      and(
        eq(creditTransaction.userId, userId),
        // Exclude usage and expire records (these are consumption/expiration logs)
        not(eq(creditTransaction.type, CREDIT_TRANSACTION_TYPE.USAGE)),
        not(eq(creditTransaction.type, CREDIT_TRANSACTION_TYPE.EXPIRE)),
        // Only include transactions with expirationDate set
        not(isNull(creditTransaction.expirationDate)),
        // Only include transactions not yet processed for expiration
        isNull(creditTransaction.expirationDateProcessedAt),
        // Only include transactions with remaining amount > 0
        gt(creditTransaction.remainingAmount, 0)
      )
    );
  let expiredTotal = 0;
  // Process expired credit transactions
  for (const transaction of transactions) {
    if (
      transaction.expirationDate &&
      isAfter(now, transaction.expirationDate) &&
      !transaction.expirationDateProcessedAt
    ) {
      const remain = transaction.remainingAmount || 0;
      if (remain > 0) {
        expiredTotal += remain;
        await db
          .update(creditTransaction)
          .set({
            remainingAmount: 0,
            expirationDateProcessedAt: now,
            updatedAt: now,
          })
          .where(eq(creditTransaction.id, transaction.id));
      }
    }
  }
  if (expiredTotal > 0) {
    // Deduct expired credits from balance
    const current = await db
      .select()
      .from(userCredit)
      .where(eq(userCredit.userId, userId))
      .limit(1);
    const newBalance = Math.max(
      0,
      (current[0]?.currentCredits || 0) - expiredTotal
    );
    await db
      .update(userCredit)
      .set({ currentCredits: newBalance, updatedAt: now })
      .where(eq(userCredit.userId, userId));
    // Write expire record
    await saveCreditTransaction({
      userId,
      type: CREDIT_TRANSACTION_TYPE.EXPIRE,
      amount: -expiredTotal,
      description: `Expire credits: ${expiredTotal}`,
    });

    console.log(
      `processExpiredCredits, ${expiredTotal} credits expired for user ${userId}`
    );
  }
}

/**
 * Add register gift credits
 * @param userId - User ID
 */
export async function addRegisterGiftCredits(userId: string) {
  if (!websiteConfig.credits.registerGiftCredits.enable) {
    console.log('addRegisterGiftCredits, disabled');
    return;
  }
  // Check if user has already received register gift credits
  const db = await getDb();
  const record = await db
    .select()
    .from(creditTransaction)
    .where(
      and(
        eq(creditTransaction.userId, userId),
        eq(creditTransaction.type, CREDIT_TRANSACTION_TYPE.REGISTER_GIFT)
      )
    )
    .limit(1);
  // add register gift credits if user has not received them yet
  if (record.length === 0) {
    const credits = websiteConfig.credits.registerGiftCredits.credits;
    const expireDays = websiteConfig.credits.registerGiftCredits.expireDays;
    await addCredits({
      userId,
      amount: credits,
      type: CREDIT_TRANSACTION_TYPE.REGISTER_GIFT,
      description: `Register gift credits: ${credits}`,
      expireDays,
    });

    console.log(
      `addRegisterGiftCredits, ${credits} credits for user ${userId}`
    );
  }
}

/**
 * Add free monthly credits
 * @param userId - User ID
 */
export async function addMonthlyFreeCredits(userId: string) {
  const freePlan = Object.values(websiteConfig.price.plans).find(
    (plan) => plan.isFree && !plan.disabled
  );
  if (!freePlan) {
    console.log('addMonthlyFreeCredits, no free plan found');
    return;
  }
  if (
    freePlan.disabled ||
    !freePlan.credits?.enable ||
    !freePlan.credits?.amount
  ) {
    console.log(
      'addMonthlyFreeCredits, plan disabled or credits disabled',
      freePlan.id
    );
    return;
  }
  // Check last refresh time
  const db = await getDb();
  const record = await db
    .select()
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);
  const now = new Date();
  let canAdd = false;
  // never added credits before
  if (!record[0]?.lastRefreshAt) {
    canAdd = true;
  } else {
    const last = new Date(record[0].lastRefreshAt);
    // different month or year means new month
    canAdd =
      now.getMonth() !== last.getMonth() ||
      now.getFullYear() !== last.getFullYear();
  }
  // add credits if it's a new month
  if (canAdd) {
    const credits = freePlan.credits.amount;
    const expireDays = freePlan.credits.expireDays;
    await addCredits({
      userId,
      amount: credits,
      type: CREDIT_TRANSACTION_TYPE.MONTHLY_REFRESH,
      description: `Free monthly credits: ${credits} for ${now.getFullYear()}-${now.getMonth() + 1}`,
      expireDays,
    });

    console.log(
      `addMonthlyFreeCredits, ${credits} credits for user ${userId}, date: ${now.getFullYear()}-${now.getMonth() + 1}`
    );
  }
}

/**
 * Add subscription renewal credits
 * @param userId - User ID
 * @param priceId - Price ID
 */
export async function addSubscriptionCredits(userId: string, priceId: string) {
  const pricePlan = findPlanByPriceId(priceId);
  if (
    !pricePlan ||
    pricePlan.isFree ||
    !pricePlan.credits ||
    !pricePlan.credits.enable
  ) {
    console.log(
      `addSubscriptionRenewalCredits, no credits configured for plan ${priceId}`
    );
    return;
  }

  const credits = pricePlan.credits.amount;
  const expireDays = pricePlan.credits.expireDays;
  const now = new Date();

  await addCredits({
    userId,
    amount: credits,
    type: CREDIT_TRANSACTION_TYPE.SUBSCRIPTION_RENEWAL,
    description: `Subscription renewal credits: ${credits} for ${now.getFullYear()}-${now.getMonth() + 1}`,
    expireDays,
  });

  console.log(
    `addSubscriptionRenewalCredits, ${credits} credits for user ${userId}, priceId: ${priceId}`
  );
}

/**
 * Add lifetime monthly credits
 * @param userId - User ID
 */
export async function addLifetimeMonthlyCredits(userId: string) {
  const lifetimePlan = Object.values(websiteConfig.price.plans).find(
    (plan) => plan.isLifetime && !plan.disabled
  );
  if (
    !lifetimePlan ||
    lifetimePlan.disabled ||
    !lifetimePlan.credits ||
    !lifetimePlan.credits.enable
  ) {
    console.log(
      'addLifetimeMonthlyCredits, plan disabled or credits disabled',
      lifetimePlan?.id
    );
    return;
  }

  // Check last refresh time to avoid duplicate monthly credits
  const db = await getDb();
  const record = await db
    .select()
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);

  const now = new Date();
  let canAdd = false;

  // Check if user has never received lifetime credits or it's a new month
  if (!record[0]?.lastRefreshAt) {
    canAdd = true;
  } else {
    const last = new Date(record[0].lastRefreshAt);
    // different month or year means new month
    canAdd =
      now.getMonth() !== last.getMonth() ||
      now.getFullYear() !== last.getFullYear();
  }

  // Add credits if it's a new month
  if (canAdd) {
    const credits = lifetimePlan.credits.amount;
    const expireDays = lifetimePlan.credits.expireDays;

    await addCredits({
      userId,
      amount: credits,
      type: CREDIT_TRANSACTION_TYPE.LIFETIME_MONTHLY,
      description: `Lifetime monthly credits: ${credits} for ${now.getFullYear()}-${now.getMonth() + 1}`,
      expireDays,
    });

    // Update last refresh time for lifetime credits
    await updateUserLastRefreshAt(userId, now);

    console.log(
      `addLifetimeMonthlyCredits, ${credits} credits for user ${userId}, date: ${now.getFullYear()}-${now.getMonth() + 1}`
    );
  }
}

/**
 * Distribute credits to all users based on their plan type
 * This function is designed to be called by a cron job
 */
export async function distributeCreditsToAllUsers() {
  console.log('distributing credits to all users start');

  const db = await getDb();

  // Get all users with their current active payments/subscriptions
  const users = await db
    .select({
      userId: user.id,
      email: user.email,
      name: user.name,
    })
    .from(user)
    .where(eq(user.banned, false)); // Only active users
  console.log('distributing credits to all users, users count:', users.length);

  let processedCount = 0;
  let errorCount = 0;

  for (const userRecord of users) {
    try {
      // Get user's current active subscription/payment
      const activePayments = await db
        .select()
        .from(payment)
        .where(
          and(
            eq(payment.userId, userRecord.userId),
            or(eq(payment.status, 'active'), eq(payment.status, 'trialing'))
          )
        )
        .orderBy(desc(payment.createdAt));

      if (activePayments.length > 0) {
        // User has active subscription - check what type
        const activePayment = activePayments[0];
        const pricePlan = findPlanByPriceId(activePayment.priceId);

        if (pricePlan?.isLifetime) {
          // Lifetime user - add monthly credits
          await addLifetimeMonthlyCredits(userRecord.userId);
        }
        // Note: Subscription renewals are handled by Stripe webhooks, not here
      } else {
        // User has no active subscription - add free monthly credits if enabled
        await addMonthlyFreeCredits(userRecord.userId);
      }

      processedCount++;
    } catch (error) {
      console.error(
        `distributing credits to all users error, user: ${userRecord.userId}, error:`,
        error
      );
      errorCount++;
    }
  }

  console.log(
    `distributing credits to all users end, processed: ${processedCount}, errors: ${errorCount}`
  );
  return { processedCount, errorCount };
}
