'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/useLanguage';
import SelectComponent from '../typing/select';

export interface PaginationProps {
  page?: number;
  pageCount?: number;
  totalItems?: number;
  pageSize?: number;
  setPageSize?: (pageSize: number) => void;
  onPageChange?: (page: number) => void;
}

export function Pagination({ page = 1, pageCount = 1, totalItems = 0, pageSize = 10, setPageSize, onPageChange }: PaginationProps) {
  const [goToPageValue, setGoToPageValue] = React.useState('');
  const { t } = useLanguage();
  const currentPage = page;
  const canPreviousPage = page > 1;
  const canNextPage = page < pageCount;

  const pageSizeOptions = [
    {
      label: '10 / page',
      value: '10',
    },
    {
      label: '20 / page',
      value: '20',
    },
    {
      label: '50 / page',
      value: '50',
    },
    {
      label: '100 / page',
      value: '100',
    },
  ];

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
    const pageNum = Number.parseInt(goToPageValue);
    if (!Number.isNaN(pageNum) && pageNum >= 1 && pageNum <= pageCount) {
      handlePageChange(pageNum);
      setGoToPageValue('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (!Number.isNaN(Number(value)) && Number(value) >= 1 && Number(value) <= pageCount)) {
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
    <div className="flex items-center justify-end gap-4 px-2">
      <div className="text-sm leading-5.5 font-normal text-(--color-pagination-item-text-color)">
        {t('totalItems', { count: totalItems })}
      </div>

      <div className="flex flex-row items-center gap-4">
        {/* Pagination Navigation */}
        <nav className="flex items-center gap-2" role="navigation" aria-label="Pagination">
          <ul className="flex flex-row items-center gap-2">
            {/* Previous Button */}
            <li>
              <button
                onClick={handlePreviousPage}
                disabled={!canPreviousPage}
                className={cn(
                  'hover:bg-muted/80 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-(--color-pagination-item-border) bg-(--color-pagination-item-background) p-0 transition-colors',
                  !canPreviousPage && 'pointer-events-none cursor-not-allowed opacity-50'
                )}
                aria-label="Go to previous page"
              >
                <ChevronLeft
                  className={cn(
                    'h-3 w-3',
                    canPreviousPage ? 'text-(--color-pagination-item-text-color)' : 'text-(--color-muted-foreground)'
                  )}
                />
              </button>
            </li>

            {/* Page Numbers */}
            {pageNumbers.map((pageNum, index) => {
              if (pageNum === 'ellipsis') {
                return (
                  <li key={`ellipsis-${index}-${pageNumbers.length}`}>
                    <div className="flex h-8 w-8 items-center justify-center text-(--color-pagination-item-text-color)">...</div>
                  </li>
                );
              }

              const isActive = pageNum === currentPage;
              return (
                <li key={pageNum}>
                  <button
                    onClick={() => handlePageChange(pageNum)}
                    className={cn(
                      'hover:bg-muted/80 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border p-0 text-sm leading-5.5 font-normal transition-colors',
                      isActive
                        ? 'border-(--color-pagination-item-border-active) bg-transparent text-(--color-pagination-item-border-active) hover:bg-transparent hover:text-(--color-pagination-item-border-active)'
                        : 'border-(--color-pagination-item-border) bg-transparent text-(--color-pagination-item-text-color) hover:bg-transparent hover:text-(--color-pagination-item-text-color)'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                </li>
              );
            })}

            {/* Next Button */}
            <li>
              <button
                onClick={handleNextPage}
                disabled={!canNextPage}
                className={cn(
                  'hover:bg-muted/80 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-(--color-pagination-item-border) bg-(--color-pagination-item-background) p-0 transition-colors',
                  !canNextPage && 'pointer-events-none cursor-not-allowed opacity-50'
                )}
                aria-label="Go to next page"
              >
                <ChevronRight
                  className={cn('h-3 w-3', canNextPage ? 'text-(--color-pagination-item-text-color)' : 'text-(--color-muted-foreground)')}
                />
              </button>
            </li>
          </ul>
        </nav>

        {/* Page Size Selector */}
        <SelectComponent
          isClearable={false}
          menuPlacement="top"
          options={pageSizeOptions}
          value={pageSize.toString()}
          onValueChange={(val: string) => setPageSize?.(Number(val))}
        />

        {/* Go to Page */}
        <form onSubmit={handleGoToPage} className="flex items-center gap-2">
          <span className="text-sm leading-5.5 font-normal text-nowrap text-(--color-pagination-item-text-color)">{t('goTo')}</span>
          <input
            type="number"
            min={1}
            value={goToPageValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="h-8 w-16 rounded border border-(--color-pagination-item-border) bg-(--color-pagination-item-background) px-2 text-sm leading-5.5 text-(--color-pagination-item-text-color) focus:border-(--color-pagination-item-border-active) focus:ring-0 focus:outline-none"
            placeholder=""
          />
        </form>
      </div>
    </div>
  );
}
