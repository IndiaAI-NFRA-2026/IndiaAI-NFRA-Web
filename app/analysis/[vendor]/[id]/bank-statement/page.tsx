'use client';

import { useState, useEffect, useLayoutEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useBreadcrumb } from '@/components/breadcrumb';
import { useDocumentDetail, useUpdateBankAnalysis } from '@/lib/query/use-documents';
import { Spinner } from '@/components/ui/spinner';
import BankStatementDetailInformation from '@/components/bank-statement/bank-statement-detail/bank-statement-detail-information';
import { BankStatementResponse, ExtractionAnalysis } from '@/types/analysis';
import { PreviewModal } from '@/components/bank-statement/bank-statement-detail/preview-modal';
import { DocumentType } from '@/enums/document-type';
import { parseNumberValue } from '@/lib/utils/helpers';
import type { ExtractedBankStatementData } from '@/types/documents';
import { toast } from 'sonner';
import { useMe } from '@/lib/query/use-auth';
import { hasAccessToPage } from '@/lib/auth/rbac';
import { USER_ROLE } from '@/enums/auth';
import BalanceMetrics from '@/components/bank-statement/bank-statement-detail/balance-metrics';
import CashFlow from '@/components/bank-statement/bank-statement-detail/cash-flow';
import CreditMetrics from '@/components/bank-statement/bank-statement-detail/credit-metrics';
import { BankStatementExtractionAnalysisResponse, RiskPattern } from '@/types/analysis';
import RiskPatterns from '@/components/bank-statement/bank-statement-detail/risk-patterns';
import TransactionCategories from '@/components/bank-statement/bank-statement-detail/transaction-categories';
import { AppLayout } from '@/components/layout/app-layout';
import { InfoIcon } from 'lucide-react';
import Card from '@/components/card';
import { Heading } from '@/components/heading';
import { ROUTERS } from '@/constants/routers';

