import { useLanguage } from '@/lib/i18n/useLanguage';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { AnalysisField } from '@/types/documents';
import { EditModal } from './edit-modal';

interface SectionItemProps {
  fieldKey: string;
  field: AnalysisField;
  titleKey: string;
  onSave?: (key: string, analysis: string, rationale: string, reason: string) => void;
  isEditable?: boolean;
  isViewReason?: boolean;
  isUploader?: boolean;
}

export function SectionItem({
  fieldKey,
  field,
  titleKey,
  onSave,
  isEditable = true,
  isViewReason = false,
  isUploader = false,
}: Readonly<SectionItemProps>) {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analysis, setAnalysis] = useState(field.Analysis || '');
  const [rationale, setRationale] = useState(field.rationale || '');
  const [reason, setReason] = useState(field.reason || '');

  // Check if analysis is a final result value (strong, medium, weak)
  const finalResultOptions = ['strong', 'medium', 'weak'] as const;
  const normalizedAnalysis = analysis?.toLowerCase().trim() || '';
  const isFinalResult = finalResultOptions.includes(normalizedAnalysis as (typeof finalResultOptions)[number]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnalysis(field.Analysis || '');
      setRationale(field.rationale || '');
      setReason(field.reason || '');
    }, 0);
    return () => clearTimeout(timer);
  }, [field.Analysis, field.rationale, field.reason]);

  const handleEdit = () => {
    setIsModalOpen(true);
  };

  const handleModalSave = (analysisContent: string, rationaleContent: string, reasonContent: string) => {
    if (onSave) {
      onSave(fieldKey, analysisContent, rationaleContent, reasonContent);
    }
    // Update local state with the saved content
    setAnalysis(analysisContent);
    setRationale(rationaleContent);
    setReason(reasonContent);
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="rounded-lg border border-(--color-filters-border) bg-(--color-background-color)">
      <div className="flex items-center justify-between border-b border-(--color-filters-border) px-6 py-4">
        <h3 className="text-sm font-bold text-(--color-table-header-text-color)">
          {t(`financialStatement.analytics.dataSourcesAudit.${titleKey}`) || titleKey.replaceAll('_', ' ')}
        </h3>
        {isEditable && isUploader && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 rounded border border-(--color-data-sources-audit-analysis-border-color) bg-(--color-background-color) px-4 text-(--color-table-header-text-color) hover:bg-(--color-background-color) hover:text-(--color-table-header-text-color)"
            title={t('financialStatement.analytics.edit')}
          >
            <Image src="/assets/icons/edit-icon.svg" alt={t('financialStatement.analytics.edit')} width={12} height={12} />
            {t('financialStatement.analytics.edit')}
          </Button>
        )}
      </div>
      <div className="space-y-4 p-6">
        {/* Analysis Field or Final Result */}
        <div className="space-y-2 rounded border border-(--color-data-sources-audit-analysis-border-color) bg-(--color-data-sources-audit-analysis-background-color) p-4">
          <label className="text-sm font-semibold text-(--color-data-sources-audit-analysis-text-color)">
            {isFinalResult
              ? t('financialStatement.analytics.finalResult') || 'Final Result'
              : t('financialStatement.analytics.analysis') || 'Analysis'}
          </label>
          {isFinalResult ? (
            <div className="text-sm font-medium text-(--color-data-sources-audit-analysis-text-color)">
              {t(`financialStatement.analytics.finalResultOptions.${normalizedAnalysis}`) || normalizedAnalysis}
            </div>
          ) : (
            <div
              className="prose prose-sm max-w-none text-sm leading-relaxed text-(--color-data-sources-audit-analysis-text-color) [&_li]:mb-1 [&_li_p]:mb-0 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-1 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-1"
              dangerouslySetInnerHTML={{
                __html: analysis,
              }}
            />
          )}
        </div>

        {/* Rationale Field */}
        <div className="space-y-2 rounded border border-(--color-data-sources-audit-rationale-border-color) bg-(--color-data-sources-audit-rationale-background-color) p-4">
          <label className="mb-1 text-sm font-semibold text-(--color-data-sources-audit-rationale-text-color)">
            {t('financialStatement.analytics.rationale') || 'Rationale'}
          </label>
          <div
            className="prose prose-sm max-w-none text-sm leading-relaxed text-(--color-data-sources-audit-rationale-text-color) [&_li]:mb-1 [&_li_p]:mb-0 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-1 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-1"
            dangerouslySetInnerHTML={{
              __html: rationale || 'No rationale provided',
            }}
          />
        </div>

        {isViewReason && (
          <div className="space-y-2 rounded border border-(--color-data-sources-audit-analysis-border-color) bg-white p-4">
            <label className="text-sm font-semibold text-(--color-data-sources-audit-analysis-text-color)">
              {t('financialStatement.analytics.reason') || 'Reason'}
            </label>
            <div className="prose prose-sm max-w-none text-sm leading-relaxed text-(--color-data-sources-audit-analysis-text-color)">
              {reason}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialJustification={analysis}
        initialRationale={rationale}
        initialReason={reason}
        initialKey={fieldKey}
        onSave={handleModalSave}
      />
    </div>
  );
}
