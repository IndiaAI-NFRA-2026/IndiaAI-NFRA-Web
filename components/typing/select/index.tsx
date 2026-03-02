'use client';
import { useId } from 'react';
import Select, { CSSObjectWithLabel, StylesConfig, ControlProps, OptionProps, GroupBase, MenuPlacement } from 'react-select';

interface Option {
  label: string;
  value: string;
  menuPlacement?: MenuPlacement;
}

interface SelectComponentProps {
  options?: Option[];
  instanceId?: string;
  disabled?: boolean;
  defaultValue?: Option;
  [key: string]: any;
  menuPlacement?: MenuPlacement;
  isSearchable?: boolean;
  isClearable?: boolean;
  menuPortalTarget?: HTMLElement | null;
}

const SelectComponent = ({
  options = [],
  instanceId,
  disabled,
  defaultValue,
  menuPlacement = 'bottom',
  isSearchable = false,
  isClearable = true,
  onValueChange,
  value,
  menuPortalTarget: menuPortalTargetProp = null,
  ...props
}: SelectComponentProps) => {
  const id = useId();
  const selectInstanceId = instanceId || `react-select-${id}`;

  const optionValue =
    value == null || value === ''
      ? null
      : typeof value === 'string'
        ? (options.find((o) => o.value === value) ?? { label: value, value })
        : value;
  const style: StylesConfig<Option, false, GroupBase<Option>> = {
    control: (base: CSSObjectWithLabel, state: ControlProps<Option, false, GroupBase<Option>>) => ({
      ...base,
      fontSize: '14px',
      borderColor: '#0000000F',
      ...(state.isFocused && {
        borderColor: '#0000000F',
        boxShadow: 'none',
      }),
      '&:hover': {
        borderColor: '#0000000F',
      },
      borderRadius: '4px',
      padding: '0',
      minHeight: '37px',
      minWidth: '150px',
      userSelect: 'none',
    }),
    valueContainer: (base) => ({
      ...base,
      overflow: 'hidden',
    }),
    input: (base) => ({
      ...base,
      color: 'black',
      fontWeight: '400',
      input: {
        '&:focus': {
          outline: 'none',
          outlineOffset: '0px !important',
          '--tw-ring-color': 'transparent',
        },
      },
      cursor: 'text',
    }),
    placeholder: (base: CSSObjectWithLabel) => ({
      ...base,
      fontSize: '13px',
      fontWeight: '400',
      color: 'rgb(156 163 175)',
    }),
    singleValue: (base: CSSObjectWithLabel) => ({
      ...base,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontWeight: '400',
    }),
    menu: (base: CSSObjectWithLabel) => ({
      ...base,
      borderRadius: '4px',
      padding: '0px',
      boxShadow: '0 2px 8px 0 rgba(0,0,0,0.15)',
      zIndex: 999,
    }),
    menuList: (base: CSSObjectWithLabel) => ({
      ...base,
      scrollbarWidth: 'thin',
    }),
    option: (base: CSSObjectWithLabel, state: OptionProps<Option, false, GroupBase<Option>>) => ({
      ...base,
      cursor: state.isSelected ? 'default' : 'pointer',
      backgroundColor: state.isSelected ? '#d4e6fb' : 'white',
      color: '#4f4f4f',
      opacity: state.isDisabled ? '0.5' : '1',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      overflowWrap: 'break-word',
      fontWeight: '400',
      fontSize: '14px',
      '&:hover': {
        backgroundColor: state.isSelected ? '#d4e6fb' : '#e1edf9',
      },
    }),
    indicatorsContainer: (base: CSSObjectWithLabel) => ({
      ...base,
      cursor: 'pointer',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    menuPortal: (base: CSSObjectWithLabel) => ({
      ...base,
      zIndex: 1050,
    }),
    noOptionsMessage: (base: CSSObjectWithLabel) => ({
      ...base,
      fontSize: '13px',
    }),
    multiValue: (styles) => ({
      ...styles,
      color: '#2e78b8',
      display: 'flex',
      flexDirection: 'row-reverse',
      backgroundColor: '#ebf7fc',
      border: 1,
      borderStyle: 'solid',
      borderColor: '#cccc',
    }),
    multiValueRemove: (styles) => ({
      ...styles,
      borderRight: 1,
      borderColor: '#cccc',
      borderStyle: 'solid',
    }),
  };

  return (
    <Select
      instanceId={selectInstanceId}
      styles={style}
      defaultValue={defaultValue}
      value={optionValue}
      options={options}
      onChange={(option) => onValueChange?.(option?.value ?? '')}
      isClearable={isClearable}
      {...props}
      placeholder={props.placeholder ?? ''}
      isDisabled={disabled}
      menuPlacement={menuPlacement}
      isSearchable={isSearchable}
      menuPortalTarget={
        menuPortalTargetProp === null ? undefined : (menuPortalTargetProp ?? (typeof document !== 'undefined' ? document.body : undefined))
      }
    />
  );
};

export default SelectComponent;
