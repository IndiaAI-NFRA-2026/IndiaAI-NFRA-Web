'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/i18n/useLanguage';
import * as XLSX from 'xlsx';

interface ExcelPreviewProps {
  fileUrl: string;
  fileType: 'xlsx' | 'xls' | 'csv';
}

export function ExcelPreview({ fileUrl, fileType }: Readonly<ExcelPreviewProps>) {
  const { t } = useLanguage();
  const [tableData, setTableData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef({ startX: 0, scrollLeft: 0 });

  useEffect(() => {
    let cancelled = false;

    const loadSpreadsheet = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(t('documentDetail.preview.failedToLoadCsv'));
        }

        const buffer = await response.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];

        if (!firstSheetName) {
          throw new Error(t('documentDetail.preview.noDataToDisplay'));
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
        });

        type CellValue = string | number | boolean;

        const convertCellToString = (cell: CellValue): string => {
          return (cell ?? '').toString();
        };

        const convertRowToStrings = (row: Array<CellValue>): string[] => {
          return row.map(convertCellToString);
        };

        const rows = rawRows.map((row: unknown) => convertRowToStrings(row as Array<CellValue>));

        if (!cancelled) {
          setTableData(rows);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t('documentDetail.preview.failedToLoadCsv'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadSpreadsheet();

    return () => {
      cancelled = true;
    };
  }, [fileUrl, t]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!scrollContainerRef.current) return;

      e.preventDefault();
      const container = scrollContainerRef.current;
      const rect = container.getBoundingClientRect();
      const x = e.pageX - rect.left;
      const walk = (x - dragStateRef.current.startX) * 2;
      container.scrollLeft = dragStateRef.current.scrollLeft - walk;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const doc = document;
    doc.addEventListener('mousemove', handleMouseMove);
    doc.addEventListener('mouseup', handleMouseUp);
    doc.body.style.cursor = 'grabbing';
    doc.body.style.userSelect = 'none';

    return () => {
      doc.removeEventListener('mousemove', handleMouseMove);
      doc.removeEventListener('mouseup', handleMouseUp);
      doc.body.style.cursor = '';
      doc.body.style.userSelect = '';
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const rect = container.getBoundingClientRect();
    dragStateRef.current = {
      startX: e.pageX - rect.left,
      scrollLeft: container.scrollLeft,
    };
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm text-gray-600">{t('documentDetail.preview.loadingCsv')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm text-(--color-destructive)">{error}</p>
      </div>
    );
  }

  if (tableData.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm text-(--color-muted-foreground)">{t('documentDetail.preview.noDataToDisplay')}</p>
      </div>
    );
  }

  const showDownloadLink = fileType === 'xlsx' || fileType === 'xls';

  return (
    <div className="flex h-full w-full flex-col">
      <div
        ref={scrollContainerRef}
        role="region"
        aria-label="Excel preview table - use arrow keys to scroll, click and drag to pan"
        aria-live="polite"
        className={`flex-1 overflow-auto rounded border border-gray-200 bg-transparent p-0 text-left ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const scrollAmount = 50;
            if (scrollContainerRef.current) {
              if (e.key === 'ArrowLeft') scrollContainerRef.current.scrollLeft -= scrollAmount;
              else if (e.key === 'ArrowRight') scrollContainerRef.current.scrollLeft += scrollAmount;
              else if (e.key === 'ArrowUp') scrollContainerRef.current.scrollTop -= scrollAmount;
              else if (e.key === 'ArrowDown') scrollContainerRef.current.scrollTop += scrollAmount;
            }
          }
        }}
        onTouchStart={(e) => {
          if (e.touches.length === 1) {
            handleMouseDown(e as unknown as React.MouseEvent<HTMLDivElement>);
          }
        }}
        style={{ userSelect: isDragging ? 'none' : 'auto' }}
      >
        <table className="min-w-full border-collapse bg-white">
          <tbody>
            {tableData.map((row, rowIndex) => {
              const rowKey = row[0] ? String(row[0]).substring(0, 20) : `row-${rowIndex}`;
              return (
                <tr key={`row-${rowKey}-${rowIndex}`}>
                  {row.map((cell, cellIndex) => {
                    const isHeader = rowIndex === 0;
                    const cellKey = cell ? String(cell).substring(0, 10) : `cell-${cellIndex}`;
                    return (
                      <td
                        key={`cell-${cellKey}-${rowIndex}-${cellIndex}`}
                        className={`border border-gray-200 px-4 py-2 text-sm ${isHeader ? 'bg-gray-50 font-semibold' : 'bg-white'}`}
                        style={{ userSelect: isDragging ? 'none' : 'auto' }}
                      >
                        {cell || ''}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showDownloadLink && (
        <div className="mt-2 flex items-center justify-center">
          <a href={fileUrl} download className="text-sm text-(--color-primary) hover:text-(--color-primary-hover) hover:underline">
            {t('documentDetail.preview.downloadExcelFile')}
          </a>
        </div>
      )}
    </div>
  );
}
