'use client';

import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number | null | undefined;
  className?: string;
}

export function ScoreBadge({ score, className }: Readonly<ScoreBadgeProps>) {
  if (score === null || score === undefined) {
    return null;
  }

  const scoreValue = Math.round(score);
  const displayScore = Math.max(scoreValue, 0);

  // Determine color based on score
  let bgColor = '';
  let textColor = '';
  let borderColor = '';

  if (displayScore >= 0) {
    // Green for high scores
    bgColor = 'bg-(--color-status-completed-background)';
    textColor = 'text-(--color-sidebar-primary)';
    borderColor = 'border-(--color-sidebar-primary)';
  } else if (displayScore === 0) {
    bgColor = 'bg-(--color-status-processing-background)';
    textColor = 'text-(--color-status-processing-foreground)';
    borderColor = 'border-(--color-status-processing-border)';
  }

  return (
    <div
      className={cn(
        'flex h-6 min-w-6 items-center justify-center rounded-full border text-xs font-semibold',
        bgColor,
        textColor,
        borderColor,
        className
      )}
    >
      {displayScore}
    </div>
  );
}
