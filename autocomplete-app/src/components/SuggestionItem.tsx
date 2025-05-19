import React from 'react';
import { highlightText } from '../utils/highlightText';

interface SuggestionItemProps {
  suggestion: string;
  query: string;
  isSelected: boolean;
  onSelect: (suggestion: string) => void;
}

/**
 * Individual suggestion item that can be selected
 */
export const SuggestionItem: React.FC<SuggestionItemProps> = ({
  suggestion,
  query,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      className={`px-3 py-2 cursor-pointer flex items-center text-sm transition-colors ${
        isSelected
          ? 'bg-primary/10 text-primary'
          : 'hover:bg-secondary'
      }`}
      onClick={() => onSelect(suggestion)}
    >
      {highlightText(suggestion, query)}
    </div>
  );
}; 