import { BankStatementResponse } from '@/types/analysis';
import { useLanguage } from '@/lib/i18n/useLanguage';
import Card from './card';
import { formatCurrency } from '@/lib/utils/helpers';

export default function BalanceMetrics({ documentDetail }: Readonly<{ documentDetail: BankStatementResponse }>) {
  const { t } = useLanguage();
  const analysis = documentDetail.analysis;
  const balanceMetrics = analysis?.balance_metrics;

  if (!balanceMetrics) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="mb-3 text-[16px] font-medium text-(--color-table-header-text-color)">{t('bankStatement.balanceMetrics.title')}</h2>
      <div className="grid grid-cols-1 gap-4 border-t border-(--color-filters-border) pt-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label={t('bankStatement.balanceMetrics.openingBalance')} value={formatCurrency(balanceMetrics.opening_balance)} />
        <Card label={t('bankStatement.balanceMetrics.closingBalance')} value={formatCurrency(balanceMetrics.closing_balance)} />
        <Card label={t('bankStatement.balanceMetrics.averageBalance')} value={formatCurrency(balanceMetrics.average_balance)} />
        <Card label={t('bankStatement.balanceMetrics.minBalance')} value={formatCurrency(balanceMetrics.min_balance)} />
        <Card label={t('bankStatement.balanceMetrics.totalDebits')} value={formatCurrency(balanceMetrics.total_debit)} />
        <Card label={t('bankStatement.balanceMetrics.totalCredits')} value={formatCurrency(balanceMetrics.total_credit)} />
      </div>
    </div>
  );
}
