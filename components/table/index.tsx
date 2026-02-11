import { cn } from '@/lib/utils';
import { Pagination, PaginationProps } from '../pagination';
import { Spinner } from '../ui/spinner';

interface Column<T> {
  id: string;
  header: string;
  accessorKey: string;
  cell: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  noDataMessage?: string;
  stickyHeader?: boolean;
  pagination?: PaginationProps;
  loading?: boolean;
}

const Table = <T,>({ columns, data, noDataMessage, stickyHeader = false, pagination, loading = false }: TableProps<T>) => {
  const { page, pageCount, totalItems, pageSize, setPageSize, onPageChange } = pagination ?? {};

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-10 animate-spin text-(--color-sidebar-ring)" />
      </div>
    );
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Desktop: table */}
        <div className="hidden md:block">
          <table className="w-full border-t border-l border-[#0000000F]">
            <thead className={cn(stickyHeader && 'sticky top-[-1] z-20 bg-[#F4F4F5]')}>
              <tr>
                {columns?.map((column) => (
                  <th
                    key={column.id}
                    className="h-[42px] border-r border-b border-[#0000000F] bg-[#F4F4F5] px-3 text-left text-[14px] leading-[22px] font-bold text-[#4F4F4F]"
                  >
                    <span className="whitespace-nowrap">{column.header}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.map((row, index) => (
                <tr key={index}>
                  {columns?.map((column) => (
                    <td
                      key={column?.id}
                      className="h-[45px] border-r border-b border-[#0000000F] px-3 text-left text-[14px] leading-[22px] text-[#4F4F4F]"
                    >
                      {column?.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: stack card */}
        <div className="space-y-3 md:hidden">
          {data?.map((row, index) => (
            <div key={index} className="overflow-hidden rounded border border-[#0000000F] bg-white">
              {columns?.map((column, i) => (
                <div
                  key={column.id}
                  className={cn(
                    'flex items-center justify-between gap-2 px-3 py-2.5 text-[14px] leading-[22px]',
                    i < (columns?.length ?? 0) - 1 && 'border-b border-[#0000000F]'
                  )}
                >
                  <span className="shrink-0 font-bold text-[#4F4F4F]">{column.header}</span>
                  <span className="min-w-0 text-[#4F4F4F]">{column.cell(row)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {data?.length === 0 && noDataMessage && (
          <div className="mt-4 flex h-[110px] flex-col items-center justify-center gap-4 border border-[#0000000F] p-4">
            <img src="/assets/icons/no-data-icon.svg" alt="No data" className="h-10 w-16" />
            <p className="text-sm font-normal text-(--color-table-no-data-icon)">{noDataMessage}</p>
          </div>
        )}
      </div>
      {pagination && data?.length > 0 && (
        <div className="my-2 shrink-0">
          <Pagination
            page={page}
            pageCount={pageCount}
            totalItems={totalItems}
            pageSize={pageSize}
            setPageSize={setPageSize}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default Table;
