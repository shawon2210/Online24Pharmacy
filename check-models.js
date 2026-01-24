import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log('genAI methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(genAI)));
console.log('genAI properties:', Object.keys(genAI));

// Try to get a model and see what happens
try {
  console.log('Trying gemini-pro...');
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  console.log('Model created successfully:', model ? 'yes' : 'no');
  console.log('Model methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(model)));
} catch (error) {
  console.error('Error creating model:', error.message);
}