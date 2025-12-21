/**
 * API Endpoint Tests
 * Run with: node server/tests/api.test.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Test helper
async function test(name, fn) {
  try {
    await fn();
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
    console.log(`✓ ${name}`);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error.message });
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
  }
}

// Assert helper
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// API request helper
async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  return { response, data };
}

// Run tests
async function runTests() {
  console.log('\n🧪 Running API Tests...\n');

  // Auth Tests
  console.log('Auth Endpoints:');
  
  await test('POST /api/auth/signup - should create new user', async () => {
    const { response, data } = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      })
    });
    
    assert(response.status === 201 || response.status === 200, 'Should return 200/201');
    assert(data.token || data.success, 'Should return token or success');
  });

  await test('POST /api/auth/login - should login with valid credentials', async () => {
    const { response, data } = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    assert(response.ok, 'Should return success');
    assert(data.token, 'Should return token');
  });

  await test('POST /api/auth/login - should reject invalid credentials', async () => {
    const { response } = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'wrong@example.com',
        password: 'wrongpass'
      })
    });
    
    assert(!response.ok, 'Should return error');
  });

  // Product Tests
  console.log('\nProduct Endpoints:');
  
  await test('GET /api/products - should return products list', async () => {
    const { response, data } = await apiRequest('/api/products');
    
    assert(response.ok, 'Should return success');
    assert(Array.isArray(data.products) || Array.isArray(data), 'Should return array');
  });

  await test('GET /api/products?limit=5 - should respect limit parameter', async () => {
    const { response, data } = await apiRequest('/api/products?limit=5');
    
    assert(response.ok, 'Should return success');
    const products = data.products || data;
    assert(products.length <= 5, 'Should return max 5 products');
  });

  await test('GET /api/products/search - should search products', async () => {
    const { response, data } = await apiRequest('/api/products/search?q=medicine');
    
    assert(response.ok, 'Should return success');
    assert(Array.isArray(data.results) || Array.isArray(data), 'Should return results');
  });

  // Category Tests
  console.log('\nCategory Endpoints:');
  
  await test('GET /api/categories - should return categories', async () => {
    const { response, data } = await apiRequest('/api/categories');
    
    assert(response.ok, 'Should return success');
    assert(Array.isArray(data) || data.categories, 'Should return categories');
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`Tests: ${results.passed + results.failed}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log('='.repeat(50) + '\n');

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests, test, assert };
