/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { DocumentInformation } from '@/components/financial-statement/analytics/document-information';
import { useDocumentDetail, useExportDocumentReport, documentKeys } from '@/lib/query/use-documents';
import { useBreadcrumb } from '@/components/breadcrumb';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { PreviewModal } from '@/components/financial-statement/analytics/analytics-tab/preview-modal';
import { DocumentDetailResponse, FinancialStatementExtractionData } from '@/types/documents';
import { DocumentType } from '@/enums/document-type';
import { DocumentStatus } from '@/enums';
import { toast } from 'sonner';
import { AnalyzeDetailApiResponse, ExtractionAnalysis } from '@/types/analysis';
import { Heading } from '@/components/heading';
import Card from '@/components/card';
import { ROUTERS } from '@/constants/routers';
import { AppLayout } from '@/components/layout/app-layout';
import AnalysisOverview from '@/components/analysis/overview';
import { Button } from '@/components/button';
import {
  bidderSpecificCriticalRatios,
  cashFlowRatios,
  efficiencyRatios,
  liquidityRatios,
  profitabilityRatios,
  ratioUnits,
  solvencyRatios,
} from '@/lib/utils/constants';
import { getTagSeverity, snakeToCamel } from '@/lib/utils/helpers';
import { RatioItem } from '@/components/financial-statement/analytics/analytics-tab/ratio-item';
import { Spinner } from '@/components/ui/spinner';
import { DownloadIcon } from 'lucide-react';
import Tag from '@/components/tag';

export type RatioStatus = 'passed' | 'warning' | 'failed';

export interface FinancialRatio {
  id: string;
  key: string;
  value: string | number;
  status: RatioStatus;
  unit?: string;
}

export interface RatioSection {
  titleKey: string;
  ratios: FinancialRatio[];
}

interface RatioSectionProps {
  section: RatioSection;
  t: (key: string) => string;
}

export function buildRatioSections(analysisData: ExtractionAnalysis | null | undefined, t: (key: string) => string): RatioSection[] {
  if (!analysisData) {
    return [];
  }

  const allRatioConfigs = [
    liquidityRatios(t),
    solvencyRatios(t),
    profitabilityRatios(t),
    efficiencyRatios(t),
    cashFlowRatios(t),
    bidderSpecificCriticalRatios(t),
  ];

  return allRatioConfigs
    .map((config) => {
      const ratios: FinancialRatio[] = config.ratios.map((ratioKey) => {
        const rawValue = analysisData[ratioKey as keyof ExtractionAnalysis];
        let value: string | number;

        // If value is missing, undefined, or null, set to "N/A"
        if (rawValue === undefined || rawValue === null) {
          value = 'N/A';
        } else if (rawValue === '') {
          value = 'N/A';
        } else if (typeof rawValue === 'number') {
          value = rawValue;
        } else if (typeof rawValue === 'string') {
          value = rawValue;
        } else {
          value = 'N/A';
        }

        const camelKey = snakeToCamel(ratioKey);
        const id = ratioKey.replaceAll('_', '-');
        const unit = ratioUnits[ratioKey] || '';

        return {
          id,
          key: camelKey,
          value: value,
          status: 'passed' as RatioStatus,
          unit,
        };
      });

      return {
        titleKey: config.titleKey,
        ratios,
      };
    })
    .filter((section) => section.ratios.length > 0);
}

export function RatioSectionComponent({ section, t }: Readonly<RatioSectionProps>) {
  return (
    <div className="mb-4 space-y-4">
      <h3 className="border-b border-(--color-filters-border) pb-2 text-sm font-semibold text-(--color-table-header-text-color)">
        {t(`financialStatement.analytics.${section.titleKey}`)}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {section.ratios.map((ratio) => (
          <RatioItem key={ratio.id} ratio={ratio} t={t} isTooltip={true} />
        ))}
      </div>
    </div>
  );
}

