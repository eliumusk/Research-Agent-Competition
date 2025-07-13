import BillingCard from '@/components/settings/billing/billing-card';
import CreditsBalanceCard from '@/components/settings/billing/credits-balance-card';
import { CreditPackages } from '@/components/settings/credits/credit-packages';
import { websiteConfig } from '@/config/website';

export default function BillingPage() {
  return (
    <div className="space-y-8">
      {/* Billing and Credits Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BillingCard />
        {websiteConfig.credits.enableCredits && <CreditsBalanceCard />}
      </div>

      {/* Credit Packages */}
      {websiteConfig.credits.enableCredits && (
        <div className="w-full">
          <CreditPackages />
        </div>
      )}
    </div>
  );
}
