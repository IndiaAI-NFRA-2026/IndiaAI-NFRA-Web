'use client';

import { useState, useEffect, useLayoutEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useBreadcrumb } from '@/components/breadcrumb';
import { useApproveDocument, useUploadDocumentDetail, useAnalysisStatus } from '@/lib/query/use-documents';
import { DocumentPreviewPanel } from '@/components/upload-history/document-detail/document-preview-panel';
import { ExtractedBankStatementDataPanel } from '@/components/upload-history/document-detail/extracted-bank-statement-data-panel';
import { ExtractedFinancialStatementDataPanel } from '@/components/upload-history/document-detail/extracted-financial-statement-data-panel';
import type { ExtractedBankStatementData, FinancialStatementExtractionData } from '@/types/documents';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { DocumentType } from '@/enums/document-type';
import { DocumentStatus } from '@/enums';
import { parseNumberValue } from '@/lib/utils/helpers';
import { Heading } from '@/components/heading';
import { ArrowLeftIcon, Check, EyeIcon, PencilLineIcon, Save, ThumbsUpIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/button';
import { Modal } from '@/components/modal';
import { AppLayout } from '@/components/layout/app-layout';
import { ROUTERS } from '@/constants/routers';

function ReviewExtractionDocumentContent() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const documentId = (params?.id as string) || '';
  const venderName = (params?.vendor as string) || '';
  const pathname = usePathname();
  const { setOptions: setBreadcrumbOptions } = useBreadcrumb();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalConfirm, setIsModalConfirm] = useState(false);
  const [isModalSuccess, setIsModalSuccess] = useState(false);
  const [isCompletedAnalysis, setIsCompletedAnalysis] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [approvedDocumentId, setApprovedDocumentId] = useState<string | null>(null);

  const snapshotBankStatementDataRef = useRef<ExtractedBankStatementData | null>(null);
  const snapshotFinancialStatementDataRef = useRef<any>(null);

  const approveDocumentMutation = useApproveDocument();

  const {
    data: documentDetail,
    isLoading: isLoadingDocument,
    error: documentError,
  } = useUploadDocumentDetail(documentId, {
    enabled: !!documentId,
  });

  const { data: analysisStatus } = useAnalysisStatus(analysisId, {
    enabled: !!analysisId && isModalSuccess && !isCompletedAnalysis,
    refetchInterval: (query) => {
      const status = query.state.data;
      if (status === false || status === undefined) {
        return 3000;
      }
      return false;
    },
  });

  useEffect(() => {
    if (analysisStatus === true) {
      setIsCompletedAnalysis(true);
    }
  }, [analysisStatus]);

  const initialExtractedBankStatementData = useMemo(() => {
    if (documentDetail?.document_type === DocumentType.BANK_STATEMENT && documentDetail?.data && typeof documentDetail?.data === 'object') {
      const extraction = documentDetail.data as any;
      const account = extraction?.account || {};

      return {
        accountName: account.account_holder_name?.value ?? '',
        accountHolderAddress: account.account_holder_address?.value ?? '',
        accountCurrency: account.currency?.value ?? '',
        endingBalance: account.closing_balance?.value ?? '',
        accountNumber: account.account_number?.value ?? '',
        bankName: account.bank_name?.value ?? '',
        beginningBalance: account.opening_balance?.value ?? '',
        transactions: Array.isArray(extraction.transactions) ? extraction.transactions : [],
        monthlySummaries: Array.isArray(extraction.monthly_summaries) ? extraction.monthly_summaries : [],
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
    };
  }, [documentDetail]);

  const [extractedBankStatementData, setExtractedBankStatementData] =
    useState<ExtractedBankStatementData>(initialExtractedBankStatementData);

  useEffect(() => {
    setExtractedBankStatementData(initialExtractedBankStatementData);
  }, [initialExtractedBankStatementData]);

  const initialExtractedFinancialStatementData = useMemo(() => {
    if (
      documentDetail?.document_type === DocumentType.FINANCIAL_STATEMENT &&
      documentDetail?.data &&
      typeof documentDetail?.data === 'object'
    ) {
      const extraction = documentDetail.data as unknown as FinancialStatementExtractionData;
      return extraction.data;
    }
    return {};
  }, [documentDetail]);

  const [extractedFinancialStatementData, setExtractedFinancialStatementData] = useState<any>(initialExtractedFinancialStatementData);

  useEffect(() => {
    setExtractedFinancialStatementData(initialExtractedFinancialStatementData);
  }, [initialExtractedFinancialStatementData]);

  useEffect(() => {
    snapshotBankStatementDataRef.current = null;
    snapshotFinancialStatementDataRef.current = null;
  }, [documentDetail]);

  useLayoutEffect(() => {
    const vendor = params?.vendor as string | undefined;
    if (!vendor) return;
    const vendorDecoded = decodeURIComponent(vendor);
    setBreadcrumbOptions({
      items: [
        { label: t('sidebar.reviewExtraction'), path: ROUTERS.REVIEW_EXTRACTION },
        { label: vendorDecoded, path: ROUTERS.REVIEW_EXTRACTION_VENDOR(vendorDecoded) },
        { label: documentDetail?.file_name || documentId, path: pathname },
      ],
    });
    return () => setBreadcrumbOptions(null);
  }, [params?.vendor, documentId, documentDetail?.file_name, pathname, t, setBreadcrumbOptions]);

  const fileUrl = documentDetail?.s3_url || '';

  const handleBack = () => {
    router.push(ROUTERS.REVIEW_EXTRACTION_VENDOR(decodeURIComponent(venderName)));
  };

  const handleEdit = () => {
    if (documentDetail?.document_type === DocumentType.BANK_STATEMENT) {
      snapshotBankStatementDataRef.current = JSON.parse(JSON.stringify(extractedBankStatementData));
    } else if (documentDetail?.document_type === DocumentType.FINANCIAL_STATEMENT) {
      snapshotFinancialStatementDataRef.current = JSON.parse(JSON.stringify(extractedFinancialStatementData));
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (documentDetail?.document_type === DocumentType.BANK_STATEMENT && snapshotBankStatementDataRef.current) {
      setExtractedBankStatementData(snapshotBankStatementDataRef.current);
      snapshotBankStatementDataRef.current = null;
    } else if (documentDetail?.document_type === DocumentType.FINANCIAL_STATEMENT && snapshotFinancialStatementDataRef.current) {
      setExtractedFinancialStatementData(snapshotFinancialStatementDataRef.current);
      snapshotFinancialStatementDataRef.current = null;
    }
    setIsEditing(false);
  };

  const transformToDocumentBankStatementData = (extractedBankStatementData: ExtractedBankStatementData) => {
    return {
      ...documentDetail?.data,
      account: {
        ...(documentDetail?.data as any)?.account,
        account_holder_name: {
          ...(documentDetail?.data as any)?.account?.account_holder_name,
          value: extractedBankStatementData.accountName,
        },
        account_holder_address: {
          ...(documentDetail?.data as any)?.account?.account_holder_address,
          value: extractedBankStatementData.accountHolderAddress,
        },
        currency: {
          ...(documentDetail?.data as any)?.account?.currency,
          value: extractedBankStatementData.accountCurrency,
        },
        account_number: {
          ...(documentDetail?.data as any)?.account?.account_number,
          value: extractedBankStatementData.accountNumber,
        },
        bank_name: {
          ...(documentDetail?.data as any)?.account?.bank_name,
          value: extractedBankStatementData.bankName,
        },
        opening_balance: {
          ...(documentDetail?.data as any)?.account?.opening_balance,
          value: extractedBankStatementData.beginningBalance,
        },
        closing_balance: {
          ...(documentDetail?.data as any)?.account?.closing_balance,
          value: extractedBankStatementData.endingBalance,
        },
      },
      transactions: extractedBankStatementData.transactions,
    };
  };

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      let extractJsonData = {};
      if (documentDetail?.document_type === DocumentType.BANK_STATEMENT) {
        extractJsonData = transformToDocumentBankStatementData(extractedBankStatementData);
      }

      if (documentDetail?.document_type === DocumentType.FINANCIAL_STATEMENT) {
        extractJsonData = extractedFinancialStatementData;
      }
      const response = await approveDocumentMutation.mutateAsync({
        id: documentId,
        data: {
          data: extractJsonData,
        } as any,
        type: 'approve',
      });

      setAnalysisId(response.analysis_id);
      setApprovedDocumentId(response.approved_document_id);
      setIsLoading(false);
      setIsModalConfirm(false);
      setIsModalSuccess(true);
      setIsCompletedAnalysis(false);
    } catch {
      setIsLoading(false);
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
    const numberFields = ['amount', 'balance', 'debit', 'credit', 'running_balance'];

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
            value:
              value.endsWith('.') && value.length > 1
                ? parseFloat(value.slice(0, -1)) || null
                : value === '.'
                  ? null
                  : parseNumberValue(value),
            raw: value || '',
          };
        }

        return updated;
      }),
    }));
  }, []);

  const updateFinancialStatementField = useCallback((field: keyof any, value: string) => {
    setExtractedFinancialStatementData((prev: any) => ({
      ...prev,
      [field]: {
        ...(prev[field] as any),
        value: value,
      },
    }));
  }, []);

  if (!documentId) {
    router.push(ROUTERS.REVIEW_EXTRACTION);
    return null;
  }

  if (isLoadingDocument) {
    return (
      <div className="flex h-screen items-center justify-center bg-(--color-background-color)">
        <div className="text-center">
          <p className="text-lg text-gray-600">{t('financialStatement.message.loading')}</p>
        </div>
      </div>
    );
  }

  if (documentError && !isLoadingDocument) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-md border p-8">
        <img src="/assets/icons/no-data-icon.svg" alt="No data" className="h-10 w-16" />
        <p className="text-sm font-normal text-(--color-table-no-data-icon)">{t('dataTable.noResults')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-scroll rounded bg-(--color-background-color) shadow-[0_2px_8px_0_rgba(0,0,0,0.15)]">
      <Heading
        title={decodeURIComponent(venderName)}
        subTitle={t('reviewExtraction.pageSubTitle')}
        onBack={handleBack}
        actions={
          documentDetail?.status === DocumentStatus.APPROVED || !documentDetail?.is_uploader
            ? undefined
            : [
                {
                  title: isEditing ? t('button.cancel') : t('button.edit'),
                  onClick: () => (isEditing ? handleCancel() : handleEdit()),
                  icon: isEditing ? <XIcon className="size-4" /> : <PencilLineIcon className="size-4" />,
                  type: 'outline',
                },
              ]
        }
      />

      <div className="flex flex-col gap-4 p-6 md:flex-row">
        <DocumentPreviewPanel fileUrl={fileUrl} />
        {documentDetail?.document_type === DocumentType.BANK_STATEMENT ? (
          <ExtractedBankStatementDataPanel
            extractedData={extractedBankStatementData}
            isEditing={isEditing}
            onUpdateField={updateBankStatementField}
            onUpdateTransaction={updateBankStatementTransaction}
            originalData={documentDetail?.data}
          />
        ) : (
          <ExtractedFinancialStatementDataPanel
            extractedData={extractedFinancialStatementData}
            isEditing={isEditing}
            onUpdateField={updateFinancialStatementField}
            originalData={documentDetail?.data}
          />
        )}
      </div>
      <div className="inline-flex justify-end gap-3 p-4">
        {isEditing ? (
          <Button
            title={t('button.cancel')}
            onClick={handleCancel}
            icon={<XIcon className="size-4" />}
            type="outline"
            isLoading={isLoading}
          />
        ) : (
          <Button title={'Back'} onClick={handleBack} type="outline" isLoading={isLoading} icon={<ArrowLeftIcon className="size-4" />} />
        )}

        <Button
          title={
            documentDetail?.status === DocumentStatus.APPROVED ? t('reviewExtraction.viewAnalysis') : t('reviewExtraction.generateAnalysis')
          }
          onClick={() => {
            if (documentDetail?.status === DocumentStatus.APPROVED) {
              if (documentDetail?.document_type === DocumentType.BANK_STATEMENT) {
                router.push(
                  ROUTERS.BANK_STATEMENT_ANALYSIS_VENDOR_ID(decodeURIComponent(venderName), String(documentDetail?.approved_document_id))
                );
              } else {
                router.push(
                  ROUTERS.FINANCIAL_ANALYSIS_VENDOR_ID(decodeURIComponent(venderName), String(documentDetail?.approved_document_id))
                );
              }
            } else {
              setIsModalConfirm(true);
            }
          }}
          icon={
            isEditing ? (
              <Save className="size-4" />
            ) : documentDetail?.status === DocumentStatus.APPROVED ? (
              <EyeIcon className="size-4" />
            ) : (
              <ThumbsUpIcon className="size-4" />
            )
          }
          type="primary"
          isLoading={isLoading}
        />
      </div>

      <Modal
        isOpen={isModalConfirm}
        onClose={() => setIsModalConfirm(false)}
        onConfirm={handleApprove}
        showCloseButton={false}
        title={t('reviewExtraction.approveDataGenerateAnalysis')}
        confirmButtonText={t('reviewExtraction.generateAnalysis')}
        headerClassName="!text-center"
        contentClassName="md:max-w-xl!"
        footerClassName="!justify-center"
        isLoading={isLoading}
        renderDescription={() => (
          <div className="px-6 md:px-10">
            <p className="text-sm text-nowrap text-gray-700">{t('reviewExtraction.approveModalIntro')}</p>
            <ul className="list-inside list-disc text-sm wrap-break-word break-all text-gray-700">
              <li>{t('reviewExtraction.extractedDataLocked')}</li>
              <li>{t('reviewExtraction.correctionRequireNewExtraction')}</li>
              <li>
                {documentDetail?.document_type === DocumentType.BANK_STATEMENT
                  ? t('reviewExtraction.bankAnalysisGenerated')
                  : t('reviewExtraction.financialAnalysisGenerated')}
              </li>
            </ul>
            <p className="text-sm wrap-break-word break-all text-gray-700">{t('reviewExtraction.pleaseConfirmReviewed')}</p>
          </div>
        )}
      />

      <Modal
        isOpen={isModalSuccess}
        onClose={() => setIsModalSuccess(false)}
        onConfirm={() => {
          setIsModalSuccess(false);
          router.push(
            documentDetail?.document_type === DocumentType.BANK_STATEMENT
              ? ROUTERS.BANK_STATEMENT_ANALYSIS_VENDOR_ID(decodeURIComponent(venderName), String(approvedDocumentId))
              : ROUTERS.FINANCIAL_ANALYSIS_VENDOR_ID(decodeURIComponent(venderName), String(approvedDocumentId))
          );
        }}
        showCloseButton={false}
        contentClassName="md:max-w-xl!"
        footerClassName="!justify-center"
        confirmButtonText={t('reviewExtraction.viewAnalysis')}
        cancelButtonText={t('common.close')}
        confirmDisabled={!isCompletedAnalysis}
        renderDescription={() => (
          <div className="flex flex-col items-center justify-center gap-6 p-6">
            {isCompletedAnalysis ? (
              <>
                <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[#52C41A]">
                  <Check className="size-10 text-white" />
                </div>
                <div className="flex w-[210px] items-center gap-2 rounded-full border border-[#E3E3E3] bg-[#F4F4F4] p-[2px]">
                  <div className="h-[12px] w-full rounded-full bg-[#2E9BFF]"></div>
                </div>
              </>
            ) : (
              <>
                <Image src="/assets/gif/scanning.gif" alt="Scanning" width={150} height={150} />
                <div className="flex w-[210px] items-center gap-2 rounded-full border border-[#E3E3E3] bg-[#F4F4F4] p-[2px]">
                  <div className="h-[12px] w-[12px] rounded-full bg-[#2E9BFF]"></div>
                </div>
              </>
            )}

            <div className="flex flex-col items-center justify-center gap-1">
              <p className="text-center text-sm text-gray-700">We’re generating the analysis based on the approved documents.</p>
              <p className="text-center text-sm text-gray-700">This process usually takes 3–5 minutes.</p>
            </div>
            <div className="flex justify-center bg-[#EEF0F4] p-[8px] text-center">
              <span className="text-[12px] text-[#4F4F4F]">{t('reviewExtraction.noteWaitOrClose')}</span>
            </div>
          </div>
        )}
      />
    </div>
  );
}
export default function ReviewExtractionDocumentPage() {
  return (
    <AppLayout>
      <ReviewExtractionDocumentContent />
    </AppLayout>
  );
}
