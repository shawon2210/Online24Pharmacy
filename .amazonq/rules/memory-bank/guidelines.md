# Online24 Pharmacy - Development Guidelines & Patterns

## Code Quality Standards

### JavaScript/TypeScript Standards
- **Module System**: ES Modules (import/export syntax)
- **Naming Conventions**:
  - Components: PascalCase (e.g., `ProductCard.jsx`)
  - Functions/variables: camelCase (e.g., `validateEmail`, `cartStore`)
  - Constants: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`, `VALIDATION_RULES`)
  - Files: kebab-case for utilities (e.g., `use-api.js`), PascalCase for components
- **Indentation**: 2 spaces (consistent across all files)
- **Semicolons**: Required at end of statements
- **Quotes**: Single quotes for strings (enforced by ESLint)
- **Comments**: JSDoc style for functions, inline comments for complex logic

### File Organization
- **One component per file** (except for small related components)
- **Exports**: Named exports for utilities, default export for components
- **Imports**: Group by external, internal, then relative paths
- **File size**: Keep components under 300 lines; split larger components

### React Component Patterns

#### Functional Components
All components are functional components using React Hooks:
```javascript
export default function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue);
  
  return (
    <div>
      {/* JSX content */}
    </div>
  );
}
```

#### Custom Hooks Pattern
Custom hooks follow the `use*` naming convention and encapsulate reusable logic:
```javascript
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

#### Context API Usage
- Create context with `createContext(undefined)`
- Provide context through wrapper component
- Consume with custom hook that validates context exists
- Throw error if hook used outside provider

### State Management Patterns

#### Zustand Stores
Used for client-side state (cart, auth):
```javascript
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        // Implementation
      },
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.discountPrice || item.product.price;
          return total + (parseFloat(price) * item.quantity);
        }, 0);
      }
    }),
    { name: 'cart-storage' }
  )
);
```

**Key patterns**:
- Use `persist` middleware for localStorage persistence
- Use `get()` to access current state
- Use `set()` to update state
- Provide computed methods (getTotalPrice, getTotalItems)
- Name store with `use*` prefix

#### React Query
Used for server state management:
- Automatic caching and synchronization
- Stale-while-revalidate pattern
- Automatic refetching on window focus
- Mutation handling with optimistic updates

### API & HTTP Patterns

#### Custom useApi Hook
```javascript
export default function useApi(apiFunction) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  return { data, loading, error, execute, reset };
}
```

**Usage pattern**:
- Returns object with `data`, `loading`, `error`, `execute`, `reset`
- `execute` is async and can be called with arguments
- Automatically manages loading and error states
- Provides reset function to clear state

#### Axios Configuration
- Base URL configured in environment variables
- Interceptors for auth token injection
- Error handling with custom error messages
- Request/response transformation

### Form Handling Patterns

#### React Hook Form Integration
```javascript
import { useForm } from 'react-hook-form';

export default function FormComponent() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const onSubmit = (data) => {
    // Handle form submission
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { required: true })} />
      {errors.email && <span>Email is required</span>}
    </form>
  );
}
```

#### Validation Utilities
Centralized validation functions with consistent return format:
```javascript
export const validateEmail = (email) => {
  if (!email) return { valid: false, error: 'Email is required' };
  if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  return { valid: true };
};
```

**Pattern**:
- Returns object with `valid` boolean and optional `error` message
- Validates Bangladesh phone numbers (01XXXXXXXXX format)
- Validates file uploads (type and size)
- Validates prescription forms with multiple fields

### Backend API Patterns

#### Express Route Structure
```javascript
import express from 'express';
import prisma from '../db/prisma.js';

const router = express.Router();

// GET all resources
router.get('/', async (req, res) => {
  try {
    const data = await prisma.model.findMany();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

// GET single resource
router.get('/:id', async (req, res) => {
  try {
    const data = await prisma.model.findUnique({
      where: { id: req.params.id }
    });
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

// POST create resource
router.post('/', async (req, res) => {
  try {
    const data = await prisma.model.create({
      data: req.body
    });
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create' });
  }
});

export default router;
```

**Patterns**:
- Use async/await for all database operations
- Wrap in try/catch blocks
- Return appropriate HTTP status codes (200, 201, 400, 404, 500)
- Use Prisma for all database queries
- Validate input before database operations

#### Authentication Middleware
```javascript
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};
```

**Patterns**:
- Extract token from Authorization header (Bearer scheme)
- Verify JWT with secret
- Fetch user from database
- Attach user to request object
- Return 401 for missing/invalid token, 403 for verification failure

#### File Upload with Multer
```javascript
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `product-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only image files allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const imageUrl = `/uploads/products/${req.file.filename}`;
  res.json({ imageUrl });
});
```

**Patterns**:
- Use disk storage for file persistence
- Generate unique filenames with timestamp
- Filter by MIME type and extension
- Set file size limits (5MB typical)
- Return file path/URL in response

### Styling Patterns

#### Tailwind CSS
- **Utility-first approach**: Use Tailwind classes directly in JSX
- **Responsive design**: Mobile-first with breakpoints (sm, md, lg, xl, 2xl)
- **Dark mode**: Class-based dark mode with `dark:` prefix
- **Custom colors**: Extended in tailwind.config.js
- **Component classes**: Use @apply for repeated patterns

#### Responsive Breakpoints
```javascript
const BREAKPOINTS = {
  sm: 640,    // Mobile
  md: 768,    // Tablet
  lg: 1024,   // Desktop
  xl: 1280,   // Large desktop
  '2xl': 1536 // Extra large
};
```

**Usage patterns**:
- Mobile-first: base styles for mobile, add `md:`, `lg:` for larger screens
- Grid layouts: 1 column mobile, 2-3 tablet, 3-4 desktop
- Spacing: Compact (16px) mobile, comfortable (24-32px) desktop
- Typography: Smaller fonts mobile, larger desktop

### Testing Patterns

#### Vitest Unit Tests
```javascript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  describe('Specific behavior', () => {
    it('should do something specific', () => {
      const result = functionUnderTest();
      expect(result).toBe(expectedValue);
    });
  });
});
```

**Patterns**:
- Use `describe` for grouping related tests
- Use `it` for individual test cases
- Use `expect` assertions
- Test both success and error cases
- Test responsive breakpoints and grid layouts

### Internationalization (i18n) Patterns

#### i18next Configuration
```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import bn from './locales/bn.json';

