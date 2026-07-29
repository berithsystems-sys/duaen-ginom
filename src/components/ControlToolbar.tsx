import React, { useState } from 'react';
import {
  Globe,
  Monitor,
  Smartphone,
  Columns,
  Maximize2,
  Video,
  Pause,
  Play,
  Square,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  ChevronDown,
  Layers,
  Wand2,
  RefreshCw,
} from 'lucide-react';
import {
  RecordingState,
  LayoutMode,
  ResolutionPreset,
  AudioConfig,
  CaptureSource,
} from '../types';
import { SAMPLE_WEBSITES } from '../data/sampleWebsites';

interface ControlToolbarProps {
  recordingState: RecordingState;
  onStartRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onStopRecording: () => void;

  websiteUrl: string;
  onWebsiteUrlChange: (url: string) => void;
  useProxy: boolean;
  onToggleProxy: (val: boolean) => void;
  onLoadWebsite: (url: string) => void;

  layoutMode: LayoutMode;
  onChangeLayoutMode: (mode: LayoutMode) => void;

  captureSource?: CaptureSource;
  onChangeCaptureSource?: (source: CaptureSource) => void;

  resolution: ResolutionPreset;
  onChangeResolution: (res: ResolutionPreset) => void;

  fps: number;
  onChangeFps: (fps: number) => void;

  countdownSeconds: number;
  onChangeCountdownSeconds: (sec: number) => void;

  audioConfig: AudioConfig;
  onChangeAudioConfig: (config: AudioConfig) => void;
  availableMics: MediaDeviceInfo[];
  liveAudioLevel: number;

  onOpenTourModal: () => void;
  onOpenCursorModal: () => void;
}

