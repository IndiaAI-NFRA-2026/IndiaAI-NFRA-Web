'use client';

import * as React from 'react';
import { Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/useLanguage';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  totalItems?: number;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  onPageChange?: (page: number) => void;
}

export function DataTablePagination<TData>({
  table,
  totalItems,
  pageSize,
  setPageSize,
  onPageChange,
}: Readonly<DataTablePaginationProps<TData>>) {
  const [goToPageValue, setGoToPageValue] = React.useState('');
  const { t } = useLanguage();
  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageCount = table.getPageCount();
  const totalRows = totalItems ?? table.getFilteredRowModel().rows.length;

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const current = currentPage;
    const total = pageCount;

    if (total <= 9) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, current - 2);
      let end = Math.min(total - 1, current + 2);

      if (current <= 4) {
        start = 2;
        end = 5;
      }

      if (current >= total - 3) {
        start = total - 4;
        end = total - 1;
      }

      if (start > 2) {
        pages.push('ellipsis');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < total - 1) {
        pages.push('ellipsis');
      }

      pages.push(total);
    }

    return pages;
  };

  const handlePageChange = (newPage: number) => {
    table.setPageIndex(newPage - 1);
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  const handlePreviousPage = () => {
    const prevPage = currentPage - 1;
    if (prevPage >= 1) {
      handlePageChange(prevPage);
    }
  };

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    if (nextPage <= pageCount) {
      handlePageChange(nextPage);
    }
  };

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const page = Number.parseInt(goToPageValue);
    if (!Number.isNaN(page) && page >= 1 && page <= pageCount) {
      handlePageChange(page);
      setGoToPageValue('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (!Number.isNaN(Number(value)) && Number(value) >= 1)) {
      setGoToPageValue(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const currentValue = Number.parseInt(goToPageValue) || currentPage;
      let newValue: number;

      if (e.key === 'ArrowUp') {
        newValue = Math.min(currentValue + 1, pageCount);
      } else {
        newValue = Math.max(currentValue - 1, 1);
      }

      setGoToPageValue(newValue.toString());
    }
  };

  const pageNumbers = getPageNumbers().length > 0 ? getPageNumbers() : [1];

  return (
    <div className="sm:items-left flex items-center justify-end gap-4 px-2 py-4">
      <div className="text-sm leading-5.5 font-normal text-(--color-pagination-item-text-color)">
        {t('totalItems', { count: totalRows })}
      </div>

      <div className="flex flex-row items-center gap-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <button
                onClick={handlePreviousPage}
                disabled={!table.getCanPreviousPage()}
                className={cn(
                  'hover:bg-muted/80 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-(--color-pagination-item-border) bg-(--color-pagination-item-background) p-0 transition-colors',
                  !table.getCanPreviousPage() && 'pointer-events-none cursor-not-allowed opacity-50'
                )}
                aria-label="Go to previous page"
              >
                <ChevronLeft
                  className={cn(
                    'h-3 w-3',
                    table.getCanPreviousPage() ? 'text-(--color-pagination-item-text-color)' : 'text-(--color-muted-foreground)'
                  )}
                />
              </button>
            </PaginationItem>

            {pageNumbers.map((page, index) => {
              if (page === 'ellipsis') {
                return (
                  <PaginationItem key={`ellipsis-${index}-${pageNumbers.length}`}>
                    <div>...</div>
                  </PaginationItem>
                );
              }

              const isActive = page === currentPage;
              return (
                <PaginationItem key={page}>
                  <button
                    onClick={() => handlePageChange(page)}
                    className={cn(
                      'hover:bg-muted/80 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border p-0 text-sm leading-5.5 font-normal transition-colors',
                      isActive
                        ? 'text-pagination-item-border-active border-(--color-pagination-item-border-active) bg-transparent hover:bg-transparent hover:text-(--color-pagination-item-border-active)'
                        : 'border-(--color-pagination-item-border) bg-transparent text-(--color-pagination-item-text-color) hover:bg-transparent hover:text-(--color-pagination-item-text-color)'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {page}
                  </button>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <button
                onClick={handleNextPage}
                disabled={!table.getCanNextPage()}
                className={cn(
                  'hover:bg-muted/80 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-(--color-pagination-item-border) bg-(--color-pagination-item-background) p-0 transition-colors',
                  !table.getCanNextPage() && 'pointer-events-none cursor-not-allowed opacity-50'
                )}
                aria-label="Go to next page"
              >
                <ChevronRight
                  className={cn(
                    'h-3 w-3',
                    table.getCanNextPage() ? 'text-(--color-pagination-item-text-color)' : 'text-(--color-muted-foreground)'
                  )}
                />
              </button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <div className="flex items-center gap-2">
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(Number.parseInt(value));
            }}
          >
            <SelectTrigger className="h-8 w-auto min-w-28 px-3">
              <SelectValue>
                <span className="whitespace-nowrap">
                  {pageSize} / {t('page')}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / {t('page')}</SelectItem>
              <SelectItem value="20">20 / {t('page')}</SelectItem>
              <SelectItem value="50">50 / {t('page')}</SelectItem>
              <SelectItem value="100">100 / {t('page')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <form onSubmit={handleGoToPage} className="flex items-center gap-2">
          <span className="text-sm leading-5.5 font-normal text-nowrap text-(--color-pagination-item-text-color)">{t('goTo')}</span>
          <Input
            type="text"
            min="1"
            max={pageCount}
            value={goToPageValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="h-8 w-16 px-2 leading-5.5"
            placeholder=""
          />
        </form>
      </div>
    </div>
  );
}
