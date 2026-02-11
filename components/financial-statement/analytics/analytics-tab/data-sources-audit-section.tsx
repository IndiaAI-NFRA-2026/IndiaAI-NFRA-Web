import { useState } from 'react';
import { AnalysisField } from '@/types/documents';
import Image from 'next/image';
import { SectionItem } from './section-item';

interface DataSourcesAuditSectionProps {
  title: string;
  data: Record<string, AnalysisField | undefined>;
  onSave?: (key: string, analysis: string, rationale: string, reason: string) => void;
  isEditable?: boolean;
  isViewReason?: boolean;
  isUploader?: boolean;
}
export function DataSourcesAuditSection({
  title,
  data,
  onSave,
  isEditable = true,
  isViewReason = false,
  isUploader = false,
}: Readonly<DataSourcesAuditSectionProps>) {
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
        <Image src="/assets/icons/expanded-icon.svg" alt="Expand/Collapse" width={11} height={7} />
      </button>
      {isExpanded && (
        <div className="p-6">
          {Object.entries(data)
            .filter((entry): entry is [string, AnalysisField] => {
              const [, value] = entry;
              // Only show items that exist and pass the view reason check
              return !!value && !(isViewReason && !value.reason);
            })
            .map(([key, value], index, visibleArray) => {
              // Check if this is the last visible item
              const isLastItem = index === visibleArray.length - 1;
              return (
                <div key={key} className={isLastItem ? '' : 'mb-4 border-b border-(--color-filters-border) pb-4'}>
                  <SectionItem
                    key={key}
                    fieldKey={key}
                    field={value}
                    titleKey={key}
                    onSave={onSave}
                    isEditable={isEditable}
                    isViewReason={isViewReason}
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
