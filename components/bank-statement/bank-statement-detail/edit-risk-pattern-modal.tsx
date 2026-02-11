'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { RichTextEditor } from '@/components/financial-statement/analytics/analytics-tab/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditRiskPatternModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTransactionId?: string;
  initialCategory?: string;
  initialRationale?: string;
  initialReason?: string;
  onSave: (category: string, rationale: string, reason: string) => void;
}

const RISK_CATEGORIES = [
  'money_mule',
  'merchant_risk',
  'gambling_activity',
  'high_velocity',
  'round_tripping',
  'cash_intensive',
  'structuring',
  'geographic_risk',
  'insider_activity',
  'account_takeover',
];

export function EditRiskPatternModal({
  isOpen,
  onClose,
  initialTransactionId = '',
  initialCategory = '',
  initialRationale = '',
  initialReason = '',
  onSave,
}: Readonly<EditRiskPatternModalProps>) {
  const { t } = useLanguage();

  const [category, setCategory] = useState(initialCategory);
  const [reason, setReason] = useState(initialReason);
  const [errors, setErrors] = useState<{
    category?: string;
    rationale?: string;
    reason?: string;
  }>({});
  const [updateKeyRationale, setUpdateKeyRationale] = useState(0);
  const reasonTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Editor for Rationale
  const editorRationale = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        horizontalRule: false,
        blockquote: false,
        codeBlock: false,
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Strike,
    ],
    content: initialRationale || '',
    immediatelyRender: false,
    onUpdate: () => {
      setUpdateKeyRationale((prev) => prev + 1);
      // Validate on change
      if (errors.rationale) {
        const text = editorRationale?.getText() || '';
        const error = text.trim() ? undefined : t('bankStatement.riskPatterns.rationaleRequired') || 'Rationale is required';
        setErrors((prev) => ({ ...prev, rationale: error }));
      }
    },
    onSelectionUpdate: () => {
      setUpdateKeyRationale((prev) => prev + 1);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none px-4 py-3',
        style: 'min-height: 60px;',
      },
    },
  });

  // Auto-resize textarea for reason
  useEffect(() => {
    if (reasonTextareaRef.current) {
      reasonTextareaRef.current.style.height = 'auto';
      reasonTextareaRef.current.style.height = `${reasonTextareaRef.current.scrollHeight}px`;
    }
  }, [reason]);

  // Reset form when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setTimeout(() => {
      setCategory(initialCategory);
      setReason(initialReason);
      setErrors({});
      if (editorRationale) {
        editorRationale.commands.setContent(initialRationale || '');
      }
    }, 0);
  }, [isOpen, initialCategory, initialRationale, initialReason, editorRationale]);

  const handleSave = () => {
    const newErrors: { category?: string; rationale?: string; reason?: string } = {};

    // Validate category
    if (!category?.trim()) {
      newErrors.category = t('bankStatement.riskPatterns.categoryRequired') || 'Category is required';
    }

    // Validate rationale
    const rationaleText = editorRationale?.getText() || '';
    if (!rationaleText.trim()) {
      newErrors.rationale = t('bankStatement.riskPatterns.rationaleRequired') || 'Rationale is required';
    }

    // Validate reason
    if (!reason?.trim()) {
      newErrors.reason = t('bankStatement.riskPatterns.reasonRequired') || 'Reason is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const rationaleHtml = editorRationale?.getHTML() || '';
    onSave(category, rationaleHtml, reason);
    onClose();
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const formatCategoryLabel = (category: string) => {
    return category.replaceAll('_', ' ').replaceAll(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-upload-modal-background rounded p-0 sm:max-w-[600px]">
        <button onClick={handleClose} className="absolute top-4 right-5 cursor-pointer rounded-full p-1.5 transition hover:bg-gray-100">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader className="border-b border-(--color-filters-border) px-6 py-4 text-left">
          <DialogTitle className="text-base leading-6 font-medium">
            {t('bankStatement.riskPatterns.editTitle') || 'Edit Risk Patterns'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4">
          {/* TXN ID - Read-only */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-(--color-table-header-text-color)">
              {t('bankStatement.riskPatterns.txnId') || 'TXN ID:'}
            </label>
            <span className="text-sm font-normal text-(--color-upload-content-color)">{initialTransactionId}</span>
          </div>

          {/* Category - Required */}
          <div>
            <label className="mb-2 block text-sm font-medium text-(--color-table-header-text-color)">
              <span className="text-(--color-destructive)">*</span> {t('bankStatement.riskPatterns.category') || 'Category'}
            </label>
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value);
                if (errors.category) {
                  setErrors((prev) => ({ ...prev, category: undefined }));
                }
              }}
            >
              <SelectTrigger className={cn('w-full', errors.category && 'border-red-500')}>
                <SelectValue placeholder={t('bankStatement.riskPatterns.selectCategory') || 'Select category'} />
              </SelectTrigger>
              <SelectContent>
                {RISK_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {formatCategoryLabel(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
          </div>

          {/* Rationale - Required with Rich Text Editor */}
          <div>
            <label className="mb-2 block text-sm font-medium text-(--color-table-header-text-color)">
              <span className="text-(--color-destructive)">*</span> {t('bankStatement.riskPatterns.rationale') || 'Rationale'}
            </label>
            {editorRationale && (
              <RichTextEditor
                editor={editorRationale}
                updateKey={updateKeyRationale}
                setUpdateKey={setUpdateKeyRationale}
                error={errors.rationale}
              />
            )}
            {errors.rationale && <p className="mt-1 text-sm text-red-500">{errors.rationale}</p>}
          </div>

          {/* Reason - Required */}
          <div>
            <label className="mb-2 block text-sm font-medium text-(--color-table-header-text-color)">
              <span className="text-(--color-destructive)">*</span> {t('bankStatement.riskPatterns.reason') || 'Reason'}
            </label>
            <Textarea
              ref={reasonTextareaRef}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errors.reason) {
                  setErrors((prev) => ({ ...prev, reason: undefined }));
                }
              }}
              className={cn('min-h-[100px] resize-none', errors.reason && 'border-red-500')}
              placeholder={t('bankStatement.riskPatterns.reasonPlaceholder') || 'Enter reason...'}
            />
            {errors.reason && <p className="mt-1 text-sm text-red-500">{errors.reason}</p>}
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-3 border-t border-(--color-filters-border) px-6 py-4">
          <Button type="button" variant="outline" onClick={handleClose} className="hover:bg-muted min-w-24">
            {t('button.cancel') || 'Cancel'}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="hover:bg-sidebar-primary/90 min-w-24 bg-(--color-sidebar-primary) text-white"
          >
            {t('button.save') || 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
