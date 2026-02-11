'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useBreadcrumb } from '@/components/breadcrumb';
import CombinedAnalysisDetailInformation from '@/components/combined-analysis/combined-analysis-detail-information';
import { useState, useEffect, useLayoutEffect } from 'react';
import { toast } from 'sonner';
import { useMe } from '@/lib/query/use-auth';
import { hasAccessToPage } from '@/lib/auth/rbac';
import { USER_ROLE } from '@/enums/auth';
import {
  useCombinedAnalysisDetail,
  useUpdateCombinedAnalysisAnalysis,
  useExportCombinedAnalysisReport,
} from '@/lib/query/use-vendor-documents';
import { Spinner } from '@/components/ui/spinner';
import { CombinedAnalysisDetail } from '@/types/analysis';
import { AppLayout } from '@/components/layout/app-layout';
import Card from '@/components/card';
import { Heading } from '@/components/heading';
import { ROUTERS } from '@/constants/routers';
import AnalysisOverview from '@/components/analysis/overview';
import { DownloadIcon } from 'lucide-react';

function CombinedAnalysisContent() {
  const { data: user } = useMe();
  const isComplianceOfficer = hasAccessToPage(user?.role as USER_ROLE, ROUTERS.ANALYSIS);
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();

  const combinedAnalyzeId = (params?.id as string) || '';
  const pathname = usePathname();
  const { setOptions: setBreadcrumbOptions } = useBreadcrumb();
  const [isLoadingExport, setIsLoadingExport] = useState(false);

  const { data: combinedAnalysisDetail, isLoading } = useCombinedAnalysisDetail(combinedAnalyzeId, {
    enabled: !!combinedAnalyzeId,
  });

  const updateCombinedAnalysisMutation = useUpdateCombinedAnalysisAnalysis();
  const exportCombinedAnalysisMutation = useExportCombinedAnalysisReport();

  const vendorName = combinedAnalysisDetail?.vendor_name || '';
  const overallResult = (combinedAnalysisDetail?.analysis?.final_recommendation?.overall_analysis_result?.['Final Result'] || null) as
    | 'Strong'
    | 'Medium'
    | 'Weak'
    | null
    | undefined;

  const [analysisDataEdit, setAnalysisDataEdit] = useState<CombinedAnalysisDetail | null>(null);

  useEffect(() => {
    if (combinedAnalysisDetail?.analysis) {
      setAnalysisDataEdit(combinedAnalysisDetail.analysis);
    }
  }, [combinedAnalysisDetail?.analysis]);

  useLayoutEffect(() => {
    const vendor = params?.vendor as string | undefined;
    if (!vendor) return;
    const vendorDecoded = decodeURIComponent(vendor);
    const thirdLabel =
      combinedAnalysisDetail?.name ||
      (combinedAnalysisDetail?.fy_period && combinedAnalysisDetail?.vendor_name
        ? `${combinedAnalysisDetail.fy_period} - ${combinedAnalysisDetail.vendor_name}`
        : null) ||
      combinedAnalyzeId;
    const vendorLabel = combinedAnalysisDetail?.vendor_name || vendorDecoded;
    setBreadcrumbOptions({
      items: [
        { label: t('sidebar.analysis'), path: ROUTERS.ANALYSIS },
        { label: vendorLabel, path: ROUTERS.ANALYSIS_VENDOR(vendorDecoded) },
        { label: thirdLabel, path: pathname },
      ],
    });
    return () => setBreadcrumbOptions(null);
  }, [
    params?.vendor,
    combinedAnalyzeId,
    combinedAnalysisDetail?.name,
    combinedAnalysisDetail?.fy_period,
    combinedAnalysisDetail?.vendor_name,
    pathname,
    t,
    setBreadcrumbOptions,
  ]);

  const handleAddNote = async (newData: object) => {
    if (!analysisDataEdit || !combinedAnalyzeId) {
      return;
    }
    updateCombinedAnalysisMutation.mutate({ combinedAnalyzeId, analysis: { ...analysisDataEdit, ...newData } });
  };

  const handleBack = () => {
    router.back();
  };

  const handleExport = async () => {
    if (!combinedAnalyzeId) return;

    setIsLoadingExport(true);
    try {
      await exportCombinedAnalysisMutation.mutateAsync({ combinedAnalyzeName: combinedAnalysisDetail?.name || '', combinedAnalyzeId });
      toast.success(t('combinedAnalysis.exportSuccess'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('combinedAnalysis.exportError');
      toast.error(errorMessage);
    } finally {
      setIsLoadingExport(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-10 animate-spin text-(--color-sidebar-ring)" />
      </div>
    );
  }

  if (!combinedAnalysisDetail) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-(--color-sidebar-foreground)">{t('dataTable.noResults')}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-1 flex-col gap-6">
      <Card
        header={
          <Heading
            title={decodeURIComponent(vendorName)}
            subTitle={t('analysis.combinedAnalysisSubTitle')}
            onBack={handleBack}
            actions={[
              {
                title: t('combinedAnalysis.export'),
                onClick: handleExport,
                isLoading: isLoadingExport,
                icon: <DownloadIcon className="size-4" />,
                type: 'primary',
              },
            ]}
          />
        }
      >
        <div className="rounded bg-(--color-background-color) p-6">
          <CombinedAnalysisDetailInformation vendorName={vendorName} overallResult={overallResult} />
        </div>
      </Card>

      {analysisDataEdit && (
        <Card>
          <AnalysisOverview analysisData={analysisDataEdit} onAddNote={handleAddNote} />
        </Card>
      )}
    </div>
  );
}

export default function CombinedAnalysisPage() {
  return (
    <AppLayout isContentScrollable={true}>
      <CombinedAnalysisContent />
    </AppLayout>
  );
}
