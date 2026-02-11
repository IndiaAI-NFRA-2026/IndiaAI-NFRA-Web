import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface SubHeaderProps {
  title: string;
  subTitle: string;
  handleBack: () => void;
  handleAction?: () => void;
  isActionButtonVisible?: boolean;
  titleAction?: string;
  handleSubAction?: () => void;
  isSubActionButtonVisible?: boolean;
  titleSubAction?: string;
  isDisabledActionButton?: boolean;
  isUploadHistory?: boolean;
  isLoadingActionButton?: boolean;
}

export function SubHeader({
  title,
  subTitle,
  handleBack,
  isActionButtonVisible = true,
  titleAction,
  handleAction,
  handleSubAction,
  isSubActionButtonVisible = false,
  titleSubAction,
  isDisabledActionButton = false,
  isUploadHistory = false,
  isLoadingActionButton = false,
}: Readonly<SubHeaderProps>) {
  return (
    <div className="mb-6 flex flex-row items-center justify-between gap-4">
      <div className="flex min-w-0 flex-1 flex-row items-center gap-4">
        <button
          onClick={handleBack}
          className="flex shrink-0 cursor-pointer items-center gap-2 text-sm text-(--color-sidebar-foreground) hover:text-(--color-sidebar-foreground)"
        >
          <ArrowLeft className="text-upload-content-color h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h5 className="line-clamp-2 text-base leading-6 font-bold tracking-normal wrap-break-word">{title}</h5>
          <span
            className={`text-upload-content-color line-clamp-2 text-sm leading-5.5 wrap-break-word ${isUploadHistory ? 'font-bold' : 'font-normal'}`}
          >
            {subTitle}
          </span>
        </div>
      </div>
      <div className="flex flex-row items-center gap-2">
        {isSubActionButtonVisible && (
          <Button
            variant="outline"
            className="hover:bg-background-color/90 cursor-pointer rounded bg-(--color-background-color) px-[15px] py-[4px] leading-5.5 font-normal text-(--color-sidebar-foreground) hover:text-(--color-sidebar-foreground) disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleSubAction}
          >
            {titleSubAction}
          </Button>
        )}
        {isActionButtonVisible && (
          <Button
            variant="outline"
            disabled={isDisabledActionButton || isLoadingActionButton}
            className="hover:bg-button-background/90 cursor-pointer rounded bg-(--color-button-background) px-[15px] py-[4px] leading-5.5 font-normal text-(--color-button-foreground) hover:text-(--color-button-foreground) disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleAction}
          >
            {isLoadingActionButton ? (
              <div className="flex items-center gap-2">
                <Spinner className="size-4 animate-spin" />
                {titleAction}
              </div>
            ) : (
              titleAction
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
