import { ProductWithSimilarity } from '@/types/product';

/**
 * Removes duplicate products from results based on embedding similarity.
 * If two products are too similar to each other (e.g., same item, different angle),
 * only keeps the one with higher match score.
 */
export const deduplicateResults = (
  results: ProductWithSimilarity[],
  embeddings: Map<string, number[]>,
  diversityThreshold = 0.85 // Products more similar than this are considered duplicates
): ProductWithSimilarity[] => {
  if (results.length === 0) return results;

  // Sort by similarity descending to prioritize best matches
  const sorted = [...results].sort((a, b) => b.similarity - a.similarity);
  const kept: ProductWithSimilarity[] = [];
  const keptIds = new Set<string>();

  for (const product of sorted) {
    const productEmbedding = embeddings.get(product.id);
    if (!productEmbedding) continue;

    let isDuplicate = false;

    // Check if this product is too similar to any already kept product
    for (const keptProduct of kept) {
      const keptEmbedding = embeddings.get(keptProduct.id);
      if (!keptEmbedding) continue;

      const similarity = cosineSimilarity(productEmbedding, keptEmbedding);
      
      // If products are very similar to each other, consider it a duplicate
      if (similarity > diversityThreshold) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate && !keptIds.has(product.id)) {
      kept.push(product);
      keptIds.add(product.id);
    }
  }

  return kept;
};

/**
 * Calculates cosine similarity between two vectors
 */
const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
};

/**
 * Improves result diversity by ensuring variety across categories.
 * Balances showing best matches while also showing diverse product types.
 */
export const balanceResultDiversity = (
  results: ProductWithSimilarity[],
  maxPerCategory = 3
): ProductWithSimilarity[] => {
  const categoryCount = new Map<string, number>();
  const balanced: ProductWithSimilarity[] = [];

  // First pass: add top matches regardless of category (top 5)
  const topMatches = results.slice(0, Math.min(5, results.length));
  balanced.push(...topMatches);
  
  topMatches.forEach(product => {
    categoryCount.set(product.category, (categoryCount.get(product.category) || 0) + 1);
  });

  // Second pass: add remaining results with category diversity
  for (const product of results.slice(5)) {
    const categoryCurrentCount = categoryCount.get(product.category) || 0;
    
    if (categoryCurrentCount < maxPerCategory) {
      balanced.push(product);
      categoryCount.set(product.category, categoryCurrentCount + 1);
    }
  }

  return balanced;
};

/**
 * Ensures each product ID appears only once in results
 */
export const removeDuplicateIds = (results: ProductWithSimilarity[]): ProductWithSimilarity[] => {
  const seen = new Set<string>();
  return results.filter(product => {
    if (seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
};
