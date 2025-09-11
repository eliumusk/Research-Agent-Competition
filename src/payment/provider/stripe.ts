import { randomUUID } from 'crypto';
import { websiteConfig } from '@/config/website';
import {
  addCredits,
  addLifetimeMonthlyCredits,
  addSubscriptionCredits,
} from '@/credits/credits';
import { getCreditPackageById } from '@/credits/server';
import { CREDIT_TRANSACTION_TYPE } from '@/credits/types';
import { getDb } from '@/db';
import { payment, user } from '@/db/schema';
import { findPlanByPlanId, findPriceInPlan } from '@/lib/price-plan';
import { sendNotification } from '@/notification/notification';
import { desc, eq } from 'drizzle-orm';
import { Stripe } from 'stripe';
import {
  type CheckoutResult,
  type CreateCheckoutParams,
  type CreateCreditCheckoutParams,
  type CreatePortalParams,
  type PaymentProvider,
  type PaymentStatus,
  PaymentTypes,
  type PlanInterval,
  PlanIntervals,
  type PortalResult,
  type Subscription,
  type getSubscriptionsParams,
} from '../types';

/**
 * Stripe payment provider implementation
 *
 * docs:
 * https://mksaas.com/docs/payment
 */
export class StripeProvider implements PaymentProvider {
  private stripe: Stripe;
  private webhookSecret: string;

