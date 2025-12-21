/**
 * Secure field selection helpers for Prisma queries
 * Prevents accidental exposure of sensitive data
 */

export const userSelect = {
  id: true,
  email: true,
  phone: true,
  firstName: true,
  lastName: true,
  role: true,
  isVerified: true,
  isActive: true,
  createdAt: true,
  // passwordHash excluded by default
};

export const userPublicSelect = {
  id: true,
  firstName: true,
  lastName: true,
};

export const prescriptionSelect = {
  id: true,
  referenceNumber: true,
  userId: true,
  prescriptionImage: true,
  patientName: true,
  patientAge: true,
  doctorName: true,
  hospitalClinic: true,
  prescriptionDate: true,
  status: true,
  expiresAt: true,
  isReorderable: true,
  items: true,
  createdAt: true,
  updatedAt: true,
};

export const productSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  discountPrice: true,
  requiresPrescription: true,
  isOTC: true,
  strength: true,
  dosageForm: true,
  brand: true,
  images: true,
  stockQuantity: true,
  isActive: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    }
  },
};

export const orderSelect = {
  id: true,
  orderNumber: true,
  status: true,
  totalAmount: true,
  shippingCost: true,
  paymentMethod: true,
  paymentStatus: true,
  shippingAddress: true,
  deliveryDate: true,
  createdAt: true,
  orderItems: {
    select: {
      id: true,
      quantity: true,
      unitPrice: true,
      totalPrice: true,
      product: {
        select: productSelect,
      },
    },
  },
};

/**
 * Row-level security helper
 * Ensures users can only access their own data
 */
export const userOwnsResource = (userId, resourceUserId) => {
  return userId === resourceUserId;
};

/**
 * Admin check helper
 */
export const isAdmin = (user) => {
  return user?.role === 'ADMIN' || user?.role === 'PHARMACIST';
};
