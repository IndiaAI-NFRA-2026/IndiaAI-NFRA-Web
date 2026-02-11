import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface BadgeProps {
  label: string;
  severity: 'info' | 'warn' | 'danger' | 'success';
}

const Badge = ({ label, severity }: BadgeProps) => {
  const variantClass = useMemo(() => {
    switch (severity) {
      case 'info':
        return 'bg-[#FAFAFA] border border-[#D9D9D9] text-[#000000D9]';
      case 'warn':
        return 'bg-[#FFF7E6] border border-[#FFD591] text-[#FA8C16]';
      case 'danger':
        return 'bg-[#FFF1F0] border border-[#FFA39E] text-[#F5222D]';
      case 'success':
        return 'bg-[#DDF5F2] border border-[#2A9D8F] text-[#2A9D8F]';
      default:
        return 'bg-[#FAFAFA] border border-[#D9D9D9] text-[#000000D9]';
    }
  }, [severity]);

  return (
    <div className={cn('inline-flex h-[25px] w-[25px] items-center justify-center rounded-full', variantClass)}>
      <p className="text-[12px] leading-[20px] text-nowrap">{label}</p>
    </div>
  );
};

export default Badge;
