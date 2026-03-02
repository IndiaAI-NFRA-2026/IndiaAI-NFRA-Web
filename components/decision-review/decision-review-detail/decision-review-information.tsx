'use client';

import { useLanguage } from '@/lib/i18n/useLanguage';

export interface DecisionReviewDetail {
  vendorName: string;
  financialYear: string;
  currency: string;
  status: string;
  uploadedBy: string;
  overriddenAt: string;
  overriddenBy: string;
}

interface DecisionReviewInformationProps {
  detail: DecisionReviewDetail;
}

export function DecisionReviewInformation({ detail }: Readonly<DecisionReviewInformationProps>) {
  const { t } = useLanguage();

  return (
    <div className="mb-6 rounded-lg border bg-(--color-background-color) p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Left Column */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-1">
            <p className="text-table-header-text-color text-sm leading-5.5 font-bold">{t('decisionReview.detail.vendor')}:</p>
            <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">{detail.vendorName || '-'}</p>
          </div>

          <div className="flex flex-row gap-1">
            <p className="text-table-header-text-color text-sm leading-5.5 font-bold">{t('decisionReview.detail.financialYear')}:</p>
            <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">{detail.financialYear || '-'}</p>
          </div>

          <div className="flex flex-row gap-1">
            <p className="text-table-header-text-color text-sm leading-5.5 font-bold">{t('decisionReview.detail.currency')}:</p>
            <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">{detail.currency || '-'}</p>
          </div>

          <div className="flex flex-row gap-1">
            <p className="text-table-header-text-color text-sm leading-5.5 font-bold">{t('decisionReview.detail.status')}:</p>
            <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">{detail.status || '-'}</p>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          {detail.uploadedBy && (
            <div className="flex flex-row gap-1">
              <p className="text-table-header-text-color text-sm leading-5.5 font-bold">{t('decisionReview.detail.uploadedBy')}:</p>
              <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">{detail.uploadedBy || '-'}</p>
            </div>
          )}

          <div className="flex flex-row gap-1">
            <p className="text-table-header-text-color text-sm leading-5.5 font-bold">{t('decisionReview.detail.overriddenAt')}:</p>
            <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">{detail.overriddenAt || '-'}</p>
          </div>

          <div className="flex flex-row gap-1">
            <p className="text-table-header-text-color text-sm leading-5.5 font-bold">{t('decisionReview.detail.overriddenBy')}:</p>
            <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">{detail.overriddenBy || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
