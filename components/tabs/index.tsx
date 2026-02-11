'use client';

import { cn } from '@/lib/utils';
import Badge from '../badge';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface TabItem {
  key: string;
  label: string;
  content: React.ReactNode;
  badge?: number;
}

interface TabsProps {
  tabItems: TabItem[];
}

const Tabs = ({ tabItems }: TabsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabFromQuery = searchParams.get('tab');

  // Derive activeTab from query parameter, fallback to first tab
  const activeTab = tabFromQuery && tabItems.some((item) => item.key === tabFromQuery) ? tabFromQuery : tabItems[0].key;

  const handleTabClick = (itemKey: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', itemKey);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-1 flex-col p-3 sm:p-4">
      <div className="flex min-w-0 overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
        {tabItems.map((item, index) => (
          <div key={item.key} className="flex shrink-0">
            <div
              className={cn(
                'flex cursor-pointer items-center gap-1.5 sm:gap-2 rounded-t-[4px] px-2 py-3 sm:px-[10px] sm:pt-[9px] sm:pb-[8px]',
                activeTab === item.key
                  ? 'border border-b-0 border-(--color-text-link) bg-white'
                  : 'border-b border-(--color-text-link) bg-[#F4F4F4]'
              )}
              onClick={() => handleTabClick(item.key)}
              role="tab"
              aria-selected={activeTab === item.key}
            >
              <span
                className={cn(
                  'text-[13px] sm:text-[14px] leading-[20px] sm:leading-[22px] font-normal text-nowrap select-none',
                  activeTab === item.key ? 'font-medium' : 'font-normal'
                )}
              >
                {item.label}
              </span>
              {!!item.badge && item.badge > 0 && <Badge label={item.badge.toString()} severity="success" />}
            </div>
            <div className={cn("w-2 sm:w-[10px] shrink-0 border-b border-(--color-text-link)", index === tabItems.length - 1 ? 'hidden' : '')} />
          </div>
        ))}
        <div className="min-w-px flex-1 border-b border-(--color-text-link)" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-3 sm:py-4">{tabItems.find((item) => item.key === activeTab)?.content}</div>
    </div>
  );
};

export default Tabs;
