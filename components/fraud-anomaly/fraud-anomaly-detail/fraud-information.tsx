'use client';

import { useLanguage } from '@/lib/i18n/useLanguage';
import { BankStatementResponse } from '@/types/analysis';
import type { FraudDetailResponse } from '@/types/fraud-detection';

type FraudInformationDocumentDetail = BankStatementResponse | FraudDetailResponse;

function isBankStatementResponse(d: FraudInformationDocumentDetail): d is BankStatementResponse {
  return 'data' in d && d.data != null;
}

interface FraudInformationProps {
  documentDetail: FraudInformationDocumentDetail;
}

export function FraudInformation({ documentDetail }: Readonly<FraudInformationProps>) {
  const { t } = useLanguage();

  const vendorName = isBankStatementResponse(documentDetail) ? documentDetail.vendor_name : documentDetail.vender;
  const bankName = isBankStatementResponse(documentDetail) ? documentDetail.data?.account?.bank_name?.value : documentDetail.bank_name;
  const address = isBankStatementResponse(documentDetail)
    ? documentDetail.data?.account?.account_holder_address?.value
    : documentDetail.address;
  const accountNumber = isBankStatementResponse(documentDetail)
    ? documentDetail.data?.account?.account_masked?.value
    : documentDetail.account_number;
  const periodString = isBankStatementResponse(documentDetail)
    ? (() => {
        const start = documentDetail.data?.analysis_period?.period_start || '';
        const end = documentDetail.data?.analysis_period?.period_end || '';
        return start && end ? `${start} to ${end}` : start;
      })()
    : documentDetail.period;
  const currency = isBankStatementResponse(documentDetail)
    ? documentDetail.data?.account?.currency?.value || documentDetail.preferred_currency
    : documentDetail.currency;

  return (
    <div className="mb-6 rounded-[4px] border border-(--color-filters-border) bg-(--color-background-color) p-4">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-1">
            <p className="text-table-header-text-color text-sm leading-5.5 font-bold">{t('fraudAnomaly.detail.vendor') || 'Vendor'}:</p>
            <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">{vendorName || '-'}</p>
          </div>

          <div className="flex flex-row gap-1">
            <p className="text-table-header-text-color text-sm leading-5.5 font-bold">
              {t('fraudAnomaly.detail.bankName') || 'Bank name'}:
            </p>
            <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">{bankName || '-'}</p>
          </div>

          <div className="flex flex-row gap-1">
            <p className="text-table-header-text-color text-sm leading-5.5 font-bold">{t('fraudAnomaly.detail.address') || 'Address'}:</p>
            <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">{address || '-'}</p>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-1">
            <p className="text-table-header-text-color text-sm leading-5.5 font-bold">
              {t('fraudAnomaly.detail.accountNumber') || 'Account number'}:
            </p>
            <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">{accountNumber || '-'}</p>
          </div>

          <div className="flex flex-row gap-1">
            <p className="text-table-header-text-color text-sm leading-5.5 font-bold">{t('fraudAnomaly.detail.period') || 'Period'}:</p>
            <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">{periodString || '-'}</p>
          </div>

          <div className="flex flex-row gap-1">
            <p className="text-table-header-text-color text-sm leading-5.5 font-bold">{t('fraudAnomaly.detail.currency') || 'Currency'}:</p>
            <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">{currency || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
