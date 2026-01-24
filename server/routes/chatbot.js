import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { chatbotSafety } from '../middleware/chatbotSafety.js';

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Try different model names - Gemini Pro should work
let model;
try {
  model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  console.log('✅ Gemini Pro model initialized successfully');
} catch (error) {
  console.warn('❌ Gemini Pro not available:', error.message);
  console.warn('🤖 Chatbot will use fallback responses');
  model = null;
}

// System prompt for pharmacy AI assistant
const SYSTEM_PROMPT = `You are an AI pharmacy assistant for Online24 Pharmacy, Bangladesh's trusted online pharmacy. You provide intelligent, helpful, and accurate information about medicines, health, and pharmacy services while maintaining strict safety guidelines.

CORE PRINCIPLES:
- NEVER provide medical advice, diagnoses, prescriptions, or treatment recommendations
- Always direct users to consult licensed healthcare professionals for medical decisions
- Be extremely cautious about anything that could be interpreted as medical advice
- Focus on general information, pharmacy services, and health education

SERVICES & CAPABILITIES:
- 5000+ medicines and healthcare products available
- Prescription upload, management, and reorder system
- Free delivery in Dhaka within 2-24 hours
- Multiple payment options: Cash on Delivery, bKash, Nagad, Credit/Debit cards
- 7-day return policy for sealed OTC medicines
- Real-time order tracking and status updates
- Prescription reminder system
- Account management and order history

RESPONSE GUIDELINES:
- Be friendly, professional, and conversational
- Provide detailed, helpful information about pharmacy services
- For medicine questions: Give general information from reliable sources only
- Include specific details about our services when relevant
- Ask clarifying questions when needed
- Keep responses informative but not overwhelming
- Always end with appropriate disclaimers

MEDICINE INFORMATION APPROACH:
- Provide general knowledge about common medicines
- Mention common uses (not specific treatments)
- Discuss general side effects from reliable sources
- Never suggest dosages, frequencies, or specific treatments
- Always recommend consulting pharmacists or doctors

CONVERSATION STYLE:
- Natural and engaging
- Use pharmacy-specific terminology appropriately
- Show enthusiasm for helping with pharmacy needs
- Be patient and thorough in explanations

Always respond in English unless specifically requested otherwise.`;


router.post('/', chatbotSafety, async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        answer: 'Please provide a message to chat about.',
        citations: [],
        language,
        caution: false,
      });
    }

    // Check if model is available
    if (!model) {
      return res.status(500).json({
        answer: 'AI service is currently unavailable. Please try again later or contact our support team.',
        citations: [],
        language,
        caution: false,
      });
    }

    // Create enhanced prompt with system context
    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser question: ${message}\n\nCurrent date: ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}\n\nPlease respond as a knowledgeable pharmacy assistant.`;

    // Send message using Gemini
    try {
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      let answer = response.text();

      // Clean up the response and ensure it's helpful
      answer = answer.trim();

      // If response is too short or generic, provide more context
      if (answer.length < 50) {
        answer += "\n\nIs there anything specific about our pharmacy services or medicine information I can help you with?";
      }

      // Add safety disclaimer if needed
      if (req.chatbotSafety?.caution) {
        answer += '\n\n⚠️ I cannot provide dosing or clinical advice. Please consult a licensed clinician or pharmacist.';
      }

      // Always add general disclaimer
      answer += '\n\nThis is general information only and not medical advice. For any treatment decisions, speak to a licensed clinician.';

      res.json({
        answer,
        citations: [], // Gemini doesn't provide citations in the same way
        language,
        caution: !!req.chatbotSafety?.caution,
        timestamp: new Date().toISOString(),
      });
    } catch (aiError) {
      console.error('Gemini API error:', aiError.message);

      // Provide helpful fallback responses based on common pharmacy questions
      let fallbackAnswer = '';

      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes('delivery') || lowerMessage.includes('shipping')) {
        fallbackAnswer = 'We offer free delivery in Dhaka within 2-24 hours for orders over ৳500. Delivery charges apply for orders under ৳500. You can track your order status in real-time through our website.';
      } else if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
        fallbackAnswer = 'We accept multiple payment methods: Cash on Delivery, bKash, Nagad, and all major credit/debit cards. Cash on Delivery is available for all locations.';
      } else if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
        fallbackAnswer = 'We have a 7-day return policy for sealed OTC medicines. Prescription medicines cannot be returned once dispensed. Please contact our support team for return requests.';
      } else if (lowerMessage.includes('prescription') || lowerMessage.includes('upload')) {
        fallbackAnswer = 'You can upload your prescriptions through our website. Our pharmacists will review them and contact you if needed. We ensure safe and accurate dispensing of all prescription medicines.';
      } else {
        fallbackAnswer = 'I\'m here to help with information about our pharmacy services. I can tell you about our delivery options, payment methods, return policy, prescription services, and general medicine information. What would you like to know?';
      }

      res.json({
        answer: fallbackAnswer,
        citations: [],
        language,
        caution: false,
        timestamp: new Date().toISOString(),
        fallback: true, // Indicate this is a fallback response
      });
    }

  } catch (error) {
    console.error('Gemini API error:', error);

    // Fallback response
    const fallbackAnswer = `I apologize for the temporary issue. I can help with questions about medicines, prescriptions, ordering, delivery, payments, account management, and using Online24 Pharmacy. Please try rephrasing your question or contact our support team.

This is general information only and not medical advice. For any treatment decisions, speak to a licensed clinician.`;

    res.status(200).json({
      answer: fallbackAnswer,
      citations: [],
      language: req.body?.language || 'en',
      caution: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;