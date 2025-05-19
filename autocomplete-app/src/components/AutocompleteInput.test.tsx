import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { AutocompleteInput } from './AutocompleteInput';
import { useAutocomplete } from '../hooks/useAutocomplete';
import '@testing-library/jest-dom';

// Mock the useAutocomplete hook
vi.mock('../hooks/useAutocomplete');

// // Mock SuggestionsList to simplify testing of AutocompleteInput - REMOVED for more integrated tests
// vi.mock('./SuggestionsList', () => ({
//   SuggestionsList: vi.fn(() => <div data-testid="suggestions-list">Mocked SuggestionsList</div>),
// }));


describe('AutocompleteInput component', () => {
  const mockSetInputValue = vi.fn();
  const mockHandleKeyDown = vi.fn();
  const mockHandleSelectSuggestion = vi.fn();
  const mockClearSuggestions = vi.fn();

  const mockUseAutocompleteDefaultReturn = {
    inputValue: '',
    suggestions: [],
    loading: false,
    error: null,
    selectedIndex: -1,
    isOpen: false,
    setInputValue: mockSetInputValue,
    handleKeyDown: mockHandleKeyDown,
    handleSelectSuggestion: mockHandleSelectSuggestion,
    clearSuggestions: mockClearSuggestions,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAutocomplete as Mock).mockReturnValue(mockUseAutocompleteDefaultReturn);
  });

  it('should render the input field with a placeholder', () => {
    const placeholderText = 'Type here...';
    render(<AutocompleteInput placeholder={placeholderText} />);
    const inputElement = screen.getByPlaceholderText(placeholderText);
    expect(inputElement).toBeInTheDocument();
  });

  it('should call setInputValue on input change', () => {
    render(<AutocompleteInput />);
    const inputElement = screen.getByRole('textbox');
    fireEvent.change(inputElement, { target: { value: 'test' } });
    expect(mockSetInputValue).toHaveBeenCalledWith('test');
  });

  it('should call handleKeyDown on key down in input', () => {
    render(<AutocompleteInput />);
    const inputElement = screen.getByRole('textbox');
    fireEvent.keyDown(inputElement, { key: 'ArrowDown', code: 'ArrowDown' });
    expect(mockHandleKeyDown).toHaveBeenCalled();
  });

  it('should show clear button when inputValue is not empty and call setInputValue with empty string on click', () => {
    (useAutocomplete as Mock).mockReturnValue({
      ...mockUseAutocompleteDefaultReturn,
      inputValue: 'testing',
    });
    render(<AutocompleteInput />);
    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();
    fireEvent.click(clearButton);
    expect(mockSetInputValue).toHaveBeenCalledWith('');
  });

  it('should not show clear button when inputValue is empty', () => {
    render(<AutocompleteInput />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  
  // Tests for internal messages (loading, error, no results)
  it('should display loading message when loading and isOpen', () => {
    (useAutocomplete as Mock).mockReturnValue({
      ...mockUseAutocompleteDefaultReturn,
      inputValue: 'search',
      loading: true,
      isOpen: true,
    });
    render(<AutocompleteInput />);
    expect(screen.getByText(/Loading suggestions.../i)).toBeInTheDocument();
  });

  it('should display error message when error and isOpen', () => {
    (useAutocomplete as Mock).mockReturnValue({
      ...mockUseAutocompleteDefaultReturn,
      inputValue: 'search',
      error: new Error('Failed to fetch'),
      isOpen: true, 
    });
    render(<AutocompleteInput />);
    expect(screen.getByText(/Error loading suggestions/i)).toBeInTheDocument();
  });
  
  it('should display no results message when no suggestions, not loading, no error, and isOpen', () => {
    (useAutocomplete as Mock).mockReturnValue({
      ...mockUseAutocompleteDefaultReturn,
      inputValue: 'search',
      suggestions: [],
      isOpen: true,
    });
    render(<AutocompleteInput />);
    expect(screen.getByText(/No results found./i)).toBeInTheDocument();
  });

  it('should call clearSuggestions when clicking outside the component', () => {
    // For this test, ensure the hook initially reports isOpen: true
    (useAutocomplete as Mock).mockReturnValue({
      ...mockUseAutocompleteDefaultReturn,
      isOpen: true, 
    });
    render(
      <div>
        <AutocompleteInput />
        <div data-testid="outside-element">Click me</div>
      </div>
    );
        
    // Simulate click outside
    fireEvent.mouseDown(screen.getByTestId('outside-element'));
    expect(mockClearSuggestions).toHaveBeenCalledTimes(1);
  });
  
  it('should render actual suggestion items and handle selection when suggestions are present and isOpen', () => {
    const suggestions = ['apple', 'apricot'];
    (useAutocomplete as Mock).mockReturnValue({
      ...mockUseAutocompleteDefaultReturn,
      inputValue: 'ap',
      suggestions: suggestions,
      isOpen: true,
      selectedIndex: 0, // 'apple' is selected
    });
  
    const { container } = render(<AutocompleteInput />); // AutocompleteInput uses highlightText internally
    
    const suggestionItems = container.querySelectorAll('.suggestion-item');
    expect(suggestionItems.length).toBe(suggestions.length);

    // Check first item (apple)
    // highlightText will be called, so we check for the text content.
    // The actual structure is <div><span>apple</span></div> if 'ap' is the input and 'apple' the suggestion part.
    // For simplicity, checking if the text content includes 'apple'.
    expect(suggestionItems[0]).toHaveTextContent('apple');
    expect(suggestionItems[0]).toHaveClass('selected');

    // Check second item (apricot)
    expect(suggestionItems[1]).toHaveTextContent('apricot');
    expect(suggestionItems[1]).not.toHaveClass('selected');
    
    // Simulate click on the second suggestion
    fireEvent.click(suggestionItems[1]);
    expect(mockHandleSelectSuggestion).toHaveBeenCalledWith('apricot');
  });

  it('should not render suggestion items when isOpen is false, even if suggestions exist', () => {
    (useAutocomplete as Mock).mockReturnValue({
      ...mockUseAutocompleteDefaultReturn,
      inputValue: 'ap',
      suggestions: ['apple', 'apricot'],
      isOpen: false, // Key for this test
    });
  
    const { container } = render(<AutocompleteInput />);
    const suggestionItems = container.querySelectorAll('.suggestion-item');
    expect(suggestionItems.length).toBe(0);
    // Also ensure no loading/error/empty messages are shown if not applicable
    expect(screen.queryByText(/Loading suggestions.../i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Error loading suggestions/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/No results found./i)).not.toBeInTheDocument();
  });

}); 