const resources = {
  en: { common: en },
  bn: { common: bn }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });
```

**Patterns**:
- Detect language from localStorage or browser
- Cache language preference
- Support English (en) and Bengali (bn)
- Use namespaces for organizing translations
- Fallback to English if translation missing

#### Translation Usage
```javascript
import { useTranslation } from 'react-i18next';

export default function Component() {
  const { t } = useTranslation();
  return <h1>{t('common:title')}</h1>;
}
```

### Error Handling Patterns

#### Frontend Error Handling
- Try/catch blocks for async operations
- User-friendly error messages
- Error state in custom hooks
- Toast notifications for errors
- Fallback UI for error states

#### Backend Error Handling
- Try/catch blocks for all async operations
- Appropriate HTTP status codes
- Consistent error response format: `{ error: 'message' }`
- Console logging for debugging
- Graceful fallbacks (e.g., file-based data if database fails)

### Performance Optimization Patterns

#### Code Splitting
- Lazy load routes with React.lazy
- Dynamic imports for heavy components
- Vite automatic chunk splitting

#### Image Optimization
- Use image optimization utilities
- Lazy load images with Intersection Observer
- Responsive images with srcset
- WebP format support

#### Caching Strategies
- React Query for server state caching
- Zustand with localStorage persistence
- Browser cache headers
- Service Worker for offline support

## Common Idioms & Practices

### Null/Undefined Checks
```javascript
// Preferred: Optional chaining and nullish coalescing
const price = product?.discountPrice ?? product?.price;
const images = product?.images || [product?.image];

// Avoid: Multiple nested ternaries
// const price = product && product.discountPrice ? product.discountPrice : product.price;
```

### Array Operations
```javascript
// Use map for transformations
const items = products.map(p => ({ id: p.id, name: p.name }));

// Use filter for filtering
const active = products.filter(p => p.isActive);

// Use reduce for aggregations
const total = items.reduce((sum, item) => sum + item.price, 0);

// Use find for single item lookup
const product = products.find(p => p.id === id);
```

### Async/Await Pattern
```javascript
// Preferred: async/await with try/catch
try {
  const data = await fetchData();
  setData(data);
} catch (error) {
  setError(error.message);
}

// Avoid: Promise chains for new code
// fetchData().then(data => setData(data)).catch(error => setError(error));
```

### Destructuring
```javascript
// Function parameters
function Component({ title, description, isActive = false }) {
  // Implementation
}

// Object destructuring
const { id, name, price } = product;

// Array destructuring
const [state, setState] = useState(initialValue);
```

### Conditional Rendering
```javascript
// Preferred: Ternary for simple conditions
{isLoading ? <Spinner /> : <Content />}

// Preferred: Logical AND for single condition
{isVisible && <Component />}

// Avoid: Inline if statements
{if (condition) <Component />} // Invalid JSX
```

## Frequently Used Patterns

### Product Display Pattern
- Fetch product data with useApi or React Query
- Display product details (name, price, images, description)
- Show prescription requirement indicator
- Display reviews and ratings
- Add to cart/wishlist buttons

### Order Processing Pattern
1. Add items to cart (Zustand store)
2. Navigate to checkout
3. Collect shipping address
4. Select payment method
5. Create order via API
6. Show confirmation
7. Redirect to order tracking

### Prescription Verification Pattern
1. User uploads prescription image
2. Admin reviews prescription
3. Verify doctor license
4. Approve/reject with notes
5. Notify user of status
6. Enable/disable reordering

### Real-Time Updates Pattern
- Socket.io connection on component mount
- Listen for specific events (order status, notifications)
- Update local state on event
- Disconnect on component unmount

### Pagination Pattern
```javascript
const [page, setPage] = useState(1);
const { data, isLoading } = useQuery({
  queryKey: ['items', page],
  queryFn: () => fetchItems(page)
});
```

## Best Practices Summary

1. **Always use TypeScript-like JSDoc comments** for functions
2. **Keep components small and focused** (single responsibility)
3. **Extract reusable logic into custom hooks**
4. **Use Zustand for client state**, React Query for server state
5. **Validate all user input** before processing
6. **Handle errors gracefully** with user-friendly messages
7. **Use Tailwind CSS** for all styling
8. **Support both English and Bengali** languages
9. **Test responsive design** at all breakpoints
10. **Optimize performance** with code splitting and lazy loading
11. **Follow consistent naming conventions** across codebase
12. **Document complex logic** with comments
13. **Use environment variables** for configuration
14. **Implement proper error boundaries** for React components
15. **Use Socket.io** for real-time features
