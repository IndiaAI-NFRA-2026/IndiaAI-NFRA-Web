'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { RichTextEditor } from './rich-text-editor';
import { formatTitle } from '@/lib/utils/helpers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialJustification?: string;
  initialRationale?: string;
  initialReason?: string;
  initialKey?: string;
  onSave: (analysis: string, rationale: string, reason: string, key?: string) => void;
}

export function EditModal({
  isOpen,
  onClose,
  initialJustification = '',
  initialRationale = '',
  initialReason = '',
  initialKey = '',
  onSave,
}: Readonly<EditModalProps>) {
  const { t } = useLanguage();

  const [reason, setReason] = useState(initialReason);
  const [errors, setErrors] = useState<{
    analysis?: string;
    rationale?: string;
    reason?: string;
  }>({});
  const [updateKeyAnalysis, setUpdateKeyAnalysis] = useState(0);
  const [updateKeyRationale, setUpdateKeyRationale] = useState(0);
  const reasonTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Check if initialJustification is a final result value (strong, medium, weak)
  const finalResultOptions = ['strong', 'medium', 'weak'] as const;
  const normalizedInitialJustification = initialJustification?.toLowerCase().trim() || '';
  const isFinalResultDropdown = finalResultOptions.includes(normalizedInitialJustification as (typeof finalResultOptions)[number]);
  const [finalResult, setFinalResult] = useState(normalizedInitialJustification || '');

  // Editor for Analysis
  const editorAnalysis = useEditor({
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
    content: initialJustification || '',
    immediatelyRender: false,
    onUpdate: () => {
      setUpdateKeyAnalysis((prev) => prev + 1);
      // Validate on change
      if (errors.analysis) {
        const text = editorAnalysis?.getText() || '';
        const error = text.trim() === '' ? t('financialStatement.modalEditor.analysisRequired') : undefined;
        setErrors((prev) => ({ ...prev, analysis: error }));
      }
    },
    onSelectionUpdate: () => {
      setUpdateKeyAnalysis((prev) => prev + 1);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none px-4 py-3',
        style: 'min-height: 60px;',
      },
    },
  });

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
        const error = text.trim() === '' ? t('financialStatement.modalEditor.rationaleRequired') : undefined;
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

    const normalized = initialJustification?.toLowerCase().trim() || '';
    const isDropdown = finalResultOptions.includes(normalized as (typeof finalResultOptions)[number]);

    setReason(initialReason);
    setFinalResult(normalized);
    setErrors({});

    if (!isDropdown && editorAnalysis) {
      editorAnalysis.commands.setContent(initialJustification || '');
    }
    if (editorRationale) {
      editorRationale.commands.setContent(initialRationale || '');
    }
  }, [isOpen, initialJustification, initialRationale, initialReason, editorAnalysis, editorRationale]);

  const handleSave = () => {
    const newErrors: {
      analysis?: string;
      rationale?: string;
      reason?: string;
    } = {};

    let analysisContent = '';
    let analysisText = '';

    if (isFinalResultDropdown) {
      analysisContent = finalResult;
      if (!finalResult.trim()) {
        newErrors.analysis = t('financialStatement.modalEditor.finalResultRequired');
      }
    } else {
      analysisContent = editorAnalysis?.getHTML() || '';
      analysisText = editorAnalysis?.getText() || '';
      if (!analysisText.trim()) {
        newErrors.analysis = t('financialStatement.modalEditor.analysisRequired');
      }
    }

    const rationaleContent = editorRationale?.getHTML() || '';
    const rationaleText = editorRationale?.getText() || '';
    if (!rationaleText.trim()) {
      newErrors.rationale = t('financialStatement.modalEditor.rationaleRequired');
    }

    // Validate reason is required
    if (!reason?.trim()) {
      newErrors.reason = t('financialStatement.modalEditor.reasonRequired') || 'Reason is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(analysisContent, rationaleContent, reason || '', initialKey);
    onClose();
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!editorRationale || (!isFinalResultDropdown && !editorAnalysis)) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-(--color-background-color) p-0">
        <DialogHeader className="border-b border-(--color-filters-border) px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold text-(--color-table-header-text-color)">
              {t('financialStatement.modalEditor.edit')} {formatTitle(initialKey)}
            </DialogTitle>
            <Button
              onClick={handleClose}
              className="color-(--color-table-text-color) cursor-pointer rounded-full bg-transparent p-0 hover:bg-transparent"
              variant="ghost"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 px-6 py-2">
          {/* Analysis Field or Final Result Dropdown */}
          {(() => {
            if (isFinalResultDropdown) {
              return (
                <div className="space-y-2">
                  <label className="text-sm font-normal text-(--color-table-text-color)">
                    <span className="text-(--color-destructive)">*</span> {t('financialStatement.analytics.analysis') || 'Analysis'}
                  </label>
                  <Select
                    value={finalResult}
                    onValueChange={(value) => {
                      setFinalResult(value);
                      // Validate on change
                      if (errors.analysis) {
                        const error = value.trim() === '' ? t('financialStatement.modalEditor.finalResultRequired') : undefined;
                        setErrors((prev) => ({ ...prev, analysis: error }));
                      }
                    }}
                  >
                    <SelectTrigger className={errors.analysis ? 'border-red-500' : ''}>
                      <SelectValue
                        placeholder={
                          t('financialStatement.modalEditor.selectAnalysis') ||
                          t('financialStatement.analytics.analysis') ||
                          'Select Analysis'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strong">{t('financialStatement.analytics.finalResultOptions.strong') || 'Strong'}</SelectItem>
                      <SelectItem value="medium">{t('financialStatement.analytics.finalResultOptions.medium') || 'Medium'}</SelectItem>
                      <SelectItem value="weak">{t('financialStatement.analytics.finalResultOptions.weak') || 'Weak'}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.analysis && <p className="text-sm text-(--color-destructive)">{errors.analysis}</p>}
                </div>
              );
            }
            if (editorAnalysis) {
              return (
                <div className="space-y-2">
                  <label className="text-sm font-normal text-(--color-table-text-color)">
                    <span className="text-(--color-destructive)">*</span> {t('financialStatement.analytics.analysis') || 'Analysis'}
                  </label>
                  <RichTextEditor
                    editor={editorAnalysis}
                    updateKey={updateKeyAnalysis}
                    setUpdateKey={setUpdateKeyAnalysis}
                    error={errors.analysis}
                  />
                  {errors.analysis && <p className="text-sm text-(--color-destructive)">{errors.analysis}</p>}
                </div>
              );
            }
            return null;
          })()}

          {/* Rationale Field */}
          <div className="space-y-2">
            <label className="text-sm font-normal text-(--color-table-text-color)">
              <span className="text-(--color-destructive)">*</span> {t('financialStatement.analytics.rationale') || 'Rationale'}
            </label>
            <RichTextEditor
              editor={editorRationale}
              updateKey={updateKeyRationale}
              setUpdateKey={setUpdateKeyRationale}
              error={errors.rationale}
            />
            {errors.rationale && <p className="text-sm text-(--color-destructive)">{errors.rationale}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-normal text-(--color-table-text-color)">
              <span className="text-(--color-destructive)">*</span> {t('financialStatement.modalEditor.reason') || 'Reason'}
            </label>
            <Textarea
              ref={reasonTextareaRef}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                // Validate on change
                if (errors.reason) {
                  const error =
                    e.target.value?.trim() === '' ? t('financialStatement.modalEditor.reasonRequired') || 'Reason is required' : undefined;
                  setErrors((prev) => ({ ...prev, reason: error }));
                }
              }}
              className={cn('mt-1 resize-none overflow-hidden', errors.reason && 'border-red-500')}
              placeholder={t('financialStatement.modalEditor.reason')}
              rows={1}
            />
            {errors.reason && <p className="text-sm text-(--color-destructive)">{errors.reason}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-(--color-filters-border) px-6 py-4">
          <Button
            variant="outline"
            onClick={handleClose}
            className="hover:bg-background-color/90 w-fit min-w-8 cursor-pointer rounded bg-(--color-background-color) px-4 py-1 leading-5.5 font-normal text-(--color-sidebar-foreground) hover:text-(--color-sidebar-foreground) disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('financialStatement.modalEditor.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            variant="outline"
            className="hover:bg-button-background/90 cursor-pointer rounded bg-(--color-button-background) px-[15px] py-[4px] leading-5.5 font-normal text-(--color-button-foreground) hover:text-(--color-button-foreground) disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('financialStatement.modalEditor.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
