'use client';

import { useLanguage } from '@/lib/i18n/useLanguage';
import { OverallResultBadge } from './combined-analysis-columns';

interface CombinedAnalysisDetailInformationProps {
  vendorName: string;
  overallResult: 'Strong' | 'Medium' | 'Weak' | null | undefined;
}

export default function CombinedAnalysisDetailInformation({ vendorName, overallResult }: Readonly<CombinedAnalysisDetailInformationProps>) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4 rounded border bg-(--color-background-color) p-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-bold text-(--color-sidebar-foreground)">{t('combinedAnalysis.vendor') || 'Vendor:'}</span>
        <span className="text-sm font-normal text-(--color-text-gray)">{vendorName}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-bold text-(--color-sidebar-foreground)">
          {t('combinedAnalysis.overallResultLabel') || 'Overall result:'}
        </span>
        <OverallResultBadge result={overallResult} />
      </div>
    </div>
  );
}
