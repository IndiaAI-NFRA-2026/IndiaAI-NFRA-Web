'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/useLanguage';

export function FlagBadge({ flag }: Readonly<{ flag?: string }>) {
  if (!flag) return null;

  let borderColor = '';
  let backgroundColor = '';
  let textColor = '';

  switch (flag.toUpperCase()) {
    case 'IDENTITY':
      borderColor = 'border-(--color-fraud-flag-round-trip-border)';
      backgroundColor = 'bg-(--color-fraud-flag-round-trip-background)';
      textColor = 'text-(--color-fraud-flag-round-trip-text)';
      break;
    case 'ARITHMETIC':
      borderColor = 'border-(--color-fraud-flag-casino-border)';
      backgroundColor = 'bg-(--color-fraud-flag-casino-background)';
      textColor = 'text-(--color-fraud-flag-casino-text)';
      break;
    case 'OCR QUALITY':
      borderColor = 'border-(--color-fraud-flag-weekend-border)';
      backgroundColor = 'bg-(--color-fraud-flag-weekend-background)';
      textColor = 'text-(--color-fraud-flag-weekend-text)';
      break;
    case 'AMOUNT PATTERN':
      borderColor = 'border-(--color-fraud-flag-round-figure-border)';
      backgroundColor = 'bg-(--color-fraud-flag-round-figure-background)';
      textColor = 'text-(--color-fraud-flag-round-figure-text)';
      break;
    case 'METADATA':
      borderColor = 'border-(--color-fraud-flag-unusual-currency-border)';
      backgroundColor = 'bg-(--color-fraud-flag-unusual-currency-background)';
      textColor = 'text-(--color-fraud-flag-unusual-currency-text)';
      break;
    case 'IMAGE':
      borderColor = 'border-(--color-fraud-flag-image-border)';
      backgroundColor = 'bg-(--color-fraud-flag-image-background)';
      textColor = 'text-(--color-fraud-flag-image-text)';
      break;
    default:
      borderColor = 'border-(--color-fraud-flag-default-border)';
      backgroundColor = 'bg-(--color-fraud-flag-default-background)';
      textColor = 'text-(--color-fraud-flag-default-text)';
  }

  return (
    <Badge variant="outline" className={cn('rounded px-2 py-0.5 text-xs font-normal', borderColor, backgroundColor, textColor)}>
      {flag}
    </Badge>
  );
}

interface StatusIndicatorProps {
  status?: string;
  showDot?: boolean;
  textSize?: 'xs' | 'sm';
}

export function StatusIndicator({ status, showDot = true, textSize = 'xs' }: Readonly<StatusIndicatorProps>) {
  const { t } = useLanguage();
  if (!status) return null;

  let dotColor = '';
  let textColor = '';
  let displayText = '';

  switch (status) {
    case 'false_positive':
      dotColor = 'bg-(--color-fraud-status-false-positive-dot)';
      textColor = 'text-(--color-fraud-status-false-positive-text)';
      displayText = t('fraudAnomaly.detail.statusFalsePositive') || 'False Positive';
      break;
    case 'fraud':
      dotColor = 'bg-(--color-fraud-status-fraud-dot)';
      textColor = 'text-(--color-fraud-status-fraud-text)';
      displayText = t('fraudAnomaly.detail.statusFraud') || 'Fraud';
      break;
    default:
      return null;
  }

  const textSizeClass = textSize === 'sm' ? 'text-sm' : 'text-xs';

  if (showDot) {
    return (
      <div className="flex items-center gap-2">
        <div className={cn('h-2 min-w-2 rounded-full', dotColor)} />
        <span className={cn('font-normal', textSizeClass, textColor)}>{displayText}</span>
      </div>
    );
  }

  return <span className={cn('font-normal', textSizeClass, textColor)}>{displayText}</span>;
}
