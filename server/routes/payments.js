import express from 'express';
import axios from 'axios';
import prisma from '../db/prisma.js';
import { authenticateToken } from '../middleware/roleAuth.js';

const router = express.Router();

// bKash payment creation
router.post('/bkash/create', authenticateToken, async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user.id }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // bKash API integration
    const bkashResponse = await axios.post('https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/create', {
      mode: '0011',
      payerReference: req.user.id,
      callbackURL: `${process.env.FRONTEND_URL}/payment/callback`,
      amount: amount.toString(),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: order.orderNumber
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BKASH_ID_TOKEN}`,
        'X-APP-Key': process.env.BKASH_APP_KEY
      }
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { 
        paymentId: bkashResponse.data.paymentID,
        paymentStatus: 'pending'
      }
    });

    res.json({
      paymentID: bkashResponse.data.paymentID,
      bkashURL: bkashResponse.data.bkashURL
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Payment creation failed' });
  }
});

// Nagad payment creation
router.post('/nagad/create', authenticateToken, async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user.id }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Nagad API integration
    const nagadResponse = await axios.post('https://api.mynagad.com/api/dfs/check-out/initialize', {
      merchantId: process.env.NAGAD_MERCHANT_ID,
      orderId: order.orderNumber,
      amount: amount.toString(),
      currencyCode: '050',
      challenge: generateNagadChallenge()
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-KM-Api-Version': 'v-0.2.0',
        'X-KM-IP-V4': req.ip,
        'X-KM-Client-Type': 'PC_WEB'
      }
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { 
        paymentId: nagadResponse.data.paymentReferenceId,
        paymentStatus: 'pending'
      }
    });

    res.json({
      paymentReferenceId: nagadResponse.data.paymentReferenceId,
      callBackUrl: nagadResponse.data.callBackUrl
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Payment creation failed' });
  }
});

// Payment verification
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { paymentId, status } = req.body;

    const order = await prisma.order.findFirst({
      where: { paymentId, userId: req.user.id }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { 
        paymentStatus: status === 'success' ? 'completed' : 'failed',
        status: status === 'success' ? 'confirmed' : 'cancelled'
      }
    });

    res.json({ message: 'Payment verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

function generateNagadChallenge() {
  return Math.random().toString(36).substring(2, 15);
}

export default router;