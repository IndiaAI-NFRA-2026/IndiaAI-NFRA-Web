'use client';

import { useState, useMemo, useCallback, useLayoutEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useBreadcrumb } from '@/components/breadcrumb';
import { useUpdateFraudTransaction } from '@/lib/query/use-documents';
import { Spinner } from '@/components/ui/spinner';
import { FraudInformation } from '@/components/fraud-anomaly/fraud-anomaly-detail/fraud-information';
import { TransactionFraudDetailModal } from '@/components/fraud-anomaly/fraud-anomaly-detail/transaction-fraud-detail-modal';
import type { FraudTransaction } from '@/components/fraud-anomaly/fraud-anomaly-detail/fraud-transaction-column';
import { useMe } from '@/lib/query/use-auth';
import { hasAccessToPage } from '@/lib/auth/rbac';
import { USER_ROLE } from '@/enums/auth';
import { AppLayout } from '@/components/layout/app-layout';
import Table from '@/components/table';
import { formatCurrency, formatDate } from '@/lib/utils/helpers';
import { FlagBadge, StatusIndicator } from '@/components/fraud-anomaly/fraud-anomaly-detail/fraud-status-badges';
import { EyeIcon } from 'lucide-react';
import { Button } from '@/components/button';
import { apiFetch } from '@/lib/api';
import { FraudDetailResponse } from '@/types/fraud-detection';
import { useQuery } from '@tanstack/react-query';
import Card from '@/components/card';
import { Heading } from '@/components/heading';
import { ROUTERS } from '@/constants/routers';

