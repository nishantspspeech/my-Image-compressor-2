import React from 'react';
import { AIAnalysisResult, AppStatus } from '../types';

interface AIAnalysisPanelProps {
  status: AppStatus;
  result: AIAnalysisResult | null;
  onAnalyze: () => void;
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ status, result, onAnalyze }) => {
  const isAnalyzing = status === AppStatus.ANALYZING;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col gap-4 h-full relative overflow-hidden">
      {/* Decorator */}
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <svg className="w-32 h-32 text-indigo-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
          <path d="M12 6a1 1 0 0 0-1 1v4.59L8.29 14.3a1 1 0 1 0 1.42 1.42l3-3A1 1 0 0 0 13 12V7a1 1 0 0 0-1-1z"/>
        </svg>
      </div>

      <div className="flex items-center justify-between relative z-10">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Smart Analysis <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">Gemini AI</span>
        </h2>
      </div>

      <p className="text-sm text-slate-400 relative z-10">
        Use AI to generate SEO-friendly alt text, tags, and filenames before downloading.
      </p>

      {!result && (
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className={`
            mt-auto w-full py-3 rounded-lg font-medium text-sm relative overflow-hidden group
            ${isAnalyzing ? 'bg-slate-700 cursor-wait text-slate-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all'}
          `}
        >
           {isAnalyzing ? (
               <div className="flex items-center justify-center gap-2">
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   Analyzing...
               </div>
           ) : (
               <span className="flex items-center justify-center gap-2">
                 Analyze with Gemini
               </span>
           )}
        </button>
      )}

      {result && (
        <div className="space-y-4 mt-2 animate-fadeIn relative z-10">
            
            {/* Suggested Filename */}
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block">Suggested Filename</label>
                <div className="flex items-center justify-between gap-2">
                    <code className="text-green-400 text-sm truncate">{result.suggestedFilename}</code>
                    <button 
                        onClick={() => navigator.clipboard.writeText(result.suggestedFilename)}
                        className="text-slate-500 hover:text-white transition-colors"
                        title="Copy"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    </button>
                </div>
            </div>

            {/* Alt Text */}
            <div>
                <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block">Alt Text</label>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/30 p-2 rounded border border-slate-700/50">
                    {result.description}
                </p>
            </div>

            {/* Keywords */}
            <div>
                <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-2 block">Keywords</label>
                <div className="flex flex-wrap gap-2">
                    {result.keywords.map((kw, i) => (
                        <span key={i} className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded-full">
                            #{kw}
                        </span>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};