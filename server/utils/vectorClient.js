/**
 * ============================================
 * VECTOR SEARCH CLIENT
 * ============================================
 * 
 * Lightweight in-memory vector search implementation
 * Uses TF-IDF and cosine similarity for semantic search
 * 
 * Production Note: Replace with real vector DB:
 * - Pinecone for cloud-based vector search
 * - Supabase pgvector for PostgreSQL integration
 * - Weaviate for self-hosted solution
 */

import fs from 'fs/promises';

/**
 * ============================================
 * TEXT PROCESSING UTILITIES
 * ============================================
 */

/**
 * Tokenize text into normalized words
 * Removes punctuation and filters short tokens
 * 
 * @param {string} text - Input text to tokenize
 * @returns {Array<string>} Array of normalized tokens
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

/**
 * Create simple term frequency embedding
 * Maps tokens to their occurrence count
 * 
 * @param {string} text - Input text to embed
 * @returns {Map<string, number>} Term frequency map
 */
function embed(text) {
  const tokens = tokenize(text);
  const freq = new Map();
  tokens.forEach((t) => freq.set(t, (freq.get(t) || 0) + 1));
  return freq;
}

/**
 * Calculate cosine similarity between two embeddings
 * Measures semantic similarity (0 = unrelated, 1 = identical)
 * 
 * @param {Map<string, number>} a - First embedding
 * @param {Map<string, number>} b - Second embedding
 * @returns {number} Cosine similarity score (0-1)
 */
function cosine(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const [, v] of a) normA += v * v;
  for (const [, v] of b) normB += v * v;
  for (const [k, v] of a) {
    const bv = b.get(k);
    if (bv) dot += v * bv;
  }
  if (!normA || !normB) return 0;
  return dot / Math.sqrt(normA * normB);
}

/**
 * ============================================
 * IN-MEMORY VECTOR STORE
 * ============================================
 */

/**
 * Simple in-memory vector store for semantic search
 * Stores documents with pre-computed embeddings
 */
class InMemoryVectorStore {
  constructor() {
    this.items = [];
  }

  /**
   * Insert or update documents in the vector store
   * Pre-computes embeddings for efficient querying
   * 
   * @param {Array<Object>} documents - Documents to store
   * @param {string} documents[].title - Document title
   * @param {string} documents[].text - Document content
   * @param {string} documents[].source - Document source
   */
  async upsert(documents = []) {
    this.items = documents.map((doc) => ({
      ...doc,
      _embedding: embed([doc.title, doc.text, doc.source].filter(Boolean).join(' ')),
    }));
  }

  /**
   * Query vector store for similar documents
   * Uses cosine similarity for ranking
   * 
   * @param {string} queryText - Search query
   * @param {number} [topK=4] - Number of results to return
   * @returns {Promise<Array<Object>>} Top K similar documents with scores
   */
  async query(queryText, topK = 4) {
    if (!queryText || !this.items.length) return [];

    const queryEmbedding = embed(queryText);
    if (queryEmbedding.size === 0) return []; // Empty query edge case

    // Score all documents by similarity
    const scored = this.items.map((item) => ({
      ...item,
      score: cosine(queryEmbedding, item._embedding),
    }));
    
    // Filter by threshold and return top K
    // Low threshold (0.01) to catch weak matches for better recall
    return scored
      .filter((r) => r.score > 0.01)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

/**
 * ============================================
 * SINGLETON INSTANCE
 * ============================================
 */

// Global vector store instance
const store = new InMemoryVectorStore();

/**
 * ============================================
 * PUBLIC API
 * ============================================
 */

/**
 * Insert or update documents in vector store
 * @param {Array<Object>} docs - Documents to upsert
 */
export async function upsertDocuments(docs) {
  await store.upsert(docs);
}

/**
 * Query vector store for similar documents
 * @param {string} queryText - Search query
 * @param {number} [topK=4] - Number of results
 * @returns {Promise<Array<Object>>} Similar documents
 */
export async function queryDocuments(queryText, topK = 4) {
  return store.query(queryText, topK);
}

/**
 * ============================================
 * PERSISTENCE HELPERS
 * ============================================
 */

/**
 * Save vector store to disk (optional)
 * Useful for caching pre-computed embeddings
 * 
 * @param {string} filePath - Path to save snapshot
 */
export async function saveCorpusSnapshot(filePath) {
  const data = JSON.stringify(store.items, null, 2);
  await fs.writeFile(filePath, data);
}

/**
 * Load vector store from disk (optional)
 * Restores previously saved embeddings
 * 
 * @param {string} filePath - Path to load snapshot from
 */
export async function loadCorpusSnapshot(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw || '[]');
    await upsertDocuments(parsed);
  } catch {
    // Silently ignore if file doesn't exist
  }
}
