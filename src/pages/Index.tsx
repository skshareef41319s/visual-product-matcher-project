import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUploader } from '@/components/ImageUploader';
import { LoadingState } from '@/components/LoadingState';
import { ProductCard } from '@/components/ProductCard';
import { FilterBar } from '@/components/FilterBar';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { loadModel, getImageEmbedding, cosineSimilarity, isModelLoaded } from '@/lib/tensorflow';
import { loadImageFromFile, loadImageFromUrl } from '@/lib/imageUtils';
import { deduplicateResults, balanceResultDiversity, removeDuplicateIds } from '@/lib/matchingUtils';
import { Product, ProductWithSimilarity, ProductEmbedding } from '@/types/product';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [modelLoading, setModelLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ProductWithSimilarity[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [embeddings, setEmbeddings] = useState<Map<string, number[]>>(new Map());
  const [threshold, setThreshold] = useState(0.5);
  const [sortBy, setSortBy] = useState<'highest' | 'lowest' | 'category'>('highest');
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      try {
        await loadModel();
        const productsData = await fetch('/data/products.json').then(res => res.json());
        setProducts(productsData);

        // Precompute embeddings for all products
        const embeddingsMap = new Map<string, number[]>();
        for (const product of productsData) {
          try {
            const img = await loadImageFromUrl(product.image);
            const embedding = await getImageEmbedding(img);
            embeddingsMap.set(product.id, embedding);
          } catch (error) {
            console.error(`Failed to process ${product.name}:`, error);
          }
        }
        setEmbeddings(embeddingsMap);
        setModelLoading(false);
      } catch (error) {
        toast({
          title: 'Initialization Error',
          description: 'Failed to load the AI model. Please refresh the page.',
          variant: 'destructive',
        });
      }
    };

    init();
  }, [toast]);

  const handleImageSelected = async (imageData: string | File) => {
    setProcessing(true);

    try {
      let img: HTMLImageElement;

      if (typeof imageData === 'string') {
        img = await loadImageFromUrl(imageData);
      } else {
        img = await loadImageFromFile(imageData);
      }

      const queryEmbedding = await getImageEmbedding(img);

      // Step 1: Calculate similarity for all products
      const allMatches: ProductWithSimilarity[] = [];

      embeddings.forEach((embedding, productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const similarity = cosineSimilarity(queryEmbedding, embedding);

        // Use a lower initial threshold to get more candidates
        if (similarity >= 0.3) {
          allMatches.push({
            ...product,
            similarity,
          });
        }
      });

      // Step 2: Sort by similarity (best matches first)
      allMatches.sort((a, b) => b.similarity - a.similarity);

      // Step 3: Remove duplicate IDs (shouldn't happen, but just in case)
      const uniqueMatches = removeDuplicateIds(allMatches);

      // Step 4: Remove visually similar duplicates (same product, different angles)
      const deduplicated = deduplicateResults(uniqueMatches, embeddings);

      // Step 5: Balance category diversity while keeping best matches
      const balanced = balanceResultDiversity(deduplicated);

      setResults(balanced);
      setShowResults(true);
    } catch (error) {
      toast({
        title: 'Processing Error',
        description: error instanceof Error ? error.message : 'Failed to process image',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setShowResults(false);
    setResults([]);
  };

  const filteredAndSortedResults = results
    .filter(r => r.similarity >= threshold)
    .sort((a, b) => {
      if (sortBy === 'highest') return b.similarity - a.similarity;
      if (sortBy === 'lowest') return a.similarity - b.similarity;
      return a.category.localeCompare(b.category);
    });

  if (modelLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState message="Loading AI model..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Visual Product Matcher
            </h1>
          </motion.div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload an image and discover visually similar products instantly — powered by AI, running in your browser
          </p>
        </motion.header>

        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div key="upload">
              <ImageUploader onImageSelected={handleImageSelected} />
            </motion.div>
          ) : processing ? (
            <motion.div key="loading">
              <LoadingState />
            </motion.div>
          ) : (
            <motion.div key="results" className="space-y-6">
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  New Search
                </Button>
              </div>

              <FilterBar
                threshold={threshold}
                onThresholdChange={setThreshold}
                sortBy={sortBy}
                onSortChange={setSortBy}
                resultCount={filteredAndSortedResults.length}
              />

              {filteredAndSortedResults.length === 0 ? (
                <EmptyState onReset={handleReset} />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {filteredAndSortedResults.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
