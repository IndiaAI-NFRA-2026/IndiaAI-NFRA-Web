'use client';

import { useLanguage } from '@/lib/i18n/useLanguage';
import { Heading } from '@/components/heading';
import { useParams, useRouter } from 'next/navigation';
import Tabs from '@/components/tabs';
import { useMemo, useState } from 'react';
import { DocumentType } from '@/enums/document-type';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { CountReviewApiResponse, VendorDocumentsApiResponse } from '@/types/documents';
import Table from '@/components/table';
import { Filter, SELECT_TYPE } from '@/components/filter';
import Tag from '@/components/tag';
import { DocumentStatus } from '@/enums';
import { formatDate, getTagSeverity } from '@/lib/utils/helpers';
import { useOptionsMultiLanguages } from '@/components/hook/use-options';
import { Button } from '@/components/button';
import { ArrowRightIcon, EyeIcon, TrashIcon } from 'lucide-react';
import { ROUTERS } from '@/constants/routers';
import { AppLayout } from '@/components/layout/app-layout';

interface ExtractionComponentProps {
  type: DocumentType;
  noDataMessage?: string;
}

const ExtractionComponent = ({ type, noDataMessage }: ExtractionComponentProps) => {
  const { t } = useLanguage();
  const params = useParams();
  const vendorName = decodeURIComponent(params.vendor as string);
  const { documentStatusOptions } = useOptionsMultiLanguages();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    date: '',
    fy_period: '',
  });

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
        cell: (row: any) => <div className="line-clamp-2 min-w-[150px] max-md:text-sm">{row.period}</div>,
      },
      {
        id: 'uploadedBy',
        header: t('uploadedHistory.table.uploadedBy'),
        accessorKey: 'created_by',
        cell: (row: any) => <div className="line-clamp-2 min-w-[150px] max-md:text-sm">{row.created_by}</div>,
      },
      {
        id: 'dateUpload',
        header: t('uploadedHistory.table.dateUpload'),
        accessorKey: 'created_at',
        cell: (row: any) => <div className="text-nowrap">{formatDate(row.created_at)}</div>,
      },
      {
        id: 'status',
        header: t('title.status'),
        accessorKey: 'status',
        cell: (row: any) => (
          <Tag
            label={documentStatusOptions.find((option) => option.value === row.status)?.label || ''}
            severity={getTagSeverity(row.status as DocumentStatus)}
            icon={
              row.status === DocumentStatus.REVIEW ? (
                <div
                  className="ml-1 cursor-pointer rounded-[4px] bg-(--primary-color) p-[2px] hover:opacity-80"
                  onClick={() => {
                    router.push(ROUTERS.REVIEW_EXTRACTION_VENDOR_ID(vendorName, row.id));
                  }}
                >
                  <ArrowRightIcon className="size-4 text-white" />
                </div>
              ) : null
            }
            iconPosition="right"
          />
        ),
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
                router.push(ROUTERS.REVIEW_EXTRACTION_VENDOR_ID(vendorName, row.id));
              }}
            />
            <Button type="text" size="sm" icon={<TrashIcon className="size-4" />} onClick={() => {}} />
          </div>
        ),
      },
    ];
  }, [t, documentStatusOptions, vendorName, router]);

  const { data: documentsData } = useQuery({
    queryKey: ['upload-document', 'by-vendor', vendorName, { page, page_size: pageSize, document_type: type, ...filters }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('vendor_name', vendorName);
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());
      params.append('document_type', type);
      if (filters.search) params.append('search', filters.search);
      if (filters.date) {
        params.append('date_from', filters.date + 'T00:00:00');
        params.append('date_to', filters.date + 'T23:59:59');
      }
      if (filters.fy_period) params.append('fy_period', filters.fy_period);

      const response = await apiFetch<VendorDocumentsApiResponse>(`/upload-document/by-vendor?${params.toString()}`, {
        method: 'GET',
      });

      return response;
    },
    enabled: !!vendorName,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: filtersData } = useQuery({
    queryKey: ['upload-document', 'by-vendor', vendorName, { document_type: type }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('vendor_name', vendorName);
      params.append('document_type', type);

      const response = await apiFetch<{ periods: string[] }>(`/upload-document/by-vendor/filters?${params.toString()}`, {
        method: 'GET',
      });

      return response;
    },
    enabled: !!vendorName,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Filter
        search={{
          name: 'search',
          placeholder: t('title.search'),
          value: filters.search,
          className: 'w-[300px]',
        }}
        onFilterChange={(value) => {
          setFilters((prev) => ({ ...prev, [value.name]: value.value }));
          setPage(1);
        }}
        selects={[
          {
            type: SELECT_TYPE.SELECT,
            name: 'fy_period',
            placeholder: 'FY Period',
            value: filters.fy_period,
            options: filtersData?.periods.map((period) => ({ label: period, value: period })) || [],
            className: 'w-[200px]',
            isClearable: true,
          },
          {
            type: SELECT_TYPE.DATE,
            name: 'date',
            placeholder: 'Date',
            value: filters.date,
            className: 'w-[200px]',
            isClearable: true,
          },
        ]}
        className="flex justify-between"
      />
      <Table
        columns={columns}
        data={documentsData?.documents?.map((document, index) => ({ ...document, index: index + 1 })) || []}
        noDataMessage={noDataMessage}
        pagination={{
          page,
          pageCount: documentsData?.total_pages ?? 0,
          totalItems: documentsData?.total || 0,
          pageSize,
          setPageSize: setPageSize,
          onPageChange: setPage,
        }}
      />
    </div>
  );
};

