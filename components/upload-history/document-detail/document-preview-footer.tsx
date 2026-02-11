'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useLanguage } from '@/lib/i18n/useLanguage';

interface DocumentPreviewFooterProps {
  titleButton: string;
  isEditing: boolean;
  isLoading: boolean;
  onBack: () => void;
  onCancel: () => void;
  onApprove: () => void;
  isDisabledApproveButton: boolean;
}

export function DocumentPreviewFooter({
  titleButton,
  isEditing,
  isLoading,
  onBack,
  onCancel,
  onApprove,
  isDisabledApproveButton,
}: Readonly<DocumentPreviewFooterProps>) {
  const { t } = useLanguage();

  return (
    <div className="bg-white p-4">
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={isEditing ? onCancel : onBack}
          disabled={isLoading}
          className="hover:bg-muted min-w-24 font-normal"
        >
          {isEditing ? t('documentDetail.footer.cancel') : t('documentDetail.footer.back')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onApprove}
          disabled={isDisabledApproveButton}
          className="hover:bg-button-background/90 bg-(--color-button-background) font-normal text-white hover:text-white"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Spinner className="size-4 animate-spin" />
              {t('documentDetail.footer.saving')}
            </span>
          ) : (
            titleButton
          )}
        </Button>
      </div>
    </div>
  );
}
