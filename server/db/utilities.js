/**
 * ============================================
 * DATABASE UTILITIES & SECURITY PATTERNS
 * ============================================
 * 
 * Reusable, type-safe database helpers
 * Following security best practices
 */

import prisma, {
  getUserSafe,
  getUserByEmailWithPassword,
  createAuditLog,
  getUserOrdersSafe,
  getOrderDetails,
  getUserPrescriptions,
  // removed unused helpers: getProductsByCategory, checkProductAvailability, validatePrescriptionForOrder
  getUserActiveSessions,
  revokeAllUserSessions,
  createOrderWithInventoryUpdate,
} from './prisma.js';

/**
 * ============================================
 * USER OPERATIONS
 * ============================================
 */

/**
 * Create new user account
 * Passwords should be hashed before calling
 */
export const createUser = async (data) => {
  try {
    const user = await prisma.user.create({
      data: {
        ...data,
        role: data.role || 'USER',
      },
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
      },
    };
  } catch (error) {
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      return {
        success: false,
        error: `${field} already exists`,
      };
    }
    throw error;
  }
};

/**
 * Authenticate user
 */
export const authenticateUser = async (email) => {
  return getUserByEmailWithPassword(email);
};

/**
 * Get user profile (safe)
 */
export const getUserProfile = async (userId) => {
  return getUserSafe(userId);
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
  await createAuditLog(userId, 'PROFILE_UPDATED', 'User', userId);

  return prisma.user.update({
    where: { id: userId },
    data: updates,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      gender: true,
    },
  });
};

/**
 * Verify user email
 */
export const verifyUserEmail = async (userId) => {
  await createAuditLog(userId, 'EMAIL_VERIFIED', 'User', userId);

  return prisma.user.update({
    where: { id: userId },
    data: { isVerified: true },
  });
};

/**
 * ============================================
 * PRODUCT OPERATIONS
 * ============================================
 */

/**
 * Get all active products with pagination
 */
export const getAllProducts = async (page = 1, pageSize = 20, filters) => {
  const skip = (page - 1) * pageSize;

  const where = { isActive: true };

  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }
  if (filters?.requiresPrescription !== undefined) {
    where.requiresPrescription = filters.requiresPrescription;
  }
  if (filters?.minPrice || filters?.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = filters.minPrice;
    if (filters.maxPrice) where.price.lte = filters.maxPrice;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

/**
 * Get product by ID with details
 */
export const getProductDetails = async (productId) => {
  return prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      shortDescription: true,
      price: true,
      discountPrice: true,
      requiresPrescription: true,
      isOTC: true,
      strength: true,
      dosageForm: true,
      packSize: true,
      genericName: true,
      brand: true,
      manufacturer: true,
      stockQuantity: true,
      images: true,
      category: {
        select: { id: true, name: true },
      },
      reviews: {
        where: { status: 'approved' },
        select: {
          id: true,
          rating: true,
          comment: true,
          user: {
            select: { firstName: true, lastName: true },
          },
        },
      },
    },
  });
};

/**
 * Search products by name or description
 */
export const searchProducts = async (query, page = 1, pageSize = 20) => {
  const skip = (page - 1) * pageSize;

  const where = {
    isActive: true,
    OR: [
      { name: { search: query } },
      { description: { search: query } },
      { genericName: { search: query } },
    ],
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        discountPrice: true,
        images: true,
      },
      skip,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    query,
  };
};

/**
 * ============================================
 * ORDER OPERATIONS
 * ============================================
 */

/**
 * Create order (with inventory update)
 * Atomic transaction - all or nothing
 */
export const createOrder = async (userId, orderData, ipAddress) => {
  const orderNumber = `ORD-${Date.now()}`;

  try {
    const order = await createOrderWithInventoryUpdate(userId, orderData.items, {
      userId,
      orderNumber,
      status: 'PENDING',
      totalAmount: orderData.totalAmount,
      discountAmount: orderData.discountAmount || 0,
      shippingCost: orderData.shippingCost || 0,
      paymentMethod: orderData.paymentMethod || 'COD',
      paymentStatus: 'PENDING',
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress,
      prescriptionId: orderData.prescriptionId,
    });

    await createAuditLog(
      userId,
      'ORDER_CREATED',
      'Order',
      order.id,
      { orderNumber: order.orderNumber, total: order.totalAmount },
      ipAddress
    );

    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error('Order creation failed:', error);
    return {
      success: false,
      error: 'Failed to create order. Please try again.',
    };
  }
};

/**
 * Get user's orders
 */
export const getUserOrders = async (userId, page = 1) => {
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const orders = await getUserOrdersSafe(userId, { skip, take: pageSize });

  const total = await prisma.order.count({ where: { userId } });

  return {
    orders,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

/**
 * Get specific order (with row-level security)
 */
export const getOrder = async (orderId, userId) => {
  return getOrderDetails(orderId, userId);
};

/**
 * Update order status (admin only)
 */
export const updateOrderStatus = async (orderId, status, adminId, notes) => {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status, notes },
  });

  await createAuditLog(
    adminId,
    'ORDER_STATUS_UPDATED',
    'Order',
    orderId,
    { newStatus: status, notes }
  );

  return order;
};

/**
 * ============================================
 * PRESCRIPTION OPERATIONS
 * ============================================
 */

/**
 * Upload prescription
 */
