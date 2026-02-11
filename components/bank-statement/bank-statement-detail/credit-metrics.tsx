import { BankStatementResponse } from '@/types/analysis';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { formatCurrency } from '@/lib/utils/helpers';

interface CreditMetricCardProps {
  label: string;
  value: string | number;
  valueColor?: string;
}

function CreditMetricCard({ label, value, valueColor }: Readonly<CreditMetricCardProps>) {
  return (
    <div className="rounded border border-(--color-filters-border) bg-(--color-background-color) p-4">
      <h3 className="text-sm font-medium text-(--color-table-header-text-color)">{label}</h3>
      <span className="text-2xl font-bold text-(--color-sidebar-primary)">{value}</span>
    </div>
  );
}

interface CashVolatilityStyles {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

function getCashVolatilityStyles(volatility: string): CashVolatilityStyles {
  const upperVolatility = volatility.toUpperCase();
  switch (upperVolatility) {
    case 'LOW':
      return {
        backgroundColor: 'bg-(--color-credit-metrics-low-background)',
        borderColor: 'border-(--color-credit-metrics-low-border)',
        textColor: 'text-(--color-credit-metrics-low-text)',
      };
    case 'MEDIUM':
      return {
        backgroundColor: 'bg-(--color-credit-metrics-medium-background)',
        borderColor: 'border-(--color-credit-metrics-medium-border)',
        textColor: 'text-(--color-credit-metrics-medium-text)',
      };
    case 'HIGH':
      return {
        backgroundColor: 'bg-(--color-credit-metrics-high-background)',
        borderColor: 'border-(--color-credit-metrics-high-border)',
        textColor: 'text-(--color-credit-metrics-high-text)',
      };
    default:
      return {
        backgroundColor: 'bg-(--color-background-color)',
        borderColor: 'border-(--color-filters-border)',
        textColor: 'text-(--color-sidebar-primary)',
      };
  }
}

interface CashVolatilityCardProps {
  label: string;
  value: string;
  styles: CashVolatilityStyles;
}

function CashVolatilityCard({ label, value, styles }: Readonly<CashVolatilityCardProps>) {
  return (
    <div className={`rounded border p-4 ${styles.backgroundColor} ${styles.borderColor}`}>
      <h3 className="text-sm font-medium text-(--color-table-header-text-color)">{label}</h3>
      <span className={`text-[20px] font-bold ${styles.textColor}`}>{value}</span>
    </div>
  );
}

export default function CreditMetrics({ documentDetail }: Readonly<{ documentDetail: BankStatementResponse }>) {
  const { t } = useLanguage();
  const analysis = documentDetail.analysis;
  const creditMetrics = analysis?.credit_metrics;

  if (!creditMetrics) {
    return null;
  }

  const bufferRatio = creditMetrics.buffer_ratio ?? 0;
  const cashVolatility = creditMetrics.cash_volatility || '';
  const volatilityStyles = getCashVolatilityStyles(cashVolatility);

  return (
    <div className="mb-6">
      <h2 className="mb-3 text-lg font-medium text-(--color-table-header-text-color)">
        {t('bankStatement.creditMetrics.title') || 'Credit Metrics'}
      </h2>
      <div className="grid grid-cols-1 gap-4 border-t border-(--color-filters-border) pt-4 sm:grid-cols-2">
        <CreditMetricCard
          label={t('bankStatement.creditMetrics.bufferRatio') || 'Buffer Ratio'}
          value={formatCurrency(bufferRatio)}
          valueColor="text-green-600"
        />
        <CashVolatilityCard
          label={t('bankStatement.creditMetrics.cashVolatility') || 'Cash Volatility'}
          value={cashVolatility.toUpperCase() || '-'}
          styles={volatilityStyles}
        />
      </div>
    </div>
  );
}
