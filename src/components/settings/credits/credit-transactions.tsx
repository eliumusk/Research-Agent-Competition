'use client';

import { CreditTransactionsTable } from '@/components/settings/credits/credit-transactions-table';
import { useCreditTransactions } from '@/hooks/use-credits';
import type { SortingState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

interface CreditTransactionsProps {
  page: number;
  pageSize: number;
  search: string;
  sorting: SortingState;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearch: (search: string) => void;
  onSortingChange: (sorting: SortingState) => void;
}

/**
 * Credit transactions component
 */
export function CreditTransactions({
  page,
  pageSize,
  search,
  sorting,
  onPageChange,
  onPageSizeChange,
  onSearch,
  onSortingChange,
}: CreditTransactionsProps) {
  const t = useTranslations('Dashboard.settings.credits.transactions');

  const { data, isLoading } = useCreditTransactions(
    page,
    pageSize,
    search,
    sorting
  );

  return (
    <CreditTransactionsTable
      data={data?.items || []}
      total={data?.total || 0}
      pageIndex={page}
      pageSize={pageSize}
      search={search}
      sorting={sorting}
      loading={isLoading}
      onSearch={onSearch}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onSortingChange={onSortingChange}
    />
  );
}
