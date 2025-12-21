// Comprehensive Pharmacy Knowledge Base for AI Training
const pharmacyKnowledge = {
  // Store Information
  storeInfo: {
    name: "Online24 Pharmacy",
    license: "DGDA License #SL/04/2024",
    services: [
      "24/7 Medicine Delivery",
      "Prescription Upload Service",
      "Licensed Pharmacist Consultation",
      "Same Day Delivery in Dhaka",
      "Cash on Delivery Available",
      "bKash & Nagad Payment",
      "Surgical Product Sales",
      "Medical Equipment"
    ],
    deliveryInfo: {
      areas: "All areas of Dhaka city",
      time: "2-24 hours delivery",
      charge: "Free delivery on orders above ৳500",
      tracking: "Real-time order tracking available"
    },
    contact: {
      phone: "Available on website",
      email: "support@online24pharmacy.com",
      hours: "24/7 Customer Support"
    },
    stats: {
      customers: "50,000+ Happy Customers",
      products: "5,000+ Products",
      rating: "4.9/5 Star Rating"
    }
  },

  // Product Categories
  categories: {
    medicines: {
      name: "Medicines",
      count: "2,500+",
      types: ["Pain Relief", "Antibiotics", "Fever", "Allergy", "Diabetes", "Blood Pressure", "Vitamins"],
      prescription: "Required for certain medicines"
    },
    surgical: {
      name: "Surgical Items",
      count: "800+",
      items: ["Syringes", "Needles", "Surgical Gloves", "Masks", "Bandages", "Gauze"]
    },
    woundCare: {
      name: "Wound Care",
      count: "350+",
      items: ["Antiseptic", "Dressing Materials", "Plasters", "Cotton", "Adhesive Tape"]
    },
    diagnostics: {
      name: "Diagnostics",
      count: "200+",
      items: ["BP Monitors", "Glucometers", "Thermometers", "Oximeters", "Test Strips"]
    },
    hospital: {
      name: "Hospital Supplies",
      count: "600+",
      items: ["IV Sets", "Catheters", "Medical Tubes", "Surgical Instruments"]
    },
    ppe: {
      name: "PPE Equipment",
      count: "150+",
      items: ["N95 Masks", "Face Shields", "Protective Gowns", "Sanitizers"]
    }
  },

  // Common Medicines Knowledge
  medicines: {
    paracetamol: {
      name: "Paracetamol",
      genericName: "Acetaminophen",
      uses: ["Fever", "Headache", "Body Pain", "Toothache"],
      dosage: "500mg-1000mg every 4-6 hours",
      maxDose: "4000mg per day",
      sideEffects: ["Rare allergic reactions", "Liver damage in overdose"],
      precautions: "Avoid alcohol, liver disease patients consult doctor",
      prescription: "Not required for 500mg tablets",
      brands: ["Napa", "Ace", "Paracetamol"]
    },
    cetirizine: {
      name: "Cetirizine",
      uses: ["Allergic Rhinitis", "Urticaria", "Skin Allergy", "Hay Fever"],
      dosage: "10mg once daily",
      sideEffects: ["Drowsiness", "Dry mouth", "Headache"],
      precautions: "May cause sleepiness, avoid driving",
      prescription: "Not required"
    },
    azithromycin: {
      name: "Azithromycin",
      type: "Antibiotic",
      uses: ["Respiratory Infections", "Throat Infection", "Skin Infections"],
      dosage: "500mg once daily for 3-5 days",
      sideEffects: ["Nausea", "Diarrhea", "Stomach pain"],
      precautions: "Complete full course, not for viral infections",
      prescription: "REQUIRED - Antibiotic"
    },
    omeprazole: {
      name: "Omeprazole",
      uses: ["Acid Reflux", "GERD", "Stomach Ulcers", "Gastritis"],
      dosage: "20mg-40mg once daily before breakfast",
      sideEffects: ["Headache", "Nausea", "Diarrhea"],
      precautions: "Long-term use needs monitoring",
      prescription: "Not required for 20mg"
    },
    metformin: {
      name: "Metformin",
      uses: ["Type 2 Diabetes", "Blood Sugar Control"],
      dosage: "500mg-2000mg daily in divided doses",
      sideEffects: ["Nausea", "Diarrhea", "Metallic taste"],
      precautions: "Take with meals, regular monitoring needed",
      prescription: "REQUIRED"
    },
    amlodipine: {
      name: "Amlodipine",
      uses: ["High Blood Pressure", "Angina"],
      dosage: "5mg-10mg once daily",
      sideEffects: ["Ankle swelling", "Headache", "Flushing"],
      precautions: "Don't stop suddenly, regular BP monitoring",
      prescription: "REQUIRED"
    }
  },

  // Symptoms and Recommendations
  symptoms: {
    fever: {
      keywords: ["fever", "জ্বর", "temperature", "hot", "pyrexia"],
      recommendations: [
        "Paracetamol 500mg every 4-6 hours",
        "Stay hydrated - drink plenty of water",
        "Rest and avoid physical exertion",
        "Sponge with lukewarm water",
        "Consult doctor if fever > 103°F or persists > 3 days",
        "Seek immediate care if fever with severe headache, rash, or difficulty breathing"
      ],
      medicines: ["Paracetamol", "Ibuprofen"],
      warning: "If fever persists for more than 3 days, consult a doctor"
    },
    headache: {
      keywords: ["headache", "মাথা ব্যথা", "migraine", "head pain"],
      recommendations: [
        "Paracetamol 500mg or Ibuprofen 400mg",
        "Rest in a quiet, dark room",
        "Apply cold compress to forehead",
        "Stay hydrated",
        "Avoid screens and bright lights",
        "Consult doctor for severe or frequent headaches"
      ],
      medicines: ["Paracetamol", "Ibuprofen", "Aspirin"],
      warning: "Consult doctor if headache is severe, sudden, or with vision problems"
    },
    cold: {
      keywords: ["cold", "সর্দি", "runny nose", "nasal", "congestion"],
      recommendations: [
        "Cetirizine 10mg for allergic symptoms",
        "Nasal decongestant spray",
        "Steam inhalation 2-3 times daily",
        "Drink warm fluids",
        "Get adequate rest",
        "Maintain hygiene - wash hands frequently"
      ],
      medicines: ["Cetirizine", "Pseudoephedrine", "Saline nasal spray"],
      warning: "Consult doctor if symptoms persist beyond 7 days"
    },
    cough: {
      keywords: ["cough", "কাশি", "throat", "phlegm"],
      recommendations: [
        "Cough syrup with Dextromethorphan for dry cough",
        "Expectorant for productive cough",
        "Warm water with honey",
        "Steam inhalation",
        "Avoid cold drinks and ice cream",
        "Consult doctor if cough persists > 2 weeks"
      ],
      medicines: ["Cough Syrup", "Lozenges", "Expectorant"],
      warning: "Seek medical care for cough with blood or breathing difficulty"
    },
    stomachPain: {
      keywords: ["stomach", "পেট ব্যথা", "abdominal", "gastric", "acidity"],
      recommendations: [
        "Antacid for immediate relief",
        "Omeprazole for acid reflux",
        "Eat light, bland foods",
        "Avoid spicy and oily foods",
        "Small, frequent meals",
        "Consult doctor for severe or persistent pain"
      ],
      medicines: ["Omeprazole", "Antacid", "Ranitidine"],
      warning: "Seek immediate care for severe pain with vomiting or blood"
    },
    diabetes: {
      keywords: ["diabetes", "ডায়াবেটিস", "sugar", "glucose", "blood sugar"],
      recommendations: [
        "Regular blood sugar monitoring",
        "Follow prescribed medication schedule",
        "Maintain healthy diet - low sugar, high fiber",
        "Regular exercise",
        "Foot care - check daily for wounds",
        "Regular doctor checkups",
        "HbA1c test every 3 months"
      ],
      medicines: ["Metformin", "Insulin", "Glimepiride"],
      warning: "PRESCRIPTION REQUIRED for diabetes medications"
    },
    hypertension: {
      keywords: ["blood pressure", "BP", "hypertension", "উচ্চ রক্তচাপ"],
      recommendations: [
        "Regular BP monitoring",
        "Take medications as prescribed",
        "Reduce salt intake",
        "Regular exercise",
        "Maintain healthy weight",
        "Avoid smoking and excessive alcohol",
        "Stress management"
      ],
      medicines: ["Amlodipine", "Atenolol", "Losartan"],
      warning: "PRESCRIPTION REQUIRED - Never stop BP medications suddenly"
    },
    allergy: {
      keywords: ["allergy", "এলার্জি", "rash", "itching", "hives"],
      recommendations: [
        "Cetirizine 10mg once daily",
        "Avoid known allergens",
        "Keep skin moisturized",
        "Use mild, fragrance-free products",
        "Calamine lotion for itching",
        "Consult doctor for severe reactions"
      ],
      medicines: ["Cetirizine", "Loratadine", "Fexofenadine"],
      warning: "Seek emergency care for breathing difficulty or facial swelling"
    }
  },

  // Common Questions
  faq: {
    "prescription required": {
      question: "Which medicines need prescription?",
      answer: "Antibiotics, diabetes medications, blood pressure medicines, controlled substances, and strong painkillers require a valid prescription. You can upload your prescription on our website for easy ordering."
    },
    "delivery time": {
      question: "How long does delivery take?",
      answer: "We offer same-day delivery across Dhaka within 2-24 hours. Urgent orders are prioritized. You can track your order in real-time through our website."
    },
    "payment methods": {
      question: "What payment methods do you accept?",
      answer: "We accept Cash on Delivery (COD), bKash, Nagad, and all major credit/debit cards. Payment is secure and convenient."
    },
    "order tracking": {
      question: "How can I track my order?",
      answer: "You can track your order in real-time by clicking 'Track Order' on our website and entering your order number."
    },
    "return policy": {
      question: "What is your return policy?",
      answer: "Medicines can be returned within 7 days if unopened and in original packaging. Please contact our customer support for return requests."
    },
    "pharmacist consultation": {
      question: "Can I consult with a pharmacist?",
      answer: "Yes! Our licensed pharmacists are available 24/7 for free consultation. Click 'Talk to Pharmacist' or call our hotline."
    }
  },

  // Emergency Information
  emergencies: {
    "drug overdose": {
      keywords: ["overdose", "too much medicine", "poisoning"],
      action: "EMERGENCY! Call 999 immediately or go to nearest emergency room. Do not induce vomiting. Bring the medicine container.",
      urgent: true
    },
    "allergic reaction": {
      keywords: ["swelling", "difficulty breathing", "anaphylaxis", "severe rash"],
      action: "EMERGENCY! Call 999 if breathing difficulty or facial swelling. Give antihistamine if available. Seek immediate medical care.",
      urgent: true
    },
    "chest pain": {
      keywords: ["chest pain", "heart attack", "cardiac"],
      action: "EMERGENCY! Call 999 immediately. Chew aspirin if available. Do not delay - could be heart attack.",
      urgent: true
    }
  },

  // Legal and Safety
  legalInfo: {
    disclaimer: "⚠️ This is AI-generated advice for general information only. Always consult a licensed doctor or pharmacist for medical decisions. Never self-medicate with prescription drugs.",
    prescriptionPolicy: "Prescription medicines require a valid prescription from a licensed doctor. We verify all prescriptions with our pharmacists.",
    privacyPolicy: "Your health information is confidential and protected under medical privacy laws.",
    dgdaLicense: "We are DGDA licensed (License #SL/04/2024) and follow all pharmaceutical regulations."
  }
};

