// Silence React Router v7 warnings in tests
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';

// Set future flags globally for tests
window.__reactRouterV7Flags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

// Optionally, you can mock BrowserRouter to use HistoryRouter with future flags
// But for now, setting the global flag is enough for warnings
