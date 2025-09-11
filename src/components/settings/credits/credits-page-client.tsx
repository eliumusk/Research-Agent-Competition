'use client';

import { CreditPackages } from '@/components/settings/credits/credit-packages';
import { CreditTransactions } from '@/components/settings/credits/credit-transactions';
import CreditsCard from '@/components/settings/credits/credits-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SortingState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import {
  parseAsIndex,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import { useMemo } from 'react';

/**
 * Credits page client, show credit balance and transactions
 */
export default function CreditsPageClient() {
  const t = useTranslations('Dashboard.settings.credits');

  // Manage all URL states in the parent component
  const [{ tab, page, pageSize, search, sortId, sortDesc }, setQueryStates] =
    useQueryStates({
      tab: parseAsStringLiteral(['balance', 'transactions']).withDefault(
        'balance'
      ),
      // Transaction-specific parameters
      page: parseAsIndex.withDefault(0),
      pageSize: parseAsInteger.withDefault(10),
      search: parseAsString.withDefault(''),
      sortId: parseAsString.withDefault('createdAt'),
      sortDesc: parseAsInteger.withDefault(1),
    });

  const sorting: SortingState = useMemo(
    () => [{ id: sortId, desc: Boolean(sortDesc) }],
    [sortId, sortDesc]
  );

  const handleTabChange = (value: string) => {
    if (value === 'balance' || value === 'transactions') {
      if (value === 'balance') {
        // When switching to balance tab, clear transaction parameters
        setQueryStates({
          tab: value,
          page: null,
          pageSize: null,
          search: null,
          sortId: null,
          sortDesc: null,
        });
      } else {
        // When switching to transactions tab, just set the tab
        setQueryStates({ tab: value });
      }
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="">
          <TabsTrigger value="balance">{t('tabs.balance')}</TabsTrigger>
          <TabsTrigger value="transactions">
            {t('tabs.transactions')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="balance" className="mt-4 flex flex-col gap-8">
          {/* Credits Balance Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CreditsCard />
          </div>

          {/* Credit Packages */}
          <div className="w-full">
            <CreditPackages />
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          {/* Credit Transactions */}
          <CreditTransactions
            page={page}
            pageSize={pageSize}
            search={search}
            sorting={sorting}
            onPageChange={(newPageIndex) =>
              setQueryStates({ page: newPageIndex })
            }
            onPageSizeChange={(newPageSize) =>
              setQueryStates({ pageSize: newPageSize, page: 0 })
            }
            onSearch={(newSearch) =>
              setQueryStates({ search: newSearch, page: 0 })
            }
            onSortingChange={(newSorting) => {
              if (newSorting.length > 0) {
                setQueryStates({
                  sortId: newSorting[0].id,
                  sortDesc: newSorting[0].desc ? 1 : 0,
                });
              }
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
