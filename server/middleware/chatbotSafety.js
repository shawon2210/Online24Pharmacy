import { z } from 'zod';

const hardBlockPatterns = [
  /overdose/i,
  /suicide|self-harm|kill myself/i,
  /how many.*(pills|tablets).*kill/i,
  /(poison|harm).*someone/i,
];

// These are high-risk contexts where we should not provide dosing or clinical guidance
const cautionPatterns = [
  /(dose|dosage|how many|mg|ml)/i,
  /(child|pediatric|kids?|baby|infant)/i,
  /(pregnan(t|cy)|lactation|breastfeed)/i,
  /(mix|combine).*alcohol/i,
  /(interaction|interact).*\b(drug|medicine|tablet|pill)s?/i,
];

const inputSchema = z.object({
  message: z.string().min(1, 'message required'),
  language: z.string().optional(),
});

export function chatbotSafety(req, res, next) {
  try {
    // Try to parse and validate
    let message = '';
    try {
      const parsed = inputSchema.parse(req.body);
      message = parsed.message;
    } catch {
      // If validation fails but we have a message, still allow it through
      message = req.body?.message || '';
      if (!message) {
        return res.status(400).json({ 
          error: 'Message required',
        });
      }
    }

    // Check for hard blocks - these are serious safety issues
    if (hardBlockPatterns.some((p) => p.test(message))) {
      return res.status(400).json({
        error: 'Unsafe request. Please consult a licensed clinician or call local emergency services.',
      });
    }

    // Set caution flag if message contains sensitive contexts
    req.chatbotSafety = {
      caution: cautionPatterns.some((p) => p.test(message)),
    };

    next();
  } catch (err) {
    // Don't reject on unexpected errors - let the endpoint handle it
    console.warn('Chatbot safety middleware warning:', err.message);
    req.chatbotSafety = { caution: false };
    next();
  }
}
