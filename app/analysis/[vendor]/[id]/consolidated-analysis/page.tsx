'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { DocumentInformation } from '@/components/financial-statement/analytics/document-information';
import { useBreadcrumb } from '@/components/breadcrumb';
import { useLayoutEffect, useState } from 'react';
import { toast } from 'sonner';
import { documentKeys, useExportDocumentReport } from '@/lib/query/use-documents';
import { AnalyzeDetailApiResponse } from '@/types/analysis';
import { Heading } from '@/components/heading';
import Card from '@/components/card';
import { ROUTERS } from '@/constants/routers';
import { AppLayout } from '@/components/layout/app-layout';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import AnalysisOverview from '@/components/analysis/overview';
import { Button } from '@/components/button';
import { Spinner } from '@/components/ui/spinner';
import { DownloadIcon } from 'lucide-react';

function ConsolidatedAnalyticsContent() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();

  const documentId = (params?.id as string) || '';
  const vendor = (params?.vendor as string) || '';
  const pathname = usePathname();
  const { setOptions: setBreadcrumbOptions } = useBreadcrumb();
  const queryClient = useQueryClient();

  const retryAnalysisMutation = useMutation({
    mutationFn: (id: string) => apiFetch<string>(`/analyze/${id}/retry-consolidated-analysis`, { method: 'POST' }),
    onSuccess: (response) => {
      router.push(ROUTERS.CONSOLIDATED_ANALYSIS_VENDOR_ID(decodeURIComponent(vendor), response));
      const idToInvalidate = response || documentId;
      queryClient.invalidateQueries({ queryKey: ['analysis', idToInvalidate] });
      queryClient.invalidateQueries({ queryKey: ['analysis', decodeURIComponent(vendor)] });
      queryClient.invalidateQueries({ queryKey: [...documentKeys.detail(idToInvalidate), 'detail'], refetchType: 'active' });
    },
  });

  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  const exportDocumentReportMutation = useExportDocumentReport();

  const [isLoadingExport, setIsLoadingExport] = useState(false);

  const { data: consolidatedAnalysisData, isLoading: isLoadingConsolidatedAnalysis } = useQuery({
    queryKey: ['analysis', documentId],
    queryFn: () => apiFetch<AnalyzeDetailApiResponse>(`/analyze/${documentId}`),
    enabled: !!documentId,
    refetchInterval: (query) => {
      const data = query.state.data;
      const hasData = data?.results != null && Object.keys(data.results).length > 0;

      if (data && data.analyze_error === null && !hasData) {
        setIsLoadingAnalysis(true);
        return 3000;
      } else if (data && data.analyze_error === null && hasData) {
        setIsLoadingAnalysis(false);
      }
      return false;
    },
    refetchIntervalInBackground: false,
  });

  const handleBack = () => {
    router.push(ROUTERS.ANALYSIS_VENDOR(decodeURIComponent(vendor)));
  };

  const handleExport = async () => {
    if (!documentId) return;

    setIsLoadingExport(true);
    try {
      await exportDocumentReportMutation.mutateAsync({
        documentId,
        fileName: consolidatedAnalysisData?.name,
      });
      toast.success(t('financialStatement.exportSuccess'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('financialStatement.exportError');
      toast.error(errorMessage);
    } finally {
      setIsLoadingExport(false);
    }
  };

  const updateNoteMutation = useMutation({
    mutationFn: (results: AnalyzeDetailApiResponse['results']) =>
      apiFetch<AnalyzeDetailApiResponse>(`/analyze/${documentId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...consolidatedAnalysisData?.results,
          ...results,
        }),
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
    updateNoteMutation.mutate(newData as AnalyzeDetailApiResponse['results']);
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

  useLayoutEffect(() => {
    const vendor = params?.vendor as string | undefined;
    if (!vendor) return;
    const vendorDecoded = decodeURIComponent(vendor);
    setBreadcrumbOptions({
      items: [
        { label: t('sidebar.analysis'), path: ROUTERS.ANALYSIS },
        { label: vendorDecoded, path: ROUTERS.ANALYSIS_VENDOR(vendorDecoded) },
        { label: consolidatedAnalysisData?.name || documentId, path: pathname },
      ],
    });
    return () => setBreadcrumbOptions(null);
  }, [params?.vendor, documentId, consolidatedAnalysisData?.name, pathname, t, setBreadcrumbOptions]);

  if (!consolidatedAnalysisData && !isLoadingConsolidatedAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-md border p-8">
        <img src="/assets/icons/no-data-icon.svg" alt="No data" className="h-10 w-16" />
        <p className="text-sm font-normal text-(--color-table-no-data-icon)">{t('dataTable.noResults')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card
        header={
          <Heading
            title={decodeURIComponent(vendor)}
            subTitle={t('analysis.financialStatementSubTitle')}
            onBack={handleBack}
            actions={[
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
            vendorName={consolidatedAnalysisData?.name || ''}
            financialYear={consolidatedAnalysisData?.fy_period || ''}
            currency={consolidatedAnalysisData?.currency || ''}
            status={''}
          />
        </div>
      </Card>

      {consolidatedAnalysisData?.analyze_error && (
        <Card contentStyle="p-6 flex flex-col items-center justify-center gap-4">
          <p className="text-sm text-(--color-upload-content-color)">Analysis failed. Please retry.</p>
          <Button onClick={handleRetryAnalysis} title={t('financialStatement.analytics.retry') || 'Retry Analysis'} type="primary" />
        </Card>
      )}

      {isLoadingAnalysis && (
        <Card contentStyle="p-6 flex flex-col items-center justify-center gap-4">
          <p className="text-sm text-(--color-upload-content-color)">We are analyzing your document...</p>
          <Spinner className="size-10 animate-spin text-(--color-sidebar-ring)" />
        </Card>
      )}

      {consolidatedAnalysisData?.results && (
        <Card contentStyle="p-6">
          <AnalysisOverview analysisData={consolidatedAnalysisData?.results ?? {}} onAddNote={handleAddNote} />
        </Card>
      )}
    </div>
  );
}
export default function ConsolidatedAnalyticsPage() {
  return (
    <AppLayout isContentScrollable={true}>
      <ConsolidatedAnalyticsContent />
    </AppLayout>
  );
}
