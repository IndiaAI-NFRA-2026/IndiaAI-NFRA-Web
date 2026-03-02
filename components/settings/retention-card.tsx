'use client';

import { useLanguage } from '@/lib/i18n/useLanguage';
import { Input } from '../typing/input';
import { Calendar } from 'lucide-react';

interface RetentionCardProps {
  image: React.ReactNode;
  title: string;
  subTitle: string;
  value: number;
  helper: string;
  error?: string;
  disabled?: boolean;
  onChange?: (value: number) => void;
}

export function RetentionCard({ image, title, subTitle, value, helper, disabled = false, error, onChange }: Readonly<RetentionCardProps>) {
  const { t } = useLanguage();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      onChange?.(0);
      return;
    }

    const numericValue = inputValue.replaceAll(/\D/g, '');

    if (numericValue === '') {
      onChange?.(0);
      return;
    }

    const numValue = Number.parseInt(numericValue, 10);
    if (!Number.isNaN(numValue) && numValue >= 1) {
      onChange?.(numValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (e.ctrlKey || e.metaKey) {
      if (/[a-zA-Z]/.test(e.key)) {
        e.preventDefault();
      }
      return;
    }
    if (allowedKeys.includes(e.key)) {
      return;
    }
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const numericValue = pastedText.replaceAll(/\D/g, '');
    if (numericValue === '') {
      return;
    }
    const numValue = Number.parseInt(numericValue, 10);

    if (!Number.isNaN(numValue) && numValue >= 1) {
      onChange?.(numValue);
    }
  };

  const handleInvalid = (e: React.InvalidEvent<HTMLInputElement>) => {
    e.preventDefault();
  };

  return (
    <div className="rounded border border-(--color-filters-border) bg-[#F9FAFB] p-5">
      <div className="flex flex-1 items-center">
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center gap-1">
            <div className="flex items-center justify-center rounded text-(--color-button-background)">{image}</div>
            <p className="text-foreground text-sm font-semibold">{title}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-secondary text-[14px] leading-[21px] font-normal">{subTitle}</p>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={value || ''}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onInvalid={handleInvalid}
              disabled={disabled}
              className="w-full"
              error={error}
              placeholder={t('retentionPolicy.retentionPeriods.enterDays')}
              icon={<Calendar className="size-3" />}
            />
          </div>
          <p className="text-secondary text-sm">{helper}</p>
        </div>
      </div>
    </div>
  );
}
