// components/ui/ReactSelect.tsx
'use client';

import React from 'react';
import Select, { StylesConfig, components, ControlProps, OptionProps } from 'react-select';
import { useTheme } from 'next-themes';

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface ReactSelectProps {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  onSelect: (value: string) => void;
  className?: string;
  disabled?: boolean;
  isMulti?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
}

// Custom components to include icons
const Option = (props: OptionProps<SelectOption, boolean>) => {
  return (
    <components.Option {...props}>
      <div className="flex items-center space-x-2">
        {props.data.icon && <span className="flex-shrink-0">{props.data.icon}</span>}
        <span>{props.data.label}</span>
      </div>
    </components.Option>
  );
};

const Control = ({ children, ...props }: ControlProps<SelectOption, boolean>) => {
  const selectedOption = props.getValue()[0];
  
  return (
    <components.Control {...props}>
      <div className="flex items-center space-x-2 px-1">
        {selectedOption?.icon && (
          <span className="flex-shrink-0 ml-1">{selectedOption.icon}</span>
        )}
        {children}
      </div>
    </components.Control>
  );
};

export function ReactSelect({
  options,
  value,
  placeholder = 'Select an option',
  onSelect,
  className = '',
  disabled = false,
  isMulti = false,
  isClearable = false,
  isSearchable = true,
}: ReactSelectProps) {
  const { theme, resolvedTheme } = useTheme();
  
  // Use resolvedTheme for more reliable theme detection
  const isDark = resolvedTheme === 'dark' || theme === 'dark';
  
  const selectedOption = options.find(option => option.value === value) || null;

  const customStyles: StylesConfig<SelectOption, boolean> = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderColor: isDark ? '#4b5563' : '#d1d5db',
      color: isDark ? '#ffffff !important' : '#111827 !important',
      minHeight: '42px',
      boxShadow: state.isFocused 
        ? '0 0 0 2px rgb(59 130 246 / 0.5)'
        : 'none',
      borderRadius: '8px',
      position: 'relative',
      zIndex: 1,
      '&:hover': {
        borderColor: isDark ? '#6b7280' : '#9ca3af',
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
      },
      transition: 'all 0.2s ease',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      backdropFilter: 'blur(8px)',
      border: isDark ? '1px solid #4b5563' : '1px solid #d1d5db',
      borderRadius: '8px',
      boxShadow: isDark 
        ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)' 
        : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      zIndex: 9999,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? isDark ? '#2563eb' : '#dbeafe'
        : state.isFocused
        ? isDark ? '#1e40af' : '#f3f4f6'
        : 'transparent',
      color: state.isSelected
        ? isDark ? '#ffffff !important' : '#2563eb !important'
        : isDark ? '#ffffff !important' : '#111827 !important',
      cursor: 'pointer',
      padding: '8px 12px',
      '&:hover': {
        backgroundColor: isDark ? '#1e40af' : '#f3f4f6',
        color: isDark ? '#ffffff !important' : '#111827 !important',
      },
      transition: 'all 0.15s ease',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: isDark ? '#9ca3af !important' : '#6b7280 !important',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: isDark ? '#ffffff !important' : '#111827 !important',
    }),
    input: (provided) => ({
      ...provided,
      color: isDark ? '#ffffff !important' : '#111827 !important',
      '&::after': {
        display: 'none !important',
      },
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: isDark ? '#4b5563' : '#d1d5db',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: isDark ? '#9ca3af' : '#6b7280',
      '&:hover': {
        color: isDark ? '#d1d5db' : '#374151',
      },
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: isDark ? '#9ca3af' : '#6b7280',
      '&:hover': {
        color: isDark ? '#f87171' : '#ef4444',
      },
    }),
  };

  return (
    <div className={`react-select-container ${className}`}>
      <Select
        options={options}
        value={selectedOption}
        onChange={(selectedOption) => {
          if (selectedOption && !Array.isArray(selectedOption) && 'value' in selectedOption) {
            onSelect(selectedOption.value);
          }
        }}
        placeholder={placeholder}
        isDisabled={disabled}
        isMulti={isMulti}
        isClearable={isClearable}
        isSearchable={isSearchable}
        styles={customStyles}
        components={{ Option, Control }}
        classNamePrefix="react-select"
        theme={(selectTheme) => ({
          ...selectTheme,
          colors: {
            ...selectTheme.colors,
            primary: isDark ? '#60a5fa' : '#2563eb',
            primary75: isDark ? '#3b82f6' : '#1d4ed8',
            primary50: isDark ? '#1e40af' : '#93c5fd',
            primary25: isDark ? '#1e3a8a' : '#dbeafe',
          },
        })}
      />
    </div>
  );
}
