import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SuggestionsList } from './SuggestionsList';
import { SuggestionItem as SuggestionItemActual } from './SuggestionItem'; // Import the actual component
import '@testing-library/jest-dom';

// Mock SuggestionItem to simplify testing of SuggestionsList
vi.mock('./SuggestionItem', () => ({
  // Note: The key here must match the exported name from the module
  SuggestionItem: vi.fn(({ suggestion, onSelect, isSelected, query }) => (
    <div 
      data-testid={`suggestion-item-${suggestion}`}
      data-selected={isSelected}
      data-query={query}
      onClick={() => onSelect(suggestion)}
    >
      {suggestion} 
    </div>
  )),
}));

// After the mock setup, cast the imported component to a mock function type
const SuggestionItemMock = vi.mocked(SuggestionItemActual);

describe('SuggestionsList component', () => {
  const mockSuggestions = ['Apple', 'Banana', 'Cherry'];
  const mockQuery = 'A';
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    SuggestionItemMock.mockClear(); // Also clear the mock component itself
  });

  it('should render loading state correctly', () => {
    render(
      <SuggestionsList
        suggestions={[]}
        query={mockQuery}
        selectedIndex={-1}
        onSelect={mockOnSelect}
        loading={true}
        error={null}
      />
    );
    expect(screen.getByText(/Loading suggestions.../i)).toBeInTheDocument();
    // Check that an animated spinner element is present by its class
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render error state correctly', () => {
    render(
      <SuggestionsList
        suggestions={[]}
        query={mockQuery}
        selectedIndex={-1}
        onSelect={mockOnSelect}
        loading={false}
        error={new Error('Test error')}
      />
    );
    expect(screen.getByText(/Error loading suggestions/i)).toBeInTheDocument();
  });

  it('should render null if no suggestions, not loading, and no error (as per component logic)', () => {
    const { container } = render(
      <SuggestionsList
        suggestions={[]}
        query={mockQuery}
        selectedIndex={-1}
        onSelect={mockOnSelect}
        loading={false}
        error={null}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render suggestion items when suggestions are provided', () => {
    render(
      <SuggestionsList
        suggestions={mockSuggestions}
        query={mockQuery}
        selectedIndex={-1}
        onSelect={mockOnSelect}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByTestId('suggestion-item-Apple')).toBeInTheDocument();
    expect(screen.getByTestId('suggestion-item-Banana')).toBeInTheDocument();
    expect(screen.getByTestId('suggestion-item-Cherry')).toBeInTheDocument();
    
    expect(SuggestionItemMock).toHaveBeenCalledTimes(mockSuggestions.length);
  });

  it('should pass correct props to SuggestionItem, including isSelected', () => {
    const selectedIndex = 1;
    render(
      <SuggestionsList
        suggestions={mockSuggestions}
        query={mockQuery}
        selectedIndex={selectedIndex} 
        onSelect={mockOnSelect}
        loading={false}
        error={null}
      />
    );
    
    expect(SuggestionItemMock).toHaveBeenNthCalledWith(1, 
      expect.objectContaining({
        suggestion: 'Apple',
        query: mockQuery,
        isSelected: false,
        onSelect: mockOnSelect,
      }),
      undefined
    );
    expect(SuggestionItemMock).toHaveBeenNthCalledWith(2, 
      expect.objectContaining({
        suggestion: 'Banana',
        query: mockQuery,
        isSelected: true,
        onSelect: mockOnSelect,
      }),
      undefined
    );
    expect(SuggestionItemMock).toHaveBeenNthCalledWith(3, 
      expect.objectContaining({
        suggestion: 'Cherry',
        query: mockQuery,
        isSelected: false,
        onSelect: mockOnSelect,
      }),
      undefined
    );
  });
}); 