import express from 'express';
import { authenticateToken } from '../middleware/roleAuth.js';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

const PRODUCTS_FILE = path.resolve(process.cwd(), 'server', 'data', 'products.json');
const ORDERS_FILE = path.resolve(process.cwd(), 'server', 'data', 'orders.json');

async function readProductsFile() {
  try {
    const raw = await fs.readFile(PRODUCTS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error('Error reading products file:', e.message);
    return [];
  }
}

async function readOrdersFile() {
  try {
    const raw = await fs.readFile(ORDERS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error('Error reading orders file:', e.message);
    return [];
  }
}

async function writeOrdersFile(orders) {
  try {
    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch (e) {
    console.error('Error writing orders file:', e.message);
  }
}

// Create order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id || req.user._id;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Read products from file
    const allProducts = await readProductsFile();
    const productMap = {};
    allProducts.forEach(p => { productMap[p.id || p._id] = p; });

    // Validate items and check stock
    for (const item of items) {
      const product = productMap[item.productId];
      if (!product) {
        return res.status(400).json({ error: `Product ${item.productId} not found` });
      }
      const availableStock = product.stock ?? product.stockQuantity ?? 0;
      if (availableStock < item.quantity) {
        return res.status(400).json({ error: `${product.name} is out of stock` });
      }
    }

    // Calculate total
    const totalAmount = items.reduce((sum, item) => {
      const product = productMap[item.productId];
      const price = product.discountPrice || product.salePrice || product.price || 0;
      return sum + price * item.quantity;
    }, 0);

    // Generate order number
    const orderNumber = 'LP' + Date.now().toString().slice(-8);

    // Create order object
    const order = {
      _id: `order_${Date.now()}`,
      id: `order_${Date.now()}`,
      userId,
      orderNumber,
      status: 'confirmed',
      totalAmount,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: 'pending',
      shippingAddress,
      billingAddress: shippingAddress,
      orderItems: items.map(item => {
        const product = productMap[item.productId];
        return {
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: product.price || 0,
          totalPrice: (product.price || 0) * item.quantity
        };
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update product stock in file
    for (const item of items) {
      const product = allProducts.find(p => (p.id || p._id) === item.productId);
      if (product) {
        if (product.stock !== null && product.stock !== undefined) {
          product.stock -= item.quantity;
        } else if (product.stockQuantity !== null && product.stockQuantity !== undefined) {
          product.stockQuantity -= item.quantity;
        }
      }
    }
    
    // Save updated products
    try {
      await fs.writeFile(PRODUCTS_FILE, JSON.stringify(allProducts, null, 2));
    } catch (e) {
      console.error('Error writing products file:', e.message);
    }

    // Save order to file
    const orders = await readOrdersFile();
    orders.push(order);
    await writeOrdersFile(orders);

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get all orders for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const orders = await readOrdersFile();
    const userOrders = orders.filter(o => o.userId === userId);
    res.json({ orders: userOrders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id || req.user._id;

    const orders = await readOrdersFile();
    const order = orders.find(o => (o.id === orderId || o._id === orderId) && o.userId === userId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;
