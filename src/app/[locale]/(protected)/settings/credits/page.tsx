import { CreditTransactionsPageClient } from '@/components/settings/credits/credit-transactions-page';
import { websiteConfig } from '@/config/website';
import { Routes } from '@/routes';
import { redirect } from 'next/navigation';

/**
 * Credits page, show credit transactions
 */
export default function CreditsPage() {
  // If credits are disabled, redirect to billing page
  if (!websiteConfig.credits.enableCredits) {
    redirect(Routes.SettingsBilling);
  }

  return <CreditTransactionsPageClient />;
}
