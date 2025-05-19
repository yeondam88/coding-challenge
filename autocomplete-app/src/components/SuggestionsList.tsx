import React from 'react';
import { SuggestionItem } from './SuggestionItem';

interface SuggestionsListProps {
  suggestions: string[];
  query: string;
  selectedIndex: number;
  onSelect: (suggestion: string) => void;
  loading: boolean;
  error: Error | null;
}

/**
 * List of autocomplete suggestions with loading and error states
 */
export const SuggestionsList: React.FC<SuggestionsListProps> = ({
  suggestions,
  query,
  selectedIndex,
  onSelect,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-border overflow-hidden animate-in fade-in">
        <div className="p-3 text-sm text-muted-foreground flex items-center">
          <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin mr-2" />
          Loading suggestions...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-border overflow-hidden animate-in fade-in">
        <div className="p-3 text-sm text-destructive">
          Error loading suggestions
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-border overflow-hidden animate-in fade-in">
      <div className="max-h-60 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <SuggestionItem
            key={`${suggestion}-${index}`}
            suggestion={suggestion}
            query={query}
            isSelected={index === selectedIndex}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}; 