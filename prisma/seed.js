// prisma/seed.js
import pkg from '@prisma/client';
import bcrypt from 'bcryptjs';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // 1. Create an Admin User
  const adminPassword = await bcrypt.hash('password123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pharmacy.com' },
    update: {},
    create: {
      email: 'admin@pharmacy.com',
      phone: '1234567890',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      isVerified: true,
      role: 'ADMIN',
    },
  });
  console.log(`Created admin user: ${adminUser.email}`);

  // 2. Create Categories
  const surgical = await prisma.category.upsert({
    where: { slug: 'surgical-products' },
    update: {},
    create: {
      name: 'Surgical Products',
      slug: 'surgical-products',
      description: 'Instruments and supplies for surgical procedures.',
    },
  });

  const vitamins = await prisma.category.upsert({
    where: { slug: 'vitamins-and-supplements' },
    update: {},
    create: {
      name: 'Vitamins & Supplements',
      slug: 'vitamins-and-supplements',
      description: 'Dietary supplements to support overall health.',
    },
  });

  const painRelief = await prisma.category.upsert({
    where: { slug: 'pain-relief' },
    update: {},
    create: {
      name: 'Pain Relief',
      slug: 'pain-relief',
      description: 'Medications for relieving pain.',
    },
  });

  console.log('Created categories');

  // 3. Create Subcategories
  const generalSurgical = await prisma.subcategory.upsert({
    where: { name_categoryId: { name: 'General Surgical Supplies', categoryId: surgical.id } },
    update: {},
    create: {
      name: 'General Surgical Supplies',
      slug: 'general-surgical-supplies',
      categoryId: surgical.id,
    },
  });

  const generalHealth = await prisma.subcategory.upsert({
    where: { name_categoryId: { name: 'General Health', categoryId: vitamins.id } },
    update: {},
    create: {
      name: 'General Health',
      slug: 'general-health',
      categoryId: vitamins.id,
    },
  });

  const otcPainRelief = await prisma.subcategory.upsert({
    where: { name_categoryId: { name: 'Over-the-Counter', categoryId: painRelief.id } },
    update: {},
    create: {
      name: 'Over-the-Counter',
      slug: 'over-the-counter',
      categoryId: painRelief.id,
    },
  });

  console.log('Created subcategories');

  // 4. Create Products
  await prisma.product.upsert({
    where: { sku: 'SURG-MASK-50' },
    update: {},
    create: {
      name: 'Surgical Face Mask (50 pcs)',
      slug: 'surgical-face-mask-50-pcs',
      sku: 'SURG-MASK-50',
      description: 'High-quality 3-ply surgical face masks for general use.',
      price: 15.99,
      stockQuantity: 1000,
      categoryId: surgical.id,
      subcategoryId: generalSurgical.id,
      brand: 'MediCare',
      isOTC: true,
      requiresPrescription: false,
      images: '["/uploads/products/placeholder.jpg"]',
    },
  });

  await prisma.product.upsert({
    where: { sku: 'VITC-1000MG-100' },
    update: {},
    create: {
      name: 'Vitamin C 1000mg (100 tablets)',
      slug: 'vitamin-c-1000mg-100-tablets',
      sku: 'VITC-1000MG-100',
      description: 'Supports immune system health.',
      price: 22.5,
      stockQuantity: 500,
      categoryId: vitamins.id,
      subcategoryId: generalHealth.id,
      brand: 'HealthFirst',
      isOTC: true,
      requiresPrescription: false,
      images: '["/uploads/products/placeholder.jpg"]',
    },
  });

  await prisma.product.upsert({
    where: { sku: 'IBU-200MG-50' },
    update: {},
    create: {
      name: 'Ibuprofen 200mg (50 tablets)',
      slug: 'ibuprofen-200mg-50-tablets',
      sku: 'IBU-200MG-50',
      description: 'For temporary relief of minor aches and pains.',
      price: 9.99,
      stockQuantity: 800,
      categoryId: painRelief.id,
      subcategoryId: otcPainRelief.id,
      brand: 'Generic',
      isOTC: true,
      requiresPrescription: false,
      images: '["/uploads/products/placeholder.jpg"]',
    },
  });

  await prisma.product.upsert({
    where: { sku: 'AMOX-500MG-30' },
    update: {},
    create: {
      name: 'Amoxicillin 500mg (30 capsules)',
      slug: 'amoxicillin-500mg-30-capsules',
      sku: 'AMOX-500MG-30',
      description: 'A penicillin antibiotic used to treat a wide variety of bacterial infections.',
      price: 35.0,
      stockQuantity: 200,
      categoryId: painRelief.id, // Note: This is just for example, category should be 'Antibiotics'
      subcategoryId: otcPainRelief.id,
      brand: 'PharmaCo',
      isOTC: false,
      requiresPrescription: true,
      images: '["/uploads/products/placeholder.jpg"]',
    },
  });

  console.log('Created products');

  // 6. Create Pickup Locations
  await prisma.pickupLocation.upsert({
    where: { name: 'Online24 Pharma - Dhanmondi' },
    update: {},
    create: {
      name: 'Online24 Pharma - Dhanmondi',
      address: 'House 12, Road 27, Dhanmondi, Dhaka',
      lat: 23.78,
      lng: 90.4,
      open_hours: '9:00 AM – 9:00 PM',
      is_active: true,
    },
  });

  await prisma.pickupLocation.upsert({
    where: { name: 'Online24 Pharma - Gulshan' },
    update: {},
    create: {
      name: 'Online24 Pharma - Gulshan',
      address: 'Gulshan Avenue, Dhaka',
      lat: 23.7925,
      lng: 90.4078,
      open_hours: '8:00 AM – 10:00 PM',
      is_active: true,
    },
  });

  await prisma.pickupLocation.upsert({
    where: { name: 'Online24 Pharma - Uttara' },
    update: {},
    create: {
      name: 'Online24 Pharma - Uttara',
      address: 'Sector 7, Uttara, Dhaka',
      lat: 23.8679,
      lng: 90.4003,
      open_hours: '10:00 AM – 8:00 PM',
      is_active: true,
    },
  });

  console.log('Created pickup locations');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
