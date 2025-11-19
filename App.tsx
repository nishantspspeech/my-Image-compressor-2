import React, { useState, useEffect, useCallback } from 'react';
import { DropZone } from './components/DropZone';
import { ComparisonView } from './components/ComparisonView';
import { Controls } from './components/Controls';
import { AIAnalysisPanel } from './components/AIAnalysisPanel';
import { compressImage, formatBytes, readFileAsDataURL } from './services/compressionUtils';
import { analyzeImageWithGemini } from './services/geminiService';
import { CompressionSettings, CompressedResult, AppStatus, AIAnalysisResult } from './types';

const App: React.FC = () => {
  // --- State ---
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalDim, setOriginalDim] = useState({ w: 0, h: 0 });
  
  const [compressedResult, setCompressedResult] = useState<CompressedResult | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  const [settings, setSettings] = useState<CompressionSettings>({
    quality: 80,
    format: 'image/webp',
    scale: 1.0,
    maintainAspectRatio: true,
  });

  // --- Effects ---

  // Debounced Compression Trigger
  useEffect(() => {
    if (!originalUrl || !file) return;

    const timer = setTimeout(() => {
      performCompression();
    }, 300); // Debounce to prevent lag on slider drag

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, originalUrl]);

  // --- Handlers ---

  const handleFileSelect = async (selectedFile: File) => {
    setStatus(AppStatus.PROCESSING);
    setAiResult(null);
    setFile(selectedFile);
    
    try {
      const url = await readFileAsDataURL(selectedFile);
      setOriginalUrl(url);
      
      // Get dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalDim({ w: img.width, h: img.height });
      };
      img.src = url;

      // Reset settings slightly for new file but keep format preference
      setSettings(prev => ({ ...prev, scale: 1.0, maxWidth: undefined }));
      
      // Trigger initial compression will happen via useEffect
    } catch (error) {
      console.error("Error loading file:", error);
      setStatus(AppStatus.IDLE);
    }
  };

  const performCompression = async () => {
    if (!originalUrl) return;
    
    try {
      // Don't set global loading state for slider changes to keep UI responsive
      // just update the result when ready
      const result = await compressImage(originalUrl, settings);
      setCompressedResult(result);
      setStatus(AppStatus.READY);
    } catch (error) {
      console.error("Compression failed:", error);
    }
  };

  const handleAIAnalyze = async () => {
    if (!originalUrl) return;

    setStatus(AppStatus.ANALYZING);
    try {
        // Strip base64 header for Gemini
        const base64Data = originalUrl.split(',')[1];
        const mimeType = originalUrl.substring(originalUrl.indexOf(':') + 1, originalUrl.indexOf(';'));
        
        const result = await analyzeImageWithGemini(base64Data, mimeType);
        setAiResult(result);
    } catch (error) {
        console.error("AI Analysis failed:", error);
        alert("Failed to analyze image. Ensure API Key is valid.");
    } finally {
        setStatus(AppStatus.READY);
    }
  };

  const handleDownload = () => {
    if (!compressedResult) return;
    
    const link = document.createElement('a');
    link.href = compressedResult.url;
    
    // Use AI suggested filename if available, else original name + optimized
    let filename = 'optimized-image';
    if (aiResult?.suggestedFilename) {
        filename = aiResult.suggestedFilename;
    } else if (file) {
        const namePart = file.name.substring(0, file.name.lastIndexOf('.'));
        filename = `${namePart}-optimized`;
    }
    
    const ext = settings.format === 'image/jpeg' ? 'jpg' : settings.format === 'image/png' ? 'png' : 'webp';
    link.download = `${filename}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-slate-200 selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    OptiPix AI
                </span>
            </div>
            {file && (
                <button 
                    onClick={() => { setFile(null); setOriginalUrl(null); setCompressedResult(null); setAiResult(null); }}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                    New Upload
                </button>
            )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Initial View: DropZone */}
        {!originalUrl && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12 animate-fadeIn">
                <div className="text-center space-y-4 max-w-2xl">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                        Smart Image Compression <br />
                        <span className="text-indigo-400">Enhanced by Gemini</span>
                    </h1>
                    <p className="text-lg text-slate-400">
                        Compress your images locally with modern formats like WebP. 
                        Use AI to generate perfect SEO descriptions and optimized filenames.
                    </p>
                </div>
                <div className="w-full">
                    <DropZone onFileSelect={handleFileSelect} />
                </div>
            </div>
        )}

        {/* Editor View */}
        {originalUrl && compressedResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
                
                {/* Left Column: Preview (span 8) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-slate-900/50 rounded-2xl p-1 border border-slate-800 shadow-2xl shadow-black/50">
                        <ComparisonView 
                            originalUrl={originalUrl}
                            compressedUrl={compressedResult.url}
                            originalSize={file ? formatBytes(file.size) : '0 B'}
                            compressedSize={formatBytes(compressedResult.size)}
                            originalDim={originalDim}
                            compressedDim={{ w: compressedResult.width, h: compressedResult.height }}
                        />
                    </div>
                    
                    {/* Compression Stats Bar */}
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="px-3 py-1 rounded bg-slate-700 text-slate-300 text-sm">
                                Saved: <span className="text-green-400 font-bold">
                                    {Math.max(0, Math.round((1 - compressedResult.size / (file?.size || 1)) * 100))}%
                                </span>
                            </div>
                            <div className="text-sm text-slate-400">
                                {formatBytes(file?.size || 0)} <span className="mx-2">→</span> <span className="text-white font-semibold">{formatBytes(compressedResult.size)}</span>
                            </div>
                        </div>
                        <button 
                            onClick={handleDownload}
                            className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download Image
                        </button>
                    </div>
                </div>

                {/* Right Column: Tools (span 4) */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                    <div className="flex-1">
                        <Controls 
                            settings={settings} 
                            setSettings={setSettings} 
                            disabled={status === AppStatus.ANALYZING}
                        />
                    </div>
                    <div className="flex-1">
                        <AIAnalysisPanel 
                            status={status} 
                            result={aiResult} 
                            onAnalyze={handleAIAnalyze} 
                        />
                    </div>
                </div>

            </div>
        )}
      </main>
    </div>
  );
};

export default App;