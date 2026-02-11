'use client';

import { useLanguage } from '@/lib/i18n/useLanguage';

export function Status({ status }: Readonly<{ status: string }>) {
  const { t } = useLanguage();
  let textColor = '';
  let borderColor = '';
  let statusText = '';
  let icon = '';
  let backgroundColor = '';

  switch (status) {
    case 'pending':
      textColor = 'text-(--color-sidebar-foreground)';
      borderColor = 'border border-(--color-table-action-type-border)';
      statusText = t('documentStatus.pending');
      icon = '/assets/icons/process-icon.svg';
      backgroundColor = 'bg-(--color-table-action-type-background)';
      break;
    case 'processing':
      textColor = 'text-[var(--color-status-processing-foreground)]';
      borderColor = 'border border-[var(--color-status-processing-border)]';
      statusText = t('documentStatus.processing');
      icon = '/assets/icons/process-icon.svg';
      backgroundColor = 'bg-[var(--color-status-processing-background)]';
      break;

    case 'review':
      textColor = 'text-[var(--color-status-completed-foreground)]';
      borderColor = 'border border-[var(--color-status-completed-border)]';
      statusText = t('documentStatus.review');
      icon = '/assets/icons/complete-icon.svg';
      backgroundColor = 'bg-[var(--color-status-completed-background)]';
      break;

    case 'completed':
      textColor = 'text-[var(--color-status-completed-foreground)]';
      borderColor = 'border border-[var(--color-status-completed-border)]';
      statusText = t('documentStatus.completed');
      icon = '/assets/icons/complete-icon.svg';
      backgroundColor = 'bg-[var(--color-status-completed-background)]';
      break;

    case 'approved':
      textColor = 'text-[var(--color-status-approved-foreground)]';
      borderColor = 'border border-[var(--color-status-approved-border)]';
      statusText = t('documentStatus.approved');
      icon = '/assets/icons/approved-icon.svg';
      backgroundColor = 'bg-[var(--color-status-approved-background)]';
      break;

    case 'failed':
      textColor = 'text-[var(--color-status-failed-foreground)]';
      borderColor = 'border border-[var(--color-status-failed-border)]';
      statusText = t('documentStatus.failed');
      icon = '/assets/icons/failed-icon.svg';
      backgroundColor = 'bg-[var(--color-status-failed-background)]';
      break;

    default:
      textColor = 'text-gray-600';
      borderColor = 'border border-gray-400';
      statusText = t('documentStatus.unknown');
      backgroundColor = 'bg-gray-400';
      break;
  }

  return (
    <div className={`flex w-fit items-center gap-2 rounded px-2 py-1 ${borderColor} ${backgroundColor}`}>
      {icon && <img src={icon} alt={statusText} width={12} height={12} />}
      <p className={`text-xs font-normal ${textColor}`}>{statusText}</p>
    </div>
  );
}
