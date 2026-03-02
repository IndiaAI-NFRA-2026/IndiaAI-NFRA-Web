'use client';

import * as React from 'react';
import { Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DatePickerProps extends React.ComponentProps<'input'> {
  placeholder?: string;
  onDateChange?: (date: string) => void;
  isClearable?: boolean;
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, placeholder, onDateChange, onChange, value, isClearable, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [selectedDate, setSelectedDate] = React.useState<string>((value as string) || '');
    const [showPlaceholder, setShowPlaceholder] = React.useState<boolean>(!value);

    // Merge refs
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    React.useEffect(() => {
      if (value) {
        setSelectedDate(value as string);
        setShowPlaceholder(false);
      } else {
        setSelectedDate('');
        setShowPlaceholder(true);
      }
    }, [value]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSelectedDate(value);
      setShowPlaceholder(!value);
      if (onChange) {
        onChange(e);
      }
      if (onDateChange) {
        onDateChange(value);
      }
    };

    const handleCalendarClick = () => {
      inputRef.current?.showPicker?.();
      inputRef.current?.focus();
    };

    const handleInputClick = () => {
      if (!selectedDate && inputRef.current) {
        inputRef.current.showPicker?.();
      }
    };

    return (
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="date"
          value={selectedDate}
          className={cn(
            'ring-offset-background flex h-[37px] w-full rounded border border-[#0000000F] bg-(--color-background-color) px-2 pr-10 text-sm transition-all duration-200 select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:hidden',
            !selectedDate && 'appearance-none [&::-webkit-datetime-edit]:opacity-0',
            className
          )}
          onChange={handleDateChange}
          onClick={handleInputClick}
          {...props}
        />
        {showPlaceholder && !selectedDate && placeholder && (
          <div className="text-muted-foreground/60 pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm">{placeholder}</div>
        )}
        {isClearable && selectedDate && (
          <button
            type="button"
            onClick={() => handleDateChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)}
            className="text-muted-foreground/60 hover:text-muted-foreground absolute top-1/2 right-10 z-10 -translate-y-1/2 cursor-pointer transition-colors duration-200"
            tabIndex={-1}
            aria-label="Clear date"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={handleCalendarClick}
          className="text-muted-foreground/60 hover:text-muted-foreground absolute top-1/2 right-3 z-10 -translate-y-1/2 cursor-pointer transition-colors duration-200"
          tabIndex={-1}
          aria-label="Open calendar"
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>
    );
  }
);
DatePicker.displayName = 'DatePicker';

export { DatePicker };