  /**
   * Initialize Stripe provider with API key
   */
  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set.');
    }

    // Initialize Stripe without specifying apiVersion to use default/latest version
    this.stripe = new Stripe(apiKey);
    this.webhookSecret = webhookSecret;
  }

  /**
   * Create a customer in Stripe if not exists
   * @param email Customer email
   * @param name Optional customer name
   * @returns Stripe customer ID
   */
  private async createOrGetCustomer(
    email: string,
    name?: string
  ): Promise<string> {
    try {
      // Search for existing customer
      const customers = await this.stripe.customers.list({
        email,
        limit: 1,
      });

      // Find existing customer
      if (customers.data && customers.data.length > 0) {
        const customerId = customers.data[0].id;

        // Find user id by customer id
        const userId = await this.findUserIdByCustomerId(customerId);
        // user does not exist, update user with customer id
        // in case you deleted user in database, but forgot to delete customer in Stripe
        if (!userId) {
          console.log('User does not exist, update with customer id (hidden)');
          await this.updateUserWithCustomerId(customerId, email);
        }
        return customerId;
      }

      // Create new customer
      const customer = await this.stripe.customers.create({
        email,
        name: name || undefined,
      });

      // Update user record in database with the new customer ID
      await this.updateUserWithCustomerId(customer.id, email);

      return customer.id;
    } catch (error) {
      console.error('Create or get customer error:', error);
      throw new Error('Failed to create or get customer');
    }
  }

  /**
   * Updates a user record with a Stripe customer ID
   * @param customerId Stripe customer ID
   * @param email Customer email
   * @returns Promise that resolves when the update is complete
   */
  private async updateUserWithCustomerId(
    customerId: string,
    email: string
  ): Promise<void> {
    try {
      // Update user record with customer ID if email matches
      const db = await getDb();
      const result = await db
        .update(user)
        .set({
          customerId: customerId,
          updatedAt: new Date(),
        })
        .where(eq(user.email, email))
        .returning({ id: user.id });

      if (result.length > 0) {
        console.log('Updated user with customer ID (hidden)');
      } else {
        console.log('No user found with given email');
      }
    } catch (error) {
      console.error('Update user with customer ID error:', error);
      throw new Error('Failed to update user with customer ID');
    }
  }

  /**
   * Finds a user by customerId
   * @param customerId Stripe customer ID
   * @returns User ID or undefined if not found
   */
  private async findUserIdByCustomerId(
    customerId: string
  ): Promise<string | undefined> {
    try {
      // Query the user table for a matching customerId
      const db = await getDb();
      const result = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.customerId, customerId))
        .limit(1);

      if (result.length > 0) {
        return result[0].id;
      }
      console.warn('No user found with given customerId');

      return undefined;
    } catch (error) {
      console.error('Find user by customer ID error:', error);
      return undefined;
    }
  }

  /**
   * Create a checkout session for a plan
   * @param params Parameters for creating the checkout session
   * @returns Checkout result
   */
  public async createCheckout(
    params: CreateCheckoutParams
  ): Promise<CheckoutResult> {
    const {
      planId,
      priceId,
      customerEmail,
      successUrl,
      cancelUrl,
      metadata,
      locale,
    } = params;

    try {
      // Get plan and price
      const plan = findPlanByPlanId(planId);
      if (!plan) {
        throw new Error(`Plan with ID ${planId} not found`);
      }

      // Find price in plan
      const price = findPriceInPlan(planId, priceId);
      if (!price) {
        throw new Error(`Price ID ${priceId} not found in plan ${planId}`);
      }

      // Get userName from metadata if available
      const userName = metadata?.userName;

      // Create or get customer
      const customerId = await this.createOrGetCustomer(
        customerEmail,
        userName
      );

      // Add planId and priceId to metadata, so we can get it in the webhook event
      const customMetadata = {
        ...metadata,
        planId,
        priceId,
      };

      // Set up the line items
      const lineItems = [
        {
          price: priceId,
          quantity: 1,
        },
      ];

      // Create checkout session parameters
      const checkoutParams: Stripe.Checkout.SessionCreateParams = {
        line_items: lineItems,
        mode:
          price.type === PaymentTypes.SUBSCRIPTION ? 'subscription' : 'payment',
        success_url: successUrl ?? '',
        cancel_url: cancelUrl ?? '',
        metadata: customMetadata,
        allow_promotion_codes: price.allowPromotionCode ?? false,
      };

      // Add customer to checkout session
      checkoutParams.customer = customerId;

      // Add locale if provided
      if (locale) {
        checkoutParams.locale = this.mapLocaleToStripeLocale(
          locale
        ) as Stripe.Checkout.SessionCreateParams.Locale;
      }

      // Add payment intent data for one-time payments
      if (price.type === PaymentTypes.ONE_TIME) {
        checkoutParams.payment_intent_data = {
          metadata: customMetadata,
        };
        // Automatically create an invoice for the one-time payment
        checkoutParams.invoice_creation = {
          enabled: true,
        };
      }

      // Add subscription data for recurring payments
      if (price.type === PaymentTypes.SUBSCRIPTION) {
        // Initialize subscription_data with metadata
        checkoutParams.subscription_data = {
          metadata: customMetadata,
        };

        // Add trial period if applicable
        if (price.trialPeriodDays && price.trialPeriodDays > 0) {
          checkoutParams.subscription_data.trial_period_days =
            price.trialPeriodDays;
        }
      }

      // Create the checkout session
      const session =
        await this.stripe.checkout.sessions.create(checkoutParams);

      return {
        url: session.url!,
        id: session.id,
      };
    } catch (error) {
      console.error('Create checkout session error:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Create a checkout session for a plan
   * @param params Parameters for creating the checkout session
   * @returns Checkout result
   */
  public async createCreditCheckout(
    params: CreateCreditCheckoutParams
  ): Promise<CheckoutResult> {
    const {
      packageId,
      priceId,
      customerEmail,
      successUrl,
      cancelUrl,
      metadata,
      locale,
    } = params;

    try {
      // Get credit package
      const creditPackage = getCreditPackageById(packageId);
      if (!creditPackage) {
        throw new Error(`Credit package with ID ${packageId} not found`);
      }

      // Get priceId from credit package
      const priceId = creditPackage.price.priceId;
      if (!priceId) {
        throw new Error(`Price ID not found for credit package ${packageId}`);
      }

      // Get userName from metadata if available
      const userName = metadata?.userName;

      // Create or get customer
      const customerId = await this.createOrGetCustomer(
        customerEmail,
        userName
      );

      // Add planId and priceId to metadata, so we can get it in the webhook event
      const customMetadata = {
        ...metadata,
        packageId,
        priceId,
      };

      // Set up the line items
      const lineItems = [
        {
          price: priceId,
          quantity: 1,
        },
      ];

      // Create checkout session parameters
      const checkoutParams: Stripe.Checkout.SessionCreateParams = {
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl ?? '',
        cancel_url: cancelUrl ?? '',
        metadata: customMetadata,
        allow_promotion_codes: creditPackage.price.allowPromotionCode ?? false,
      };

      // Add customer to checkout session
      checkoutParams.customer = customerId;

      // Add locale if provided
      if (locale) {
        checkoutParams.locale = this.mapLocaleToStripeLocale(
          locale
        ) as Stripe.Checkout.SessionCreateParams.Locale;
      }

      // Add payment intent data for one-time payments
      checkoutParams.payment_intent_data = {
        metadata: customMetadata,
      };
      // Automatically create an invoice for the one-time payment
      checkoutParams.invoice_creation = {
        enabled: true,
      };

      // Create the checkout session
      const session =
        await this.stripe.checkout.sessions.create(checkoutParams);

      return {
        url: session.url!,
        id: session.id,
      };
    } catch (error) {
      console.error('Create credit checkout session error:', error);
      throw new Error('Failed to create credit checkout session');
    }
  }

  /**
   * Create a customer portal session
   * @param params Parameters for creating the portal
   * @returns Portal result
   */
  public async createCustomerPortal(
    params: CreatePortalParams
  ): Promise<PortalResult> {
    const { customerId, returnUrl, locale } = params;

    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl ?? '',
        locale: locale
          ? (this.mapLocaleToStripeLocale(
              locale
            ) as Stripe.BillingPortal.SessionCreateParams.Locale)
          : undefined,
      });

      return {
        url: session.url,
      };
    } catch (error) {
      console.error('Create customer portal error:', error);
      throw new Error('Failed to create customer portal');
    }
  }

  /**
   * Get subscriptions
   * @param params Parameters for getting subscriptions
   * @returns Array of subscription objects
   */
  public async getSubscriptions(
    params: getSubscriptionsParams
  ): Promise<Subscription[]> {
    const { userId } = params;

    try {
      // Build query to fetch subscriptions from database
      const db = await getDb();
      const subscriptions = await db
        .select()
        .from(payment)
        .where(eq(payment.userId, userId))
        .orderBy(desc(payment.createdAt)); // Sort by creation date, newest first

      // Map database records to our subscription model
      return subscriptions.map((subscription) => ({
        id: subscription.subscriptionId || '',
        customerId: subscription.customerId,
        priceId: subscription.priceId,
        status: subscription.status as PaymentStatus,
        type: subscription.type as PaymentTypes,
        interval: subscription.interval as PlanInterval,
        currentPeriodStart: subscription.periodStart || undefined,
        currentPeriodEnd: subscription.periodEnd || undefined,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
        trialStartDate: subscription.trialStart || undefined,
        trialEndDate: subscription.trialEnd || undefined,
        createdAt: subscription.createdAt,
      }));
    } catch (error) {
      console.error('List customer subscriptions error:', error);
      return [];
    }
  }

  /**
   * Handle webhook event
   * @param payload Raw webhook payload
   * @param signature Webhook signature
   */
  public async handleWebhookEvent(
    payload: string,
    signature: string
  ): Promise<void> {
    try {
      // Verify the event signature if webhook secret is available
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );
      const eventType = event.type;
      console.log(`handle webhook event, type: ${eventType}`);

      // Handle subscription events
      if (eventType.startsWith('customer.subscription.')) {
        const stripeSubscription = event.data.object as Stripe.Subscription;

        // Process based on subscription status and event type
        switch (eventType) {
          case 'customer.subscription.created': {
            await this.onCreateSubscription(stripeSubscription);
            break;
          }
          case 'customer.subscription.updated': {
            await this.onUpdateSubscription(stripeSubscription);
            break;
          }
          case 'customer.subscription.deleted': {
            await this.onDeleteSubscription(stripeSubscription);
            break;
          }
        }
      } else if (eventType.startsWith('invoice.')) {
        // Handle invoice events
        switch (eventType) {
          case 'invoice.paid': {
            const invoice = event.data.object as Stripe.Invoice;
            await this.onInvoicePaid(invoice);
            break;
          }
        }
      } else if (eventType.startsWith('checkout.')) {
        // Handle checkout events
        if (eventType === 'checkout.session.completed') {
          const session = event.data.object as Stripe.Checkout.Session;

          // Only process one-time payments (likely for lifetime plan)
          if (session.mode === 'payment') {
            if (session.metadata?.type === 'credit_purchase') {
              await this.onCreditPurchase(session);
            } else {
              await this.onOnetimePayment(session);
            }
          }
        }
      }
    } catch (error) {
      console.error('handle webhook event error:', error);
      throw new Error('Failed to handle webhook event');
    }
  }

  /**
   * Find checkout session ID from payment intent
   * @param paymentIntentId Payment intent ID
   * @returns Session ID or undefined
   */
  private async findSessionIdFromPaymentIntent(
    paymentIntentId: string
  ): Promise<string | undefined> {
    try {
      // Search for checkout sessions that contain this payment intent
      const sessions = await this.stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
        limit: 1,
      });

      if (sessions.data && sessions.data.length > 0) {
        return sessions.data[0].id;
      }

      return undefined;
    } catch (error) {
      console.error('Find session by payment intent error:', error);
      return undefined;
    }
  }

  /**
   * Find checkout session ID from subscription
   * @param subscriptionId Subscription ID
   * @returns Session ID or undefined
   */
  private async findSessionIdFromSubscription(
    subscriptionId: string
  ): Promise<string | undefined> {
    try {
      // Search for checkout sessions that created this subscription
      const sessions = await this.stripe.checkout.sessions.list({
        subscription: subscriptionId,
        limit: 1,
      });

      if (sessions.data && sessions.data.length > 0) {
        return sessions.data[0].id;
      }

      return undefined;
    } catch (error) {
      console.error('Find session by subscription error:', error);
      return undefined;
    }
  }

  /**
   * Handle successful invoice payment - NEW ARCHITECTURE
   * Only create payment records here after payment is confirmed
   *
   * For one-time payments, the order of events may be:
   * checkout.session.completed
   * invoice.paid
   *
   * For subscription payments, the order of events may be:
   * checkout.session.completed
   * customer.subscription.created
   * customer.subscription.updated
   * invoice.paid
   *
   * @param invoice Stripe invoice
   */
  private async onInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    console.log('>> Handle invoice paid');

    try {
      const subscriptionId = invoice.subscription as string | null;

      if (subscriptionId) {
        // This is a subscription payment
        await this.createSubscriptionPayment(invoice, subscriptionId);
      } else {
        // This is a one-time payment
        await this.createOneTimePayment(invoice);
      }

      console.log('<< Successfully processed invoice paid');
    } catch (error) {
      console.error('<< Handle invoice paid error:', error);

      // Check if it's a duplicate invoice error (database constraint violation)
      if (
        error instanceof Error &&
        error.message.includes('unique constraint')
      ) {
        console.log('<< Invoice already processed:', invoice.id);
        return; // Don't throw, this is expected for duplicate processing
      }

      // For other errors, let Stripe retry
      throw error;
    }
  }

  /**
   * Create subscription payment record and process benefits - NEW ARCHITECTURE
   *
   * The order of events may be:
   * checkout.session.completed
   * customer.subscription.created
   * customer.subscription.updated
   * invoice.paid
   *
   * @param invoice Stripe invoice
   * @param subscriptionId Subscription ID
   */
  private async createSubscriptionPayment(
    invoice: Stripe.Invoice,
    subscriptionId: string
  ): Promise<void> {
    console.log(
      '>> Create subscription payment record for subscription:',
      subscriptionId
    );

    try {
      // Get subscription details from Stripe
      const subscription =
        await this.stripe.subscriptions.retrieve(subscriptionId);
      const customerId = subscription.customer as string;

      // Get priceId from subscription items
      const priceId = subscription.items.data[0]?.price.id;
      if (!priceId) {
        console.warn('<< No priceId found for subscription');
        return;
      }

      // Get userId from subscription metadata or fallback to customerId lookup
      let userId: string | undefined = subscription.metadata.userId;

      // If no userId in metadata (common in renewals), find by customerId
      if (!userId) {
        console.log('No userId in metadata, finding by customerId');
        userId = await this.findUserIdByCustomerId(customerId);

        if (!userId) {
          console.error('<< No userId found, this should not happen');
          return;
        }
      }

      const periodStart = this.getPeriodStart(subscription);
      const periodEnd = this.getPeriodEnd(subscription);
      const trialStart = subscription.trial_start
        ? new Date(subscription.trial_start * 1000)
        : null;
      const trialEnd = subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null;
      const currentDate = new Date();

      // Find session ID from subscription
      const sessionId =
        await this.findSessionIdFromSubscription(subscriptionId);

      // Create payment record with subscription status
      const db = await getDb();
      const paymentResult = await db
        .insert(payment)
        .values({
          id: randomUUID(),
          priceId,
          type: PaymentTypes.SUBSCRIPTION,
          userId,
          customerId,
          subscriptionId,
          sessionId,
          invoiceId: invoice.id,
          interval: this.mapStripeIntervalToPlanInterval(subscription),
          status: this.mapSubscriptionStatusToPaymentStatus(
            subscription.status
          ), // Use actual subscription status
          periodStart,
          periodEnd,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          trialStart,
          trialEnd,
          createdAt: currentDate,
          updatedAt: currentDate,
        })
        .returning({ id: payment.id });

      if (paymentResult.length === 0) {
        console.warn('<< Failed to create subscription payment record');
        return;
      }

      // Add subscription credits if enabled
      if (websiteConfig.credits?.enableCredits) {
        await addSubscriptionCredits(userId, priceId);
        console.log('Added subscription credits for invoice:', invoice.id);
      }

      console.log('<< Successfully processed subscription payment');
    } catch (error) {
      console.error('<< Create subscription payment error:', error);

      // Don't throw error if it's already processed
      if (
        error instanceof Error &&
        error.message.includes('unique constraint')
      ) {
        console.log('<< Subscription payment already processed:', invoice.id);
        return;
      }

      throw error;
    }
  }

  /**
   * Create one-time payment record and process benefits - NEW ARCHITECTURE
   *
   * The order of events may be:
   * checkout.session.completed
   * invoice.paid
   *
   * @param invoice Stripe invoice
   */
  private async createOneTimePayment(invoice: Stripe.Invoice): Promise<void> {
    console.log('>> Create one-time payment record for invoice:', invoice.id);

    try {
      const customerId = invoice.customer as string;
      const paymentIntentId = invoice.payment_intent as string;

      if (!paymentIntentId) {
        console.warn('<< No payment_intent found in invoice:', invoice.id);
        return;
      }

      // Get payment intent to access metadata
      const paymentIntent =
        await this.stripe.paymentIntents.retrieve(paymentIntentId);
      const metadata = paymentIntent.metadata;

      // Get userId from payment intent metadata or fallback to customerId lookup
      let userId: string | undefined = metadata?.userId;
      if (!userId) {
        console.log('No userId in metadata, finding by customerId');
        userId = await this.findUserIdByCustomerId(customerId);

        if (!userId) {
          console.error('<< No userId found, this should not happen');
          return;
        }
      }

      // Check if this is a credit purchase
      const isCreditPurchase = metadata?.type === 'credit_purchase';

      if (isCreditPurchase) {
        // Process credit purchase
        await this.createCreditPurchasePayment(invoice, metadata, userId);
      } else {
        // Process lifetime plan purchase
        await this.createLifetimePlanPayment(
          invoice,
          metadata,
          userId,
          customerId
        );
      }

      console.log('<< Successfully created one-time payment record');
    } catch (error) {
      console.error('<< Create one-time payment error:', error);
      throw error;
    }
  }

  /**
   * Create payment record for credit purchase - NEW ARCHITECTURE
   * @param invoice Stripe invoice
   * @param metadata Payment intent metadata
   * @param userId User ID
   */
  private async createCreditPurchasePayment(
    invoice: Stripe.Invoice,
    metadata: { [key: string]: string },
    userId: string
  ): Promise<void> {
    console.log('>> Create credit purchase payment record');

    try {
      const packageId = metadata.packageId;
      const credits = metadata.credits;
      const customerId = invoice.customer as string;

      if (!packageId || !credits) {
        console.warn('<< Missing packageId or credits in metadata');
        return;
      }

      // Get credit package
      const creditPackage = getCreditPackageById(packageId);
      if (!creditPackage) {
        console.warn('<< Credit package not found:', packageId);
        return;
      }

      // Find session ID from payment intent
      const paymentIntentId = invoice.payment_intent as string;
      const sessionId = paymentIntentId
        ? await this.findSessionIdFromPaymentIntent(paymentIntentId)
        : undefined;

      // Create payment record
      const db = await getDb();
      const currentDate = new Date();
      const paymentResult = await db
        .insert(payment)
        .values({
          id: randomUUID(),
          priceId: metadata.priceId || '',
          type: PaymentTypes.ONE_TIME,
          userId,
          customerId,
          sessionId,
          invoiceId: invoice.id,
          status: 'completed',
          periodStart: currentDate,
          createdAt: currentDate,
          updatedAt: currentDate,
        })
        .returning({ id: payment.id });

      if (paymentResult.length === 0) {
        console.warn('<< Failed to create credit purchase payment record');
        return;
      }

      // Add credits to user account
      const amount = invoice.amount_paid ? invoice.amount_paid / 100 : 0;
      await addCredits({
        userId,
        amount: Number.parseInt(credits),
        type: CREDIT_TRANSACTION_TYPE.PURCHASE_PACKAGE,
        description: `+${credits} credits for package ${packageId} ($${amount.toLocaleString()})`,
        paymentId: invoice.id, // Use invoice ID as payment ID
        expireDays: creditPackage.expireDays,
      });

      console.log('<< Successfully added credits to user for credit purchase');
    } catch (error) {
      console.error('<< Create credit purchase payment error:', error);

      // Don't throw error if it's already processed
      if (
        error instanceof Error &&
        error.message.includes('unique constraint')
      ) {
        console.log('<< Credit purchase already processed:', invoice.id);
        return;
      }

      throw error;
    }
  }

  /**
   * Create payment record for lifetime plan purchase - NEW ARCHITECTURE
   * @param invoice Stripe invoice
   * @param metadata Payment intent metadata
   * @param userId User ID
   * @param customerId Customer ID
   */
  private async createLifetimePlanPayment(
    invoice: Stripe.Invoice,
    metadata: { [key: string]: string },
    userId: string,
    customerId: string
  ): Promise<void> {
    console.log('>> Create lifetime plan payment record');

    try {
      const priceId = metadata?.priceId;
      if (!priceId) {
        console.warn('<< No priceId found in payment intent metadata');
        return;
      }

      // Find session ID from payment intent
      const paymentIntentId = invoice.payment_intent as string;
      const sessionId = paymentIntentId
        ? await this.findSessionIdFromPaymentIntent(paymentIntentId)
        : undefined;

      // Create payment record
      const db = await getDb();
      const currentDate = new Date();
      const paymentResult = await db
        .insert(payment)
        .values({
          id: randomUUID(),
          priceId,
          type: PaymentTypes.ONE_TIME,
          userId,
          customerId,
          sessionId,
          invoiceId: invoice.id,
          status: 'completed',
          periodStart: currentDate,
          createdAt: currentDate,
          updatedAt: currentDate,
        })
        .returning({ id: payment.id });

      if (paymentResult.length === 0) {
        console.warn('<< Failed to create lifetime plan payment record');
        return;
      }

      // Add lifetime credits if enabled
      if (websiteConfig.credits?.enableCredits) {
        await addLifetimeMonthlyCredits(userId, priceId);
        console.log('Added lifetime credits for invoice:', invoice.id);
      }

      // Send notification
      const amount = invoice.amount_paid ? invoice.amount_paid / 100 : 0;
      await sendNotification(invoice.id, customerId, userId, amount);

      console.log('<< Successfully created lifetime plan payment record');
    } catch (error) {
      console.error('<< Create lifetime plan payment error:', error);

      // Don't throw error if it's already processed
      if (
        error instanceof Error &&
        error.message.includes('unique constraint')
      ) {
        console.log('<< Lifetime plan payment already processed:', invoice.id);
        return;
      }

      throw error;
    }
  }

  /**
   * Handle subscription creation - NEW ARCHITECTURE
   * Only log the event, payment records created in invoice.paid
   * @param stripeSubscription Stripe subscription
   */
  private async onCreateSubscription(
    stripeSubscription: Stripe.Subscription
  ): Promise<void> {
    console.log('Handle subscription creation:', stripeSubscription.id);
  }

  /**
   * Update payment record
   *
   * When subscription is renewed, the order of events may be:
   * customer.subscription.updated
   * invoice.paid
   *
   * In this case, we need to update the payment record.
   *
   * @param stripeSubscription Stripe subscription
   */
  private async onUpdateSubscription(
    stripeSubscription: Stripe.Subscription
  ): Promise<void> {
    console.log('>> Handle subscription update');

    // get priceId from subscription items (this is always available)
    const priceId = stripeSubscription.items.data[0]?.price.id;
    if (!priceId) {
      console.warn('<< No priceId found for subscription');
      return;
    }

    // get new period start and end
    const newPeriodStart = this.getPeriodStart(stripeSubscription);
    const newPeriodEnd = this.getPeriodEnd(stripeSubscription);
    const trialStart = stripeSubscription.trial_start
      ? new Date(stripeSubscription.trial_start * 1000)
      : undefined;
    const trialEnd = stripeSubscription.trial_end
      ? new Date(stripeSubscription.trial_end * 1000)
      : undefined;

    // update fields
    const updateFields: any = {
      priceId: priceId,
      interval: this.mapStripeIntervalToPlanInterval(stripeSubscription),
      status: this.mapSubscriptionStatusToPaymentStatus(
        stripeSubscription.status
      ),
      periodStart: newPeriodStart,
      periodEnd: newPeriodEnd,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      trialStart: trialStart,
      trialEnd: trialEnd,
      updatedAt: new Date(),
    };

    const db = await getDb();
    const result = await db
      .update(payment)
      .set(updateFields)
      .where(eq(payment.subscriptionId, stripeSubscription.id))
      .returning({ id: payment.id });

    if (result.length > 0) {
      console.log('<< Updated payment record for subscription');
    } else {
      console.warn('<< No payment record found for subscription update');
    }
  }

  /**
   * Update payment record, set status to canceled
   * @param stripeSubscription Stripe subscription
   */
  private async onDeleteSubscription(
    stripeSubscription: Stripe.Subscription
  ): Promise<void> {
    console.log('>> Handle subscription deletion');

    const db = await getDb();
    const result = await db
      .update(payment)
      .set({
        status: this.mapSubscriptionStatusToPaymentStatus(
          stripeSubscription.status
        ),
        updatedAt: new Date(),
      })
      .where(eq(payment.subscriptionId, stripeSubscription.id))
      .returning({ id: payment.id });

    if (result.length > 0) {
      console.log('<< Marked payment record for subscription as canceled');
    } else {
      console.warn('<< No payment record found for subscription deletion');
    }
  }

  /**
   * Handle checkout session completion - NEW ARCHITECTURE
   * Only log the event, payment records created in invoice.paid
   * @param session Stripe checkout session
   */
  private async onOnetimePayment(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    console.log('Handle checkout session completion:', session.id);
  }

  /**
   * Handle credit purchase checkout completion - NEW ARCHITECTURE
   * Only log the event, payment records created in invoice.paid
   * @param session Stripe checkout session
   */
  private async onCreditPurchase(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    console.log('Handle credit purchase checkout completion:', session.id);
  }

  /**
   * Map Stripe subscription interval to our own interval types
   * @param subscription Stripe subscription
   * @returns PlanInterval
   */
  private mapStripeIntervalToPlanInterval(
    subscription: Stripe.Subscription
  ): PlanInterval {
    switch (subscription.items.data[0]?.plan.interval) {
      case 'month':
        return PlanIntervals.MONTH;
      case 'year':
        return PlanIntervals.YEAR;
      default:
        return PlanIntervals.MONTH;
    }
  }

  /**
   * Convert Stripe subscription status to PaymentStatus,
   * we narrow down the status to our own status types
   * @param status Stripe subscription status
   * @returns PaymentStatus
   */
  private mapSubscriptionStatusToPaymentStatus(
    status: Stripe.Subscription.Status
  ): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      active: 'active',
      canceled: 'canceled',
      incomplete: 'incomplete',
      incomplete_expired: 'incomplete_expired',
      past_due: 'past_due',
      trialing: 'trialing',
      unpaid: 'unpaid',
      paused: 'paused',
    };

    return statusMap[status] || 'failed';
  }

  /**
   * Map application locale to Stripe's supported locales
   * @param locale Application locale (e.g., 'en', 'zh-CN')
   * @returns Stripe locale string
   */
  private mapLocaleToStripeLocale(locale: string): string {
    // Stripe supported locales as of 2023:
    // https://stripe.com/docs/js/appendix/supported_locales
    const stripeLocales = [
      'bg',
      'cs',
      'da',
      'de',
      'el',
      'en',
      'es',
      'et',
      'fi',
      'fil',
      'fr',
      'hr',
      'hu',
      'id',
      'it',
      'ja',
      'ko',
      'lt',
      'lv',
      'ms',
      'mt',
      'nb',
      'nl',
      'pl',
      'pt',
      'ro',
      'ru',
      'sk',
      'sl',
      'sv',
      'th',
      'tr',
      'vi',
      'zh',
    ];

    // First check if the exact locale is supported
    if (stripeLocales.includes(locale)) {
      return locale;
    }

    // If not, try to get the base language
    const baseLocale = locale.split('-')[0];
    if (stripeLocales.includes(baseLocale)) {
      return baseLocale;
    }

    // Default to auto to let Stripe detect the language
    return 'auto';
  }

  private getPeriodStart(subscription: Stripe.Subscription): Date | undefined {
    const s: any = subscription as any;
    const startUnix =
      s.current_period_start ??
      s?.items?.data?.[0]?.current_period_start ??
      undefined;
    return typeof startUnix === 'number'
      ? new Date(startUnix * 1000)
      : undefined;
  }

  private getPeriodEnd(subscription: Stripe.Subscription): Date | undefined {
    const s: any = subscription as any;
    const endUnix =
      s.current_period_end ??
      s?.items?.data?.[0]?.current_period_end ??
      undefined;
    return typeof endUnix === 'number' ? new Date(endUnix * 1000) : undefined;
  }
}
