import '@testing-library/jest-dom';
import { beforeAll, afterAll, vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock global.fetch
global.fetch = vi.fn();

// Silence React Router v7 future flag warnings in tests
const originalWarn = console.warn;
beforeAll(() => {
	console.warn = (...args) => {
		if (
			typeof args[0] === 'string' &&
			(args[0].includes('React Router will begin wrapping state updates in `React.startTransition`') ||
				args[0].includes('Relative route resolution within Splat routes is changing in v7'))
		) {
			return;
		}
		originalWarn(...args);
	};
});
afterAll(() => {
	console.warn = originalWarn;
});