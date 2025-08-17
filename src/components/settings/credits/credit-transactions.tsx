'use client';

import { getCreditTransactionsAction } from '@/actions/get-credit-transactions';
import type { CreditTransaction } from '@/components/settings/credits/credit-transactions-table';
import { CreditTransactionsTable } from '@/components/settings/credits/credit-transactions-table';
import type { SortingState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * Credit transactions component
 */
export function CreditTransactions() {
  const t = useTranslations('Dashboard.settings.credits.transactions');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [data, setData] = useState<CreditTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCreditTransactionsAction({
        pageIndex,
        pageSize,
        search,
        sorting,
      });

      if (result?.data?.success) {
        setData(result.data.data?.items || []);
        setTotal(result.data.data?.total || 0);
      } else {
        const errorMessage = result?.data?.error || t('error');
        toast.error(errorMessage);
        setData([]);
        setTotal(0);
      }
    } catch (error) {
      console.error(
        'CreditTransactions, fetch credit transactions error:',
        error
      );
      toast.error(t('error'));
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, search, sorting]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <CreditTransactionsTable
      data={data}
      total={total}
      pageIndex={pageIndex}
      pageSize={pageSize}
      search={search}
      loading={loading}
      onSearch={setSearch}
      onPageChange={setPageIndex}
      onPageSizeChange={setPageSize}
      onSortingChange={setSorting}
    />
  );
}
