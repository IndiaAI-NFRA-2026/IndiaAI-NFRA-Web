'use client';

import { cn } from '@/lib/utils';
import { Button } from '../button';
import { ButtonProps } from '../button';
import { ArrowLeft } from 'lucide-react';

interface HeadingProps {
  title: string;
  onBack?: () => void;
  titleClassName?: string;
  subTitle?: string;
  actions?: ButtonProps[];
  className?: string;
}

export function Heading({ title, onBack, titleClassName, subTitle, actions, className }: Readonly<HeadingProps>) {
  return (
    <div className={cn('flex items-center justify-between border-b border-(--color-border) p-5 max-md:p-4', className)}>
      <div className="flex items-center gap-4">
        {onBack && <ArrowLeft onClick={onBack} className="size-5 cursor-pointer text-gray-500 hover:text-gray-700" />}
        <div>
          <p className={cn('mb-0.5 text-base leading-6 font-bold tracking-normal', titleClassName)}>{title}</p>
          {subTitle && <p className="text-secondary text-sm leading-5 font-normal">{subTitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">{actions && actions.map((action) => <Button key={action.title} {...action} />)}</div>
    </div>
  );
}
