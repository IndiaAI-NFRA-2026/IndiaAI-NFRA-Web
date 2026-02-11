'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  path: string;
  isLast?: boolean;
}

export interface BreadcrumbOptions {
  items?: Array<{ label: string; path: string }>;
  segmentLabelOverrides?: Record<number, string>;
  labelMap?: Record<string, string>;
  className?: string;
  separator?: ReactNode;
}

interface BreadcrumbContextValue {
  options: BreadcrumbOptions | null;
  setOptions: (o: BreadcrumbOptions | null) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<BreadcrumbOptions | null>(null);
  const value = useMemo(() => ({ options, setOptions }), [options]);
  return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>;
}

export function useBreadcrumb() {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) return { options: null, setOptions: () => {} };
  return ctx;
}

export function Breadcrumb() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { options } = useBreadcrumb();

  const baseLabelMap: Record<string, string> = useMemo(
    () => ({
      'review-extraction': t('sidebar.reviewExtraction'),
      analysis: t('sidebar.analysis'),
    }),
    [t]
  );
  const labelMap = useMemo(() => ({ ...baseLabelMap, ...options?.labelMap }), [baseLabelMap, options?.labelMap]);

  const getBreadcrumbLabel = useCallback(
    (segment: string, index: number): string => {
      const override = options?.segmentLabelOverrides?.[index];
      if (override != null) return override;

      if (segment.includes('[')) return 'Detail';

      let decoded = segment;
      try {
        decoded = decodeURIComponent(segment);
      } catch {
        decoded = segment;
      }
      const clean = decoded.toLowerCase();
      return labelMap[clean] || decoded.charAt(0).toUpperCase() + decoded.slice(1).replace(/-/g, ' ');
    },
    [labelMap, options?.segmentLabelOverrides]
  );

  const generateBreadcrumbs = useCallback((): BreadcrumbItem[] => {
    if (options?.items?.length) {
      return options.items.map((item, i, arr) => ({ ...item, isLast: i === arr.length - 1 }));
    }

    const segments = pathname.split('/').filter(Boolean);
    const list: BreadcrumbItem[] = [];
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      list.push({
        label: getBreadcrumbLabel(segment, index),
        path: currentPath,
        isLast: index === segments.length - 1,
      });
    });
    return list;
  }, [pathname, getBreadcrumbLabel, options]);

  const breadcrumbs = generateBreadcrumbs();
  const separator = options?.separator ?? <span className="text-gray-400">/</span>;

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className={cn('flex max-h-[35px] min-h-[35px] items-center max-md:px-2', options?.className)} aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        {breadcrumbs.map((item, index) => (
          <li key={item.path} className="flex items-center gap-2">
            {index > 0 && separator}
            {item.isLast ? (
              <span className="text-[12px] text-gray-600">{item.label}</span>
            ) : (
              <button
                onClick={() => router.push(item.path)}
                className={cn('cursor-pointer text-[12px] text-(--color-text-link) hover:underline', 'transition-colors')}
              >
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
