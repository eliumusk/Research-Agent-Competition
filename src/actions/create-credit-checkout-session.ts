'use server';

import { websiteConfig } from '@/config/website';
import { getCreditPackageById } from '@/credits/server';
import { getSession } from '@/lib/server';
import { getUrlWithLocale } from '@/lib/urls/urls';
import { createCreditCheckout } from '@/payment';
import type { CreateCreditCheckoutParams } from '@/payment/types';
import { Routes } from '@/routes';
import { getLocale } from 'next-intl/server';
import { createSafeActionClient } from 'next-safe-action';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Create a safe action client
const actionClient = createSafeActionClient();

// Credit checkout schema for validation
// metadata is optional, and may contain referral information if you need
const creditCheckoutSchema = z.object({
  userId: z.string().min(1, { error: 'User ID is required' }),
  packageId: z.string().min(1, { error: 'Package ID is required' }),
  priceId: z.string().min(1, { error: 'Price ID is required' }),
  metadata: z.record(z.string(), z.string()).optional(),
});

/**
 * Create a checkout session for a credit package
 */
export const createCreditCheckoutSession = actionClient
  .schema(creditCheckoutSchema)
  .action(async ({ parsedInput }) => {
    const { userId, packageId, priceId, metadata } = parsedInput;

    // Get the current user session for authorization
    const session = await getSession();
    if (!session) {
      console.warn(
        `unauthorized request to create credit checkout session for user ${userId}`
      );
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Only allow users to create their own checkout session
    if (session.user.id !== userId) {
      console.warn(
        `current user ${session.user.id} is not authorized to create credit checkout session for user ${userId}`
      );
      return {
        success: false,
        error: 'Not authorized to do this action',
      };
    }

    try {
      // Get the current locale from the request
      const locale = await getLocale();

      // Find the credit package
      const creditPackage = getCreditPackageById(packageId);
      if (!creditPackage) {
        return {
          success: false,
          error: 'Credit package not found',
        };
      }

      // Add metadata to identify this as a credit purchase
      const customMetadata: Record<string, string> = {
        ...metadata,
        type: 'credit_purchase',
        packageId,
        credits: creditPackage.credits.toString(),
        userId: session.user.id,
        userName: session.user.name,
      };

      // https://datafa.st/docs/stripe-checkout-api
      // if datafast analytics is enabled, add the revenue attribution to the metadata
      if (websiteConfig.features.enableDatafastRevenueTrack) {
        const cookieStore = await cookies();
        customMetadata.datafast_visitor_id =
          cookieStore.get('datafast_visitor_id')?.value ?? '';
        customMetadata.datafast_session_id =
          cookieStore.get('datafast_session_id')?.value ?? '';
      }

      // Create checkout session with credit-specific URLs
      const successUrl = getUrlWithLocale(
        `${Routes.SettingsBilling}?credits_session_id={CHECKOUT_SESSION_ID}`,
        locale
      );
      const cancelUrl = getUrlWithLocale(Routes.SettingsBilling, locale);

      const params: CreateCreditCheckoutParams = {
        packageId,
        priceId,
        customerEmail: session.user.email,
        metadata: customMetadata,
        successUrl,
        cancelUrl,
        locale,
      };

      const result = await createCreditCheckout(params);
      // console.log('create credit checkout session result:', result);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Create credit checkout session error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create checkout session',
      };
    }
  });
