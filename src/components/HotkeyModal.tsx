import React from 'react';
import { Cpu, X, Command } from 'lucide-react';

interface HotkeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HotkeyModal: React.FC<HotkeyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
        <div className="bg-slate-800/80 px-5 py-3.5 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-slate-100 text-sm">Keyboard Hotkey Shortcuts</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-700 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-2.5 text-xs text-slate-200">
          {[
            { key: 'Alt + R', action: 'Start / Stop Recording Studio' },
            { key: 'Alt + P', action: 'Pause / Resume Live Recording' },
            { key: 'Alt + M', action: 'Toggle Microphone Mute / Unmute' },
            { key: 'Alt + C', action: 'Toggle Cursor Halo Spotlight' },
            { key: 'Space', action: 'Trigger Click Ripple Animation' },
          ].map((hk, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300 font-medium">{hk.action}</span>
              <kbd className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-indigo-300 rounded-lg font-mono font-bold text-[11px] shadow">
                {hk.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="bg-slate-800/80 px-5 py-3 border-t border-slate-700/80 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs">
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
