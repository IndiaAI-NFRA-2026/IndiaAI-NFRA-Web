import { useLanguage } from '@/lib/i18n/useLanguage';

interface DocumentInformationProps {
  vendorName: string;
  financialYear: string;
  currency: string;
  status: string;
  uploadedBy?: string;
}

export function DocumentInformation({ vendorName, financialYear, currency, status, uploadedBy }: Readonly<DocumentInformationProps>) {
  const { t } = useLanguage();
  return (
    <div className="rounded-[4px] border border-(--color-filters-border) bg-white p-4">
      <div className="space-y-2">
        <div className="flex flex-row gap-1">
          <span className="text-sm font-bold text-(--color-table-text-color)">{t('financialStatement.analytics.vendorName')}:</span>
          <span className="text-sm font-normal text-(--color-table-text-color)">{vendorName}</span>
        </div>
        <div className="flex flex-row gap-1">
          <span className="text-sm font-bold text-(--color-table-text-color)">{t('financialStatement.analytics.financialYear')}:</span>
          <span className="text-sm font-normal text-(--color-table-text-color)">{financialYear}</span>
        </div>
        <div className="flex flex-row gap-1">
          <span className="text-sm font-bold text-(--color-table-text-color)">{t('financialStatement.analytics.currency')}:</span>
          <span className="text-sm font-normal text-(--color-table-text-color)">{currency}</span>
        </div>
        <div className="flex flex-row gap-1">
          <span className="text-sm font-bold text-(--color-table-text-color)">{t('financialStatement.analytics.status')}:</span>
          <span className="text-sm font-normal text-(--color-table-text-color) capitalize">{status}</span>
        </div>
        {uploadedBy && (
          <div className="flex flex-row gap-1">
            <span className="text-sm font-bold text-(--color-table-text-color)">{t('financialStatement.analytics.uploadedBy')}:</span>
            <span className="text-sm font-normal text-(--color-table-text-color) capitalize">{uploadedBy}</span>
          </div>
        )}
      </div>
    </div>
  );
}
