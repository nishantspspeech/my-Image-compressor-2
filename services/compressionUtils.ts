import { CompressionSettings, CompressedResult } from '../types';

export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

export const compressImage = async (
  sourceUrl: string,
  settings: CompressionSettings
): Promise<CompressedResult> => {
  const img = await loadImage(sourceUrl);
  
  // Calculate dimensions
  let width = img.width * settings.scale;
  let height = img.height * settings.scale;

  if (settings.maxWidth && width > settings.maxWidth) {
    const ratio = settings.maxWidth / width;
    width = settings.maxWidth;
    height = height * ratio;
  }

  width = Math.round(width);
  height = Math.round(height);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Better quality scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas to Blob failed'));
          return;
        }
        const url = URL.createObjectURL(blob);
        resolve({
          blob,
          url,
          width,
          height,
          size: blob.size,
        });
      },
      settings.format,
      settings.quality / 100 // Canvas expects 0.0 - 1.0
    );
  });
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};