import fs from 'fs/promises';
import path from 'path';

function buildPolicyDocs() {
  const docs = [];
  docs.push({
    id: 'policy-delivery',
    title: 'Delivery Policy — Dhaka',
    source: 'Online24 Policy',
    url: 'https://online24-pharmacy/policy',
    text: 'Free delivery in Dhaka within 2–24h. Order by 8 PM for same-day dispatch. COD, bKash, Nagad supported.',
  });
  docs.push({
    id: 'policy-returns',
    title: 'Returns Policy',
    source: 'Online24 Policy',
    url: 'https://online24-pharmacy/returns',
    text: 'Non-returnable for surgical items. 7-day return for sealed OTC medicines. Prescription medicines follow DGDA rules.',
  });
  docs.push({
    id: 'policy-prescription',
    title: 'Prescription Upload',
    source: 'Online24 Help',
    url: 'https://online24-pharmacy/prescription',
    text: 'Upload prescriptions at /prescription. Required for Rx-only medicines per DGDA Schedule H/X/G guidelines.',
  });
  docs.push({
    id: 'policy-dgda',
    title: 'DGDA Compliance',
    source: 'DGDA',
    url: 'https://dgda.gov.bd',
    text: 'DGDA rules: OTC vs prescription medicines must be respected. Schedule H/X/G drugs require valid prescription. No dosage advice provided.',
  });
  return docs;
}

async function buildProductDocs(limit = 1000) {
  const filePath = path.resolve(process.cwd(), 'server', 'data', 'products.json');
  let products = [];
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    products = JSON.parse(raw || '[]');
  } catch {
    return [];
  }

  return products.slice(0, limit).map((p) => {
    const rxFlag = p.requiresPrescription ? 'Prescription required' : 'OTC allowed';
    const price = p.price ? `Price: ${p.price}` : '';
    return {
      id: `product-${p.id || p.slug || p.name}`,
      title: `${p.name} — ${p.category || p.subcategory || 'Medicine'}`,
      source: 'Product Catalog',
      url: `https://online24-pharmacy/product/${p.slug || p.id || ''}`,
      text: `${p.name} in category ${p.category || p.subcategory || ''}. ${rxFlag}. ${price}. ${p.description || ''}`.trim(),
    };
  });
}

async function buildDGDAFAQDocs() {
  const filePath = path.resolve(process.cwd(), 'server', 'data', 'dgda-faqs.json');
  let faqs = [];
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    faqs = JSON.parse(raw || '[]');
  } catch {
    return [];
  }

  return faqs.map((faq) => ({
    id: faq.id,
    title: `FAQ: ${faq.question}`,
    source: 'DGDA FAQ',
    url: 'https://dgda.gov.bd/faq',
    text: `Q: ${faq.question} A: ${faq.answer} Category: ${faq.category}. Tags: ${faq.tags?.join(', ') || ''}.`,
  }));
}

async function buildDGDAGuidelineDocs() {
  const filePath = path.resolve(process.cwd(), 'server', 'data', 'dgda-guidelines.json');
  let guidelines = [];
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    guidelines = JSON.parse(raw || '[]');
  } catch {
    return [];
  }

  return guidelines.map((guideline) => ({
    id: guideline.id,
    title: `DGDA Guideline: ${guideline.title}`,
    source: 'DGDA Official Guidelines',
    url: 'https://dgda.gov.bd/guidelines',
    text: `${guideline.title}. Category: ${guideline.category}. ${guideline.content}`,
  }));
}

async function buildSystemFAQDocs() {
  const filePath = path.resolve(process.cwd(), 'server', 'data', 'system-faqs.json');
  let faqs = [];
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    faqs = JSON.parse(raw || '[]');
  } catch {
    return [];
  }

  return faqs.map((faq) => ({
    id: faq.id,
    title: `System FAQ: ${faq.question}`,
    source: 'Online24 FAQ',
    url: 'https://online24-pharmacy/help/faq',
    text: `Q: ${faq.question} A: ${faq.answer} Category: ${faq.category}. Tags: ${faq.tags?.join(', ') || ''}.`,
  }));
}

async function buildSystemFeatureDocs() {
  const filePath = path.resolve(process.cwd(), 'server', 'data', 'system-features.json');
  let features = [];
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    features = JSON.parse(raw || '[]');
  } catch {
    return [];
  }

  return features.map((feature) => ({
    id: feature.id,
    title: `Feature: ${feature.title}`,
    source: 'Online24 Features',
    url: 'https://online24-pharmacy/features',
    text: `${feature.title}. Category: ${feature.category}. ${feature.content}`,
  }));
}

export async function buildChatbotCorpus() {
  const docs = [...buildPolicyDocs()];
  const productDocs = await buildProductDocs();
  const faqDocs = await buildDGDAFAQDocs();
  const guidelineDocs = await buildDGDAGuidelineDocs();
  const systemFAQDocs = await buildSystemFAQDocs();
  const systemFeatureDocs = await buildSystemFeatureDocs();
  docs.push(...productDocs, ...faqDocs, ...guidelineDocs, ...systemFAQDocs, ...systemFeatureDocs);
  return docs;
}
