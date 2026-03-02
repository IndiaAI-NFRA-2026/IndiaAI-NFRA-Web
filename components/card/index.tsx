import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  header?: ReactNode;
  headerStyle?: string;
  children?: ReactNode;
  contentStyle?: string;
  footer?: ReactNode;
  footerStyle?: string;
  containerStyle?: string;
}

const Card = ({ header, headerStyle, children, contentStyle, footer, footerStyle, containerStyle }: CardProps) => {
  return (
    <div
      className={cn('flex min-h-0 flex-col rounded bg-(--color-background-color) shadow-[0_2px_8px_0_rgba(0,0,0,0.15)]', containerStyle)}
    >
      {header && <div className={cn(headerStyle)}>{header}</div>}
      <div className={cn('flex flex-col', contentStyle)}>{children}</div>
      {footer && <div className={cn(footerStyle)}>{footer}</div>}
    </div>
  );
};

export default Card;