function FinancialStatementAnalyticsContent() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();

  const [summaryResult, setSummaryResult] = useState<{ finalResult: string; rationale: string } | null>(null);

  const documentId = (params?.id as string) || '';
  const pathname = usePathname();
  const { setOptions: setBreadcrumbOptions } = useBreadcrumb();

  const queryClient = useQueryClient();
  const exportDocumentReportMutation = useExportDocumentReport();
  const retryAnalysisMutation = useMutation({
    mutationFn: (id: string) => apiFetch<{ message: string; document_id: string }>(`/documents/${id}/retry-analysis`, { method: 'POST' }),
    onSuccess: (_, documentId) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(documentId), refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: [...documentKeys.detail(documentId), 'detail'], refetchType: 'active' });
    },
  });

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isLoadingExport, setIsLoadingExport] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  const snapshotFinancialStatementDataRef = useRef<any>(null);

  const { data: documentDetail, isLoading: isLoadingDocumentDetail } = useDocumentDetail(documentId, DocumentType.FINANCIAL_STATEMENT, {
    enabled: !!documentId,
    include_analysis: true,
    refetchInterval: (query) => {
      const data = query.state.data;
      const analysis = data?.analysis as ExtractionAnalysis | undefined;
      if (analysis && analysis.analysis !== null) {
        setIsLoadingAnalysis(false);
      }

      if (analysis && analysis.analysis === null && !data?.analysis_error) {
        setIsLoadingAnalysis(true);
        return 3000;
      }

      return false;
    },
  });

  const handleBack = () => {
    if (documentDetail?.vendor_name) {
      router.push(ROUTERS.ANALYSIS_VENDOR(documentDetail?.vendor_name));
    } else {
      router.back();
    }
  };

  const handlePreview = () => {
    snapshotFinancialStatementDataRef.current = JSON.parse(JSON.stringify(extractedFinancialStatementData));
    setIsPreviewModalOpen(true);
  };

  const handleExport = async () => {
    if (!documentId) return;

    setIsLoadingExport(true);
    try {
      await exportDocumentReportMutation.mutateAsync({
        documentId,
        fileName: documentDetail?.file_name,
      });
      toast.success(t('financialStatement.exportSuccess'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('financialStatement.exportError');
      toast.error(errorMessage);
    } finally {
      setIsLoadingExport(false);
    }
  };

  const initialExtractedFinancialStatementData = useMemo(() => {
    if (
      documentDetail?.document_type === DocumentType.FINANCIAL_STATEMENT &&
      documentDetail?.data &&
      typeof documentDetail?.data === 'object'
    ) {
      const extraction = documentDetail.data as unknown as FinancialStatementExtractionData;
      return documentDetail.status === DocumentStatus.REVIEW ? extraction.data : extraction;
    }
    return {};
  }, [documentDetail]);

  const [extractedFinancialStatementData, setExtractedFinancialStatementData] = useState<any>(initialExtractedFinancialStatementData);

  useEffect(() => {
    setExtractedFinancialStatementData(initialExtractedFinancialStatementData);
  }, [initialExtractedFinancialStatementData]);

  useEffect(() => {
    snapshotFinancialStatementDataRef.current = null;
  }, [documentDetail]);

  useLayoutEffect(() => {
    const vendor = params?.vendor as string | undefined;
    if (!vendor) return;
    const vendorDecoded = decodeURIComponent(vendor);
    setBreadcrumbOptions({
      items: [
        { label: t('sidebar.analysis'), path: ROUTERS.ANALYSIS },
        { label: vendorDecoded, path: ROUTERS.ANALYSIS_VENDOR(vendorDecoded) },
        { label: documentDetail?.file_name || documentId, path: pathname },
      ],
    });
    return () => setBreadcrumbOptions(null);
  }, [params?.vendor, documentId, documentDetail?.file_name, pathname, t, setBreadcrumbOptions]);

  const updateFinancialStatementField = useCallback((field: keyof any, value: string) => {
    setExtractedFinancialStatementData((prev: any) => ({
      ...prev,
      [field]: {
        ...(prev[field] as any),
        value: value,
      },
    }));
  }, []);

  if (!documentDetail && !isLoadingDocumentDetail) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-md border p-8">
        <img src="/assets/icons/no-data-icon.svg" alt="No data" className="h-10 w-16" />
        <p className="text-sm font-normal text-(--color-table-no-data-icon)">{t('dataTable.noResults')}</p>
      </div>
    );
  }

  const updateAnalysisMutation = useMutation({
    mutationFn: (analysisPayload: Record<string, unknown>) =>
      apiFetch<AnalyzeDetailApiResponse>(`/analyze/${(documentDetail?.analysis as ExtractionAnalysis)?.id}/financial-analysis`, {
        method: 'PATCH',
        body: JSON.stringify(analysisPayload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis', documentId] });
      toast.success(t('analysis.noteSaveSuccess'));
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : t('analysis.noteSaveError');
      toast.error(message);
    },
  });

  const handleAddNote = (newData: object) => {
    updateAnalysisMutation.mutate(newData as Record<string, unknown>);
  };

  const handleRetryAnalysis = async () => {
    try {
      setIsLoadingAnalysis(true);
      await retryAnalysisMutation.mutateAsync(documentId);
      toast.success(t('financialStatement.analytics.retrySuccess') || 'Analysis retry initiated successfully');
    } catch {
      toast.error(t('financialStatement.analytics.retryError') || 'Failed to retry analysis');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card
        header={
          <Heading
            title={decodeURIComponent(params?.vendor as string)}
            subTitle={t('analysis.financialStatementSubTitle')}
            onBack={handleBack}
            actions={[
              {
                title: t('common.verifiedData'),
                onClick: handlePreview,
                type: 'outline',
              },
              {
                title: t('financialStatement.subHeader.export'),
                onClick: handleExport,
                isLoading: isLoadingExport,
                icon: <DownloadIcon className="size-4" />,
                type: 'primary',
              },
            ]}
          />
        }
      >
        <div className="p-6">
          <DocumentInformation
            vendorName={documentDetail?.vendor_name || ''}
            financialYear={(documentDetail?.data as any)?.financial_year?.value || ''}
            currency={(documentDetail?.data as any)?.currency?.value || ''}
            status={documentDetail?.status || ''}
            uploadedBy={documentDetail?.create_by || ''}
          />
        </div>
      </Card>

      {summaryResult && summaryResult.finalResult && summaryResult.rationale && (
        <Card>
          <div className="flex flex-col gap-2 p-6">
            <div className="text-[16px] font-bold text-(--color-table-header-text-color)">{t('analysis.summaryLabel')}</div>
            <div className="flex flex-col gap-2 rounded-[4px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <div>
                <Tag label={summaryResult.finalResult} severity={getTagSeverity(summaryResult.finalResult)} />
              </div>
              <span className="text-[14px]">{String(summaryResult.rationale ?? '')}</span>
            </div>
          </div>
        </Card>
      )}

      <Card contentStyle="p-6">
        {buildRatioSections(documentDetail?.analysis as ExtractionAnalysis | null | undefined, t).map((section) => (
          <RatioSectionComponent key={section.titleKey} section={section} t={t} />
        ))}
      </Card>

      {documentDetail?.analysis_error && (
        <Card contentStyle="p-6 flex flex-col items-center justify-center gap-4">
          <p className="text-sm text-(--color-upload-content-color)">
            {t('financialStatement.analytics.analysisError') || 'Analysis failed. Please retry.'}
          </p>
          <Button onClick={handleRetryAnalysis} title={t('financialStatement.analytics.retry') || 'Retry Analysis'} type="primary" />
        </Card>
      )}

      {isLoadingAnalysis && (
        <Card contentStyle="p-6 flex flex-col items-center justify-center gap-4">
          <p className="text-sm text-(--color-upload-content-color)">We are analyzing your document...</p>
          <Spinner className="size-10 animate-spin text-(--color-sidebar-ring)" />
        </Card>
      )}

      {documentDetail?.analysis && (
        <AnalysisOverview
          analysisData={(documentDetail?.analysis as ExtractionAnalysis)?.analysis ?? {}}
          onAddNote={handleAddNote}
          setSummaryResult={setSummaryResult}
        />
      )}

      <PreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          if (snapshotFinancialStatementDataRef.current) {
            setExtractedFinancialStatementData(snapshotFinancialStatementDataRef.current);
            snapshotFinancialStatementDataRef.current = null;
          }
          setIsPreviewModalOpen(false);
        }}
        extractedData={documentDetail as DocumentDetailResponse}
        extractedFinancialStatementData={extractedFinancialStatementData}
        updateFinancialStatementField={updateFinancialStatementField}
      />
    </div>
  );
}
export default function FinancialStatementAnalyticsPage() {
  return (
    <AppLayout isContentScrollable={true}>
      <FinancialStatementAnalyticsContent />
    </AppLayout>
  );
}
