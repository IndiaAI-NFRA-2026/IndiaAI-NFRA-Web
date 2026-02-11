'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { EyeIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/button';
import { Filter, SELECT_TYPE } from '@/components/filter';
import Table from '@/components/table';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { DocumentType } from '@/enums/document-type';
import { DocumentStatus } from '@/enums';
import { DeleteDocumentDialog } from '@/components/upload-history/delete-document-dialog';
import type { Document } from '@/types/documents';
import { formatDate } from '@/lib/utils/helpers';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { FraudDetectionApiResponse } from '@/types/fraud-detection';
import { ROUTERS } from '@/constants/routers';

export const FraudDetectionComponent = () => {
  const params = useParams();
  const vendorName = decodeURIComponent(params.vendor as string);
  const router = useRouter();
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [uploadDate, setUploadDate] = useState('');
  const [fraudAnomalyFy, setFraudAnomalyFy] = useState('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const { data: fraudDetectionData, isLoading: isFraudDetectionLoading } = useQuery({
    queryKey: ['fraud-detection', vendorName, uploadDate, fraudAnomalyFy],
    queryFn: () => getFraudDetection(vendorName, uploadDate, fraudAnomalyFy),
    placeholderData: keepPreviousData,
  });

  const getFraudDetection = async (vendorName: string, uploadDate: string, fraudAnomalyFy: string) => {
    const response = await apiFetch<FraudDetectionApiResponse>(
      `/fraud-detection?vendor_name=${vendorName}&uploadDate=${uploadDate}&fraudAnomalyFy=${fraudAnomalyFy}`
    );
    return response;
  };

  const columns = useMemo(() => {
    return [
      {
        id: 'index',
        header: '#',
        accessorKey: 'index',
        cell: (row: any) => row.index,
      },
      {
        id: 'period',
        header: t('uploadedHistory.table.fyPeriod'),
        accessorKey: 'period',
        cell: (row: any) => {
          if (!row.period) return '-';
          try {
            return new Date(row.period).getFullYear() || '-';
          } catch {
            return '-';
          }
        },
      },
      {
        id: 'fraud_detection',
        header: t('uploadedHistory.table.fraudDetection'),
        accessorKey: 'fraud_detection',
        cell: (row: any) => row.fraud_detection ?? 0,
      },
      {
        id: 'created_by',
        header: t('uploadedHistory.table.approver'),
        accessorKey: 'created_by',
        cell: (row: any) => row.created_by ?? '-',
      },
      {
        id: 'created_at',
        header: t('uploadedHistory.table.dateUpload'),
        accessorKey: 'created_at',
        cell: (row: any) => {
          if (!row.created_at) return '-';
          try {
            return formatDate(row.created_at);
          } catch {
            return '-';
          }
        },
      },
      {
        id: 'updated_at',
        header: t('uploadedHistory.table.lastModified'),
        accessorKey: 'modified_by',
        cell: (row: any) => {
          if (!row.updated_at) return '-';
          try {
            return formatDate(row.updated_at);
          } catch {
            return '-';
          }
        },
      },
      {
        id: 'action',
        header: t('uploadedHistory.table.action'),
        accessorKey: 'action',
        cell: (row: any) => (
          <div className="flex items-center">
            <Button
              type="text"
              size="sm"
              icon={<EyeIcon className="size-4" />}
              onClick={() => {
                router.push(ROUTERS.FRAUD_DETECTION_VENDOR_ID(vendorName, row.id));
              }}
            />
            {row.is_uploader && (
              <Button
                type="text"
                size="sm"
                icon={<TrashIcon className="size-4" />}
                onClick={() => {
                  const doc: Document = {
                    id: row.id,
                    fileName: row.fileName,
                    type: DocumentType.BANK_STATEMENT,
                    status: 'approved' as DocumentStatus,
                    uploadDate: row.uploadDate || row.createdAt || '',
                    period: row.period,
                  };
                  setSelectedDocument(doc);
                  setIsDeleteDialogOpen(true);
                }}
              />
            )}
          </div>
        ),
      },
    ];
  }, [t, router, vendorName]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Filter
        selects={[
          {
            type: SELECT_TYPE.SELECT,
            name: 'fy',
            placeholder: t('documentStatus.all'),
            options: [],
            className: 'w-[200px]',
          },
          {
            type: SELECT_TYPE.DATE,
            name: 'uploadDate',
            placeholder: t('uploadedHistory.dateUpload.placeholder'),
            value: uploadDate,
            className: 'w-[200px]',
            isClearable: true,
          },
        ]}
        onFilterChange={(data) => {
          if (data.name === 'fy') {
            setFraudAnomalyFy(data.value);
            setPage(1);
          } else if (data.name === 'uploadDate') {
            setUploadDate(data.value);
            setPage(1);
          }
        }}
        className="flex justify-between"
      />
      <Table
        columns={columns}
        data={fraudDetectionData?.documents?.map((item, index) => ({ ...item, index: index + 1 })) ?? []}
        noDataMessage={t('dataTable.noResults')}
        loading={isFraudDetectionLoading}
        pagination={{
          page: page,
          pageCount: fraudDetectionData?.total_pages ?? 0,
          totalItems: fraudDetectionData?.total ?? 0,
          pageSize: pageSize,
          setPageSize: setPageSize,
          onPageChange: setPage,
        }}
      />

      <DeleteDocumentDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        document={selectedDocument}
        type={DocumentType.BANK_STATEMENT}
        onSuccess={() => {
          setSelectedDocument(null);
        }}
      />
    </div>
  );
};

export default FraudDetectionComponent;
