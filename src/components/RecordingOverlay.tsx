import React from 'react';
import { Pause, Play, Square, Mic, MicOff, Clock, Sparkles } from 'lucide-react';
import { RecordingState } from '../types';
import { formatTime } from '../utils/videoExporter';

interface RecordingOverlayProps {
  recordingState: RecordingState;
  durationSeconds: number;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  liveAudioLevel: number;
  resolution: string;
}

export const RecordingOverlay: React.FC<RecordingOverlayProps> = ({
  recordingState,
  durationSeconds,
  onPause,
  onResume,
  onStop,
  liveAudioLevel,
  resolution,
}) => {
  if (recordingState === 'idle' || recordingState === 'completed') return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 select-none">
      <div className="bg-slate-900/90 backdrop-blur-md border border-rose-500/40 rounded-2xl px-5 py-2.5 shadow-2xl flex items-center space-x-4 ring-1 ring-rose-500/20">
        {/* Pulsing Red Dot & Timer */}
        <div className="flex items-center space-x-2.5">
          {recordingState === 'recording' ? (
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping"></span>
          ) : (
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500"></span>
          )}
          <span className="font-mono font-bold text-sm text-slate-100 tracking-wider">
            {formatTime(durationSeconds)}
          </span>
        </div>

        {/* Audio VU Meter */}
        <div className="flex items-center space-x-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
          <Mic className="w-3 h-3 text-rose-400" />
          <div className="w-8 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${liveAudioLevel}%` }}
              className="h-full bg-emerald-400 transition-all duration-75"
            ></div>
          </div>
        </div>

        {/* Quality Tag */}
        <span className="hidden sm:inline-block text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
          {resolution.toUpperCase()}
        </span>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          {recordingState === 'recording' ? (
            <button
              onClick={onPause}
              className="p-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
              title="Pause (Alt+P)"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onResume}
              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
              title="Resume (Alt+P)"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onStop}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-rose-600/30"
            title="Stop & Export (Alt+R)"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>FINISH RECORDING</span>
          </button>
        </div>
      </div>
    </div>
  );
};
