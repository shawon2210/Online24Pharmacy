import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, 'uploads', 'products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create SVG placeholder images for each product
const products = [
  'furosemide', 'hctz', 'spironolactone', 'torsemide', 'indapamide', 'amiloride', 'metolazone', 'bumetanide',
  'metformin', 'glimepiride', 'sitagliptin', 'glargine', 'gliclazide',
  'amlodipine', 'atorvastatin', 'losartan', 'bisoprolol', 'aspirin', 'ramipril',
  'calcium', 'vitd3', 'alendronate', 'calcitriol',
  'multivitamin', 'omega3', 'bcomplex', 'iron',
  'omeprazole', 'domperidone', 'lactulose', 'ranitidine', 'senna',
  'salbutamol', 'montelukast', 'cetirizine', 'theophylline',
  'donepezil', 'gabapentin', 'zolpidem', 'methylcobalamin', 'memantine', 'pregabalin'
];

const colors = ['4F46E5', '7C3AED', '2563EB', '0891B2', '059669', 'DC2626', 'EA580C', 'CA8A04'];

products.forEach((name, i) => {
  const color = colors[i % colors.length];
  const svg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="#${color}"/>
  <rect x="50" y="150" width="300" height="200" rx="10" fill="white" opacity="0.9"/>
  <text x="200" y="240" font-family="Arial, sans-serif" font-size="24" fill="#${color}" text-anchor="middle" font-weight="bold">${name.toUpperCase()}</text>
  <circle cx="100" cy="100" r="20" fill="white" opacity="0.5"/>
  <circle cx="300" cy="300" r="30" fill="white" opacity="0.3"/>
  <text x="200" y="280" font-family="Arial, sans-serif" font-size="14" fill="#333" text-anchor="middle">Medicine</text>
</svg>`;
  
  fs.writeFileSync(path.join(uploadDir, `${name}.svg`), svg);
});

console.log(`Created ${products.length} placeholder images in uploads/products/`);