export const uploadPrescription = async (userId, data, ipAddress) => {
  const referenceNumber = `RX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const prescription = await prisma.prescription.create({
    data: {
      userId,
      referenceNumber,
      status: 'PENDING',
      ...data,
    },
  });

  await createAuditLog(
    userId,
    'PRESCRIPTION_UPLOADED',
    'Prescription',
    prescription.id,
    { referenceNumber },
    ipAddress
  );

  return prescription;
};

/**
 * Get user's prescriptions
 */
export const getUserPrescriptionsList = async (userId) => {
  return getUserPrescriptions(userId);
};

/**
 * Approve prescription (admin only)
 */
export const approvePrescription = async (prescriptionId, adminId, adminNotes) => {
  const prescription = await prisma.prescription.update({
    where: { id: prescriptionId },
    data: {
      status: 'APPROVED',
      verifiedBy: adminId,
      verifiedAt: new Date(),
      adminNotes,
    },
  });

  await createAuditLog(
    adminId,
    'PRESCRIPTION_APPROVED',
    'Prescription',
    prescriptionId,
    { reason: adminNotes }
  );

  return prescription;
};

/**
 * Reject prescription
 */
export const rejectPrescription = async (prescriptionId, adminId, reason) => {
  const prescription = await prisma.prescription.update({
    where: { id: prescriptionId },
    data: {
      status: 'REJECTED',
      verifiedBy: adminId,
      verifiedAt: new Date(),
      adminNotes: reason,
    },
  });

  await createAuditLog(
    adminId,
    'PRESCRIPTION_REJECTED',
    'Prescription',
    prescriptionId,
    { reason }
  );

  return prescription;
};

/**
 * ============================================
 * CART OPERATIONS
 * ============================================
 */

/**
 * Add to cart
 */
export const addToCart = async (userId, productId, quantity) => {
  try {
    const cartItem = await prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: { quantity },
      create: { userId, productId, quantity },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            discountPrice: true,
          },
        },
      },
    });

    return { success: true, cartItem };
  } catch (error) {
    console.error('Add to cart failed:', error);
    return { success: false, error: 'Failed to add to cart' };
  }
};

/**
 * Get user's cart
 */
export const getCart = async (userId) => {
  return prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          discountPrice: true,
          stockQuantity: true,
          images: true,
        },
      },
    },
  });
};

/**
 * Remove from cart
 */
export const removeFromCart = async (userId, productId) => {
  return prisma.cartItem.delete({
    where: { userId_productId: { userId, productId } },
  });
};

/**
 * Clear cart
 */
export const clearCart = async (userId) => {
  return prisma.cartItem.deleteMany({
    where: { userId },
  });
};

/**
 * ============================================
 * WISHLIST OPERATIONS
 * ============================================
 */

/**
 * Add to wishlist
 */
export const addToWishlist = async (userId, productId) => {
  try {
    const item = await prisma.wishlistItem.create({
      data: { userId, productId },
    });
    return { success: true, item };
  } catch (error) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Already in wishlist' };
    }
    throw error;
  }
};

/**
 * Get user's wishlist
 */
export const getWishlist = async (userId) => {
  return prisma.wishlistItem.findMany({
    where: { userId },
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
  });
};

/**
 * Remove from wishlist
 */
export const removeFromWishlist = async (userId, productId) => {
  return prisma.wishlistItem.delete({
    where: { userId_productId: { userId, productId } },
  });
};

/**
 * ============================================
 * ADDRESS OPERATIONS
 * ============================================
 */

/**
 * Add new address
 */
export const addAddress = async (userId, data) => {
  return prisma.address.create({
    data: { userId, ...data },
  });
};

/**
 * Get user's addresses
 */
export const getUserAddresses = async (userId) => {
  return prisma.address.findMany({
    where: { userId },
    orderBy: { isDefault: 'desc' },
  });
};

/**
 * Update address
 */
export const updateAddress = async (addressId, userId, data) => {
  return prisma.address.update({
    where: { id: addressId, userId }, // Ensure user owns address
    data,
  });
};

/**
 * Set default address
 */
export const setDefaultAddress = async (userId, addressId) => {
  await prisma.address.updateMany({
    where: { userId },
    data: { isDefault: false },
  });

  return prisma.address.update({
    where: { id: addressId },
    data: { isDefault: true },
  });
};

/**
 * ============================================
 * NOTIFICATION OPERATIONS
 * ============================================
 */

/**
 * Create notification
 */
export const createNotification = async (userId, data) => {
  return prisma.notification.create({
    data: { userId, ...data },
  });
};

/**
 * Get user's notifications
 */
export const getUserNotifications = async (userId) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};

/**
 * ============================================
 * SESSION OPERATIONS
 * ============================================
 */

/**
 * Get user's active sessions
 */
export const getActiveSessions = async (userId) => {
  return getUserActiveSessions(userId);
};

/**
 * Logout from all devices
 */
export const logoutAllDevices = async (userId) => {
  await createAuditLog(userId, 'LOGOUT_ALL_DEVICES', 'User', userId);
  return revokeAllUserSessions(userId);
};

export default {
  // Users
  createUser,
  authenticateUser,
  getUserProfile,
  updateUserProfile,
  verifyUserEmail,

  // Products
  getAllProducts,
  getProductDetails,
  searchProducts,

  // Orders
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,

  // Prescriptions
  uploadPrescription,
  getUserPrescriptionsList,
  approvePrescription,
  rejectPrescription,

  // Cart
  addToCart,
  getCart,
  removeFromCart,
  clearCart,

  // Wishlist
  addToWishlist,
  getWishlist,
  removeFromWishlist,

  // Addresses
  addAddress,
  getUserAddresses,
  updateAddress,
  setDefaultAddress,

  // Notifications
  createNotification,
  getUserNotifications,
  markNotificationAsRead,

  // Sessions
  getActiveSessions,
  logoutAllDevices,
};
