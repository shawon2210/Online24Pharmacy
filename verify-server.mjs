#!/usr/bin/env node

/**
 * Server Verification Script
 * Checks all server components and dependencies
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const checks = [];
let passed = 0;
let failed = 0;

function check(name, condition, fix = '') {
  const status = condition ? '✅' : '❌';
  const result = { name, status, passed: condition, fix };
  checks.push(result);
  
  if (condition) {
    passed++;
    console.log(`${status} ${name}`);
  } else {
    failed++;
    console.log(`${status} ${name}`);
    if (fix) console.log(`   Fix: ${fix}`);
  }
}

console.log('\n🔍 Server Verification Checklist\n');
console.log('='.repeat(50));

// Check main server file
check(
  'Server index.js exists',
  fs.existsSync(path.join(__dirname, 'server', 'index.js')),
  'Create server/index.js'
);

// Check route files
const routes = [
  'authRoutes.js',
  'adminRoutes.js',
  'products.js',
  'cart.js',
  'orders.js',
  'prescriptions.js',
  'payments.js',
  'wishlist.js',
  'reviews.js',
  'coupons.js',
  'analytics.js',
  'reports.js',
  'delivery.js',
  'users.js',
  'chatbot.js',
  'savedKits.js',
  'pickup.js',
  'notifications.js'
];

console.log('\n📁 Route Files:');
routes.forEach(route => {
  check(
    `routes/${route}`,
    fs.existsSync(path.join(__dirname, 'server', 'routes', route)),
    `Create server/routes/${route}`
  );
});

// Check admin routes
const adminRoutes = [
  'products.js',
  'categories.js',
  'orders.js',
  'customers.js',
  'prescriptions.js'
];

console.log('\n📁 Admin Route Files:');
adminRoutes.forEach(route => {
  check(
    `routes/admin/${route}`,
    fs.existsSync(path.join(__dirname, 'server', 'routes', 'admin', route)),
    `Create server/routes/admin/${route}`
  );
});

// Check middleware
const middleware = [
  'auth.js',
  'roleAuth.js',
  'isAdmin.js',
  'validation.js',
  'rateLimiter.js',
  'chatbotSafety.js',
  'security.js'
];

console.log('\n🛡️ Middleware Files:');
middleware.forEach(mw => {
  check(
    `middleware/${mw}`,
    fs.existsSync(path.join(__dirname, 'server', 'middleware', mw)),
    `Create server/middleware/${mw}`
  );
});

// Check controllers
const controllers = [
  'authController.js',
  'adminController.js',
  'savedKitController.js'
];

console.log('\n🎮 Controller Files:');
controllers.forEach(ctrl => {
  check(
    `controllers/${ctrl}`,
    fs.existsSync(path.join(__dirname, 'server', 'controllers', ctrl)),
    `Create server/controllers/${ctrl}`
  );
});

// Check database files
const dbFiles = [
  'prisma.js',
  'client.js',
  'integrityMiddleware.js',
  'utilities.js'
];

console.log('\n💾 Database Files:');
dbFiles.forEach(db => {
  check(
    `db/${db}`,
    fs.existsSync(path.join(__dirname, 'server', 'db', db)),
    `Create server/db/${db}`
  );
});

// Check utility files
const utils = [
  'notificationManager.js',
  'auditLogger.js',
  'vectorClient.js',
  'chatbotCorpus.js',
  'geocoding.js',
  'notificationEmitter.js',
  'notificationEventHandlers.js',
  'notifications.js',
  'prismaHelpers.js',
  'socketioSetup.js'
];

console.log('\n🔧 Utility Files:');
utils.forEach(util => {
  check(
    `utils/${util}`,
    fs.existsSync(path.join(__dirname, 'server', 'utils', util)),
    `Create server/utils/${util}`
  );
});

// Check event files
console.log('\n📡 Event Files:');
check(
  'events/commerceEventEmitter.js',
  fs.existsSync(path.join(__dirname, 'server', 'events', 'commerceEventEmitter.js')),
  'Create server/events/commerceEventEmitter.js'
);

// Check data directory
console.log('\n📊 Data Directory:');
const dataDir = path.join(__dirname, 'server', 'data');
check(
  'data/ directory exists',
  fs.existsSync(dataDir),
  'Create server/data/ directory'
);

if (fs.existsSync(dataDir)) {
  const dataFiles = [
    'products.json',
    'categories.json',
    'subcategories.json',
    'orders.json',
    'prescriptions.json',
    'users.json',
    'dgda-faqs.json',
    'dgda-guidelines.json',
    'system-faqs.json',
    'system-features.json'
  ];
  
  dataFiles.forEach(file => {
    check(
      `data/${file}`,
      fs.existsSync(path.join(dataDir, file)),
      `Create server/data/${file} with empty array []`
    );
  });
}

// Check uploads directory
console.log('\n📤 Upload Directories:');
check(
  'uploads/prescriptions/',
  fs.existsSync(path.join(__dirname, 'uploads', 'prescriptions')),
  'Create uploads/prescriptions/ directory'
);
check(
  'uploads/products/',
  fs.existsSync(path.join(__dirname, 'uploads', 'products')),
  'Create uploads/products/ directory'
);

// Check environment file
console.log('\n⚙️ Configuration:');
check(
  '.env file exists',
  fs.existsSync(path.join(__dirname, '.env')),
  'Copy .env.example to .env and fill in values'
);

check(
  '.env.example exists',
  fs.existsSync(path.join(__dirname, '.env.example')),
  'Create .env.example with required variables'
);

// Check package.json
console.log('\n📦 Package Configuration:');
check(
  'package.json exists',
  fs.existsSync(path.join(__dirname, 'package.json')),
  'Run npm init'
);

if (fs.existsSync(path.join(__dirname, 'package.json'))) {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  
  check(
    'package.json has "type": "module"',
    pkg.type === 'module',
    'Add "type": "module" to package.json'
  );
  
  const requiredDeps = [
    'express',
    'cors',
    'cookie-parser',
    'dotenv',
    'bcryptjs',
    'jsonwebtoken',
    'multer',
    'express-rate-limit',
    'express-validator',
    'axios',
    'node-cron'
  ];
  
  requiredDeps.forEach(dep => {
    check(
      `Dependency: ${dep}`,
      pkg.dependencies && pkg.dependencies[dep],
      `Run: npm install ${dep}`
    );
  });
}

// Check Prisma
console.log('\n🗄️ Prisma:');
check(
  'prisma/schema.prisma exists',
  fs.existsSync(path.join(__dirname, 'prisma', 'schema.prisma')),
  'Create prisma/schema.prisma'
);

// Summary
console.log('\n' + '='.repeat(50));
console.log(`\n📊 Summary:`);
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);
console.log(`   📈 Total:  ${checks.length}`);
console.log(`   🎯 Success Rate: ${((passed / checks.length) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 All checks passed! Server is ready to run.');
  console.log('\n🚀 Start server with: npm run server');
} else {
  console.log('\n⚠️  Some checks failed. Please fix the issues above.');
}

console.log('\n' + '='.repeat(50) + '\n');

// Exit with appropriate code
process.exit(failed > 0 ? 1 : 0);