// Training Data for AI Learning
export const trainingData = [
  // Greetings
  { input: "hello", category: "greeting", response: "greeting" },
  { input: "hi", category: "greeting", response: "greeting" },
  { input: "hey", category: "greeting", response: "greeting" },
  { input: "আসসালামু আলাইকুম", category: "greeting", response: "greeting" },
  { input: "হ্যালো", category: "greeting", response: "greeting" },
  
  // Store Info
  { input: "store hours", category: "storeInfo", response: "storeHours" },
  { input: "delivery areas", category: "storeInfo", response: "deliveryInfo" },
  { input: "phone number", category: "storeInfo", response: "contact" },
  { input: "license", category: "storeInfo", response: "license" },
  
  // Symptoms
  { input: "fever", category: "symptoms", response: "fever" },
  { input: "headache", category: "symptoms", response: "headache" },
  { input: "cough", category: "symptoms", response: "cough" },
  { input: "cold", category: "symptoms", response: "cold" },
  { input: "stomach pain", category: "symptoms", response: "stomachPain" },
  
  // Medicine Queries
  { input: "paracetamol", category: "medicine", response: "paracetamol" },
  { input: "antibiotic", category: "medicine", response: "antibiotic" },
  { input: "diabetes medicine", category: "medicine", response: "diabetes" },
  { input: "blood pressure", category: "medicine", response: "hypertension" },
  
  // Order Related
  { input: "track order", category: "order", response: "orderTracking" },
  { input: "delivery time", category: "order", response: "deliveryTime" },
  { input: "payment", category: "order", response: "payment" },
  
  // Emergency
  { input: "emergency", category: "emergency", response: "emergency" },
  { input: "overdose", category: "emergency", response: "overdose" },
  { input: "allergic reaction", category: "emergency", response: "allergy_emergency" }
];

export default pharmacyKnowledge;
