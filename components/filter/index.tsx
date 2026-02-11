'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FilterIcon, SlidersHorizontal } from 'lucide-react';
import { BaseOption } from '../hook/use-options';
import { cn } from '@/lib/utils';
import Select from '../typing/select';
import { DatePicker } from '../typing/date';
import { Input } from '../typing/input';
import { Button, ButtonProps } from '../button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface FilterProps {
  search?: {
    label?: string;
    name: string;
    placeholder: string;
    value?: string;
    className?: string;
  };
  actions?: ButtonProps[];
  selects?: SelectProps[];
  onFilterChange: (props: OnFilterChangeProps) => void;
  className?: string;
}

interface OnFilterChangeProps {
  name: string;
  value: string;
}

export enum SELECT_TYPE {
  SELECT = 'select',
  DATE = 'date',
}

interface SelectProps {
  type: SELECT_TYPE;
  name: string;
  label?: string;
  className?: string;
  placeholder: string;
  options?: BaseOption[];
  defaultValue?: string;
  value?: string;
  isClearable?: boolean;
}

export function Filter({ search, selects, actions, onFilterChange, className }: Readonly<FilterProps>) {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState(search?.value || '');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync search value with prop
  useEffect(() => {
    if (search?.value !== undefined && search?.value !== searchValue) {
      setSearchValue(search.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleSearchChange = (value: string) => {
    const trimmedLeading = value.replace(/^\s+/, '');
    setSearchValue(trimmedLeading);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced call
    debounceTimerRef.current = setTimeout(() => {
      const trimmedValue = trimmedLeading.trim();
      onFilterChange({ name: 'search', value: trimmedValue });
    }, 500);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const hasSelects = selects && selects.length > 0;
  const hasMobileMenu = hasSelects || search || (actions && actions.length > 0);

  const renderSelects = (stacked?: boolean) =>
    hasSelects &&
    selects!.map((select) => (
      <div key={select.name} className={cn('min-w-0', stacked ? 'w-full' : 'flex-1', 'max-md:w-full!', select.className)}>
        {select.label && <p className="font-roboto mb-1 text-sm leading-6 font-normal tracking-normal">{select.label}</p>}
        {select.type === SELECT_TYPE.SELECT && (
          <Select
            onValueChange={(value: string) => onFilterChange({ name: select.name, value })}
            value={select.value}
            defaultValue={select.defaultValue ? { label: select.defaultValue, value: select.defaultValue } : undefined}
            placeholder={select.placeholder}
            className={cn('max-md:w-full!', select.className)}
            options={select.options}
            isClearable={select.isClearable}
          />
        )}
        {select.type === SELECT_TYPE.DATE && (
          <DatePicker
            placeholder={select.placeholder}
            value={select.value}
            onDateChange={(value) => onFilterChange({ name: select.name, value })}
            className={cn('max-md:w-full!', select.className)}
            isClearable={select.isClearable}
          />
        )}
      </div>
    ));

  const renderSearch = () =>
    search && (
      <div className="w-full">
        {search.label && <p className="font-roboto mb-1 text-sm leading-6 font-normal tracking-normal">{search.label}</p>}
        <Input
          placeholder={search.placeholder}
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className={cn('w-full min-w-0', search.className)}
          icon={<img src="/assets/icons/search-icon.svg" alt="search" />}
        />
      </div>
    );

  const renderActions = () =>
    actions &&
    actions.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <Button key={index} {...action} />
        ))}
      </div>
    );

  return (
    <div className={cn('flex justify-between', className)}>
      <div className="col-span-12 hidden flex-row items-center gap-[5px] md:col-span-6 md:flex">{renderSelects()}</div>
      <div className="hidden md:block">
        {search && (
          <div className={hasSelects ? 'col-span-12 md:col-span-6' : 'col-span-12'}>
            {search.label && <p className="font-roboto mb-1 text-sm leading-6 font-normal tracking-normal">{search.label}</p>}
            <Input
              placeholder={search.placeholder}
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={cn('max-md:w-full! min-w-[200px]', search.className)}
              icon={<img src="/assets/icons/search-icon.svg" alt="search" />}
            />
          </div>
        )}
        {actions && (
          <div className="col-span-12">
            {actions.map((action, index) => (
              <Button key={index} {...action} />
            ))}
          </div>
        )}
      </div>

      {hasMobileMenu && (
        <div className="flex w-full justify-between items-center gap-2 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="outline"
                className="shrink-0"
                aria-label="Open filters"
                icon={<SlidersHorizontal className="h-4 w-4" />}
                onClick={() => {}}
              />
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-4 max-sm:w-full sm:w-[85vw]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <FilterIcon className="h-4 w-4" /> {t('common.filters')}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-2 flex flex-1 flex-col gap-4 overflow-y-auto">
                {renderSearch()}
                {renderSelects(true)}
              </div>
            </SheetContent>
          </Sheet>
          {renderActions()}
        </div>
      )}
    </div>
  );
}
