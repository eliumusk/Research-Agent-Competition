'use client';

import { CreditsBalanceButton } from '@/components/layout/credits-balance-button';
import { Button } from '@/components/ui/button';
import { useCredits } from '@/hooks/use-credits';
import { CoinsIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const CONSUME_CREDITS = 50;

export function ConsumeCreditCard() {
  const { consumeCredits, hasEnoughCredits, isLoading } = useCredits();
  const [loading, setLoading] = useState(false);

  const handleConsume = async () => {
    if (!hasEnoughCredits(CONSUME_CREDITS)) {
      toast.error('Insufficient credits, please buy more credits.');
      return;
    }
    setLoading(true);
    const success = await consumeCredits(
      CONSUME_CREDITS,
      `AI Text Credit Consumption (${CONSUME_CREDITS} credits)`
    );
    setLoading(false);
    if (success) {
      toast.success(`${CONSUME_CREDITS} credits have been consumed.`);
    } else {
      toast.error('Failed to consume credits, please try again later.');
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 p-4 border rounded-lg">
      <div className="w-full flex flex-row items-center justify-end">
        <CreditsBalanceButton />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleConsume}
        disabled={isLoading || loading}
        className="w-full cursor-pointer"
      >
        <CoinsIcon className="size-4" />
        <span>Consume {CONSUME_CREDITS} credits</span>
      </Button>
    </div>
  );
}
