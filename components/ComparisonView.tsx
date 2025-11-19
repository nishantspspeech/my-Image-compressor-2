import React, { useState, useRef, useEffect } from 'react';

interface ComparisonViewProps {
  originalUrl: string;
  compressedUrl: string;
  originalSize: string;
  compressedSize: string;
  originalDim: { w: number, h: number };
  compressedDim: { w: number, h: number };
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  originalUrl,
  compressedUrl,
  originalSize,
  compressedSize,
  originalDim,
  compressedDim
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsResizing(true);
  const handleMouseUp = () => setIsResizing(false);
  
  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : 0) - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove as any);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove as any);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResizing]);

  // Touch support
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-3xl mx-auto select-none">
       <div className="flex justify-between text-sm font-medium text-slate-400 px-1">
        <div className="flex flex-col">
          <span className="text-indigo-400">Original</span>
          <span className="text-xs">{originalSize} • {originalDim.w}x{originalDim.h}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-green-400">Compressed</span>
          <span className="text-xs">{compressedSize} • {compressedDim.w}x{compressedDim.h}</span>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full aspect-[4/3] sm:aspect-[16/9] bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-700"
        onTouchMove={handleTouchMove}
      >
        {/* Compressed Image (Background) */}
        <img 
          src={compressedUrl} 
          alt="Compressed" 
          className="absolute top-0 left-0 w-full h-full object-contain"
        />

        {/* Original Image (Clipped on top) */}
        <div 
          className="absolute top-0 left-0 h-full overflow-hidden border-r-2 border-indigo-500 bg-slate-900/50 backdrop-blur-sm"
          style={{ width: `${sliderPosition}%` }}
        >
          <img 
            src={originalUrl} 
            alt="Original" 
            className="absolute top-0 left-0 max-w-none h-full object-contain"
            style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%' }}
          />
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-10 -ml-5 flex items-center justify-center cursor-ew-resize z-10 group"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <div className="w-8 h-8 rounded-full bg-indigo-600 shadow-lg shadow-indigo-500/40 flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform">
             <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" transform="rotate(90 12 12)" />
             </svg>
          </div>
        </div>
        
        {/* Labels */}
        <div className="absolute bottom-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-md pointer-events-none">
          Before
        </div>
        <div className="absolute bottom-4 right-4 bg-indigo-600/80 text-white text-xs px-2 py-1 rounded backdrop-blur-md pointer-events-none">
          After
        </div>
      </div>
    </div>
  );
};