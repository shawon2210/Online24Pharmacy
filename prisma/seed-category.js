import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a category
  const category = await prisma.category.create({
    data: {
      name: 'Surgical',
      slug: 'surgical',
    },
  });

  // Create a subcategory
  const subcategory = await prisma.subcategory.create({
    data: {
      name: 'Gloves',
      slug: 'gloves',
      categoryId: category.id,
    },
  });

  console.log({ category, subcategory });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
