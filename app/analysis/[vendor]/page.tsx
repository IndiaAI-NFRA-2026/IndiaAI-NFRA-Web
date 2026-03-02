'use client';

import { useLanguage } from '@/lib/i18n/useLanguage';
import { Heading } from '@/components/heading';
import { useParams, useRouter } from 'next/navigation';
import Tabs from '@/components/tabs';
import { useMemo } from 'react';
import { DocumentType } from '@/enums/document-type';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { CountAnalysisApiResponse } from '@/types/documents';
import { ROUTERS } from '@/constants/routers';
import { AppLayout } from '@/components/layout/app-layout';
import { CombinedAnalysisComponent } from '@/components/analysis/combined';
import FraudDetectionComponent from '@/components/analysis/fraud-detection';
import FinancialAndBankAnalysisComponent from '@/components/analysis/financial-and-bank';

const AnalysisVendorContent = () => {
  const { t } = useLanguage();
  const params = useParams();
  const vendor = decodeURIComponent(params.vendor as string);
  const router = useRouter();

  const { data: countAnalysisData } = useQuery<CountAnalysisApiResponse>({
    queryKey: ['documents', 'not-read', vendor],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('vendor_name', vendor);

      const response = await apiFetch<CountAnalysisApiResponse>(`/documents/by-vendor/not-read?${params.toString()}`, {
        method: 'GET',
      });

      return response;
    },
    enabled: !!vendor,
  });

  const financialStatementAnalysisCount = useMemo(() => {
    return countAnalysisData?.financial_statement_count || 0;
  }, [countAnalysisData]);

  const bankStatementAnalysisCount = useMemo(() => {
    return countAnalysisData?.bank_statement_count || 0;
  }, [countAnalysisData]);

  const combinedAnalysisCount = useMemo(() => {
    return countAnalysisData?.combined_analysis_count || 0;
  }, [countAnalysisData]);

  const fraudDetectionCount = useMemo(() => {
    return countAnalysisData?.fraud_detection_count || 0;
  }, [countAnalysisData]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto rounded bg-(--color-background-color) shadow-[0_2px_8px_0_rgba(0,0,0,0.15)]">
      <Heading onBack={() => router.push(ROUTERS.ANALYSIS)} className="py-4" title={vendor} subTitle={t('analysis.pageSubTitle')} />

      <div className="flex flex-1 flex-col gap-4">
        <Tabs
          tabItems={[
            {
              key: 'financial-statement-analysis',
              label: t('analysis.financialStatementAnalysis'),
              badge: financialStatementAnalysisCount,
              content: (
                <FinancialAndBankAnalysisComponent
                  key={DocumentType.FINANCIAL_STATEMENT}
                  type={DocumentType.FINANCIAL_STATEMENT}
                  noDataMessage={t('analysis.noFinancialStatementAnalysis')}
                />
              ),
            },
            {
              key: 'bank-statement-analysis',
              label: t('analysis.bankStatementAnalysis'),
              badge: bankStatementAnalysisCount,
              content: (
                <FinancialAndBankAnalysisComponent
                  key={DocumentType.BANK_STATEMENT}
                  type={DocumentType.BANK_STATEMENT}
                  noDataMessage={t('analysis.noBankStatementAnalysis')}
                />
              ),
            },
            {
              key: 'combined-analysis',
              label: t('analysis.combinedAnalysisLabel'),
              badge: combinedAnalysisCount,
              content: <CombinedAnalysisComponent />,
            },
            {
              key: 'fraud-detection',
              label: t('analysis.fraudDetectionLabel'),
              badge: fraudDetectionCount,
              content: <FraudDetectionComponent />,
            },
          ]}
        />
      </div>
    </div>
  );
};
export default function AnalysisVendorPage() {
  return (
    <AppLayout>
      <AnalysisVendorContent />
    </AppLayout>
  );
}
