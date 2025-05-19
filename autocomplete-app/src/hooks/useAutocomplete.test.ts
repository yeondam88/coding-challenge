import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutocomplete } from './useAutocomplete';
import { fetchSuggestions } from '../services/apiService';

// Mock the API service
vi.mock('../services/apiService', () => ({
  fetchSuggestions: vi.fn(),
}));

const mockedFetchSuggestions = fetchSuggestions as MockedFunction<typeof fetchSuggestions>;

describe('useAutocomplete', () => {
  const mockSuggestions = ['apple', 'application', 'appetite'];
  const mockEvent = (key: string) => ({
    key,
    preventDefault: vi.fn(),
  } as unknown as React.KeyboardEvent<HTMLInputElement>);
  
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useAutocomplete());
    
    expect(result.current.inputValue).toBe('');
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.selectedIndex).toBe(-1);
    expect(result.current.isOpen).toBe(false);
  });

  it('should update input value and trigger fetch', async () => {
    mockedFetchSuggestions.mockResolvedValue(mockSuggestions);
    const { result } = renderHook(() => useAutocomplete());
    
    act(() => {
      result.current.setInputValue('app');
    });
    
    expect(result.current.inputValue).toBe('app');
    expect(result.current.loading).toBe(true);

    await act(async () => {
      vi.runAllTimers();
    });
    
    expect(mockedFetchSuggestions).toHaveBeenCalledWith({ query: 'app', limit: 5 });
    expect(result.current.suggestions).toEqual(mockSuggestions);
    expect(result.current.isOpen).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('should handle API error', async () => {
    const error = new Error('API error');
    mockedFetchSuggestions.mockRejectedValue(error);
    
    const { result } = renderHook(() => useAutocomplete());
    
    act(() => {
      result.current.setInputValue('app');
    });
    
    expect(result.current.loading).toBe(true);

    await act(async () => {
      vi.runAllTimers();
    });
    
    expect(result.current.error).toEqual(error);
    expect(result.current.loading).toBe(false);
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isOpen).toBe(false);
  });

  it('should clear suggestions and close when input is empty', async () => {
    mockedFetchSuggestions.mockResolvedValue(mockSuggestions);
    const { result } = renderHook(() => useAutocomplete());

    act(() => {
      result.current.setInputValue('app');
    });
    await act(async () => {
      vi.runAllTimers();
    });
    expect(result.current.suggestions).toEqual(mockSuggestions);
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.setInputValue('');
    });
    
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  describe('Keyboard Navigation', () => {
    beforeEach(async () => {
      mockedFetchSuggestions.mockResolvedValue(mockSuggestions);
      const { result } = renderHook(() => useAutocomplete());
      
      act(() => {
        result.current.setInputValue('app');
      });
      await act(async () => {
        vi.runAllTimers();
      });
    });

    it('should handle ArrowDown', async () => {
      mockedFetchSuggestions.mockResolvedValue(mockSuggestions);
      const { result } = renderHook(() => useAutocomplete());
      act(() => { result.current.setInputValue('app'); });
      await act(async () => { vi.runAllTimers(); });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.selectedIndex).toBe(-1);

      act(() => { result.current.handleKeyDown(mockEvent('ArrowDown')); });
      expect(result.current.selectedIndex).toBe(0);
      
      act(() => { result.current.handleKeyDown(mockEvent('ArrowDown')); });
      expect(result.current.selectedIndex).toBe(1);

      act(() => { result.current.handleKeyDown(mockEvent('ArrowDown')); });
      act(() => { result.current.handleKeyDown(mockEvent('ArrowDown')); });
      expect(result.current.selectedIndex).toBe(mockSuggestions.length - 1);
    });

    it('should handle ArrowUp', async () => {
      mockedFetchSuggestions.mockResolvedValue(mockSuggestions);
      const { result } = renderHook(() => useAutocomplete());
      act(() => { result.current.setInputValue('app'); });
      await act(async () => { vi.runAllTimers(); });

      act(() => { result.current.handleKeyDown(mockEvent('ArrowDown')); });
      act(() => { result.current.handleKeyDown(mockEvent('ArrowDown')); });
      act(() => { result.current.handleKeyDown(mockEvent('ArrowDown')); });
      expect(result.current.selectedIndex).toBe(2);

      act(() => { result.current.handleKeyDown(mockEvent('ArrowUp')); });
      expect(result.current.selectedIndex).toBe(1);

      act(() => { result.current.handleKeyDown(mockEvent('ArrowUp')); });
      expect(result.current.selectedIndex).toBe(0);

      act(() => { result.current.handleKeyDown(mockEvent('ArrowUp')); });
      expect(result.current.selectedIndex).toBe(0);
    });

    it('should handle Enter to select suggestion and log to console', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      mockedFetchSuggestions.mockResolvedValue(mockSuggestions);
      const { result } = renderHook(() => useAutocomplete());
      act(() => { result.current.setInputValue('app'); });
      await act(async () => { vi.runAllTimers(); });

      act(() => { result.current.handleKeyDown(mockEvent('ArrowDown')); });
      act(() => { result.current.handleKeyDown(mockEvent('ArrowDown')); });
      expect(result.current.selectedIndex).toBe(1);
      
      act(() => { result.current.handleKeyDown(mockEvent('Enter')); });
      
      expect(result.current.inputValue).toBe(mockSuggestions[1]);
      expect(result.current.isOpen).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Selected:', mockSuggestions[1]);
      consoleSpy.mockRestore();
    });

    it('should handle Escape to close dropdown', async () => {
      mockedFetchSuggestions.mockResolvedValue(mockSuggestions);
      const { result } = renderHook(() => useAutocomplete());
      act(() => { result.current.setInputValue('app'); });
      await act(async () => { vi.runAllTimers(); });

      expect(result.current.isOpen).toBe(true);
      act(() => { result.current.handleKeyDown(mockEvent('Escape')); });
      expect(result.current.isOpen).toBe(false);
    });
  });

  it('should handle suggestion selection via click and log to console', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    mockedFetchSuggestions.mockResolvedValue(mockSuggestions);
    const { result } = renderHook(() => useAutocomplete());

    act(() => {
      result.current.handleSelectSuggestion('apple');
    });
    
    expect(result.current.inputValue).toBe('apple');
    expect(result.current.isOpen).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Selected:', 'apple');
    consoleSpy.mockRestore();
  });

  it('should clear suggestions manually', async () => {
    mockedFetchSuggestions.mockResolvedValue(mockSuggestions);
    const { result } = renderHook(() => useAutocomplete());
    
    act(() => { result.current.setInputValue('app'); });
    await act(async () => { vi.runAllTimers(); });
    expect(result.current.suggestions).toEqual(mockSuggestions);
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.clearSuggestions();
    });
    
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isOpen).toBe(false);
  });
}); 