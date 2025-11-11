import { motion } from 'framer-motion';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onReset: () => void;
}

export const EmptyState = ({ onReset }: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 space-y-6"
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-24 h-24 rounded-full bg-muted flex items-center justify-center"
      >
        <SearchX className="w-12 h-12 text-muted-foreground" />
      </motion.div>

      <div className="text-center space-y-2 max-w-md">
        <h3 className="text-2xl font-semibold">No Matches Found</h3>
        <p className="text-muted-foreground">
          Couldn't find close matches above the similarity threshold. Try lowering the threshold or upload a different image.
        </p>
      </div>

      <Button
        onClick={onReset}
        size="lg"
        className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
      >
        Try Another Image
      </Button>
    </motion.div>
  );
};
