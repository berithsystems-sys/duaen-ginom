import React from 'react';
import { Video, ShieldCheck, Cpu, HelpCircle, HardDriveDownload, Sparkles } from 'lucide-react';
import { RecordingState, ResolutionPreset } from '../types';

interface NavbarProps {
  recordingState: RecordingState;
  resolution: ResolutionPreset;
  fps: number;
  hasUnrecoveredRecordings: boolean;
  onOpenRecoveryModal: () => void;
  onOpenHotkeyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  recordingState,
  resolution,
  fps,
  hasUnrecoveredRecordings,
  onOpenRecoveryModal,
  onOpenHotkeyModal,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between text-slate-100 sticky top-0 z-50">
      {/* Brand Logo & Name */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-indigo-600 p-0.5 shadow-lg shadow-rose-500/20">
          <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
            <Video className="w-5 h-5 text-rose-400 animate-pulse" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-base tracking-tight text-slate-100">AutoDoc Rec</h1>
            <span className="text-[10px] uppercase tracking-wider bg-rose-500/10 text-rose-400 font-bold px-1.5 py-0.5 rounded border border-rose-500/20">
              Dual Studio
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Automated PC + Mobile Video Tutorial Studio</p>
        </div>
      </div>

      {/* Middle Status & Badges */}
      <div className="hidden md:flex items-center space-x-3">
        {/* Recording State Badge */}
        {recordingState === 'recording' && (
          <div className="flex items-center space-x-2 bg-red-500/15 border border-red-500/40 text-red-400 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>RECORDING LIVE</span>
          </div>
        )}

        {recordingState === 'paused' && (
          <div className="flex items-center space-x-2 bg-amber-500/15 border border-amber-500/40 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>RECORDING PAUSED</span>
          </div>
        )}

        {/* Resolution Quality Badge */}
        <div className="flex items-center space-x-1.5 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-lg text-xs font-mono text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            {resolution.toUpperCase()} @ {fps}FPS
          </span>
        </div>

        {/* Recovery Alert Badge if crash recovery chunks exist */}
        {hasUnrecoveredRecordings && (
          <button
            onClick={onOpenRecoveryModal}
            className="flex items-center space-x-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-emerald-500/30 transition-all animate-bounce"
          >
            <HardDriveDownload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Recovered Video Available!</span>
          </button>
        )}
      </div>

      {/* Action Buttons & Utilities */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenHotkeyModal}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors"
          title="Keyboard Hotkey Shortcuts"
        >
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Shortcuts</span>
        </button>

        <div className="flex items-center space-x-1 pl-2 border-l border-slate-800">
          <span className="flex items-center text-[11px] text-emerald-400 font-medium px-2 py-1 bg-emerald-500/10 rounded-md border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Local 100% Privacy
          </span>
        </div>
      </div>
    </header>
  );
};
