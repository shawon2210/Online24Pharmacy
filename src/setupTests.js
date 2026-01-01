/* global beforeAll, afterAll */
// src/setupTests.js
import '@testing-library/jest-dom';
import './tests/setupRouterFutureFlags';

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
