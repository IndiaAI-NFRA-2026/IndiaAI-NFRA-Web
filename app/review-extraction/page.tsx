'use client';

import { useLanguage } from '@/lib/i18n/useLanguage';
import { Heading } from '@/components/heading';
import { UploadSvg } from '@/components/svg';
import { ROUTERS } from '@/constants/routers';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Vendor } from '@/types/vendors';
import Tag from '@/components/tag';
import { Filter } from '@/components/filter';
import { Pagination } from '@/components/pagination';
import { AppLayout } from '@/components/layout/app-layout';

interface VendorWithReview extends Vendor {
  total_documents_to_review?: number;
}

interface VendorsByVendorResponse {
  data: VendorWithReview[];
  total: number;
  page: number;
  count: number;
  page_size: number;
  total_pages: number;
}

async function fetchVendorsByVendor(params: { page: number; page_size: number; search?: string }): Promise<VendorsByVendorResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append('page', params.page.toString());
  queryParams.append('page_size', params.page_size.toString());
  if (params.search) {
    queryParams.append('search', params.search.trim().toLowerCase());
  }

  return apiFetch<VendorsByVendorResponse>(`/upload-document/vendor?${queryParams.toString()}`, {
    method: 'GET',
  });
}

const ReviewExtractionContent = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const { data: vendorsData, isLoading } = useQuery({
    queryKey: ['upload-document', 'vendor', { page, pageSize, search }],
    queryFn: () => fetchVendorsByVendor({ page, page_size: pageSize, search }),
    enabled: true,
    refetchOnMount: true,
  });

  const vendors = vendorsData?.data ?? [];

  const handleReviewDocuments = (vendorName: string) => {
    router.push(ROUTERS.REVIEW_EXTRACTION_VENDOR(vendorName));
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-hidden rounded bg-(--color-background-color) shadow-[0_2px_8px_0_rgba(0,0,0,0.15)]">
      <Heading
        title={t('sidebar.reviewExtraction')}
        subTitle={t('reviewExtraction.pageSubTitle')}
        actions={[
          {
            title: t('reviewExtraction.uploadDocument'),
            icon: <UploadSvg color="white" />,
            onClick: () => {
              router.push(ROUTERS.UPLOAD_DOCUMENT);
            },
          },
        ]}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-2 px-6 pt-2 pb-1 max-md:px-2 max-md:pt-4">
        {/* Search bar */}
        {(vendors.length > 0 || search !== '') && (
          <div className="inline-flex items-center justify-end">
            <Filter
              search={{
                label: '',
                name: 'search',
                placeholder: t('reviewExtraction.searchByVendorName'),
                value: search,
                className: 'w-[300px]',
              }}
              onFilterChange={(data) => {
                if (data.name === 'search') {
                  setSearch(data.value);
                }
              }}
            />
          </div>
        )}

        {/* Vendors list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : vendors.length === 0 ? (
          <div className="mt-4 flex h-[110px] flex-col items-center justify-center gap-4 border border-[#0000000F] p-4">
            <img src="/assets/icons/no-data-icon.svg" alt="No data" className="h-10 w-16" />
            <p className="text-sm font-normal text-(--color-table-no-data-icon)">
              {search !== '' ? t('reviewExtraction.noResultsSearch') : t('reviewExtraction.noResultsUpload')}
            </p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-0 overflow-y-hidden rounded-md border-t border-[#0000000F] bg-white">
            <div className="flex flex-1 flex-col gap-0 overflow-y-auto">
              {vendors.map((vendor, index) => {
                const documentsToReview = vendor.total_documents_to_review ?? 0;
                const hasDocumentsToReview = documentsToReview > 0;
                const isFirst = index === 0;
                const isLast = index === vendors.length - 1;

                return (
                  <div
                    key={vendor.id || `${vendor.vendor_name}-${index}`}
                    className={cn(
                      'flex w-full items-center justify-between border border-t-0 border-[#0000000F] p-4 transition-colors',
                      'hover:bg-[#E8F6F4]',
                      isFirst ? 'rounded-t-md' : '',
                      isLast ? 'rounded-b-md' : ''
                    )}
                  >
                    <div className="flex w-full items-center justify-between gap-1">
                      <span className="text-sm font-bold text-gray-700">{vendor.vendor_name}</span>
                      <div className="flex items-center gap-2">
                        {hasDocumentsToReview && (
                          <Tag label={t('reviewExtraction.documentsToReview', { count: documentsToReview })} severity="success" />
                        )}
                        {hasDocumentsToReview ? (
                          <Button
                            title={t('reviewExtraction.reviewDocuments')}
                            onClick={() => handleReviewDocuments(vendor.vendor_name)}
                            size="sm"
                            type="primary"
                          />
                        ) : (
                          <Button
                            title={t('reviewExtraction.viewDetails')}
                            onClick={() => handleReviewDocuments(vendor.vendor_name)}
                            size="sm"
                            type="outline"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pagination */}
        {vendors.length > 0 && (
          <div className="mt-4">
            <Pagination
              page={page}
              pageCount={vendorsData?.total_pages ?? 0}
              pageSize={pageSize}
              totalItems={vendorsData?.total ?? 0}
              setPageSize={setPageSize}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default function ReviewExtractionPage() {
  return (
    <AppLayout>
      <ReviewExtractionContent />
    </AppLayout>
  );
}
