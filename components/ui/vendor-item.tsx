'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/useLanguage';
import type { Vendor } from '@/types/vendors';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface VendorItemProps {
  vendor: Vendor;
  isFirst: boolean;
  isLast: boolean;
  routerLink: string;
}

export function VendorItem({ vendor, isFirst, isLast, routerLink }: Readonly<VendorItemProps>) {
  const { t } = useLanguage();
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(routerLink);
  };

  return (
    <div
      className={cn(
        'flex w-full items-center justify-between p-4 transition-colors',
        'hover:bg-(--color-sidebar)',
        isFirst ? 'rounded-t-md' : '',
        isLast ? 'rounded-b-md' : ''
      )}
    >
      <div className="flex flex-col items-start gap-1">
        <span className="text-sm font-bold text-(--color-text-gray)">{vendor.vendor_name}</span>
        <span className="text-xs font-normal text-(--color-text-gray)">
          {vendor.total_documents} {vendor.total_documents === 1 ? t('uploadedHistory.doc') : t('uploadedHistory.docs')}
        </span>
      </div>
      <Button
        onClick={handleViewDetails}
        variant="outline"
        className="hover:bg-button-background/90 cursor-pointer bg-(--color-button-background) px-[15px] py-[4px] leading-5.5 font-normal text-(--color-button-foreground) hover:text-(--color-button-foreground) disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t('uploadedHistory.viewDetails')}
      </Button>
    </div>
  );
}
