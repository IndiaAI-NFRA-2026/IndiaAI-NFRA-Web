'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { formatDate, getTagSeverity } from '@/lib/utils/helpers';
import { apiFetch } from '@/lib/api';
import { EyeIcon, PlusCircleIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/button';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { CombinedAnalysisApiResponse } from '@/types/analysis';
import { Filter, SELECT_TYPE } from '@/components/filter';
import Table from '@/components/table';
import { Modal } from '@/components/modal';
import { toast } from 'sonner';
import Tag from '@/components/tag';
import { ROUTERS } from '@/constants/routers';
import { useMe } from '@/lib/query/use-auth';

export const CombinedAnalysisComponent = () => {
  const { t } = useLanguage();
  const params = useParams();
  const vendorName = decodeURIComponent(params.vendor as string);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const router = useRouter();
  const [isModalConfirmCombinedAnalysis, setIsModalConfirmCombinedAnalysis] = useState(false);
  const [isConfirmDeleteCombinedAnalysis, setIsConfirmDeleteCombinedAnalysis] = useState(false);
  const [selectedCombinedAnalysis, setSelectedCombinedAnalysis] = useState<any>(null);
  const [filter, setFilter] = useState<{ fy_period?: string; date?: string }>({});
  const { data: user } = useMe();

  const { data: checkCombinedAnalysis } = useQuery({
    queryKey: ['combined-analysis', vendorName, 'check-combined-analysis'],
    queryFn: async () => {
      const response = await apiFetch<boolean>(`/combined-analysis/check-combined-analysis/${vendorName}`, {
        method: 'GET',
      });
      return response;
    },
    enabled: !!vendorName,
  });

  const { data: combinedAnalysisFyPeriods } = useQuery({
    queryKey: ['combined-analysis', vendorName, 'fy-periods'],
    queryFn: async () => {
      const response = await apiFetch < {periods: string[]}>(`/combined-analysis/fy-periods?vendor_name=${vendorName}`, {
        method: 'GET',
      });
      return response;
    },
    enabled: !!vendorName,
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
        id: 'fy_period',
        header: t('analysis.headerFyPeriod'),
        accessorKey: 'fy_period',
        cell: (row: any) => row.fy_period,
      },
      {
        id: 'overall_result',
        header: t('analysis.headerOverallResult'),
        accessorKey: 'overall_result',
        cell: (row: any) =>
          row.overall_result ? <Tag label={row.overall_result} severity={getTagSeverity(row.overall_result)} /> : t('analysis.generating'),
      },
      {
        id: 'created_by',
        header: t('analysis.headerCreatedBy'),
        accessorKey: 'created_by',
        cell: (row: any) => row.created_by,
      },
      {
        id: 'created_at',
        header: t('analysis.headerCreatedDate'),
        accessorKey: 'created_at',
        cell: (row: any) => formatDate(row.created_at),
      },
      {
        id: 'action',
        header: t('analysis.headerAction'),
        accessorKey: 'action',
        cell: (row: any) => (
          <div className="flex items-center">
            <Button
              type="text"
              size="sm"
              icon={<EyeIcon className="size-4" />}
              onClick={() => {
                router.push(ROUTERS.COMBINED_ANALYSIS_VENDOR_ID(vendorName, row.id));
              }}
            />
            {user?.full_name === row.created_by && (
              <Button type="text" size="sm" icon={<TrashIcon className="size-4" />} onClick={() => {
                setSelectedCombinedAnalysis(row);
                setIsConfirmDeleteCombinedAnalysis(true);
              }} />
            )}
          </div>
        ),
      },
    ];
  }, [vendorName, router, t, user]);

  const queryClient = useQueryClient();

  const { data: documentsData, refetch: refetchCombinedAnalysis, isLoading: isCombinedLoading } = useQuery({
    queryKey: ['combined-analysis', vendorName, { page, pageSize, ...filter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('vendor_name', vendorName);
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());

      if (filter.fy_period) params.append('fy_period', filter.fy_period);
      if (filter.date) {
        params.append('date_from', `${filter.date}T00:00:00`);
        params.append('date_to', `${filter.date}T23:59:59`);
      }

      const response = await apiFetch<CombinedAnalysisApiResponse>(`/combined-analysis?${params.toString()}`, {
        method: 'GET',
      });

      return response;
    },
    enabled: !!vendorName,
    placeholderData: keepPreviousData,
  });

  const createCombinedAnalysisMutation = useMutation({
    mutationFn: async (dataPayload: { vendor_name: string; document_ids?: string[]; is_combined_all: boolean }) => {
      const response = await apiFetch<{ message: string; success: boolean }>('/combined-analysis', {
        method: 'POST',
        body: JSON.stringify(dataPayload),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['combined-analysis', vendorName],
      });
      queryClient.invalidateQueries({
        queryKey: ['combined-analysis', vendorName, 'check-combined-analysis'],
      });
    },
  });

  const handleCombinedAnalysis = async () => {
    setIsModalConfirmCombinedAnalysis(false);

    try {
      const dataPayload = {
        vendor_name: vendorName,
        is_combined_all: true,
      };

      await createCombinedAnalysisMutation.mutateAsync(dataPayload);
      toast.success(t('combinedAnalysis.createSuccess'));
    } catch {
      toast.error(t('combinedAnalysis.createError'));
    }
  };

  const handleDeleteCombinedAnalysis = async () => {
    setIsConfirmDeleteCombinedAnalysis(false);
    try {
      await apiFetch(`/combined-analysis/${selectedCombinedAnalysis.id}`, {
        method: 'DELETE',
      });
    } catch {
      toast.error(t('combinedAnalysis.deleteError'));
    }
    await refetchCombinedAnalysis();
    setIsConfirmDeleteCombinedAnalysis(false);
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Filter
        actions={[
          {
            title: t('combinedAnalysis.createAnalysis'),
            icon: <PlusCircleIcon className="size-4" />,
            iconPosition: 'left',
            onClick: () => setIsModalConfirmCombinedAnalysis(true),
            tooltip: t('analysis.combinedAnalysisRequiresBoth'),
            tooltipSide: 'top',
            disabled: !checkCombinedAnalysis,
          },
        ]}
        onFilterChange={(data) => {
          setFilter({ ...filter, [data.name]: data.value });
          setPage(1);
        }}
        selects={[
          {
            type: SELECT_TYPE.SELECT,
            name: 'fy_period',
            placeholder: "Fy Period",
            options: combinedAnalysisFyPeriods?.periods?.map((fyPeriod) => ({ label: fyPeriod, value: fyPeriod })),
            className: 'w-[200px]',
            isClearable: true,
            value: filter.fy_period,
          },
          {
            type: SELECT_TYPE.DATE,
            name: 'date',
            placeholder: t('title.date'),
            value: filter.date,
            className: 'w-[200px]',
            isClearable: true,
          },
        ]}
        className="flex justify-between"
      />
      <Table
        columns={columns}
        data={(documentsData?.items || []).map((document, index) => ({ ...document, index: index + 1 }))}
        noDataMessage={t('analysis.combinedAnalysisNoDataMessage')}
        loading={isCombinedLoading}
        pagination={{
          page: page,
          pageCount: documentsData?.total_pages ?? 0,
          totalItems: documentsData?.total ?? 0,
          pageSize: pageSize,
          setPageSize: setPageSize,
          onPageChange: setPage,
        }}
      />

      <Modal
        contentClassName="max-w-[500px]"
        isOpen={isModalConfirmCombinedAnalysis}
        onClose={() => setIsModalConfirmCombinedAnalysis(false)}
        onConfirm={handleCombinedAnalysis}
        showCloseButton={false}
        title={t('analysis.confirmCreateCombinedAnalysis')}
        description={t('analysis.confirmCreateCombinedAnalysisDesc')}
        confirmButtonText={t('analysis.create')}
      />

      <Modal
        contentClassName="max-w-[500px]"
        isOpen={isConfirmDeleteCombinedAnalysis}
        onClose={() => setIsConfirmDeleteCombinedAnalysis(false)}
        onConfirm={handleDeleteCombinedAnalysis}
        showCloseButton={false}
        title={t('analysis.confirmDeleteCombinedAnalysis')}
        description={t('analysis.confirmDeleteCombinedAnalysisDesc')}
        confirmButtonText={t('button.delete')}
        confirmButtonType="danger"
      />
    </div>
  );
};
