// components/ui/TagInput.tsx
'use client';

import React, { useState, KeyboardEvent } from 'react';
import { X, Tag } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  maxTags?: number;
}

export function TagInput({
  tags,
  onChange,
  placeholder = "Add tags...",
  suggestions = [],
  maxTags = 10
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onChange([...tags, trimmedTag]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    suggestion => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(suggestion.toLowerCase())
  );

  const getTagColor = (tag: string) => {
    const colors = [
      'tag-blue', 'tag-green', 'tag-purple', 'tag-pink', 
      'tag-yellow', 'tag-red', 'tag-indigo', 'tag-orange'
    ];
    const hash = tag.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="tag-input-container">
      <div className="tag-input-wrapper">
        <Tag className="tag-input-icon" />
        
        {/* Display existing tags */}
        <div className="tag-list">
          {tags.map((tag) => (
            <span key={tag} className={`tag ${getTagColor(tag)}`}>
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="tag-remove"
              >
                <X className="tag-icon w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Input field */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(inputValue.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="tag-input-field"
          disabled={tags.length >= maxTags}
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="tag-suggestions">
          {filteredSuggestions.slice(0, 5).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="tag-suggestion"
            >
              <Tag className="w-4 h-4" />
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Tag count indicator */}
      {tags.length > 0 && (
        <div className="tag-count">
          {tags.length}/{maxTags} tags
        </div>
      )}
    </div>
  );
}
