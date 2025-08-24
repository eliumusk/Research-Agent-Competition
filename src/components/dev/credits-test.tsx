'use client';

import { Button } from '@/components/ui/button';
import { useConsumeCredits, useCreditBalance } from '@/hooks/use-credits';
import { CoinsIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function CreditsTest() {
  const { data: balance = 0, isLoading } = useCreditBalance();
  const consumeCreditsMutation = useConsumeCredits();
  const [loading, setLoading] = useState(false);

  const handleConsume = async () => {
    setLoading(true);
    try {
      await consumeCreditsMutation.mutateAsync({
        amount: 10,
        description: 'Test credit consumption',
      });
      toast.success('10 credits consumed successfully!');
    } catch (error) {
      toast.error('Failed to consume credits');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h3 className="text-lg font-semibold">Credits Store Test</h3>

      <div className="space-y-2">
        <p>
          <strong>Store Balance:</strong> {balance}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleConsume}
          disabled={loading || consumeCreditsMutation.isPending}
          size="sm"
        >
          <CoinsIcon className="w-4 h-4 mr-2" />
          Consume 10 Credits
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
    </div>
  );
}