const ReviewExtractionVendorContent = () => {
  const { t } = useLanguage();
  const params = useParams();
  const vendor = decodeURIComponent(params.vendor as string);
  const router = useRouter();

  // Fetch documents for Bank Statement to count review status
  const { data: countReviewData } = useQuery<CountReviewApiResponse>({
    queryKey: ['upload-document', 'by-vendor', vendor],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('vendor_name', vendor);

      const response = await apiFetch<CountReviewApiResponse>(`/upload-document/by-vendor/count-review?${params.toString()}`, {
        method: 'GET',
      });

      return response;
    },
    enabled: !!vendor,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Count documents with review status
  const financialStatementReviewCount = useMemo(() => {
    return countReviewData?.financial_statement_count || 0;
  }, [countReviewData]);

  const bankStatementReviewCount = useMemo(() => {
    return countReviewData?.bank_statement_count || 0;
  }, [countReviewData]);

  return (
    <div className="flex flex-1 flex-col overflow-y-hidden rounded bg-(--color-background-color) shadow-[0_2px_8px_0_rgba(0,0,0,0.15)]">
      <Heading
        onBack={() => router.push(ROUTERS.REVIEW_EXTRACTION)}
        className="py-4"
        title={vendor}
        subTitle={t('reviewExtraction.pageSubTitle')}
      />

      <div className="flex flex-1 flex-col gap-4">
        <Tabs
          tabItems={[
            {
              key: 'financial-statement-extraction',
              label: t('analysis.financialStatementExtraction'),
              badge: financialStatementReviewCount,
              content: (
                <ExtractionComponent
                  type={DocumentType.FINANCIAL_STATEMENT}
                  noDataMessage={t('reviewExtraction.noFinancialStatementExtraction')}
                />
              ),
            },
            {
              key: 'bank-statement-extraction',
              label: t('analysis.bankStatementExtraction'),
              badge: bankStatementReviewCount,
              content: (
                <ExtractionComponent type={DocumentType.BANK_STATEMENT} noDataMessage={t('reviewExtraction.noBankStatementExtraction')} />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};
export default function ReviewExtractionVendorPage() {
  return (
    <AppLayout>
      <ReviewExtractionVendorContent />
    </AppLayout>
  );
}
