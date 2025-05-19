/**
 * API service for fetching word suggestions from the autocomplete API
 */

const API_URL = 'https://autocomplete-lyart.vercel.app/api/words';

export interface AutocompleteRequestParams {
  query: string;
  limit?: number;
}

/**
 * Fetches word suggestions from the autocomplete API
 * @param params - The request parameters
 * @returns A promise that resolves to an array of word suggestions
 */
export const fetchSuggestions = async (params: AutocompleteRequestParams): Promise<string[]> => {
  const { query, limit = 5 } = params;
  
  const url = new URL(API_URL);
  url.searchParams.append('query', query);
  url.searchParams.append('limit', limit.toString());
  
  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    throw error;
  }
}; 