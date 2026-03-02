'use client';

import { useLanguage } from '@/lib/i18n/useLanguage';
import { VendorItem } from '@/components/ui/vendor-item';
import type { Vendor } from '@/types/vendors';

interface VendorListProps {
  vendors: Vendor[];
  basePath?: string;
}

export function VendorList({ vendors, basePath = '/fraud-anomaly/vendor' }: Readonly<VendorListProps>) {
  const { t } = useLanguage();

  if (vendors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-md border p-8">
        <img src="/assets/icons/no-data-icon.svg" alt="no data" className="h-10 w-16" />
        <p className="text-sm font-normal text-(--color-table-no-data-icon)">{t('dataTable.noResults')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-0 rounded-md border">
      {vendors.map((vendor, index) => (
        <div key={vendor.vendor_name} className={index === vendors.length - 1 ? '' : 'border-b'}>
          <VendorItem
            vendor={vendor}
            isFirst={index === 0}
            isLast={index === vendors.length - 1}
            routerLink={`${basePath}?vendor=${encodeURIComponent(vendor.vendor_name)}`}
          />
        </div>
      ))}
    </div>
  );
}
