import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface TagProps {
  label: string;
  severity: 'info' | 'warn' | 'danger' | 'success' | 'contrast';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  rounded?: boolean;
}

const Tag = ({ label, severity, icon, iconPosition = 'left', rounded = false }: TagProps) => {
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
      case 'contrast':
        return 'bg-[#E6F7FF] border border-[#91D5FF] text-[#1890FF]';
      default:
        return 'bg-[#FAFAFA] border border-[#D9D9D9] text-[#000000D9]';
    }
  }, [severity]);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-[3px] px-[6px] py-[2px]',
        rounded ? 'rounded-full' : 'rounded-[4px]',
        variantClass,
        icon && iconPosition === 'left' && 'pl-px',
        icon && iconPosition === 'right' && 'pr-px'
      )}
    >
      {icon && iconPosition === 'left' && icon}
      <p className="text-[12px] leading-[20px] text-nowrap">{label}</p>
      {icon && iconPosition === 'right' && icon}
    </div>
  );
};

export default Tag;
