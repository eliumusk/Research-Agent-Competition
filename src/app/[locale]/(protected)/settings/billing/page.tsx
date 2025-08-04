import BillingCard from '@/components/settings/billing/billing-card';
import CreditsBalanceCard from '@/components/settings/billing/credits-balance-card';
import { CreditPackages } from '@/components/settings/credits/credit-packages';
import { websiteConfig } from '@/config/website';
import { useMemo } from 'react';

export default function BillingPage() {
  // Memoize the credits enabled state to ensure consistency across renders
  const creditsEnabled = useMemo(() => websiteConfig.credits.enableCredits, []);

  return (
    <div className="space-y-8">
      {/* Billing and Credits Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BillingCard />
        {creditsEnabled && <CreditsBalanceCard />}
      </div>

      {/* Credit Packages */}
      {creditsEnabled && (
        <div className="w-full">
          <CreditPackages />
        </div>
      )}
    </div>
  );
}
