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

  // Create some test customer users
  const customer1Password = await bcrypt.hash('password123', 10);
  const customer1 = await prisma.user.upsert({
    where: { email: 'customer1@example.com' },
    update: {},
    create: {
      email: 'customer1@example.com',
      phone: '01712345678',
      passwordHash: customer1Password,
      firstName: 'John',
      lastName: 'Doe',
      isVerified: true,
      role: 'USER',
    },
  });
  console.log(`Created customer user: ${customer1.email}`);

  const customer2Password = await bcrypt.hash('password123', 10);
  const customer2 = await prisma.user.upsert({
    where: { email: 'customer2@example.com' },
    update: {},
    create: {
      email: 'customer2@example.com',
      phone: '01812345678',
      passwordHash: customer2Password,
      firstName: 'Jane',
      lastName: 'Smith',
      isVerified: true,
      role: 'USER',
    },
  });
  console.log(`Created customer user: ${customer2.email}`);

  const customer3Password = await bcrypt.hash('password123', 10);
  const customer3 = await prisma.user.upsert({
    where: { email: 'customer3@example.com' },
    update: {},
    create: {
      email: 'customer3@example.com',
      phone: '01912345678',
      passwordHash: customer3Password,
      firstName: 'Bob',
      lastName: 'Johnson',
      isVerified: false,
      role: 'USER',
    },
  });
  console.log(`Created customer user: ${customer3.email}`);

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

  const firstAid = await prisma.category.upsert({
    where: { slug: 'first-aid' },
    update: {},
    create: {
      name: 'First Aid',
      slug: 'first-aid',
      description: 'Essential first aid supplies and bandages.',
    },
  });

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

  const firstAidSupplies = await prisma.subcategory.upsert({
    where: { name_categoryId: { name: 'First Aid Supplies', categoryId: firstAid.id } },
    update: {},
    create: {
      name: 'First Aid Supplies',
      slug: 'first-aid-supplies',
      categoryId: firstAid.id,
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
    where: { sku: 'BANDAGE-ASSORTED' },
    update: {},
    create: {
      name: 'Assorted Bandages (100 pcs)',
      slug: 'assorted-bandages-100-pcs',
      sku: 'BANDAGE-ASSORTED',
      description: 'Assorted sizes of adhesive bandages for first aid.',
      price: 12.99,
      stockQuantity: 500,
      categoryId: firstAid.id,
      subcategoryId: firstAidSupplies.id,
      brand: 'MediCare',
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

  // 5.5. Create Sample Order
  const sampleOrder = await prisma.order.upsert({
    where: { orderNumber: 'ORD-2026-001' },
    update: {},
    create: {
      userId: customer1.id,
      orderNumber: 'ORD-2026-001',
      status: 'DELIVERED',
      totalAmount: 25.98,
      discountAmount: 0,
      shippingCost: 5.0,
      paymentMethod: 'CARD',
      paymentStatus: 'PAID',
      paymentId: 'PAY-123456',
      shippingAddress: '123 Main St, Dhaka',
      billingAddress: '123 Main St, Dhaka',
      notes: 'Sample order for testing',
    },
  });

  // Create order items
  await prisma.orderItem.upsert({
    where: { id: 'order-item-1' },
    update: {},
    create: {
      orderId: sampleOrder.id,
      productId: (await prisma.product.findFirst({ where: { sku: 'VITC-1000MG-100' } })).id,
      quantity: 1,
      unitPrice: 22.5,
      totalPrice: 22.5,
    },
  });

  await prisma.orderItem.upsert({
    where: { id: 'order-item-2' },
    update: {},
    create: {
      orderId: sampleOrder.id,
      productId: (await prisma.product.findFirst({ where: { sku: 'IBU-200MG-50' } })).id,
      quantity: 1,
      unitPrice: 9.99,
      totalPrice: 9.99,
    },
  });

  console.log('Created sample order');

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

  // Create some test prescriptions
  await prisma.prescription.upsert({
    where: { referenceNumber: 'RX-001' },
    update: {},
    create: {
      referenceNumber: 'RX-001',
      patientName: 'John Doe',
      prescriptionImage: '/uploads/prescriptions/sample1.jpg',
      status: 'PENDING',
      userId: customer1.id,
    },
  });

  await prisma.prescription.upsert({
    where: { referenceNumber: 'RX-002' },
    update: {},
    create: {
      referenceNumber: 'RX-002',
      patientName: 'Jane Smith',
      prescriptionImage: '/uploads/prescriptions/sample2.jpg',
      status: 'APPROVED',
      userId: customer2.id,
      verifiedBy: adminUser.id,
      verifiedAt: new Date(),
    },
  });

  await prisma.prescription.upsert({
    where: { referenceNumber: 'RX-003' },
    update: {},
    create: {
      referenceNumber: 'RX-003',
      patientName: 'Bob Johnson',
      prescriptionImage: '/uploads/prescriptions/sample3.jpg',
      status: 'REJECTED',
      userId: customer3.id,
      adminNotes: 'Invalid prescription',
      verifiedBy: adminUser.id,
      verifiedAt: new Date(),
    },
  });

  console.log('Created test prescriptions');

  // Create some test admin logs
  await prisma.adminLog.createMany({
    data: [
      {
        adminId: adminUser.id,
        action: 'APPROVE_PRESCRIPTION',
        targetType: 'Prescription',
        targetId: 'RX-002',
        details: { notes: 'Approved prescription for Jane Smith' },
        ipAddress: '192.168.1.100',
      },
      {
        adminId: adminUser.id,
        action: 'REJECT_PRESCRIPTION',
        targetType: 'Prescription',
        targetId: 'RX-003',
        details: { notes: 'Rejected invalid prescription for Bob Johnson' },
        ipAddress: '192.168.1.100',
      },
      {
        adminId: adminUser.id,
        action: 'UPDATE_PRODUCT',
        targetType: 'Product',
        targetId: 'prod-123',
        details: { field: 'stockQuantity', oldValue: 10, newValue: 20 },
        ipAddress: '192.168.1.101',
      },
      {
        adminId: adminUser.id,
        action: 'DISABLE_USER',
        targetType: 'User',
        targetId: customer3.id,
        details: { reason: 'Account verification pending' },
        ipAddress: '192.168.1.102',
      },
      {
        adminId: adminUser.id,
        action: 'CREATE_CATEGORY',
        targetType: 'Category',
        targetId: surgical.id,
        details: { name: 'Surgical Products' },
        ipAddress: '192.168.1.103',
      },
    ],
    skipDuplicates: true,
  });

  console.log('Created test admin logs');

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
