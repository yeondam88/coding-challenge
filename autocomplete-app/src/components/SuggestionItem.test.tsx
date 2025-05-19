import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SuggestionItem } from './SuggestionItem';
import { highlightText } from '../utils/highlightText';
import '@testing-library/jest-dom';

// Mock the highlightText utility
vi.mock('../utils/highlightText', () => ({
  highlightText: vi.fn((text, _query) => text), // Simple mock that returns the text
}));

describe('SuggestionItem component', () => {
  const mockSuggestion = 'Apple Pie';
  const mockQuery = 'App';
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test
  });

  it('should render the suggestion text and call highlightText', () => {
    render(
      <SuggestionItem
        suggestion={mockSuggestion}
        query={mockQuery}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText(mockSuggestion)).toBeInTheDocument();
    expect(highlightText).toHaveBeenCalledWith(mockSuggestion, mockQuery);
  });

  it('should call onSelect when the item is clicked', () => {
    render(
      <SuggestionItem
        suggestion={mockSuggestion}
        query={mockQuery}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    fireEvent.click(screen.getByText(mockSuggestion));
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith(mockSuggestion);
  });

  it('should apply selected styles when isSelected is true', () => {
    const { container } = render(
      <SuggestionItem
        suggestion={mockSuggestion}
        query={mockQuery}
        isSelected={true}
        onSelect={mockOnSelect}
      />
    );
    // Check for a class that indicates selection. Based on SuggestionItem.tsx, this is bg-primary/10 or text-primary
    // We are checking the direct child of the container which is the div in SuggestionItem
    expect(container.firstChild).toHaveClass('bg-primary/10', 'text-primary');
  });

  it('should apply hover styles and not selected styles when isSelected is false', () => {
    const { container } = render(
      <SuggestionItem
        suggestion={mockSuggestion}
        query={mockQuery}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );
    // Check for hover class and absence of selected class
    // Based on SuggestionItem.tsx, hover is hover:bg-secondary
    expect(container.firstChild).toHaveClass('hover:bg-secondary');
    expect(container.firstChild).not.toHaveClass('bg-primary/10');
    expect(container.firstChild).not.toHaveClass('text-primary');
  });
}); 