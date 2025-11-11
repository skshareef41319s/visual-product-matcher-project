import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  threshold: number;
  onThresholdChange: (value: number) => void;
  sortBy: 'highest' | 'lowest' | 'category';
  onSortChange: (value: 'highest' | 'lowest' | 'category') => void;
  resultCount: number;
}

export const FilterBar = ({
  threshold,
  onThresholdChange,
  sortBy,
  onSortChange,
  resultCount,
}: FilterBarProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-2xl p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Filters</h3>
            <p className="text-sm text-muted-foreground">
              {resultCount} {resultCount === 1 ? 'match' : 'matches'} found
            </p>
          </div>
        </div>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px] rounded-xl border-border/50 bg-background/50">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="highest">Highest Match</SelectItem>
            <SelectItem value="lowest">Lowest Match</SelectItem>
            <SelectItem value="category">Category</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <label className="font-medium">Minimum Similarity</label>
          <span className="text-muted-foreground">
            {Math.round(threshold * 100)}%
          </span>
        </div>
        <Slider
          value={[threshold]}
          onValueChange={([value]) => onThresholdChange(value)}
          min={0}
          max={1}
          step={0.01}
          className="w-full"
        />
      </div>
    </motion.div>
  );
};
