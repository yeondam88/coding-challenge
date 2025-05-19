# System Patterns and Architecture

This document outlines the architectural patterns and design decisions for the Word Autocomplete UI component.

## Core Architecture: Component-Based with Custom Hook

The application follows a standard React component-based architecture, emphasizing separation of concerns and reusability. The core logic, state management, and side effects related to the autocomplete functionality are encapsulated within a custom React hook (`useAutocomplete`).

```mermaid
flowchart TD
    App[App.tsx] --> AutocompleteInputComponent[AutocompleteInput.tsx];
    
    subgraph AutocompleteInputComponent
        Input[HTML Input Field]
        ClearButton[Clear Button (SVG Icon)]
        SuggestionsContainer[Suggestions Dropdown Area]
    end

    AutocompleteInputComponent -- Uses Hook --> Hook[useAutocomplete.ts];
    Hook -- Manages --> State[(inputValue, suggestions, loading, error, selectedIndex, isOpen)];
    Hook -- Handles API Calls --> ApiService[apiService.ts];
    ApiService -- Fetches From --> ExternalAPI[GET /api/words];
    
    Hook -- Returns Data & Handlers --> AutocompleteInputComponent;
    
    AutocompleteInputComponent -- Renders Based on Hook State --> SuggestionsContainer;
    
    subgraph SuggestionsContainerLogic [Inside AutocompleteInput.tsx Render]
        ConditionalRendering[Conditional Rendering Logic]
        LoadingMsg[Displays "Loading..."]
        ErrorMsg[Displays "Error..."]
        EmptyMsg[Displays "No results..."]
        MapSuggestions[Maps `suggestions` to `div` elements]
    end

    SuggestionsContainer -- Handled by --> ConditionalRendering;
    ConditionalRendering -- If Loading --> LoadingMsg;
    ConditionalRendering -- If Error --> ErrorMsg;
    ConditionalRendering -- If Empty & Not Loading/Error --> EmptyMsg;
    ConditionalRendering -- If Suggestions --> MapSuggestions;
    MapSuggestions -- For Each Suggestion --> SuggestionDiv[Rendered `div` as Suggestion Item];
    SuggestionDiv -- Uses Utility --> HighlightUtil[utils/highlightText.tsx];
    HighlightUtil -- Returns JSX --> SuggestionDiv;

    UserEvents[User Interactions (Typing, KeyDown, Click on SuggestionDiv)] --> AutocompleteInputComponent;
    AutocompleteInputComponent -- Delegates Events --> Hook;
    Hook -- Processes Events (Debounce, Select, Navigate) --> State;
    Hook -- Logs Selection --> Console[Browser Console];
```

### Components

1.  **`App.tsx`**: The main application wrapper. It renders the `AutocompleteInput` component and provides basic page structure and global styles.
2.  **`AutocompleteInput.tsx`**: 
    *   The primary interactive component.
    *   Contains the text input field and a clear button.
    *   Uses the `useAutocomplete` hook to manage all its state and business logic.
    *   **Directly renders the suggestions dropdown area.** This includes:
        *   Displaying loading messages.
        *   Displaying error messages.
        *   Displaying a "No results found" message.
        *   Mapping over the `suggestions` array (from the hook) to render individual suggestion items as `div` elements.
    *   Each rendered suggestion `div` calls the `highlightText` utility for its content and has an `onClick` handler tied to `handleSelectSuggestion` from the hook.
    *   Applies dynamic classes to suggestion `divs` for `selected` state (based on `selectedIndex` from the hook).
    *   Includes a `useEffect` hook to handle clicks outside the component to close the suggestions dropdown (by calling `clearSuggestions` from the hook).
3.  **`SuggestionsList.tsx` and `SuggestionItem.tsx`**: 
    *   These files exist in the `src/components` directory from earlier development iterations or as standalone UI pieces.
    *   However, in the current primary workflow of `AutocompleteInput.tsx`, their specific rendering logic (especially for the list structure, loading/error states, and item iteration) is handled directly within `AutocompleteInput.tsx` rather than these components being composed together by `AutocompleteInput.tsx`.
    *   `SuggestionItem.tsx` conceptually represents how an individual item should behave and might be used if `AutocompleteInput.tsx` were refactored to delegate list rendering. `highlightText` is imported by `SuggestionItem.tsx` but also directly by `AutocompleteInput.tsx` for its internal suggestion rendering.

### Custom Hook (`useAutocomplete.ts`)

*   **State Management**: Manages all state related to the autocomplete functionality: `inputValue`, `suggestions` array, `loading` status, `error` object, `selectedIndex` for keyboard navigation, and `isOpen` for dropdown visibility.
*   **API Interaction**: 
    *   Contains the `fetchSuggestionsDebounced` function which calls the `fetchSuggestions` service.
    *   Implements debouncing for API calls to avoid excessive requests during user typing.
*   **Event Handlers**: Provides memoized event handlers for:
    *   Input change (`setInputValue`).
    *   Keyboard navigation (`handleKeyDown`: ArrowUp, ArrowDown, Enter, Escape).
    *   Suggestion selection via click on a suggestion `div` or Enter key (`handleSelectSuggestion`).
    *   Clearing suggestions and closing the dropdown (`clearSuggestions`).
*   **Side Effects**: Uses `useEffect` to trigger debounced fetching when `inputValue` changes and to clean up debounce timers.

### API Service (`apiService.ts`)

*   **`fetchSuggestions`**: An asynchronous function responsible for making the GET request to the external autocomplete API (`https://autocomplete-lyart.vercel.app/api/words`).
*   Constructs the URL with `query` and `limit` parameters.
*   Includes basic error handling for non-ok HTTP responses.

### Utility (`utils/highlightText.tsx`)

*   **`highlightText`**: A function that takes a text string and a query string, and returns a ReactNode.
*   It splits the text based on the query (case-insensitive) and wraps the matching parts in a `<span>` with a `.highlight` class for styling.
*   Handles regex special characters in the query to ensure correct matching.

## Styling

*   Styling is handled using plain CSS.
*   Global styles are in `index.css` and `App.css`.
*   Component-specific styles are co-located with components or directly applied (e.g., `AutocompleteInput.css`).
*   This approach was chosen after difficulties with Tailwind CSS setup during initial development.

## Key Design Decisions & Patterns

*   **Custom Hook for Logic Encapsulation**: Centralizes state and logic, making the `AutocompleteInput` component cleaner (though its rendering logic for suggestions is currently extensive).
*   **Debouncing**: Essential for performance with type-ahead APIs.
*   **Clear Separation of API Calls**: `apiService.ts` isolates external API interaction.
*   **Accessibility (Basic)**: Keyboard navigation implemented.
*   **Stateless Utility Functions**: `highlightText` is pure and reusable.

## Data Flow Summary

1.  User types in `AutocompleteInput` -> `inputValue` state in `useAutocomplete` updates.
2.  `useEffect` in `useAutocomplete` triggers debounced `fetchSuggestionsDebounced`.
3.  `fetchSuggestionsDebounced` calls `apiService.fetchSuggestions`.
4.  `apiService` calls the external API.
5.  API response updates `suggestions`, `loading`, `error` states in `useAutocomplete`.
6.  `AutocompleteInput` re-renders. Its internal logic displays loading/error/empty messages or maps `suggestions` to `div` elements, using `highlightText`.
7.  User selection (keyboard/click on a suggestion `div`) calls handlers in `useAutocomplete`.
8.  `useAutocomplete` updates `inputValue`, closes dropdown, logs to console.

*(Note: The Mermaid diagram in the main project README.md also provides a visual representation of this flow and may be more abstracted.)* 