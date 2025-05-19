import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchSuggestions } from './apiService';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('apiService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should call the API with the correct URL and parameters', async () => {
    // Mock fetch response
    const mockResponse = ['apple', 'application', 'apartment'];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    // Call the function
    const result = await fetchSuggestions({ query: 'app', limit: 3 });

    // Assert fetch was called correctly
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://autocomplete-lyart.vercel.app/api/words?query=app&limit=3'
    );
    
    // Assert result matches mock response
    expect(result).toEqual(mockResponse);
  });

  it('should use default limit if not provided', async () => {
    // Mock fetch response
    const mockResponse = ['apple', 'application', 'apartment', 'apparel', 'appear'];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    // Call the function without limit
    await fetchSuggestions({ query: 'app' });

    // Assert fetch was called with default limit
    expect(mockFetch).toHaveBeenCalledWith(
      'https://autocomplete-lyart.vercel.app/api/words?query=app&limit=5'
    );
  });

  it('should throw an error when the API request fails', async () => {
    // Mock fetch error response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    // Call the function and expect it to throw
    await expect(fetchSuggestions({ query: 'app' })).rejects.toThrow(
      'API request failed with status: 500'
    );
  });

  it('should throw an error when fetch fails', async () => {
    // Mock fetch throwing an error
    const networkError = new Error('Network failure');
    mockFetch.mockRejectedValueOnce(networkError);

    // Call the function and expect it to throw
    await expect(fetchSuggestions({ query: 'app' })).rejects.toThrow(networkError);
  });
}); 