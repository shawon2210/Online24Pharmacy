/**
 * ============================================
 * AI-POWERED PHARMACY ASSISTANT
 * ============================================
 * 
 * Intelligent chatbot with natural language processing
 * Features:
 * - Intent recognition and classification
 * - Symptom detection and medicine recommendations
 * - Emergency detection with safety protocols
 * - Multi-language support (English/Bengali)
 * - Context-aware conversation management
 * - DGDA-compliant medical advice
 */

import pharmacyKnowledge from '../data/pharmacyKnowledge';

class PharmacyAI {
  constructor() {
    this.knowledge = pharmacyKnowledge;
    this.conversationHistory = [];
    this.userContext = {
      symptoms: [],
      medications: [],
      preferences: {}
    };
  }

  /**
   * ============================================
   * NATURAL LANGUAGE PROCESSING
   * ============================================
   */

  /**
   * Analyze user message and detect intent
   * Uses pattern matching and keyword detection
   * 
   * @param {string} message - User's input message
   * @returns {Object} Intent analysis with confidence score
   * @returns {string} returns.intent - Detected intent type
   * @returns {number} returns.confidence - Confidence score (0-1)
   * @returns {string} [returns.target] - Specific target (symptom, medicine, etc.)
   */
  analyzeIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    // Emergency Detection (highest priority)
    if (this.detectEmergency(lowerMessage)) {
      return { intent: 'emergency', confidence: 1.0, urgency: 'critical' };
    }

    // Greeting Detection
    if (this.detectGreeting(lowerMessage)) {
      return { intent: 'greeting', confidence: 0.9 };
    }

    // Symptom Detection
    const symptomMatch = this.detectSymptom(lowerMessage);
    if (symptomMatch) {
      return { intent: 'symptom', target: symptomMatch, confidence: 0.85 };
    }

    // Medicine Query Detection
    const medicineMatch = this.detectMedicine(lowerMessage);
    if (medicineMatch) {
      return { intent: 'medicine', target: medicineMatch, confidence: 0.85 };
    }

    // Store Info Detection
    const storeInfoMatch = this.detectStoreInfo(lowerMessage);
    if (storeInfoMatch) {
      return { intent: 'storeInfo', target: storeInfoMatch, confidence: 0.8 };
    }

    // Order Related
    if (this.detectOrderQuery(lowerMessage)) {
      return { intent: 'order', confidence: 0.8 };
    }

    // Category Search
    const categoryMatch = this.detectCategory(lowerMessage);
    if (categoryMatch) {
      return { intent: 'category', target: categoryMatch, confidence: 0.75 };
    }

    // FAQ Detection
    const faqMatch = this.detectFAQ(lowerMessage);
    if (faqMatch) {
      return { intent: 'faq', target: faqMatch, confidence: 0.7 };
    }

