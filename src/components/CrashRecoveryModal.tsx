import React from 'react';
import { HardDriveDownload, X, AlertTriangle, Trash2, CheckCircle, Video } from 'lucide-react';
import { RecordingMetadata } from '../types';
import { formatBytes, formatTime } from '../utils/videoExporter';

interface CrashRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  unrecoveredList: { metadata: RecordingMetadata; chunks: Blob[] }[];
  onRecoverRecording: (record: { metadata: RecordingMetadata; chunks: Blob[] }) => void;
  onClearRecording: (recordingId: string) => void;
}

export const CrashRecoveryModal: React.FC<CrashRecoveryModalProps> = ({
  isOpen,
  onClose,
  unrecoveredList,
  onRecoverRecording,
  onClearRecording,
}) => {
  if (!isOpen || unrecoveredList.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
        <div className="bg-amber-500/20 px-5 py-3.5 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-bold text-slate-100 text-sm">Recover Unsaved Video Tutorial</h2>
              <p className="text-[11px] text-amber-300">Auto-saved chunks found in IndexedDB from previous session</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs text-slate-200 overflow-y-auto max-h-[60vh]">
          {unrecoveredList.map((item) => {
            const totalBytes = item.chunks.reduce((acc, c) => acc + c.size, 0);
            return (
              <div
                key={item.metadata.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-100 flex items-center space-x-2">
                    <Video className="w-4 h-4 text-amber-400" />
                    <span>Tutorial Capture ({item.metadata.resolution.toUpperCase()})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 space-x-3">
                    <span>Size: {formatBytes(totalBytes)}</span>
                    <span>Chunks: {item.chunks.length}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onClearRecording(item.metadata.id)}
                    className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl"
                    title="Discard saved chunks"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRecoverRecording(item)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20"
                  >
                    <HardDriveDownload className="w-4 h-4" />
                    <span>Recover Video</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-slate-800/80 px-5 py-3 border-t border-slate-700/80 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-medium">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
