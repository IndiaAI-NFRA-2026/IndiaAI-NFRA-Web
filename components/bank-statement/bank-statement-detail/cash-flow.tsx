import { BankStatementResponse } from '@/types/analysis';
import { useLanguage } from '@/lib/i18n/useLanguage';
import Card from './card';
import { formatCurrency } from '@/lib/utils/helpers';

export default function CashFlow({ documentDetail }: Readonly<{ documentDetail: BankStatementResponse }>) {
  const { t } = useLanguage();
  const analysis = documentDetail.analysis;
  const cashFlow = analysis?.cash_flow;

  if (!cashFlow) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="mb-3 text-[16px] font-medium text-(--color-table-header-text-color)">{t('bankStatement.cashFlow.title')}</h2>
      <div className="grid grid-cols-1 gap-4 border-t border-(--color-filters-border) pt-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label={t('bankStatement.cashFlow.totalInflow')} value={formatCurrency(cashFlow.total_inflow)} />
        <Card label={t('bankStatement.cashFlow.totalOutflow')} value={formatCurrency(cashFlow.total_outflow)} />
        <Card label={t('bankStatement.cashFlow.inflowOutflowRatio')} value={formatCurrency(cashFlow.inflow_outflow_ratio)} />
      </div>
    </div>
  );
}
