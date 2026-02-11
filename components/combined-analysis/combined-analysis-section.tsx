'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CombinedAnalysisSectionItem } from './combined-analysis-section-item';

interface CombinedAnalysisField {
  analysis?: string;
  rationale?: string;
  'Final Result'?: string;
}

interface CombinedAnalysisSectionProps {
  title: string;
  data: Record<string, CombinedAnalysisField>;
  onSave?: (key: string, analysis: string, rationale: string, reason: string) => void;
  isEditable?: boolean;
  isUploader?: boolean;
}

export function CombinedAnalysisSection({
  title,
  data,
  onSave,
  isEditable = true,
  isUploader = false,
}: Readonly<CombinedAnalysisSectionProps>) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="rounded border border-(--color-filters-border) bg-(--color-background-color)">
      <button
        onClick={toggleExpanded}
        className="flex w-full cursor-pointer items-center justify-between border-b border-(--color-filters-border) px-6 py-4"
      >
        <h2 className="text-base font-bold text-(--color-table-header-text-color)">{title}</h2>
        <Image
          src="/assets/icons/expanded-icon.svg"
          alt="Expand/Collapse"
          width={11}
          height={7}
          className={`${isExpanded ? '' : 'rotate-180'}`}
        />
      </button>
      {isExpanded && (
        <div className="p-6">
          {Object.entries(data)
            .filter((entry): entry is [string, CombinedAnalysisField] => {
              const [, value] = entry;
              return !!value;
            })
            .map(([key, value], index, visibleArray) => {
              // Check if this is the last visible item
              const isLastItem = index === visibleArray.length - 1;
              return (
                <div key={key} className={isLastItem ? '' : 'mb-4 border-b border-(--color-filters-border) pb-4'}>
                  <CombinedAnalysisSectionItem
                    key={key}
                    fieldKey={key}
                    field={value}
                    titleKey={key}
                    onSave={onSave}
                    isEditable={isEditable}
                    isUploader={isUploader}
                  />
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
