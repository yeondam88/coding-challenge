import React, { useRef, useEffect, useState } from 'react';
import { useAutocomplete } from '../hooks/useAutocomplete';
import { highlightText } from '../utils/highlightText';
import './AutocompleteInput.css';

interface AutocompleteInputProps {
  placeholder?: string;
  limit?: number;
}

/**
 * Autocomplete input component with suggestions
 */
export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  placeholder = 'Start typing to search...',
  limit = 5,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    inputValue,
    suggestions,
    loading,
    error,
    selectedIndex,
    isOpen,
    setInputValue,
    handleKeyDown,
    handleSelectSuggestion,
    clearSuggestions,
  } = useAutocomplete({ limit });
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        clearSuggestions();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [clearSuggestions]);
  
  return (
    <div ref={containerRef} className="autocomplete-container">
      <div className="input-wrapper">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="autocomplete-input"
          autoComplete="off"
        />
        {inputValue && (
          <button
            type="button"
            onClick={() => setInputValue('')}
            className="clear-button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
      
      {isOpen && (
        <div className="suggestions-container">
          <div className="suggestions-list">
            {loading && (
              <div className="suggestions-message loading">
                <div className="loading-spinner"></div>
                Loading suggestions...
              </div>
            )}
            
            {error && (
              <div className="suggestions-message error">
                Error loading suggestions
              </div>
            )}
            
            {!loading && !error && suggestions.length === 0 && (
              <div className="suggestions-message empty">
                No results found.
              </div>
            )}
            
            {!loading && !error && suggestions.length > 0 && (
              <div className="suggestions-group">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion}-${index}`}
                    className={`suggestion-item ${selectedIndex === index ? 'selected' : ''}`}
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    {highlightText(suggestion, inputValue)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 