'use client';

import { useLanguage } from '@/lib/i18n/useLanguage';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface AIRecommendationData {
  level: 'Weak' | 'Medium' | 'Strong';
  conditions: string;
  rationale: string;
  failedRatiosAnalysis: string;
  positiveIndicators: string;
}

interface AIRecommendationProps {
  data: AIRecommendationData;
}

function LevelBadge({ level }: Readonly<{ level: string }>) {
  let className = '';

  switch (level) {
    case 'Weak':
      className =
        'border-(--color-decision-weak-border-color) bg-(--color-decision-weak-background-color) text-(--color-decision-weak-text-color)';
      break;
    case 'Medium':
      className =
        'border-(--color-decision-medium-border-color) bg-(--color-decision-medium-background-color) text-(--color-decision-medium-text-color)';
      break;
    case 'Strong':
      className =
        'border-(--color-decision-strong-border-color) bg-(--color-decision-strong-background-color) text-(--color-decision-strong-text-color)';
      break;
    default:
      className =
        'border-(--color-decision-not-recommended-border-color) bg-(--color-decision-not-recommended-background-color) text-(--color-decision-not-recommended-text-color)';
  }

  return (
    <Badge variant="outline" className={cn('rounded px-3 py-1 text-sm font-semibold', className)}>
      {level}
    </Badge>
  );
}

export function AIRecommendation({ data }: Readonly<AIRecommendationProps>) {
  const { t } = useLanguage();

  return (
    <div className="flex w-full flex-col rounded border border-(--color-status-approved-foreground) bg-(--color-background-color) md:w-1/2">
      <div className="flex items-center justify-between border-b border-(--color-filters-border) px-6 py-4">
        <h3 className="text-base leading-6 font-bold">{t('decisionReview.detail.aiRecommendation')}</h3>
      </div>
      <div className="space-y-4 p-6">
        <LevelBadge level={data.level} />
        <div className="rounded bg-(--color-muted) p-4">
          {/* Conditions */}
          <div className="mb-4">
            <h4 className="text-table-header-text-color text-sm leading-5 font-bold">{t('decisionReview.detail.conditions')}:</h4>
            <p className="text-sm leading-6 text-(--color-text-gray)">{data.conditions}</p>
          </div>
          {/* Rationale */}
          <div>
            <h4 className="text-table-header-text-color text-sm leading-5 font-bold">{t('decisionReview.detail.rationale')}:</h4>
            <p className="text-sm leading-6 text-(--color-text-gray)">{data.rationale}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
