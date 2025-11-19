export interface CompressionSettings {
  quality: number; // 0 to 100
  format: 'image/jpeg' | 'image/png' | 'image/webp';
  scale: number; // 0.1 to 1.0
  maintainAspectRatio: boolean;
  maxWidth?: number;
}

export interface CompressedResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  size: number;
}

export interface AIAnalysisResult {
  description: string;
  keywords: string[];
  suggestedFilename: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  ANALYZING = 'ANALYZING',
  READY = 'READY',
}