export const ControlToolbar: React.FC<ControlToolbarProps> = ({
  recordingState,
  onStartRecording,
  onPauseRecording,
  onResumeRecording,
  onStopRecording,

  websiteUrl,
  onWebsiteUrlChange,
  useProxy,
  onToggleProxy,
  onLoadWebsite,

  layoutMode,
  onChangeLayoutMode,

  captureSource,
  onChangeCaptureSource,

  resolution,
  onChangeResolution,

  fps,
  onChangeFps,

  countdownSeconds,
  onChangeCountdownSeconds,

  audioConfig,
  onChangeAudioConfig,
  availableMics,
  liveAudioLevel,

  onOpenTourModal,
  onOpenCursorModal,
}) => {
  const [showWebsiteMenu, setShowWebsiteMenu] = useState(false);

  const isRecording = recordingState === 'recording' || recordingState === 'paused';

  return (
    <div className="bg-slate-900/95 border-b border-slate-800 p-3 text-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-xl z-40">
      {/* 1. Website URL Input & Presets */}
      <div className="flex items-center space-x-2 flex-1 min-w-[320px]">
        <div className="relative flex-1 flex items-center bg-slate-950 border border-indigo-500/40 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500/70 shadow-inner">
          <span className="hidden sm:inline-flex items-center text-[10px] font-bold text-indigo-300 uppercase tracking-wider bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30 mr-2 flex-shrink-0">
            Target URL
          </span>
          <Globe className="w-4 h-4 text-indigo-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={websiteUrl}
            onChange={(e) => onWebsiteUrlChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onLoadWebsite(websiteUrl);
            }}
            placeholder="Enter App URL (e.g. http://localhost:3000 or https://example.com)..."
            className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-400 font-medium focus:outline-none"
            disabled={isRecording}
          />
          <button
            onClick={() => onLoadWebsite(websiteUrl)}
            className="ml-2 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg shadow-sm transition-colors"
            disabled={isRecording}
          >
            Load
          </button>
        </div>

        {/* Demo Apps Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowWebsiteMenu(!showWebsiteMenu)}
            disabled={isRecording}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Demo Apps</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showWebsiteMenu && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Select Test App Preset
              </div>
              <div className="space-y-1">
                {SAMPLE_WEBSITES.map((site) => (
                  <button
                    key={site.id}
                    onClick={() => {
                      onLoadWebsite(site.url);
                      setShowWebsiteMenu(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-700/80 text-xs transition-colors flex items-start space-x-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-slate-200">{site.name}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{site.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CORS Proxy Toggle */}
        <label className="hidden sm:flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={useProxy}
            onChange={(e) => onToggleProxy(e.target.checked)}
            disabled={isRecording}
            className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
          />
          <span>CORS Proxy</span>
        </label>
      </div>

      {/* 2. Studio Layout, Resolution, Audio & Tour Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Recording Source Selection */}
        {onChangeCaptureSource && (
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-indigo-500/30">
            <button
              onClick={() => onChangeCaptureSource('duaen-canvas')}
              className={`p-1.5 rounded-lg text-xs flex items-center space-x-1 transition-all ${
                captureSource === 'duaen-canvas' ? 'bg-indigo-600 text-white font-semibold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="DuaEn Dual Studio Canvas Mode (PC + Mobile UI & synchronized cursor)"
              disabled={isRecording}
            >
              <Video className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px]">DuaEn Studio</span>
            </button>
            <button
              onClick={() => onChangeCaptureSource('screen-share')}
              className={`p-1.5 rounded-lg text-xs flex items-center space-x-1 transition-all ${
                captureSource === 'screen-share' ? 'bg-indigo-600 text-white font-semibold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Live Browser Tab / Screen Capture Mode"
              disabled={isRecording}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px]">Live Tab</span>
            </button>
          </div>
        )}

        {/* Layout Modes */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onChangeLayoutMode('side-by-side')}
            className={`p-1.5 rounded-lg text-xs flex items-center space-x-1 transition-all ${
              layoutMode === 'side-by-side' ? 'bg-indigo-600 text-white font-semibold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Dual Side-by-Side View (Desktop 16:9 + Mobile 9:16)"
            disabled={isRecording}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">Dual View</span>
          </button>

          <button
            onClick={() => onChangeLayoutMode('desktop-only')}
            className={`p-1.5 rounded-lg text-xs flex items-center space-x-1 transition-all ${
              layoutMode === 'desktop-only' ? 'bg-indigo-600 text-white font-semibold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Desktop PC View Only"
            disabled={isRecording}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">PC</span>
          </button>

          <button
            onClick={() => onChangeLayoutMode('mobile-only')}
            className={`p-1.5 rounded-lg text-xs flex items-center space-x-1 transition-all ${
              layoutMode === 'mobile-only' ? 'bg-indigo-600 text-white font-semibold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mobile View Only"
            disabled={isRecording}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">Mobile</span>
          </button>

          <button
            onClick={() => onChangeLayoutMode('picture-in-picture')}
            className={`p-1.5 rounded-lg text-xs flex items-center space-x-1 transition-all ${
              layoutMode === 'picture-in-picture' ? 'bg-indigo-600 text-white font-semibold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Picture-in-Picture (Mobile over Desktop)"
            disabled={isRecording}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">PiP</span>
          </button>
        </div>

        {/* Resolution Selector */}
        <select
          value={resolution}
          onChange={(e) => onChangeResolution(e.target.value as ResolutionPreset)}
          disabled={isRecording}
          className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
        >
          <option value="1080p">1080p Full HD</option>
          <option value="1440p">1440p 2K QHD</option>
          <option value="4k">4K Ultra HD</option>
          <option value="720p">720p (Low CPU)</option>
        </select>

        {/* FPS Selector */}
        <select
          value={fps}
          onChange={(e) => onChangeFps(Number(e.target.value))}
          disabled={isRecording}
          className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
        >
          <option value={60}>60 FPS</option>
          <option value={30}>30 FPS</option>
        </select>

        {/* Audio Mic Controls */}
        <div className="flex items-center space-x-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
          <button
            onClick={() =>
              onChangeAudioConfig({
                ...audioConfig,
                micEnabled: !audioConfig.micEnabled,
              })
            }
            disabled={isRecording}
            className={`p-1 rounded-lg transition-colors ${
              audioConfig.micEnabled ? 'bg-rose-500/20 text-rose-400' : 'text-slate-500 hover:text-slate-300'
            }`}
            title={audioConfig.micEnabled ? 'Microphone On' : 'Microphone Muted'}
          >
            {audioConfig.micEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          </button>

          {/* Audio VU Level Meter Bar */}
          {audioConfig.micEnabled && (
            <div className="w-10 h-2 bg-slate-800 rounded-full overflow-hidden flex items-center">
              <div
                style={{ width: `${liveAudioLevel}%` }}
                className={`h-full transition-all duration-75 ${
                  liveAudioLevel > 85 ? 'bg-red-500' : liveAudioLevel > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              ></div>
            </div>
          )}
        </div>

        {/* Countdown Timer selector */}
        <div className="flex items-center space-x-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <select
            value={countdownSeconds}
            onChange={(e) => onChangeCountdownSeconds(Number(e.target.value))}
            disabled={isRecording}
            className="bg-transparent text-slate-200 text-xs focus:outline-none"
          >
            <option value={0}>0s Delay</option>
            <option value={3}>3s Countdown</option>
            <option value={5}>5s Countdown</option>
            <option value={10}>10s Countdown</option>
          </select>
        </div>

        {/* Custom Cursor Settings */}
        <button
          onClick={onOpenCursorModal}
          disabled={isRecording}
          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-medium flex items-center space-x-1.5"
          title="Cursor Tracking Style Settings"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xl:inline">Cursor</span>
        </button>

        {/* Automation Tour Button */}
        <button
          onClick={onOpenTourModal}
          disabled={isRecording}
          className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center space-x-1.5 transition-all"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Auto Tour</span>
        </button>

        {/* Primary RECORDING ACTION BUTTON */}
        <div className="pl-1 border-l border-slate-800">
          {recordingState === 'idle' && (
            <button
              onClick={onStartRecording}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center space-x-2 transition-all transform active:scale-95"
            >
              <Video className="w-4 h-4" />
              <span>REC STUDIO</span>
            </button>
          )}

          {recordingState === 'recording' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={onPauseRecording}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
                title="Pause Recording (Alt+P)"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
              <button
                onClick={onStopRecording}
                className="px-4 py-1.5 bg-slate-100 hover:bg-white text-slate-950 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-xl animate-pulse"
                title="Stop & Export Video (Alt+R)"
              >
                <Square className="w-3.5 h-3.5 fill-current text-rose-600" />
                <span>FINISH</span>
              </button>
            </div>
          )}

          {recordingState === 'paused' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={onResumeRecording}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
                title="Resume Recording"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Resume</span>
              </button>
              <button
                onClick={onStopRecording}
                className="px-4 py-1.5 bg-slate-100 hover:bg-white text-slate-950 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-xl"
              >
                <Square className="w-3.5 h-3.5 fill-current text-rose-600" />
                <span>FINISH</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
