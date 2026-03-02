import { type ReactNode } from 'react';

interface SectionHeaderProps {
  icon?: ReactNode;
  title: string;
}

export function SectionHeader({ icon, title }: Readonly<SectionHeaderProps>) {
  return (
    <div className="flex items-center gap-2">
      {icon && <span className="text-(--color-button-background)">{icon}</span>}
      <h3 className="text-foreground text-[14px] leading-[24px] font-medium">{title}</h3>
    </div>
  );
}
