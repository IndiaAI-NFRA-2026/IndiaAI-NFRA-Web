import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { BankStatementResponse, RiskPattern } from '@/types/analysis';
import { AddNoteRiskPatternModal } from './add-note-risk-pattern-modal';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface RiskPatternsProps {
  idDocument?: string;
  documentDetail: BankStatementResponse;
  handleUpdateRiskPattern: (riskPatterns: RiskPattern[]) => Promise<void>;
}

export default function RiskPatterns({ idDocument, documentDetail, handleUpdateRiskPattern }: Readonly<RiskPatternsProps>) {
  const { t } = useLanguage();
  const riskPatterns = documentDetail.analysis?.risk_patterns;
  const [editingPattern, setEditingPattern] = useState<RiskPattern | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [index, setIndex] = useState<number | null>(null);

  const handleEdit = (pattern: RiskPattern, index: number) => {
    setEditingPattern(pattern);
    setIndex(index);
    setIsModalOpen(true);
  };

  const handleSave = async (category: string, rationale: string, reason: string) => {
    // Validate required data
    if (!riskPatterns || riskPatterns.length === 0) {
      return;
    }

    if (index === null || index === undefined || index < 0 || index >= riskPatterns.length) {
      return;
    }

    // Update the risk pattern at the specified index
    const listRiskPatterns = riskPatterns.map((item, indexItem) => {
      return indexItem === index
        ? {
            ...item,
            risk_type: category,
            rationale: rationale,
            reason: reason || undefined,
          }
        : item;
    });

    try {
      await handleUpdateRiskPattern(listRiskPatterns);
      setIsModalOpen(false);
      setEditingPattern(null);
      setIndex(null);
    } catch (error) {
      // Error is already handled in handleUpdateRiskPattern
      // Keep modal open if there's an error
      console.error('Error updating risk pattern:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPattern(null);
    setIndex(null);
  };

  return (
    <div className="mb-6 rounded border border-(--color-filters-border)">
      <div className="m-3 flex items-center">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-red-500" />
          <h2 className="text-[16px] font-medium text-(--color-table-header-text-color)">{t('bankStatement.riskPatterns.title')}</h2>
        </div>
      </div>

      {riskPatterns && Array.isArray(riskPatterns) && riskPatterns.length > 0 && (
        <div className="border-t border-(--color-filters-border)">
          <div className="flex flex-col gap-3 p-4">
            {riskPatterns.map((pattern, index) => {
              const patternKey = pattern?.transaction_id || pattern?.risk_type || `pattern-${index}`;
              return (
                <div
                  key={`risk-pattern-${patternKey}-${index}`}
                  className={`flex flex-col gap-4 rounded border border-(--color-data-sources-audit-analysis-border-color) bg-(--color-data-sources-audit-analysis-background-color) p-4 ${index === riskPatterns.length - 1 ? '' : 'border-b border-(--color-filters-border)'}`}
                >
                  <div className="flex w-full items-start justify-between gap-4">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="font-semibold text-red-500">
                          {pattern?.risk_type ? pattern?.risk_type.replaceAll('_', ' ').toUpperCase() : ''}
                        </span>
                        <span className="text-[#6A7282]">·</span>
                        <span className="text-sm font-bold text-[#6A7282]">{pattern?.transaction_id}</span>
                      </div>
                      <div dangerouslySetInnerHTML={{ __html: pattern.rationale }} className="text-sm text-(--color-sidebar-foreground)" />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(pattern, index)}
                      className="h-8 rounded border border-(--color-data-sources-audit-analysis-border-color) bg-(--color-background-color) px-4 text-(--color-table-header-text-color) hover:bg-(--color-background-color) hover:text-(--color-table-header-text-color)"
                      title={t('bankStatement.riskPatterns.edit')}
                    >
                      <Image src="/assets/icons/edit-icon.svg" alt={t('bankStatement.riskPatterns.edit')} width={12} height={12} />
                      {pattern.reason ? 'Edit Note' : 'Add Note'}
                    </Button>
                  </div>
                  {pattern.reason && (
                    <div>
                      <p className="text-( --color-text-gray) mb-1 text-sm font-medium">Note</p>
                      <div className="rounded border border-(--color-data-sources-audit-analysis-border-color) bg-white px-4 py-2">
                        <p className="text-sm text-(--color-sidebar-foreground)">{pattern.reason}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {editingPattern && (
        <AddNoteRiskPatternModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          riskType={editingPattern.risk_type}
          initialNote={editingPattern.reason || ''}
          onSave={(note) => handleSave(editingPattern.risk_type, editingPattern.rationale, note)}
        />
      )}
    </div>
  );
}