    return { intent: 'unknown', confidence: 0.3 };
  }

  /**
   * Detect medical emergencies in user message
   * Critical for user safety - highest priority detection
   * 
   * @param {string} message - Lowercase user message
   * @returns {boolean} True if emergency keywords detected
   */
  detectEmergency(message) {
    const emergencyKeywords = [
      'emergency', 'urgent', 'help', 'dying', 'severe pain', 'can\'t breathe',
      'chest pain', 'heart attack', 'overdose', 'poisoning', 'suicide',
      'unconscious', 'bleeding heavily', 'stroke', 'seizure',
      'জরুরী', 'জরুরি', 'বাঁচান', 'হার্ট অ্যাটাক'
    ];
    
    return emergencyKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Detect greeting messages
   * Supports English and Bengali greetings
   * 
   * @param {string} message - Lowercase user message
   * @returns {boolean} True if greeting detected
   */
  detectGreeting(message) {
    const greetings = [
      'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
      'assalamu alaikum', 'salam', 'হ্যালো', 'হাই', 'আসসালামু আলাইকুম',
      'সালাম', 'নমস্কার', 'প্রণাম'
    ];
    
    return greetings.some(greeting => message.includes(greeting));
  }

  /**
   * Detect symptoms in user message
   * Uses keyword matching and regex patterns
   * Updates user context with detected symptoms
   * 
   * @param {string} message - Lowercase user message
   * @returns {string|null} Symptom key if detected, null otherwise
   */
  detectSymptom(message) {
    const symptoms = this.knowledge.symptoms;
    
    // Check knowledge base for symptom keywords
    for (const [key, symptom] of Object.entries(symptoms)) {
      const matched = symptom.keywords.some(keyword => 
        message.includes(keyword.toLowerCase())
      );
      
      if (matched) {
        // Track symptom in user context for follow-up
        if (!this.userContext.symptoms.includes(key)) {
          this.userContext.symptoms.push(key);
        }
        return key;
      }
    }
    
    // Advanced pattern matching for natural language descriptions
    const symptomPatterns = [
      { pattern: /have (a |an )?(fever|temperature|high temp)/, symptom: 'fever' },
      { pattern: /feeling (hot|feverish|burning)/, symptom: 'fever' },
      { pattern: /(head|headache|migraine) (pain|ache|hurts)/, symptom: 'headache' },
      { pattern: /my head (hurts|is hurting|aches)/, symptom: 'headache' },
      { pattern: /(cough|coughing|throat)/, symptom: 'cough' },
      { pattern: /(cold|runny nose|congestion|sneezing)/, symptom: 'cold' },
      { pattern: /(stomach|belly|tummy|gastric) (pain|ache|hurt)/, symptom: 'stomachPain' },
      { pattern: /(acid|acidity|heartburn|indigestion)/, symptom: 'stomachPain' }
    ];
    
    for (const { pattern, symptom } of symptomPatterns) {
      if (pattern.test(message)) {
        if (!this.userContext.symptoms.includes(symptom)) {
          this.userContext.symptoms.push(symptom);
        }
        return symptom;
      }
    }
    
    return null;
  }

  /**
   * Detect medicine names in user message
   * Matches against knowledge base and generic queries
   * 
   * @param {string} message - Lowercase user message
   * @returns {string|null} Medicine key if detected
   */
  detectMedicine(message) {
    const medicines = this.knowledge.medicines;
    
    for (const [key, medicine] of Object.entries(medicines)) {
      if (message.includes(medicine.name.toLowerCase()) || 
          message.includes(key.toLowerCase())) {
        return key;
      }
    }
    
    // Generic medicine queries
    if (message.includes('antibiotic')) return 'azithromycin';
    if (message.includes('pain relief') || message.includes('painkiller')) return 'paracetamol';
    if (message.includes('allergy medicine')) return 'cetirizine';
    if (message.includes('stomach medicine') || message.includes('gastric')) return 'omeprazole';
    
    return null;
  }

  /**
   * Detect store information queries
   * Handles hours, delivery, contact, license, about
   * 
   * @param {string} message - Lowercase user message
   * @returns {string|null} Info type if detected
   */
  detectStoreInfo(message) {
    if (message.includes('hour') || message.includes('open') || message.includes('close') || message.includes('সময়')) {
      return 'hours';
    }
    if (message.includes('delivery') || message.includes('shipping') || message.includes('ডেলিভারি')) {
      return 'delivery';
    }
    if (message.includes('contact') || message.includes('phone') || message.includes('call') || message.includes('যোগাযোগ')) {
      return 'contact';
    }
    if (message.includes('license') || message.includes('dgda') || message.includes('লাইসেন্স')) {
      return 'license';
    }
    if (message.includes('about') || message.includes('who are you') || message.includes('পরিচয়')) {
      return 'about';
    }
    return null;
  }

  /**
   * Detect order-related queries
   * @param {string} message - Lowercase user message
   * @returns {boolean} True if order query detected
   */
  detectOrderQuery(message) {
    const orderKeywords = ['track', 'order', 'delivery status', 'where is my order', 'payment', 'return', 'refund'];
    return orderKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Detect product category queries
   * @param {string} message - Lowercase user message
   * @returns {string|null} Category key if detected
   */
  detectCategory(message) {
    const categories = this.knowledge.categories;
    
    for (const [key, category] of Object.entries(categories)) {
      if (message.includes(category.name.toLowerCase())) {
        return key;
      }
    }
    
    if (message.includes('surgical') || message.includes('সার্জিক্যাল')) return 'surgical';
    if (message.includes('wound') || message.includes('ক্ষত')) return 'woundCare';
    if (message.includes('diagnostic') || message.includes('test')) return 'diagnostics';
    if (message.includes('hospital')) return 'hospital';
    if (message.includes('ppe') || message.includes('mask') || message.includes('protective')) return 'ppe';
    
    return null;
  }

  /**
   * Detect FAQ queries
   * @param {string} message - Lowercase user message
   * @returns {string|null} FAQ key if detected
   */
  detectFAQ(message) {
    const faq = this.knowledge.faq;
    
    for (const key of Object.keys(faq)) {
      if (message.includes(key)) {
        return key;
      }
    }
    
    return null;
  }

  /**
   * ============================================
   * RESPONSE GENERATION
   * ============================================
   */

  /**
   * Generate intelligent response based on user message
   * Main entry point for chatbot interaction
   * 
   * @param {string} message - User's input message
   * @param {string} [language='en'] - Response language (en/bn)
   * @returns {string} Generated response text
   */
  generateResponse(message, language = 'en') {
    // Track conversation for context
    this.conversationHistory.push({ role: 'user', message, timestamp: Date.now() });
    
    // Analyze user intent
    const analysis = this.analyzeIntent(message);
    
    let response = '';
    
    // Generate response based on intent
    switch (analysis.intent) {
      case 'emergency':
        response = this.handleEmergency(message, language);
        break;
      case 'greeting':
        response = this.handleGreeting(language);
        break;
      case 'symptom':
        response = this.handleSymptom(analysis.target, language);
        break;
      case 'medicine':
        response = this.handleMedicine(analysis.target, language);
        break;
      case 'storeInfo':
        response = this.handleStoreInfo(analysis.target, language);
        break;
      case 'order':
        response = this.handleOrder(language);
        break;
      case 'category':
        response = this.handleCategory(analysis.target, language);
        break;
      case 'faq':
        response = this.handleFAQ(analysis.target, language);
        break;
      default:
        response = this.handleUnknown(language);
    }
    
    // Add to conversation history
    this.conversationHistory.push({ role: 'assistant', message: response, timestamp: Date.now() });
    
    return response;
  }

  /**
   * ============================================
   * INTENT HANDLERS
   * ============================================
   */

  /**
   * Handle medical emergency messages
   * Provides immediate safety instructions
   * 
   * @param {string} message - User message
   * @param {string} language - Response language
   * @returns {string} Emergency response with safety instructions
   */
  handleEmergency(message, language) {
    const emergencies = this.knowledge.emergencies;
    
    // Match specific emergency type
    for (const [, emergency] of Object.entries(emergencies)) {
      const matched = emergency.keywords.some(keyword => 
        message.toLowerCase().includes(keyword)
      );
      
      if (matched) {
        return language === 'bn' 
          ? `🚨 জরুরী! ${emergency.action}\n\nতাৎক্ষণিক ডাক্তারের পরামর্শ নিন বা 999 নম্বরে কল করুন।`
          : `🚨 EMERGENCY! ${emergency.action}\n\nPlease seek immediate medical attention.`;
      }
    }
    
    return language === 'bn'
      ? "🚨 এটি জরুরী পরিস্থিতি হতে পারে। অনুগ্রহ করে 999 নম্বরে কল করুন বা নিকটস্থ হাসপাতালে যান।"
      : "🚨 This may be a medical emergency. Please call 999 or go to the nearest emergency room immediately.";
  }

  /**
   * Handle greeting messages
   * @param {string} language - Response language
   * @returns {string} Greeting response
   */
  handleGreeting(language) {
    return language === 'bn'
      ? "আসসালামু আলাইকুম! 👋 আমি Online24 Pharmacy এর AI সহায়ক। আমি আপনাকে ঔষধ, স্বাস্থ্য পরামর্শ, এবং আমাদের সেবা সম্পর্কে সাহায্য করতে পারি।\n\nআপনি কীভাবে আমাকে সাহায্য করতে পারি?"
      : "Hello! 👋 I'm the AI assistant for Online24 Pharmacy. I can help you with medicines, health advice, and our services.\n\nHow may I assist you today?";
  }

  /**
   * Handle symptom queries
   * Provides medicine recommendations and care instructions
   * 
   * @param {string} symptom - Detected symptom key
   * @param {string} language - Response language
   * @returns {string} Symptom advice with medicines and warnings
   */
  handleSymptom(symptom, language) {
    const symptomData = this.knowledge.symptoms[symptom];
    
    if (!symptomData) {
      return this.handleUnknown(language);
    }
    
    if (language === 'bn') {
      let response = `🏥 ${symptom === 'fever' ? 'জ্বর' : symptom === 'headache' ? 'মাথা ব্যথা' : symptom === 'cough' ? 'কাশি' : symptom === 'cold' ? 'সর্দি' : 'পেট ব্যথা'} এর জন্য পরামর্শ:\n\n`;
      
      response += "💊 প্রস্তাবিত ঔষধ:\n";
      symptomData.medicines.forEach(med => {
        response += `• ${med}\n`;
      });
      
      response += "\n📋 যত্ন নির্দেশনা:\n";
      symptomData.recommendations.slice(0, 4).forEach(rec => {
        response += `• ${rec}\n`;
      });
      
      if (symptomData.warning) {
        response += `\n⚠️ সতর্কতা: ${symptomData.warning}`;
      }
      
      response += "\n\n" + this.knowledge.legalInfo.disclaimer;
      
      return response;
    } else {
      let response = `🏥 Recommendations for ${symptom.replace(/([A-Z])/g, ' $1').trim()}:\n\n`;
      
      response += "💊 Recommended Medicines:\n";
      symptomData.medicines.forEach(med => {
        response += `• ${med}\n`;
      });
      
      response += "\n📋 Care Instructions:\n";
      symptomData.recommendations.forEach(rec => {
        response += `• ${rec}\n`;
      });
      
      if (symptomData.warning) {
        response += `\n⚠️ Warning: ${symptomData.warning}`;
      }
      
      response += "\n\n💬 Would you like detailed information about any specific medicine?";
      
      return response;
    }
  }

  /**
   * Handle medicine information queries
   * Provides detailed drug information
   * 
   * @param {string} medicineKey - Medicine key from knowledge base
   * @param {string} language - Response language
   * @returns {string} Detailed medicine information
   */
  handleMedicine(medicineKey, language) {
    const medicine = this.knowledge.medicines[medicineKey];
    
    if (!medicine) {
      return this.handleUnknown(language);
    }
    
    if (language === 'bn') {
      let response = `💊 ${medicine.name}\n\n`;
      
      if (medicine.genericName) {
        response += `জেনেরিক নাম: ${medicine.genericName}\n\n`;
      }
      
      response += "🎯 ব্যবহার:\n";
      medicine.uses.forEach(use => response += `• ${use}\n`);
      
      response += `\n📏 ডোজ: ${medicine.dosage}\n`;
      
      if (medicine.maxDose) {
        response += `সর্বোচ্চ ডোজ: ${medicine.maxDose}\n`;
      }
      
      if (medicine.sideEffects) {
        response += "\n⚠️ পার্শ্ব প্রতিক্রিয়া:\n";
        medicine.sideEffects.forEach(effect => response += `• ${effect}\n`);
      }
      
      if (medicine.precautions) {
        response += `\n🔔 সতর্কতা: ${medicine.precautions}\n`;
      }
      
      if (medicine.prescription) {
        response += `\n📋 প্রেসক্রিপশন: ${medicine.prescription}\n`;
      }
      
      return response;
    } else {
      let response = `💊 ${medicine.name}\n\n`;
      
      if (medicine.genericName) {
        response += `Generic Name: ${medicine.genericName}\n\n`;
      }
      
      response += "🎯 Uses:\n";
      medicine.uses.forEach(use => response += `• ${use}\n`);
      
      response += `\n📏 Dosage: ${medicine.dosage}\n`;
      
      if (medicine.maxDose) {
        response += `Maximum Dose: ${medicine.maxDose}\n`;
      }
      
      if (medicine.sideEffects) {
        response += "\n⚠️ Side Effects:\n";
        medicine.sideEffects.forEach(effect => response += `• ${effect}\n`);
      }
      
      if (medicine.precautions) {
        response += `\n🔔 Precautions: ${medicine.precautions}\n`;
      }
      
      if (medicine.prescription) {
        response += `\n📋 Prescription: ${medicine.prescription}\n`;
      }
      
      response += "\n\n💬 Would you like to order this medicine or need more information?";
      
      return response;
    }
  }

  /**
   * Handle store information queries
   * @param {string} target - Info type (hours, delivery, contact, etc.)
   * @param {string} language - Response language
   * @returns {string} Store information
   */
  handleStoreInfo(target, language) {
    const info = this.knowledge.storeInfo;
    
    if (language === 'bn') {
      switch (target) {
        case 'hours':
          return "🕒 আমরা ২৪/৭ খোলা থাকি! যেকোনো সময় অর্ডার করুন এবং দ্রুত ডেলিভারি পান।";
        case 'delivery':
          return `🚚 ডেলিভারি তথ্য:\n• এলাকা: ${info.deliveryInfo.areas}\n• সময়: ${info.deliveryInfo.time}\n• চার্জ: ${info.deliveryInfo.charge}\n• ${info.deliveryInfo.tracking}`;
        case 'contact':
          return `📞 যোগাযোগ:\n• ফোন: ${info.contact.phone}\n• ইমেইল: ${info.contact.email}\n• সময়: ${info.contact.hours}`;
        case 'license':
          return `✅ আমরা DGDA লাইসেন্সপ্রাপ্ত (${info.license})। আমরা সকল ফার্মাসিউটিক্যাল নিয়ম মেনে চলি।`;
        case 'about':
          return `🏥 Online24 Pharmacy\n\n${info.services.join('\n• ')}\n\n📊 পরিসংখ্যান:\n• ${info.stats.customers}\n• ${info.stats.products}\n• ${info.stats.rating}`;
        default:
          return this.handleUnknown(language);
      }
    } else {
      switch (target) {
        case 'hours':
          return "🕒 We're open 24/7! Order anytime and get fast delivery.";
        case 'delivery':
          return `🚚 Delivery Information:\n• Areas: ${info.deliveryInfo.areas}\n• Time: ${info.deliveryInfo.time}\n• Charge: ${info.deliveryInfo.charge}\n• ${info.deliveryInfo.tracking}`;
        case 'contact':
          return `📞 Contact Us:\n• Phone: ${info.contact.phone}\n• Email: ${info.contact.email}\n• Hours: ${info.contact.hours}`;
        case 'license':
          return `✅ We are DGDA licensed (${info.license}). We follow all pharmaceutical regulations.`;
        case 'about':
          return `🏥 Online24 Pharmacy\n\nOur Services:\n• ${info.services.join('\n• ')}\n\n📊 Our Stats:\n• ${info.stats.customers}\n• ${info.stats.products}\n• ${info.stats.rating}`;
        default:
          return this.handleUnknown(language);
      }
    }
  }

  /**
   * Handle order-related queries
   * @param {string} language - Response language
   * @returns {string} Order tracking and payment information
   */
  handleOrder(language) {
    return language === 'bn'
      ? "📦 অর্ডার ট্র্যাকিং:\n\nআপনার অর্ডার নম্বর দিয়ে আপনি রিয়েল-টাইমে আপনার অর্ডার ট্র্যাক করতে পারেন। আমাদের ওয়েবসাইটে 'Track Order' এ ক্লিক করুন।\n\n💳 পেমেন্ট: ক্যাশ অন ডেলিভারি, bKash, Nagad, কার্ড গৃহীত।"
      : "📦 Order Tracking:\n\nYou can track your order in real-time using your order number. Click 'Track Order' on our website.\n\n💳 Payment: We accept Cash on Delivery, bKash, Nagad, and all major cards.";
  }

  /**
   * Handle product category queries
   * @param {string} category - Category key
   * @param {string} language - Response language
   * @returns {string} Category information with products
   */
  handleCategory(category, language) {
    const categoryData = this.knowledge.categories[category];
    
    if (!categoryData) {
      return this.handleUnknown(language);
    }
    
    if (language === 'bn') {
      let response = `📦 ${categoryData.name}\n\n`;
      response += `মোট পণ্য: ${categoryData.count}\n\n`;
      
      if (categoryData.items) {
        response += "📋 পাওয়া যায়:\n";
        categoryData.items.forEach(item => response += `• ${item}\n`);
      }
      
      if (categoryData.prescription) {
        response += `\n⚠️ ${categoryData.prescription}`;
      }
      
      return response;
    } else {
      let response = `📦 ${categoryData.name}\n\n`;
      response += `Total Products: ${categoryData.count}\n\n`;
      
      if (categoryData.items) {
        response += "📋 Available Items:\n";
        categoryData.items.forEach(item => response += `• ${item}\n`);
      }
      
      if (categoryData.prescription) {
        response += `\n⚠️ ${categoryData.prescription}`;
      }
      
      response += "\n\n💬 Would you like to browse these products?";
      
      return response;
    }
  }

  /**
   * Handle FAQ queries
   * @param {string} faqKey - FAQ key
   * @param {string} language - Response language
   * @returns {string} FAQ answer
   */
  handleFAQ(faqKey, language) {
    const faq = this.knowledge.faq[faqKey];
    
    if (!faq) {
      return this.handleUnknown(language);
    }
    
    return `❓ ${faq.question}\n\n${faq.answer}`;
  }

  /**
   * Handle unrecognized queries
   * Provides helpful suggestions
   * 
   * @param {string} language - Response language
   * @returns {string} Fallback response with suggestions
   */
  handleUnknown(language) {
    return language === 'bn'
      ? "দুঃখিত, আমি আপনার প্রশ্নটি সম্পূর্ণরূপে বুঝতে পারিনি। 😊\n\nআমি সাহায্য করতে পারি:\n• রোগের লক্ষণ ও চিকিৎসা\n• ঔষধের তথ্য\n• ডেলিভারি ও অর্ডার\n• দোকান তথ্য\n\nঅনুগ্রহ করে আরও স্পষ্টভাবে জিজ্ঞাসা করুন বা আমাদের ফার্মাসিস্টের সাথে কথা বলুন।"
      : "I'm sorry, I didn't fully understand your question. 😊\n\nI can help you with:\n• Symptoms and treatments\n• Medicine information\n• Delivery and orders\n• Store information\n\nPlease ask more specifically or talk to our pharmacist for personalized help.";
  }

  /**
   * Get context-aware follow-up suggestions
   * Adapts based on conversation history
   * 
   * @param {string} [language='en'] - Suggestion language
   * @returns {Array<string>} Array of suggestion texts
   */
  getSuggestions(language = 'en') {
    const symptoms = this.userContext.symptoms;
    
    if (symptoms.length > 0) {
      return language === 'bn'
        ? ["ঔষধের বিস্তারিত তথ্য", "অর্ডার করুন", "ফার্মাসিস্টের সাথে কথা বলুন"]
        : ["Get medicine details", "Order now", "Talk to pharmacist"];
    }
    
    return language === 'bn'
      ? ["রোগের লক্ষণ বলুন", "ঔষধ খুঁজুন", "ডেলিভারি তথ্য", "দোকান সম্পর্কে"]
      : ["Describe symptoms", "Find medicine", "Delivery info", "About us"];
  }

  /**
   * Reset conversation context
   * Clears history and user context
   */
  resetContext() {
    this.userContext = {
      symptoms: [],
      medications: [],
      preferences: {}
    };
    this.conversationHistory = [];
  }
}

export default PharmacyAI;
