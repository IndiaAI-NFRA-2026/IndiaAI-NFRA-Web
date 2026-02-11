import { BankStatementResponse } from '@/types/analysis';
import { useLanguage } from '@/lib/i18n/useLanguage';
import dayjs from 'dayjs';

export default function BankStatementDetailInformation({ documentDetail }: Readonly<{ documentDetail: BankStatementResponse }>) {
  const { t } = useLanguage();
  const accountData = documentDetail.data?.account;
  const periodStringStart = documentDetail.data?.analysis_period?.period_start || '';
  const periodStringEnd = documentDetail.data?.analysis_period?.period_end || '';

  return (
    <div className="rounded-[4px] border border-(--color-filters-border) bg-(--color-background-color) p-4">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-1">
            <p className="text-table-header-text-color text-sm leading-5.5 font-bold">
              {t('bankStatement.information.vendor') || 'Vendor'}:
            </p>
            <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">{documentDetail.vendor_name || '-'}</p>
          </div>

          <div className="flex flex-row gap-1">
            <p className="text-table-header-text-color text-sm leading-5.5 font-bold">
              {t('bankStatement.information.bankName') || 'Bank name'}:
            </p>
            <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">{accountData?.bank_name?.value || '-'}</p>
          </div>

          <div className="flex flex-row gap-1">
            <p className="text-table-header-text-color text-sm leading-5.5 font-bold">
              {t('bankStatement.information.address') || 'Address'}:
            </p>
            <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">
              {accountData?.account_holder_address?.value || '-'}
            </p>
          </div>
          <div className="flex flex-row gap-1">
            <p className="text-table-header-text-color text-sm leading-5.5 font-bold">
              {t('bankStatement.information.uploadedBy') || 'Uploaded by'}:
            </p>
            <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">{documentDetail?.create_by || '-'}</p>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-1">
            <p className="text-table-header-text-color text-sm leading-5.5 font-bold">
              {t('bankStatement.information.accountNumber') || 'Account number'}:
            </p>
            <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">{accountData?.account_number?.value || '-'}</p>
          </div>

          <div className="flex flex-row gap-1">
            <p className="text-table-header-text-color text-sm leading-5.5 font-bold">
              {t('bankStatement.information.period') || 'Period'}:
            </p>
            <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">
              {dayjs(periodStringStart, 'YYYY-MM-DD').format('YYYY-MM-DD') || '-'} {t('bankStatement.information.to') || 'to'}{' '}
              {dayjs(periodStringEnd, 'YYYY-MM-DD').format('YYYY-MM-DD') || '-'}
            </p>
          </div>

          <div className="flex flex-row gap-1">
            <p className="text-table-header-text-color text-sm leading-5.5 font-bold">
              {t('bankStatement.information.currency') || 'Currency'}:
            </p>
            <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">
              {accountData?.currency?.value || documentDetail.preferred_currency || '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
