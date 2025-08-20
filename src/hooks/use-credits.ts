import { consumeCreditsAction } from '@/actions/consume-credits';
import { getCreditBalanceAction } from '@/actions/get-credit-balance';
import { getCreditStatsAction } from '@/actions/get-credit-stats';
import { getCreditTransactionsAction } from '@/actions/get-credit-transactions';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SortingState } from '@tanstack/react-table';

// Query keys
export const creditsKeys = {
  all: ['credits'] as const,
  balance: () => [...creditsKeys.all, 'balance'] as const,
  stats: () => [...creditsKeys.all, 'stats'] as const,
  transactions: () => [...creditsKeys.all, 'transactions'] as const,
  transactionsList: (filters: {
    pageIndex: number;
    pageSize: number;
    search: string;
    sorting: SortingState;
  }) => [...creditsKeys.transactions(), filters] as const,
};

// Hook to fetch credit statistics
export function useCreditStats() {
  return useQuery({
    queryKey: creditsKeys.stats(),
    queryFn: async () => {
      const result = await getCreditStatsAction();
      if (!result?.data?.success) {
        throw new Error(result?.data?.error || 'Failed to fetch credit stats');
      }
      return result.data.data;
    },
  });
}

// Hook to fetch credit balance
export function useCreditBalance() {
  return useQuery({
    queryKey: creditsKeys.balance(),
    queryFn: async () => {
      const result = await getCreditBalanceAction();
      if (!result?.data?.success) {
        throw new Error('Failed to fetch credit balance');
      }
      return result.data.credits || 0;
    },
  });
}

// Hook to consume credits
export function useConsumeCredits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      amount,
      description,
    }: {
      amount: number;
      description: string;
    }) => {
      const result = await consumeCreditsAction({
        amount,
        description,
      });
      if (!result?.data?.success) {
        throw new Error(result?.data?.error || 'Failed to consume credits');
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate credit balance and stats after consuming credits
      queryClient.invalidateQueries({
        queryKey: creditsKeys.balance(),
      });
      queryClient.invalidateQueries({
        queryKey: creditsKeys.stats(),
      });
    },
  });
}

// Hook to fetch credit transactions with pagination, search, and sorting
export function useCreditTransactions(
  pageIndex: number,
  pageSize: number,
  search: string,
  sorting: SortingState
) {
  return useQuery({
    queryKey: creditsKeys.transactionsList({
      pageIndex,
      pageSize,
      search,
      sorting,
    }),
    queryFn: async () => {
      const result = await getCreditTransactionsAction({
        pageIndex,
        pageSize,
        search,
        sorting,
      });

      if (!result?.data?.success) {
        throw new Error(
          result?.data?.error || 'Failed to fetch credit transactions'
        );
      }

      return {
        items: result.data.data?.items || [],
        total: result.data.data?.total || 0,
      };
    },
  });
}
