'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { Button } from '@/components/button';

interface AddNoteRiskPatternModalProps {
  isOpen: boolean;
  onClose: () => void;
  riskType: string;
  initialNote?: string;
  onSave: (note: string) => void;
}

function formatRiskTypeLabel(value: string) {
  return value.replaceAll('_', ' ').replaceAll(/\b\w/g, (l) => l.toUpperCase());
}

export function AddNoteRiskPatternModal({ isOpen, onClose, riskType, initialNote = '', onSave }: Readonly<AddNoteRiskPatternModalProps>) {
  const { t } = useLanguage();
  const [note, setNote] = useState(initialNote);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => {
      setNote(initialNote);
      setError(undefined);
    }, 0);
  }, [isOpen, initialNote]);

  const handleSave = () => {
    const trimmed = note.trim();
    if (!trimmed) {
      setError(t('bankStatement.riskPatterns.addNoteRequired') || 'Note is required');
      return;
    }
    onSave(trimmed);
    onClose();
  };

  const handleClose = () => {
    setError(undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="rounded bg-(--color-upload-modal-background) p-0 sm:max-w-[700px]">
        <button
          onClick={handleClose}
          className="absolute top-4 right-5 cursor-pointer rounded-full p-1.5 transition hover:bg-gray-100"
          type="button"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader className="border-b border-(--color-filters-border) px-6 py-4 text-left">
          <DialogTitle className="text-base leading-6 font-medium text-(--color-upload-modal-text-color)">
            {initialNote
              ? 'Edit Note'
              : t('bankStatement.riskPatterns.addNoteTitle', { riskType: formatRiskTypeLabel(riskType) }) || 'Add Note'}{' '}
            - {formatRiskTypeLabel(riskType)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-(--color-table-header-text-color)">
              {initialNote ? 'Edit Note' : t('bankStatement.riskPatterns.addNoteLabel') || 'Add a note'}
            </label>
            <Textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (error) setError(undefined);
              }}
              className={cn('min-h-[80px] resize-y', error && 'border-red-500')}
              placeholder={t('bankStatement.riskPatterns.addNotePlaceholder') || 'Enter your note...'}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-1 border-t border-(--color-filters-border) px-6 py-4">
          <Button title={t('button.cancel')} type="outline" onClick={handleClose} />
          <Button title={t('button.save')} type="primary" onClick={handleSave} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