function BankStatementAnalyticsContent() {
  const { data: user } = useMe();
  const isComplianceOfficer = hasAccessToPage(user?.role as USER_ROLE, ROUTERS.ANALYSIS);
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const vendorName = (params?.vendor as string) || '';

  const documentId = (params?.id as string) || '';
  const pathname = usePathname();
  const { setOptions: setBreadcrumbOptions } = useBreadcrumb();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const snapshotBankStatementDataRef = useRef<ExtractedBankStatementData | null>(null);
  const updateBankAnalysisMutation = useUpdateBankAnalysis();

  const { data: documentDetail, isLoading } = useDocumentDetail(documentId, DocumentType.BANK_STATEMENT, {
    enabled: !!documentId,
    include_analysis: true,
    refetchInterval: (query) => {
      const data = query.state.data;
      const analysis = data?.analysis as BankStatementExtractionAnalysisResponse | null | undefined;
      if (analysis === null && !(data as any)?.analysis_error) {
        return 3000;
      }
      return false;
    },
  });

  const analysis = documentDetail?.analysis as BankStatementExtractionAnalysisResponse | null | undefined;
  const isPolling = analysis === null && !(documentDetail as any)?.analysis_error;

  const initialExtractedBankStatementData = useMemo(() => {
    if (documentDetail?.document_type === DocumentType.BANK_STATEMENT && documentDetail?.data && typeof documentDetail?.data === 'object') {
      const extraction = documentDetail.data as any;
      return {
        accountName: extraction.account?.account_holder_name?.value || '',
        accountHolderAddress: extraction.account?.account_holder_address?.value || '',
        accountCurrency: extraction.account?.currency?.value || '',
        endingBalance: extraction.account?.closing_balance?.value || '',
        accountNumber: extraction.account?.account_number?.value || '',
        bankName: extraction.account?.bank_name?.value || '',
        beginningBalance: extraction.account?.opening_balance?.value || '',
        transactions: extraction.transactions || [],
        monthlySummaries: extraction.monthly_summaries || [],
      };
    }
    return {
      accountName: '',
      accountHolderAddress: '',
      accountCurrency: documentDetail?.preferred_currency || '',
      endingBalance: '',
      accountNumber: '',
      bankName: '',
      beginningBalance: '',
      transactions: [],
      monthlySummaries: [],
    };
  }, [documentDetail]);

  const [extractedBankStatementData, setExtractedBankStatementData] =
    useState<ExtractedBankStatementData>(initialExtractedBankStatementData);

  useEffect(() => {
    setExtractedBankStatementData(initialExtractedBankStatementData);
  }, [initialExtractedBankStatementData]);

  useEffect(() => {
    snapshotBankStatementDataRef.current = null;
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

  const handleBack = () => {
    router.back();
  };

  const handlePreview = () => {
    snapshotBankStatementDataRef.current = JSON.parse(JSON.stringify(extractedBankStatementData));
    setIsPreviewOpen(true);
  };

  const handleUpdateRiskPattern = async (riskPatterns: RiskPattern[]) => {
    if (!documentId) return;

    try {
      const analysis = {
        ...documentDetail?.analysis,
        risk_patterns: riskPatterns,
      };
      await updateBankAnalysisMutation.mutateAsync({
        id: documentId,
        analysis: analysis as ExtractionAnalysis,
      });
      toast.success(t('bankStatement.riskPatterns.updateSuccess'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('bankStatement.riskPatterns.updateError');
      toast.error(errorMessage);
    }
  };

  const updateBankStatementField = (field: keyof ExtractedBankStatementData, value: string) => {
    setExtractedBankStatementData((prev: ExtractedBankStatementData) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateBankStatementTransaction = useCallback((index: number, field: string, value: string) => {
    const stringFields = ['date', 'month', 'description', 'type', 'mode', 'txn_id', 'reference_number'];
    const numberFields = ['amount', 'balance'];
    const numberWithRawFields = ['debit', 'credit', 'running_balance'];

    setExtractedBankStatementData((prev: ExtractedBankStatementData) => ({
      ...prev,
      transactions: prev.transactions.map((tx, i) => {
        if (i !== index) return tx;

        const updated = { ...tx } as any;

        if (stringFields.includes(field)) {
          const fieldKey = field as keyof typeof tx;
          updated[field] = {
            ...(tx[fieldKey] as any),
            value: value || null,
          };
        } else if (numberFields.includes(field)) {
          const fieldKey = field as keyof typeof tx;
          updated[field] = {
            ...(tx[fieldKey] as any),
            value: value.endsWith('.') && value.length > 1 ? parseFloat(value.slice(0, -1)) || null : parseNumberValue(value),
            raw: value || '',
          };
        } else if (numberWithRawFields.includes(field)) {
          const fieldKey = field as keyof typeof tx;
          updated[field] = {
            ...(tx[fieldKey] as any),
            value: value.endsWith('.') && value.length > 1 ? parseFloat(value.slice(0, -1)) || null : parseNumberValue(value),
            raw: value || '',
          };
        }

        return updated;
      }),
    }));
  }, []);

  const handleViewFullReport = () => {
    if (documentId) {
      router.push(ROUTERS.FRAUD_DETECTION_VENDOR_ID(decodeURIComponent(vendorName), String(documentId)));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-10 animate-spin text-(--color-sidebar-ring)" />
      </div>
    );
  }

  if (!documentDetail && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-md border p-8">
        <img src="/assets/icons/no-data-icon.svg" alt="No data" className="h-10 w-16" />
        <p className="text-sm font-normal text-(--color-table-no-data-icon)">{t('dataTable.noResults')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      <div className="flex flex-col gap-6">
        <Card
          header={
            <Heading
              title={decodeURIComponent(vendorName)}
              subTitle={t('analysis.bankStatementSubTitle')}
              onBack={handleBack}
              actions={[
                {
                  title: t('common.verifiedData'),
                  onClick: handlePreview,
                  type: 'outline',
                },
              ]}
            />
          }
        >
          <div className="rounded bg-(--color-background-color) p-6">
            <BankStatementDetailInformation documentDetail={documentDetail as unknown as BankStatementResponse} />
          </div>
        </Card>

        <Card>
          <div className="p-6">
            {isPolling ? (
              <div className="rounded border border-(--color-filters-border) bg-(--color-background-color) p-4">
                <div className="flex items-center justify-center gap-3">
                  <Spinner className="size-5 animate-spin text-(--color-sidebar-ring)" />
                  <p className="text-sm text-(--color-upload-content-color)">{t('bankStatement.analytics.fetchingAnalysis')}</p>
                </div>
              </div>
            ) : (
              <>
                <BalanceMetrics documentDetail={documentDetail as unknown as BankStatementResponse} />
                <CashFlow documentDetail={documentDetail as unknown as BankStatementResponse} />
                <TransactionCategories documentDetail={documentDetail as unknown as BankStatementResponse} />
                <RiskPatterns
                  idDocument={documentId}
                  documentDetail={documentDetail as unknown as BankStatementResponse}
                  handleUpdateRiskPattern={handleUpdateRiskPattern}
                />
                <CreditMetrics documentDetail={documentDetail as unknown as BankStatementResponse} />
                {documentDetail && documentDetail?.fraud_transactions_count && documentDetail?.fraud_transactions_count > 0 ? (
                  <div className="mb-6 rounded border border-(--color-filters-border)">
                    <div className="m-3 mr-5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-medium text-(--color-table-header-text-color)">{t('fraudAnomaly.detail.title')}</h2>
                      </div>
                      {documentId && (
                        <button
                          onClick={handleViewFullReport}
                          className="cursor-pointer text-sm font-medium text-(--color-sidebar-primary) hover:opacity-70"
                        >
                          {t('bankStatement.viewFullDetection')} →
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  ''
                )}
                <div className="flex items-center gap-2 pt-6">
                  <InfoIcon className="size-4" />
                  <span className="text-[14px]">{t('common.clearSightDisclaimer')}</span>
                </div>
              </>
            )}
          </div>
        </Card>
        <PreviewModal
          isOpen={isPreviewOpen}
          onClose={() => {
            if (snapshotBankStatementDataRef.current) {
              setExtractedBankStatementData(snapshotBankStatementDataRef.current);
              snapshotBankStatementDataRef.current = null;
            }
            setIsPreviewOpen(false);
          }}
          documentDetail={documentDetail as any}
          extractedBankStatementData={extractedBankStatementData}
          onUpdateField={updateBankStatementField}
          onUpdateTransaction={updateBankStatementTransaction}
        />
      </div>
    </div>
  );
}
export default function BankStatementAnalyticsPage() {
  return (
    <AppLayout>
      <BankStatementAnalyticsContent />
    </AppLayout>
  );
}
