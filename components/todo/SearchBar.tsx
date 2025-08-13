// components/todo/SearchBar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ReactSelect } from '../ui/ReactSelect';

interface SearchBarProps {
  value: string;
  onSearch: (value: string) => void;
  onFilterChange: (filters: SearchFilters) => void;
  hideCompletedFilter?: boolean;
  className?: string;
}

interface SearchFilters {
  priority?: 'low' | 'medium' | 'high' | '';
  completed?: boolean | '';
  sortBy?: 'createdAt' | 'dueDate' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export function SearchBar({ value, onSearch, onFilterChange, hideCompletedFilter = false, className = '' }: SearchBarProps) {
  const [searchValue, setSearchValue] = useState(value);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    priority: '',
    completed: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(searchValue);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchValue, onSearch]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearSearch = () => {
    setSearchValue('');
    onSearch('');
  };

  const clearFilters = () => {
    const defaultFilters = {
      priority: '' as const,
      completed: '' as const,
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
  ];

  const statusOptions = [
    { value: '', label: 'All Tasks' },
    { value: 'false', label: 'Pending' },
    { value: 'true', label: 'Completed' },
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
  ];

  const orderOptions = [
    { value: 'desc', label: 'Newest First' },
    { value: 'asc', label: 'Oldest First' },
  ];

  const hasActiveFilters = filters.priority || filters.completed !== '' || filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative ">
        <div className="absolute p-4 left-4 bottom-1/2 -translate-y-1/2 z-10">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search todos..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full ml-4 pl-10 pr-10 py-4 bg-white border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
        />
        {searchValue && (
          <button
            onClick={clearSearch}
            className="absolute p-4 -right-4 bottom-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 shadow-sm"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <ReactSelect
              options={priorityOptions}
              value={filters.priority}
              placeholder="All Priorities"
              onSelect={(value) => handleFilterChange('priority', value)}
              isClearable={true}
              isSearchable={false}
            />
          </div>

          {!hideCompletedFilter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <ReactSelect
                options={statusOptions}
                value={filters.completed?.toString() || ''}
                placeholder="All Tasks"
                onSelect={(value) => handleFilterChange('completed', value === '' ? '' : value === 'true')}
                isClearable={true}
                isSearchable={false}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <ReactSelect
              options={sortOptions}
              value={filters.sortBy}
              onSelect={(value) => handleFilterChange('sortBy', value)}
              isSearchable={false}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Order
            </label>
            <ReactSelect
              options={orderOptions}
              value={filters.sortOrder}
              onSelect={(value) => handleFilterChange('sortOrder', value)}
              isSearchable={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}