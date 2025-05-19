import React from 'react';

/**
 * Highlights the parts of a text string that match a query.
 * 
 * @param text The text to search within.
 * @param query The query string to highlight.
 * @returns A React.ReactNode with the matching parts of the text wrapped in a <span> with class "highlight".
 */
export function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) {
    return text;
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  if (!escapedQuery) {
    return text;
  }

  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  return (
    <React.Fragment>
      {parts.map((part, index) => {
        if (part.toLowerCase() === query.toLowerCase()) {
          return (
            <span key={index} className="highlight">
              {part}
            </span>
          );
        }
        return part;
      })}
    </React.Fragment>
  );
} 