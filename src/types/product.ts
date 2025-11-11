export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
}

export interface ProductWithSimilarity extends Product {
  similarity: number;
}

export interface ProductEmbedding {
  productId: string;
  embedding: number[];
}
