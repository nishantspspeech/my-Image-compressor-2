import React from 'react';
import { CompressionSettings } from '../types';

interface ControlsProps {
  settings: CompressionSettings;
  setSettings: React.Dispatch<React.SetStateAction<CompressionSettings>>;
  disabled?: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ settings, setSettings, disabled }) => {
  
  const handleChange = <K extends keyof CompressionSettings>(
    key: K, 
    value: CompressionSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col gap-6 h-full">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Settings
      </h2>

      {/* Format Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Output Format</label>
        <div className="grid grid-cols-3 gap-2">
          {['image/jpeg', 'image/png', 'image/webp'].map((fmt) => (
            <button
              key={fmt}
              disabled={disabled}
              onClick={() => handleChange('format', fmt as any)}
              className={`
                py-2 px-3 rounded-lg text-sm font-medium transition-all
                ${settings.format === fmt 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {fmt.split('/')[1].toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Quality Slider */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Quality</label>
          <span className="text-indigo-400 font-mono font-bold text-lg">{settings.quality}%</span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          step="1"
          value={settings.quality}
          disabled={disabled}
          onChange={(e) => handleChange('quality', parseInt(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-medium px-1">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Scale Slider */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Resize (Scale)</label>
          <span className="text-indigo-400 font-mono font-bold text-lg">{Math.round(settings.scale * 100)}%</span>
        </div>
         <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={settings.scale * 100}
          disabled={disabled}
          onChange={(e) => handleChange('scale', parseInt(e.target.value) / 100)}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Max Width */}
       <div className="space-y-2">
        <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Max Width (px)</label>
            {settings.maxWidth && (
                <button 
                    onClick={() => handleChange('maxWidth', undefined)}
                    className="text-[10px] text-red-400 hover:underline"
                >
                    Reset
                </button>
            )}
        </div>
        <input 
            type="number"
            value={settings.maxWidth || ''}
            placeholder="Original"
            disabled={disabled}
            onChange={(e) => handleChange('maxWidth', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
       </div>
    </div>
  );
};