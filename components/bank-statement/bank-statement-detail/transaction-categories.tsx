import { useLanguage } from '@/lib/i18n/useLanguage';
import { BankStatementResponse } from '@/types/analysis';

interface CategoryCardProps {
  category: string;
  amount: number;
  transactionCount: number;
}

function formatAmount(amount: number): string {
  if (amount === 0) {
    return '0';
  }

  const rounded = Number((Math.round(amount * 100) / 100).toFixed(2));

  const formatted = rounded.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return formatted;
}

function CategoryCard({ category, amount, transactionCount }: Readonly<CategoryCardProps>) {
  const { t } = useLanguage();

  const transactionText =
    transactionCount === 1
      ? t('bankStatement.transactionCategories.transaction') || 'transaction'
      : t('bankStatement.transactionCategories.transactions') || 'transactions';

  return (
    <div className="rounded-[4px] border border-(--color-filters-border) bg-(--color-background-color) p-4">
      <h3 className="mb-1 text-sm font-medium text-(--color-table-header-text-color)">{category}</h3>
      <span className="text-[20px] font-bold text-(--color-sidebar-primary)">{formatAmount(amount)}</span>
      <div>
        <span className="text-sm text-(--color-sidebar-foreground)">
          {transactionCount} {transactionText}
        </span>
      </div>
    </div>
  );
}

interface TransactionCategory {
  category: string;
  amount: number;
  transactionCount: number;
}

export default function TransactionCategories({ documentDetail }: Readonly<{ documentDetail: BankStatementResponse }>) {
  const { t } = useLanguage();

  const transactionCategories = documentDetail.analysis?.transaction_categories;

  const categories: TransactionCategory[] = [];

  if (transactionCategories) {
    const categoryDisplayNames: Record<string, string> = {
      utilities: t('bankStatement.transactionCategories.categories.utilities'),
      transfer: t('bankStatement.transactionCategories.categories.transfer'),
      others: t('bankStatement.transactionCategories.categories.others'),
      education: t('bankStatement.transactionCategories.categories.education'),
      cash_withdrawal: t('bankStatement.transactionCategories.categories.cashWithdrawal'),
      insurance: t('bankStatement.transactionCategories.categories.insurance'),
    };

    for (const [key, data] of Object.entries(transactionCategories)) {
      if (data && data.count > 0) {
        categories.push({
          category: categoryDisplayNames[key] || key.replaceAll('_', ' ').replaceAll(/\b\w/g, (l) => l.toUpperCase()),
          amount: data.total_amount,
          transactionCount: data.count,
        });
      }
    }
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="mb-3 text-[16px] font-medium text-(--color-table-header-text-color)">
        {t('bankStatement.transactionCategories.title')}
      </h2>
      <div className="grid grid-cols-1 gap-4 border-t border-(--color-filters-border) pt-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((item, index) => (
          <CategoryCard
            key={`category-${item.category}-${index}`}
            category={item.category}
            amount={item.amount}
            transactionCount={item.transactionCount}
          />
        ))}
      </div>
    </div>
  );
}
