import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-[4px] border border-[#dddddd]! !p-[16px] [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        default: 'bg-alert-default-background border-alert-default-border text-alert-default-foreground [&>svg]:text-alert-default-icon',
        warning:
          'bg-[var(--alert-warning-background)] border-[var(--alert-warning-border)] text-[var(--alert-warning-foreground)] [&>svg]:text-[var(--alert-warning-icon)]',
        info: 'bg-[var(--alert-info-background)] border-[var(--alert-info-border)] text-[var(--alert-info-foreground)] [&>svg]:text-[var(--alert-info-icon)]',
        error:
          'bg-[var(--alert-error-background)] border-[var(--alert-error-border)] text-[var(--alert-error-foreground)] [&>svg]:text-[var(--alert-error-icon)]',
        success:
          'bg-[var(--alert-success-background)] border-[var(--alert-success-border)] text-[var(--alert-success-foreground)] [&>svg]:text-[var(--alert-success-icon)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const alertIconMap = {
  warning: AlertTriangle,
  info: Info,
  error: XCircle,
  success: CheckCircle2,
  default: Info,
};

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ className, variant, title, description, icon, children, ...props }, ref) => {
  const IconComponent = variant && variant !== 'default' ? alertIconMap[variant] : null;
  let displayIcon: React.ReactNode = null;
  if (icon !== undefined) {
    displayIcon = icon;
  } else if (IconComponent) {
    displayIcon = <IconComponent className="h-5 w-5" />;
  }

  return (
    <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      {displayIcon}
      <div className="flex flex-col gap-[4px]">
        {title && <h5 className="mb-1 text-[15px] leading-none font-semibold tracking-tight">{title}</h5>}
        {description && <div className="text-[13px] [&_p]:leading-relaxed">{description}</div>}
        {children}
      </div>
    </div>
  );
});
Alert.displayName = 'Alert';

export { Alert, alertVariants };
