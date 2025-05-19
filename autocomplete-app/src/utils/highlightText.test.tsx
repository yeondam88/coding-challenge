import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { highlightText } from './highlightText';
import '@testing-library/jest-dom';

afterEach(() => {
  cleanup();
});

describe('highlightText utility', () => {
  it('should return the original text if query is empty or whitespace', () => {
    const text = 'Hello World';
    const { container: c1 } = render(<>{highlightText(text, '')}</>);
    expect(c1.textContent).toBe(text);
    
    cleanup();
    const { container: c2 } = render(<>{highlightText(text, '   ')}</>);
    expect(c2.textContent).toBe(text);
  });

  it('should return the original text if query consists only of special characters that get escaped to nothing', () => {
    const text = 'Hello World';
    const { container } = render(<>{highlightText(text, '.*')}</>);
    expect(container.textContent).toBe(text);
  });

  it('should highlight a single match correctly', () => {
    const text = 'Hello World';
    const query = 'World';
    const { container } = render(<>{highlightText(text, query)}</>);
    const highlightedElement = screen.getByText(query);
    expect(highlightedElement).toBeInTheDocument();
    expect(highlightedElement).toHaveClass('highlight');
    expect(container.textContent).toBe(text);
  });

  it('should be case-insensitive when highlighting', () => {
    const text = 'Hello World';
    const query = 'world';
    const { container } = render(<>{highlightText(text, query)}</>);
    const highlightedElement = screen.getByText('World');
    expect(highlightedElement).toBeInTheDocument();
    expect(highlightedElement).toHaveClass('highlight');
    expect(container.textContent).toBe(text);
  });

  it('should highlight multiple matches correctly', () => {
    const text = 'apple banana apple';
    const query = 'apple';
    const { container } = render(<>{highlightText(text, query)}</>);
    const highlightedElements = screen.getAllByText(query);
    expect(highlightedElements.length).toBe(2);
    highlightedElements.forEach(el => {
      expect(el).toHaveClass('highlight');
    });
    expect(container.textContent).toBe(text);
  });

  it('should handle special regex characters in query', () => {
    const text = 'Text with (parentheses) and [brackets]';
    const query = '(parentheses)';
    const { container } = render(<>{highlightText(text, query)}</>);
    const highlightedElement = screen.getByText(query);
    expect(highlightedElement).toBeInTheDocument();
    expect(highlightedElement).toHaveClass('highlight');
    expect(container.textContent).toBe(text);
  });

  it('should render non-matching parts of the text correctly', () => {
    const text = 'abcXXXdefYYYghi';
    const query = 'XXX';
    const { container } = render(<>{highlightText(text, query)}</>);
    expect(screen.getByText('XXX')).toHaveClass('highlight');
    expect(container.textContent).toBe(text);
  });

 it('should handle query at the beginning of the text', () => {
    const text = 'Start of the sentence';
    const query = 'Start';
    const { container } = render(<>{highlightText(text, query)}</>);
    const highlightedElement = screen.getByText(query);
    expect(highlightedElement).toBeInTheDocument();
    expect(highlightedElement).toHaveClass('highlight');
    expect(container.textContent).toBe(text);
  });

  it('should handle query at the end of the text', () => {
    const text = 'Sentence ends with End';
    const query = 'End';
    const { container } = render(<>{highlightText(text, query)}</>);
    const highlightedElement = screen.getByText(query);
    expect(highlightedElement).toBeInTheDocument();
    expect(highlightedElement).toHaveClass('highlight');
    expect(container.textContent).toBe(text);
  });

  it('should handle text that is identical to the query', () => {
    const text = 'Query';
    const query = 'Query';
    const { container } = render(<>{highlightText(text, query)}</>);
    const highlightedElement = screen.getByText(query);
    expect(highlightedElement).toBeInTheDocument();
    expect(highlightedElement).toHaveClass('highlight');
    expect(container.textContent).toBe(text);
  });
}); 