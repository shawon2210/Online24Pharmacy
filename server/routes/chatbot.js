import express from 'express';
import { chatbotSafety } from '../middleware/chatbotSafety.js';
import { queryDocuments, upsertDocuments } from '../utils/vectorClient.js';
import { buildChatbotCorpus } from '../utils/chatbotCorpus.js';

const router = express.Router();
let corpusReady = false;

async function ensureCorpusLoaded() {
  if (corpusReady) return;
  const docs = await buildChatbotCorpus();
  await upsertDocuments(docs);
  corpusReady = true;
}

function buildAnswer({ passages, caution }) {
  const bullets = passages
    .map((p) => `• ${p.text}`)
    .join('\n');

  const cautionLine = caution
    ? '⚠️ I cannot provide dosing or clinical advice. Please consult a licensed clinician or pharmacist.'
    : '';

  return [
    'Here is information I found:',
    bullets,
    cautionLine,
    'This is general information only and not medical advice. For any treatment decisions, speak to a licensed clinician.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

function generateSmartFallbackAnswer(userMessage, _language = 'en') {
  // Analyze the message to provide contextually relevant fallback
  const msg = userMessage.toLowerCase();
  const isAccountRelated = /account|profile|login|register|password|email|phone/i.test(msg);
  const isOrderRelated = /order|cart|checkout|payment|bill|invoice/i.test(msg);
  const isPrescriptionRelated = /prescription|rx|script|reorder|medicine|drug/i.test(msg);
  const isDeliveryRelated = /delivery|shipping|track|address|when|how long|arrive/i.test(msg);
  const isProductRelated = /product|medicine|drug|tablet|capsule|price|cost|available/i.test(msg);
  const isReturnRelated = /return|refund|exchange|money back|damaged/i.test(msg);
  const isPaymentRelated = /payment|cod|bkash|nagad|card|price/i.test(msg);

  const smartResponses = [
    isAccountRelated && `I understand you're asking about your account. You can manage your profile, change password, update contact info, and view your transaction history in your account settings. Need more specific help?`,
    isOrderRelated && `You're asking about orders and checkout. I can help with placing orders, applying coupons, selecting payment methods (COD, bKash, Nagad), and viewing order status.`,
    isPrescriptionRelated && `I see you're asking about prescriptions. You can upload prescriptions, reorder from previous prescriptions, set reminders, and manage your prescription history.`,
    isDeliveryRelated && `You're asking about delivery. We offer free delivery in Dhaka within 2-24 hours. You can track your order in real-time and see estimated delivery time.`,
    isProductRelated && `You're asking about our medicines and products. We have 5000+ medicines and healthcare products. You can search, filter by price, check if prescription is needed, and read reviews.`,
    isReturnRelated && `You're asking about returns and refunds. We accept returns within 7 days for sealed OTC medicines. Some items like surgical products and opened medicines are non-returnable.`,
    isPaymentRelated && `You're asking about payment. We accept Cash on Delivery, bKash, Nagad, and Credit/Debit cards. All payments are secure and PCI-DSS compliant.`,
    `I understand your question about "${userMessage}". While I don't have specific information in my current knowledge base, I can help with: medicine questions, prescription management, ordering, delivery, payments, account management, and returns. Try rephrasing or asking about one of these topics!`
  ];

  const relevantResponse = smartResponses.find(r => r) || smartResponses[smartResponses.length - 1];
  return relevantResponse;
}


router.post('/', chatbotSafety, async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;

    // Ensure corpus is loaded with timeout
    try {
      await Promise.race([
        ensureCorpusLoaded(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Corpus load timeout')), 10000))
      ]);
    } catch (corpusErr) {
      console.warn('Corpus load warning:', corpusErr.message);
      // Continue with empty results, fallback will handle it
    }

    // Query documents with fallback
    let passages = [];
    try {
      passages = await queryDocuments(message, 4) || [];
    } catch (queryErr) {
      console.warn('Query documents error:', queryErr.message);
    }

    // Always provide a meaningful response
    let answer;
    let citations = [];

    if (passages && passages.length > 0) {
      answer = buildAnswer({ passages, caution: req.chatbotSafety?.caution });
      citations = passages.map((p) => ({ title: p.title, source: p.source, url: p.url }));
    } else {
      // Smart fallback based on message content
      answer = generateSmartFallbackAnswer(message, language);
    }

    res.json({
      answer,
      citations,
      language,
      caution: !!req.chatbotSafety?.caution,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chatbot endpoint error:', error);
    // Always respond with something helpful
    res.status(200).json({
      answer: 'I apologize for the temporary issue. I can help with questions about medicines, prescriptions, ordering, and using Online24 Pharmacy. Please try rephrasing your question.',
      citations: [],
      language: req.body?.language || 'en',
      caution: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;