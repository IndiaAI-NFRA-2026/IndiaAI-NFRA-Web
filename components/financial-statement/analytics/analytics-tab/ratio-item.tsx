import { Info } from 'lucide-react';
import { formatValue, camelToSnake } from '@/lib/utils/helpers';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ratioFormulas } from '@/lib/utils/constants';
import Card from '@/components/card';

export type RatioStatus = 'passed' | 'warning' | 'failed';

export interface FinancialRatio {
  id: string;
  key: string;
  value: string | number;
  status: RatioStatus;
  unit?: string;
}

interface RatioItemProps {
  ratio: FinancialRatio;
  t: (key: string) => string;
  isTooltip?: boolean;
}
export function RatioItem({ ratio, t, isTooltip = false }: Readonly<RatioItemProps>) {
  const formula = ratioFormulas[camelToSnake(ratio.key)] || '';
  return (
    <Card contentStyle="p-4">
      <div className="mb-3 flex justify-between gap-2">
        <h3 className="text-sm font-medium text-(--color-table-header-text-color)">
          {t(`financialStatement.analytics.item.${ratio.key}`)}
        </h3>
        {isTooltip && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="cursor-pointer hover:opacity-70">
                  <Info className="h-4 w-4 text-(--color-upload-content-color)" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[300px]">
                <div className="text-left">
                  <p className="text-sm whitespace-pre-line">{formula}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="mb-3">
        {ratio.value === 'N/A' ? (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-2xl font-bold text-(--color-sidebar-primary)">{formatValue(ratio.value)}</span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[300px]">
                <div className="text-left">
                  <p className="text-sm">{t('financialStatement.analytics.cannotBeCalculated') || 'Cannot be calculated'}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-2xl font-bold text-(--color-sidebar-primary)">
            {formatValue(ratio.value)}
            {ratio.unit && (
              <>
                {ratio.unit === 'day' ? ' ' : ''}
                {ratio.unit === 'day' && Number(ratio.value) > 1 ? `${ratio.unit}s` : ratio.unit}
              </>
            )}
          </span>
        )}
      </div>
    </Card>
  );
}
