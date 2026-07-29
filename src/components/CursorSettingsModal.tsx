import React from 'react';
import { Sparkles, X, MousePointer, ShieldAlert, Cpu } from 'lucide-react';
import { CursorConfig, CursorStyle } from '../types';

interface CursorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cursorConfig: CursorConfig;
  onChangeCursorConfig: (config: CursorConfig) => void;
}

export const CursorSettingsModal: React.FC<CursorSettingsModalProps> = ({
  isOpen,
  onClose,
  cursorConfig,
  onChangeCursorConfig,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
        <div className="bg-slate-800/80 px-5 py-3.5 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-slate-100 text-sm">Cursor Tracking Studio Settings</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-700 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-slate-200">
          {/* Style Picker */}
          <div>
            <label className="font-bold text-slate-300 block mb-2">Cursor Style</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'mac-arrow', label: 'macOS Arrow', desc: 'Classic crisp pointer' },
                { id: 'laser-pointer', label: 'Laser Pointer', desc: 'Red glowing dot' },
                { id: 'glowing-halo', label: 'Glowing Halo', desc: 'Indigo halo spotlight' },
                { id: 'crosshair', label: 'Crosshair', desc: 'Precision developer target' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() =>
                    onChangeCursorConfig({
                      ...cursorConfig,
                      style: item.id as CursorStyle,
                    })
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    cursorConfig.style === item.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>{item.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Click Ripple Toggle */}
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div>
              <div className="font-bold text-slate-200">Click Ripple Animations</div>
              <div className="text-[10px] text-slate-400">Shows expanding shockwave ring on pointer clicks</div>
            </div>
            <input
              type="checkbox"
              checked={cursorConfig.showRipple}
              onChange={(e) =>
                onChangeCursorConfig({
                  ...cursorConfig,
                  showRipple: e.target.checked,
                })
              }
              className="w-4 h-4 rounded bg-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Cursor Trail Toggle */}
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div>
              <div className="font-bold text-slate-200">Synchronized Mobile Mirror Cursor</div>
              <div className="text-[10px] text-slate-400">Mirrors cursor position across PC & Mobile simultaneously</div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              ALWAYS ON
            </span>
          </div>
        </div>

        <div className="bg-slate-800/80 px-5 py-3 border-t border-slate-700/80 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
