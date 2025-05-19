import { useState, useEffect, useCallback, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { fetchSuggestions } from '../services/apiService';

interface UseAutocompleteOptions {
  debounceTime?: number;
  limit?: number;
}

interface UseAutocompleteResult {
  inputValue: string;
  suggestions: string[];
  loading: boolean;
  error: Error | null;
  selectedIndex: number;
  isOpen: boolean;
  setInputValue: (value: string) => void;
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  handleSelectSuggestion: (suggestion: string) => void;
  clearSuggestions: () => void;
}

/**
 * Custom hook for autocomplete functionality
 * @param options - Configuration options
 * @returns Autocomplete state and handlers
 */
export const useAutocomplete = (options: UseAutocompleteOptions = {}): UseAutocompleteResult => {
  const { debounceTime = 300, limit = 5 } = options;
  
  const [inputValue, setInputValue] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Clear the previous timer when the component unmounts
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  // Fetch suggestions with debouncing
  const fetchSuggestionsDebounced = useCallback((query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    if (!query.trim()) {
      setSuggestions([]);
      setLoading(false);
      setIsOpen(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await fetchSuggestions({ query, limit });
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, debounceTime);
  }, [debounceTime, limit]);
  
  // Update suggestions when input value changes
  useEffect(() => {
    fetchSuggestionsDebounced(inputValue);
  }, [inputValue, fetchSuggestionsDebounced]);
  
  // Handle input value change
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    setSelectedIndex(-1);
  }, []);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          setInputValue(suggestions[selectedIndex]);
          console.log('Selected:', suggestions[selectedIndex]);
          setIsOpen(false);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
        
      default:
        break;
    }
  }, [isOpen, selectedIndex, suggestions]);
  
  // Handle suggestion selection
  const handleSelectSuggestion = useCallback((suggestion: string) => {
    setInputValue(suggestion);
    setIsOpen(false);
    console.log('Selected:', suggestion);
  }, []);
  
  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setIsOpen(false);
  }, []);
  
  return {
    inputValue,
    suggestions,
    loading,
    error,
    selectedIndex,
    isOpen,
    setInputValue: handleInputChange,
    handleKeyDown,
    handleSelectSuggestion,
    clearSuggestions,
  };
}; 