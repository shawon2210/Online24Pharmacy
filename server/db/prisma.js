import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  console.log('prisma:init DATABASE_URL length', connectionString.length);
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? [
          { emit: 'stdout', level: 'warn' },
          { emit: 'stdout', level: 'error' }
        ]
      : [
          { emit: 'stdout', level: 'error' }
        ],
    errorFormat: 'pretty',
  });
};

let prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

const gracefulShutdown = async (signal) => {
  console.log(`\n[${signal}] Gracefully shutting down...`);
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export const getUserSafe = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getUserByEmailWithPassword = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const createAuditLog = async (
  userId,
  action,
  targetType,
  targetId,
  details,
  ipAddress,
  userAgent
) => {
  return prisma.auditLog.create({
    data: {
      userId,
      action,
      targetType,
      targetId,
      details: details ? JSON.stringify(details) : null,
      ipAddress,
      userAgent,
    },
  });
};

export const getUserOrdersSafe = async (
  userId,
  options
) => {
  return prisma.order.findMany({
    where: { userId },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
    skip: options?.skip,
    take: options?.take,
  });
};

export const getOrderDetails = async (
  orderId,
  userId
) => {
  return prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              discountPrice: true,
              images: true,
            },
          },
        },
      },
    },
  });
};

export const getUserPrescriptions = async (userId) => {
  return prisma.prescription.findMany({
    where: { userId },
    select: {
      id: true,
      referenceNumber: true,
      status: true,
      prescriptionDate: true,
      expiresAt: true,
      isReorderable: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getProductsByCategory = async (
  categoryId,
  options
) => {
  const orderBy =
    options?.sortBy === 'price_asc'
      ? { price: 'asc' }
      : options?.sortBy === 'price_desc'
      ? { price: 'desc' }
      : { createdAt: 'desc' };

  return prisma.product.findMany({
    where: {
      categoryId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      discountPrice: true,
      requiresPrescription: true,
      stockQuantity: true,
      images: true,
    },
    orderBy,
    skip: options?.skip,
    take: options?.take,
  });
};

export const checkProductAvailability = async (productId) => {
  return prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      stockQuantity: true,
      requiresPrescription: true,
      minStockLevel: true,
    },
  });
};

export const validatePrescriptionForOrder = async (
  prescriptionId,
  userId
) => {
  return prisma.prescription.findFirst({
    where: {
      id: prescriptionId,
      userId,
      status: 'APPROVED',
      expiresAt: {
        gt: new Date(),
      },
    },
  });
};

export const getUserActiveSessions = async (userId) => {
  return prisma.session.findMany({
    where: {
      userId,
      isRevoked: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  });
};

export const revokeAllUserSessions = async (userId) => {
  return prisma.session.updateMany({
    where: { userId },
    data: { isRevoked: true },
  });
};

export const createOrderWithInventoryUpdate = async (
  userId,
  items,
  orderData
) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId,
        ...orderData,
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
          })),
        },
      },
      include: { orderItems: true },
    });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    await tx.auditLog.create({
      data: {
        userId,
        action: 'ORDER_CREATED',
        targetType: 'Order',
        targetId: order.id,
        details: JSON.stringify({
          orderNumber: order.orderNumber,
          itemCount: items.length,
          total: order.totalAmount,
        }),
      },
    });

    return order;
  });
};

export default prisma;
