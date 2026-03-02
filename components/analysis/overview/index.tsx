'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { formatTitle, formatDate, getTagSeverity } from '@/lib/utils/helpers';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { InfoIcon, PencilLineIcon } from 'lucide-react';
import { Button } from '@/components/button';
import { Modal } from '@/components/modal';
import { Textarea } from '@/components/ui/textarea';
import { useMe } from '@/lib/query/use-auth';
import Card from '@/components/card';
import Tag from '@/components/tag';

const isPlainObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

export type Note = {
  user_name: string;
  user_id: string;
  note: string;
  created_at: string;
};

interface AnalysisFieldShape {
  analysis?: string;
  rationale?: string;
  'Final Result'?: string;
  note?: Note;
}

interface AnalysisOverviewProps {
  analysisData: object;
  onAddNote?: (newData: object) => void;
  setSummaryResult?: (summaryResult: { finalResult: string; rationale: string }) => void;
}

const noteKey = (sectionKey: string, subKey: string) => `${sectionKey}.${subKey}`;

const AnalysisOverview = ({ analysisData, onAddNote, setSummaryResult }: AnalysisOverviewProps) => {
  const { t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<{ sectionKey: string; subKey: string; isEdit: boolean } | null>(null);
  const [note, setNote] = useState('');
  const [localNotes, setLocalNotes] = useState<Record<string, Note>>({});
  const { data: user } = useMe();
  const objectEntries = Object.entries(analysisData).filter(([, v]) => isPlainObject(v)) as [string, Record<string, unknown>][];

  const data = analysisData as Record<string, unknown>;
  const summaryResult = (data?.['final_conclusion_and_recommendation'] as Record<string, unknown> | undefined)?.[
    'overall_analysis_result'
  ] as {
    'Final Result': string;
    rationale: string;
  };
  useEffect(() => {
    if (summaryResult) {
      setSummaryResult?.({ finalResult: summaryResult['Final Result'] as string, rationale: summaryResult.rationale as string });
    }
  }, [summaryResult, setSummaryResult]);

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionKey]: !(prev[sectionKey] ?? true) }));
  };

  const openNoteModal = (sectionKey: string, subKey: string, existingNote?: Note) => {
    setSelectedSection({ sectionKey, subKey, isEdit: !!existingNote });
    setNote(existingNote?.note ?? '');
    setIsModalOpen(true);
  };

  const closeNoteModal = () => {
    setIsModalOpen(false);
    setSelectedSection(null);
    setNote('');
  };

  const handleAddNote = () => {
    if (!selectedSection || !user?.full_name || !user?.id) return;
    const addedNote: Note = {
      user_name: user.full_name,
      user_id: user.id,
      note,
      created_at: new Date().toISOString(),
    };

    const key = noteKey(selectedSection.sectionKey, selectedSection.subKey);
    const nextLocalNotes = { ...localNotes, [key]: addedNote };
    setLocalNotes(nextLocalNotes);

    const data = { ...(analysisData as Record<string, Record<string, unknown>>) };
    for (const [k, noteValue] of Object.entries(nextLocalNotes)) {
      const [sk, ssk] = k.split('.');
      const section = (data[sk] ?? {}) as Record<string, unknown>;
      const subField = (section[ssk] ?? {}) as Record<string, unknown>;
      data[sk] = { ...section, [ssk]: { ...subField, note: noteValue } };
    }

    onAddNote?.(data);
    closeNoteModal();
  };

  if (Object.keys(analysisData).length === 0) {
    return <></>;
  }

  return (
    <Card contentStyle="p-6">
      <div className="space-y-6">
        {objectEntries.map(([sectionKey, sectionValue]) => {
          const data: Record<string, AnalysisFieldShape> = {};
          for (const [subKey, subVal] of Object.entries(sectionValue)) {
            if (!isPlainObject(subVal)) continue;
            const s = subVal as Record<string, unknown>;
            const mergedNote = (localNotes[noteKey(sectionKey, subKey)] ?? s.note) as Note | undefined;
            data[subKey] = {
              analysis: String(s.Analysis ?? s.analysis ?? ''),
              rationale: String(s.rationale ?? ''),
              ...(s['Final Result'] != null && { 'Final Result': String(s['Final Result']) }),
              ...(mergedNote != null && { note: mergedNote }),
            };
          }

          const entries = Object.entries(data);
          const isExpanded = expandedSections[sectionKey] ?? true;

          return (
            <div key={sectionKey} className="rounded border border-(--color-filters-border) bg-(--color-background-color)">
              <button
                type="button"
                onClick={() => toggleSection(sectionKey)}
                className="flex w-full cursor-pointer items-center justify-between border-b border-(--color-filters-border) px-6 py-4"
              >
                <h2 className="text-base font-bold text-(--color-table-header-text-color)">{formatTitle(sectionKey)}</h2>
                <Image
                  src="/assets/icons/expanded-icon.svg"
                  alt="Expand/Collapse"
                  width={11}
                  height={7}
                  className={isExpanded ? '' : 'rotate-180'}
                />
              </button>

              {isExpanded && (
                <div className="p-6">
                  {entries.map(([subKey, field], index) => {
                    const isLastItem = index === entries.length - 1;
                    const analysisValue = field.analysis || field['Final Result'] || '';
                    const isFinalResult = subKey === 'overall_analysis_result' || 'Final Result' in field;

                    return (
                      <div key={subKey} className={isLastItem ? '' : 'mb-4 border-b border-(--color-filters-border)'}>
                        <div className="bg-(--color-background-color)">
                          <div className="flex items-center justify-between px-1">
                            <h3 className="text-sm font-bold text-(--color-table-header-text-color)">{formatTitle(subKey)}</h3>
                            <Button
                              type="outline"
                              title={field.note ? t('analysis.editNote') : t('common.addNote')}
                              onClick={() => openNoteModal(sectionKey, subKey, field.note)}
                              icon={<PencilLineIcon className="size-4" />}
                            />
                          </div>
                          <div className="space-y-4 py-6">
                            {/* Analysis or Final Result */}
                            <div className="space-y-2 rounded border border-(--color-data-sources-audit-analysis-border-color) bg-(--color-data-sources-audit-analysis-background-color) p-4">
                              <label className="text-sm font-semibold text-(--color-data-sources-audit-analysis-text-color)">
                                {isFinalResult
                                  ? t('financialStatement.analytics.finalResult') || 'Final Result'
                                  : t('financialStatement.analytics.analysis') || 'Analysis'}
                              </label>
                              <div
                                className="prose prose-sm max-w-none text-sm leading-relaxed text-(--color-data-sources-audit-analysis-text-color) [&_li]:mb-1 [&_li_p]:mb-0 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-1 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-1"
                                dangerouslySetInnerHTML={{
                                  __html: analysisValue || 'No analysis provided',
                                }}
                              />
                            </div>

                            {/* Rationale */}
                            <div className="space-y-2 rounded border border-(--color-data-sources-audit-rationale-border-color) bg-(--color-data-sources-audit-rationale-background-color) p-4">
                              <label className="mb-1 text-sm font-semibold text-(--color-data-sources-audit-rationale-text-color)">
                                {t('financialStatement.analytics.rationale') || 'Rationale'}
                              </label>
                              <div
                                className="prose prose-sm max-w-none text-sm leading-relaxed text-(--color-data-sources-audit-rationale-text-color) [&_li]:mb-1 [&_li_p]:mb-0 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-1 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-1"
                                dangerouslySetInnerHTML={{
                                  __html: field.rationale || 'No rationale provided',
                                }}
                              />
                            </div>
                          </div>
                          {field?.note && (
                            <div className="pb-4">
                              <p className="mb-2 text-sm font-bold text-(--color-table-header-text-color)">{t('analysis.note')}</p>
                              <div className="rounded-[4px] border border-(--color-filters-border) bg-white p-4">
                                <p className="mb-2 text-sm font-bold text-(--color-table-header-text-color)">
                                  {field?.note?.user_name ?? ''}
                                  <span className="mx-1.5 font-normal text-(--color-table-no-data-icon)">•</span>
                                  <span className="text-[12px] font-medium text-[#8e8e8e]">
                                    {formatDate(field?.note?.created_at ?? '')}
                                  </span>
                                </p>
                                <p className="text-[14px] leading-[22px] text-(--color-table-header-text-color)">{field.note.note}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="flex items-center gap-2 px-6">
          <InfoIcon className="size-4" />
          <span className="text-[14px]">{t('common.clearSightDisclaimer')}</span>
        </div>

        <Modal
          onConfirm={handleAddNote}
          onClose={closeNoteModal}
          isOpen={isModalOpen}
          title={
            selectedSection
              ? `${selectedSection.isEdit ? t('analysis.editNote') : t('common.addNote')} - ${formatTitle(selectedSection.subKey)}`
              : t('analysis.note')
          }
          confirmButtonText={t('button.save')}
          renderDescription={() => (
            <div className="px-6 py-1">
              <div className="mb-2">
                <label className="mb-2 block text-sm font-medium text-(--color-table-header-text-color)">
                  {t('analysis.addNoteLabel')}
                </label>
              </div>
              {}
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('analysis.addNotePlaceholder')} />
            </div>
          )}
        />
      </div>
    </Card>
  );
};

export default AnalysisOverview;
