import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

let model: mobilenet.MobileNet | null = null;

export const loadModel = async (): Promise<void> => {
  if (model) return;
  
  try {
    await tf.ready();
    model = await mobilenet.load({
      version: 2,
      alpha: 1.0,
    });
    console.log('MobileNet model loaded successfully');
  } catch (error) {
    console.error('Error loading MobileNet model:', error);
    throw error;
  }
};

export const getImageEmbedding = async (imageElement: HTMLImageElement): Promise<number[]> => {
  if (!model) {
    throw new Error('Model not loaded. Call loadModel() first.');
  }

  try {
    const activation = model.infer(imageElement, true);
    const embeddings = await activation.data();
    activation.dispose();
    
    return Array.from(embeddings);
  } catch (error) {
    console.error('Error extracting embeddings:', error);
    throw error;
  }
};

export const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

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

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
};

export const isModelLoaded = (): boolean => {
  return model !== null;
};
