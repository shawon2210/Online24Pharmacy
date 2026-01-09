import { render, screen, act } from '@testing-library/react';
import { ThemeProvider } from '../src/contexts/ThemeProvider';
import React from 'react';

function Consumer() {
  return <div data-testid="resolved">ok</div>;
}

describe('ThemeProvider', () => {
  afterEach(() => {
    // reset document classes and localStorage
    localStorage.removeItem('theme');
    document.documentElement.classList.remove('light', 'dark');
  });

  it('applies initial theme from localStorage and reacts to storage events', async () => {
    localStorage.setItem('theme','light');

    await act(async () => {
      render(
        <ThemeProvider>
          <Consumer />
        </ThemeProvider>
      );
    });

    expect(document.documentElement.classList.contains('light')).toBe(true);

    // simulate storage event from another tab setting theme to dark
    await act(async () => {
      // set storage and dispatch event
      localStorage.setItem('theme','dark');
      window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: 'dark' }));
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});