import React, { useState } from 'react';
import {
  Download,
  X,
  Play,
  Film,
  Sparkles,
  HardDriveDownload,
  CheckCircle,
  FileVideo,
  Share2,
} from 'lucide-react';
import { VideoFormat, ResolutionPreset } from '../types';
import { exportVideoFile, formatBytes, formatTime } from '../utils/videoExporter';

interface VideoPlaybackModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordedBlob: Blob | null;
  durationMs: number;
  resolution: ResolutionPreset;
  fps: number;
}

export const VideoPlaybackModal: React.FC<VideoPlaybackModalProps> = ({
  isOpen,
  onClose,
  recordedBlob,
  durationMs,
  resolution,
  fps,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<VideoFormat>('mp4');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen || !recordedBlob) return null;

  const videoUrl = URL.createObjectURL(recordedBlob);

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      await exportVideoFile({
        blob: recordedBlob,
        format: selectedFormat,
        resolution,
        fps,
        durationSeconds: durationMs / 1000,
      });
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-800/80 px-5 py-3.5 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-sm">Tutorial Video Ready!</h2>
              <p className="text-[11px] text-slate-400">Preview and export high-resolution tutorial file locally</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player & Details */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-slate-200 text-xs">
          {/* HTML5 Video Player */}
          <div className="relative bg-black rounded-xl overflow-hidden border border-slate-800 aspect-video flex items-center justify-center shadow-inner">
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          </div>

          {/* Recording Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-500 font-medium">DURATION</div>
              <div className="font-mono font-bold text-slate-200">{formatTime(durationMs / 1000)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-medium">FILE SIZE</div>
              <div className="font-mono font-bold text-slate-200">{formatBytes(recordedBlob.size)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-medium">RESOLUTION</div>
              <div className="font-mono font-bold text-indigo-400">{resolution.toUpperCase()}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-medium">FRAMERATE</div>
              <div className="font-mono font-bold text-emerald-400">{fps} FPS</div>
            </div>
          </div>

          {/* Export Format Selector */}
          <div>
            <label className="font-bold text-slate-300 block mb-2">Select Export Video Format (Local Download)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'mp4', name: 'MP4 (H.264)', desc: 'Universal video player format' },
                { id: 'webm', name: 'WebM (VP9)', desc: 'High quality web stream' },
                { id: 'mkv', name: 'MKV Container', desc: 'Matroska tutorial file' },
                { id: 'avi', name: 'AVI Movie', desc: 'Legacy Windows & editing format' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id as VideoFormat)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedFormat === fmt.id
                      ? 'bg-rose-600/20 border-rose-500 text-rose-300 font-bold shadow-lg shadow-rose-600/10'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{fmt.name}</span>
                    <FileVideo className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{fmt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {exportSuccess && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl flex items-center space-x-2 animate-bounce">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Video saved successfully to your local computer!</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-800/80 px-5 py-3 border-t border-slate-700/80 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-medium">
            Close
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-xl shadow-rose-600/20 flex items-center space-x-2 transition-all transform active:scale-95"
          >
            <HardDriveDownload className="w-4 h-4" />
            <span>{isExporting ? 'Packaging Local Video...' : `SAVE ${selectedFormat.toUpperCase()} TO PC`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
