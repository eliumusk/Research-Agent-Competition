import type {
  CheckSubscribeStatusParams,
  NewsletterProvider,
  SubscribeNewsletterParams,
  UnsubscribeNewsletterParams,
} from '@/newsletter/types';
import { BeehiivClient } from '@beehiiv/sdk';

/**
 * Implementation of the NewsletterProvider interface using Beehiiv
 *
 * Beehiiv is a newsletter platform that provides:
 * - Subscription management via API
 * - Publication-based subscriber organization
 * - Rich subscriber data with custom fields
 *
 * docs:
 * https://developers.beehiiv.com/
 * https://github.com/beehiiv/typescript-sdk
 */
export class BeehiivNewsletterProvider implements NewsletterProvider {
  private client: BeehiivClient;
  private publicationId: string;

  constructor() {
    if (!process.env.BEEHIIV_API_KEY) {
      throw new Error('BEEHIIV_API_KEY environment variable is not set.');
    }

    if (!process.env.BEEHIIV_PUBLICATION_ID) {
      throw new Error(
        'BEEHIIV_PUBLICATION_ID environment variable is not set.'
      );
    }

    this.client = new BeehiivClient({ token: process.env.BEEHIIV_API_KEY });
    this.publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  }

  /**
   * Get the provider name
   * @returns Provider name
   */
  public getProviderName(): string {
    return 'Beehiiv';
  }

  /**
   * Subscribe a user to the newsletter
   * Creates a new subscription or reactivates an existing one
   * @param email The email address to subscribe
   * @returns True if the subscription was successful, false otherwise
   */
  async subscribe({ email }: SubscribeNewsletterParams): Promise<boolean> {
    try {
      // Check if subscription already exists
      const existing = await this.getSubscription(email);

      if (existing) {
        // If subscription exists but is inactive, reactivate it
        if (existing.status !== 'active') {
          const updateResult = await this.client.subscriptions.patch(
            this.publicationId,
            existing.id,
            {}
          );

          // Also update status via bulk update if needed
          await this.client.bulkSubscriptionUpdates.patchStatus(
            this.publicationId,
            {
              subscription_ids: [existing.id],
              new_status: 'active',
            }
          );

          console.log('Reactivated subscription', email);
          return !!updateResult;
        }

        console.log('Subscription already active', email);
        return true;
      }

      // Create new subscription
      const result = await this.client.subscriptions.create(
        this.publicationId,
        {
          email,
          reactivate_existing: true,
          send_welcome_email: false,
        }
      );

      if (!result.data) {
        console.error('Error creating subscription', email);
        return false;
      }

      console.log('Created new subscription', email);
      return true;
    } catch (error) {
      console.error('Error subscribing to newsletter', error);
      return false;
    }
  }

  /**
   * Unsubscribe a user from the newsletter
   * Updates the subscription status to inactive
   * @param email The email address to unsubscribe
   * @returns True if the unsubscription was successful, false otherwise
   */
  async unsubscribe({ email }: UnsubscribeNewsletterParams): Promise<boolean> {
    try {
      const subscription = await this.getSubscription(email);

      if (!subscription) {
        console.log('Subscription not found for unsubscribe', email);
        return true; // Already not subscribed
      }

      // Update subscription with unsubscribe flag
      await this.client.bulkSubscriptionUpdates.patch(this.publicationId, {
        subscriptions: [
          {
            subscription_id: subscription.id,
            unsubscribe: true,
          },
        ],
      });

      console.log('Unsubscribed from newsletter', email);
      return true;
    } catch (error) {
      console.error('Error unsubscribing from newsletter', error);
      return false;
    }
  }

  /**
   * Check if a user is subscribed to the newsletter
   * @param email The email address to check
   * @returns True if the user is subscribed and active, false otherwise
   */
  async checkSubscribeStatus({
    email,
  }: CheckSubscribeStatusParams): Promise<boolean> {
    try {
      const subscription = await this.getSubscription(email);

      if (!subscription) {
        console.log('Subscription not found:', email);
        return false;
      }

      // Check if subscription is active
      const isActive = subscription.status === 'active';
      console.log('Check subscribe status:', { email, status: isActive });
      return isActive;
    } catch (error) {
      console.error('Error checking subscribe status:', error);
      return false;
    }
  }

  /**
   * Get subscription by email
   * @param email The email address to look up
   * @returns Subscription data or null if not found
   */
  private async getSubscription(email: string) {
    try {
      const result = await this.client.subscriptions.getByEmail(
        this.publicationId,
        email
      );

      return result.data ?? null;
    } catch (error) {
      // Subscription not found is not an error
      return null;
    }
  }
}