function FraudDetectionContent() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();

  const { data: user } = useMe();
  const isComplianceOfficer = hasAccessToPage(user?.role as USER_ROLE, ROUTERS.ANALYSIS);
  const documentId = (params?.id as string) || '';
  const pathname = usePathname();
  const { setOptions: setBreadcrumbOptions } = useBreadcrumb();

  const { data: fraudDetailResponse, isLoading } = useQuery({
    queryKey: ['fraud-detection', documentId],
    queryFn: () => fetchFraudDetectionDetail(documentId),
    enabled: !!documentId,
  });

  async function fetchFraudDetectionDetail(documentId: string): Promise<FraudDetailResponse> {
    return apiFetch<FraudDetailResponse>(`/fraud-detection/${documentId}`, {
      method: 'GET',
    });
  }

  const [selectedTransaction, setSelectedTransaction] = useState<FraudTransaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalView, setModalView] = useState<'detail' | 'false-positive' | 'confirm-fraud'>('detail');
  const updateFraudTransactionMutation = useUpdateFraudTransaction();

  useLayoutEffect(() => {
    const vendor = params?.vendor as string | undefined;
    if (!vendor) return;
    const vendorDecoded = decodeURIComponent(vendor);
    const vendorLabel = fraudDetailResponse?.vender || vendorDecoded;
    const thirdLabel = fraudDetailResponse?.period || documentId;
    setBreadcrumbOptions({
      items: [
        { label: t('sidebar.analysis'), path: ROUTERS.ANALYSIS },
        { label: vendorLabel, path: ROUTERS.ANALYSIS_VENDOR(vendorDecoded) },
        { label: thirdLabel, path: pathname },
      ],
    });
    return () => setBreadcrumbOptions(null);
  }, [params?.vendor, documentId, fraudDetailResponse?.vender, fraudDetailResponse?.period, pathname, t, setBreadcrumbOptions]);

  const handleBack = () => {
    router.back();
  };

  const handleViewTransaction = useCallback((transaction: FraudTransaction) => {
    setSelectedTransaction(transaction);
    setModalView('detail');
    setIsDetailModalOpen(true);
  }, []);

  const columns = useMemo(() => {
    return [
      {
        id: 'index',
        header: '#',
        accessorKey: 'index',
        cell: (row: any) => row.index,
      },
      {
        id: 'txn_id',
        header: t('fraudAnomaly.detail.txnId'),
        accessorKey: 'txn_id',
        cell: (row: any) => <div className="line-clamp-2 min-w-[150px] max-md:text-sm">{row.txn_id}</div>,
      },
      {
        id: 'date',
        header: t('fraudAnomaly.detail.date'),
        accessorKey: 'date',
        cell: (row: any) => <div className="text-nowrap">{row.date && formatDate(row.date)}</div>,
      },
      {
        id: 'description',
        header: t('fraudAnomaly.detail.description'),
        accessorKey: 'description',
        cell: (row: any) => <div className="line-clamp-2 min-w-[200px] max-md:text-sm">{row.description}</div>,
      },
      {
        id: 'debit',
        header: t('fraudAnomaly.detail.debit'),
        accessorKey: 'debit',
        cell: (row: any) => <div className="text-nowrap">{row.debit && formatCurrency(parseFloat(row.debit))}</div>,
      },
      {
        id: 'credit',
        header: t('fraudAnomaly.detail.credit'),
        accessorKey: 'credit',
        cell: (row: any) => <div className="text-nowrap">{row.credit && formatCurrency(parseFloat(row.credit))}</div>,
      },
      {
        id: 'flag',
        header: t('fraudAnomaly.detail.flag'),
        accessorKey: 'flag',
        cell: (row: any) => <FlagBadge flag={row.flag} />,
      },
      {
        id: 'status',
        header: t('fraudAnomaly.detail.status'),
        accessorKey: 'status',
        cell: (row: any) => <StatusIndicator status={row.status} />,
      },
      {
        id: 'action',
        header: t('fraudAnomaly.detail.action'),
        accessorKey: 'action',
        cell: (row: any) => (
          <div className="flex items-center">
            <Button
              type="text"
              size="sm"
              icon={<EyeIcon className="size-4" />}
              onClick={() => {
                handleViewTransaction(row);
              }}
            />
          </div>
        ),
      },
    ];
  }, [t, handleViewTransaction]);

  const handleOpenFalsePositiveModal = () => {
    setModalView('false-positive');
  };

  const handleOpenConfirmFraudModal = () => {
    setModalView('confirm-fraud');
  };

  const handleConfirmFalsePositive = async (reason: string) => {
    if (!selectedTransaction?.id) return;

    try {
      await updateFraudTransactionMutation.mutateAsync({
        fraudTransactionId: selectedTransaction.id,
        data: {
          reason,
          status: 'false_positive',
        },
      });
      setIsDetailModalOpen(false);
      setSelectedTransaction(null);
      setModalView('detail');
      toast.success(t('fraudAnomaly.detail.updateSuccessFalsePositive'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('fraudAnomaly.detail.updateError');
      toast.error(errorMessage);
    }
  };

  const handleConfirmFraud = async () => {
    if (!selectedTransaction?.id) return;

    try {
      await updateFraudTransactionMutation.mutateAsync({
        fraudTransactionId: selectedTransaction.id,
        data: {
          reason: '',
          status: 'fraud',
        },
      });
      setIsDetailModalOpen(false);
      setSelectedTransaction(null);
      setModalView('detail');
      toast.success(t('fraudAnomaly.detail.updateSuccessFraud'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('fraudAnomaly.detail.updateError');
      toast.error(errorMessage);
    }
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setModalView('detail');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-10 animate-spin text-(--color-sidebar-ring)" />
      </div>
    );
  }

  if (!fraudDetailResponse) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-md border p-8">
        <img src="/assets/icons/no-data-icon.svg" alt="No data" className="h-10 w-16" />
        <p className="text-sm text-(--color-upload-content-color)">{t('dataTable.noResults')}</p>
      </div>
    );
  }

  const mappedData = fraudDetailResponse.transactions.map((transaction, index) => ({
    ...transaction,
    index: index + 1,
  }));

  return (
    <div className="flex flex-1 flex-col gap-6">
      <Card
        header={
          <Heading
            title={decodeURIComponent(params?.vendor as string)}
            subTitle={t('analysis.fraudDetectionSubTitle')}
            onBack={handleBack}
          />
        }
        containerStyle="flex-1"
      >
        <div className="rounded-[4px] bg-(--color-background-color) p-6">
          <FraudInformation documentDetail={fraudDetailResponse} />
          <div className="mt-6 rounded-[4px] border border-(--color-filters-border)">
            <div className="border-b border-(--color-filters-border) px-6 py-4">
              <h3 className="text-base leading-6 font-bold">{t('fraudAnomaly.detail.fraudTransactions')}</h3>
            </div>
            <div className="p-6">
              <Table columns={columns} data={mappedData} noDataMessage={t('dataTable.noResults')} />
            </div>
          </div>
        </div>
      </Card>

      <TransactionFraudDetailModal
        isOpen={isDetailModalOpen}
        setIsOpen={handleCloseModal}
        transaction={selectedTransaction}
        onOpenFalsePositiveModal={handleOpenFalsePositiveModal}
        onOpenConfirmFraudModal={handleOpenConfirmFraudModal}
        isComplianceOfficer={isComplianceOfficer}
        modalView={modalView}
        onConfirmFalsePositive={handleConfirmFalsePositive}
        onConfirmFraud={handleConfirmFraud}
        isLoading={updateFraudTransactionMutation.isPending}
      />
    </div>
  );
}

export default function FraudDetectionPage() {
  return (
    <AppLayout>
      <FraudDetectionContent />
    </AppLayout>
  );
}
