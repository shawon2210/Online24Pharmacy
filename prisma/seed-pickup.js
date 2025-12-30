import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Upsert a product
  const product = await prisma.product.upsert({
    where: { slug: 'surgical-gloves' },
    update: {},
    create: {
      name: 'Surgical Gloves',
      slug: 'surgical-gloves',
      description: 'A pair of surgical gloves.',
      price: 10.0,
      stockQuantity: 100,
      subcategoryId: 'cmjqru6bw0002v14sxnxwb3fp',
    },
  });

  // Upsert a pickup location
  const location = await prisma.pickupLocation.upsert({
    where: { name: 'Online24 Pharma - Dhanmondi' },
    update: {},
    create: {
      name: 'Online24 Pharma - Dhanmondi',
      address: 'House 12, Road 27, Dhanmondi, Dhaka',
      lat: 23.78,
      lng: 90.4,
      open_hours: '9:00 AM – 9:00 PM',
    },
  });

  // Upsert inventory for the product at the location
  await prisma.inventory.upsert({
    where: {
      productId_locationId: {
        productId: product.id,
        locationId: location.id,
      },
    },
    update: {
      stock_quantity: 50,
      quantity: 50,
    },
    create: {
      product: {
        connect: {
          id: product.id,
        },
      },
      location: {
        connect: {
          id: location.id,
        },
      },
      stock_quantity: 50,
      quantity: 50,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
