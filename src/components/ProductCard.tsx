import { motion } from 'framer-motion';
import { ProductWithSimilarity } from '@/types/product';
import { Progress } from '@/components/ui/progress';

interface ProductCardProps {
  product: ProductWithSimilarity;
  index: number;
}

export const ProductCard = ({ product, index }: ProductCardProps) => {
  const similarity = Math.round(product.similarity * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
      className="glass-card rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-glow"
    >
      <div className="aspect-square overflow-hidden bg-muted relative">
        <motion.img
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        
        <div className="absolute top-3 right-3">
          <div className="bg-background/90 backdrop-blur-sm rounded-full px-3 py-1.5 border border-border/50">
            <span className="text-sm font-semibold text-primary">
              {similarity}%
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {product.category}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Match</span>
            <span className="font-medium">{similarity}%</span>
          </div>
          <Progress value={similarity} className="h-2" />
        </div>
      </div>
    </motion.div>
  );
};
