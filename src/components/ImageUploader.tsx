import { useState, useRef, DragEvent } from 'react';
import { motion } from 'framer-motion';
import { Upload, Link as LinkIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validateImageUrl } from '@/lib/imageUtils';

interface ImageUploaderProps {
  onImageSelected: (imageData: string | File) => void;
}

export const ImageUploader = ({ onImageSelected }: ImageUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onImageSelected(file);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = () => {
    if (!validateImageUrl(imageUrl)) {
      return;
    }
    setPreview(imageUrl);
    onImageSelected(imageUrl);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setImageUrl('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {!preview ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              glass-card rounded-2xl p-12 text-center transition-all duration-300
              ${isDragging ? 'breathing-glow scale-105' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center breathing-glow">
                <Upload className="w-10 h-10 text-primary-foreground" />
              </div>
            </motion.div>

            <h3 className="text-2xl font-semibold mb-2">Upload an Image</h3>
            <p className="text-muted-foreground mb-6">
              Drag and drop, or click to browse
            </p>

            <Button
              onClick={() => fileInputRef.current?.click()}
              size="lg"
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              Choose File
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">or</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Paste Image URL</h3>
                <p className="text-sm text-muted-foreground">
                  Enter a direct link to an image
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                className="flex-1 h-12 rounded-xl border-border/50 bg-background/50"
              />
              <Button
                onClick={handleUrlSubmit}
                disabled={!imageUrl}
                size="lg"
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                Load
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="glass-card rounded-2xl p-6 relative slide-up-fade-in"
        >
          <Button
            onClick={clearPreview}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 rounded-full hover:bg-destructive/10"
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="aspect-video rounded-xl overflow-hidden bg-muted">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};
