// components/ui/Dropdown.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  onSelect: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function Dropdown({
  options,
  value,
  placeholder = 'Select an option',
  onSelect,
  className = '',
  disabled = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          onSelect(options[highlightedIndex].value);
          setIsOpen(false);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : options.length - 1
          );
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleOptionClick = (optionValue: string) => {
    onSelect(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className={`w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-gray-400 dark:hover:bg-gray-700 dark:hover:border-gray-500'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {selectedOption?.icon}
            <span className={selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
              {selectedOption?.label || placeholder}
            </span>
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto dark:bg-gray-800 dark:border-gray-600">
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${
                highlightedIndex === index ? 'bg-gray-50 dark:bg-gray-700' : ''
              } ${
                value === option.value ? 'bg-blue-50 text-blue-600 dark:bg-gray-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
              } ${
                index === 0 ? 'rounded-t-lg' : ''
              } ${
                index === options.length - 1 ? 'rounded-b-lg' : ''
              }`}
              onClick={() => handleOptionClick(option.value)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="flex items-center space-x-2">
                {option.icon}
                <span>{option.label}</span>
              </div>
              {value === option.value && (
                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}