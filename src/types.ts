export type RecordingState = 'idle' | 'countdown' | 'recording' | 'paused' | 'completed';

export type LayoutMode = 'side-by-side' | 'desktop-only' | 'mobile-only' | 'picture-in-picture' | 'split-screen';

export type ResolutionPreset = '1080p' | '1440p' | '4k' | '720p';

export type VideoFormat = 'mp4' | 'webm' | 'mkv' | 'avi';

export type CursorStyle = 'mac-arrow' | 'laser-pointer' | 'glowing-halo' | 'crosshair' | 'dev-dot';

export interface CursorConfig {
  style: CursorStyle;
  color: string;
  size: number;
  showRipple: boolean;
  rippleColor: string;
  smoothing: number; // 0 to 1
  trail: boolean;
}

export interface AudioConfig {
  micEnabled: boolean;
  systemAudioEnabled: boolean;
  selectedMicDeviceId: string;
  micVolume: number; // 0 to 1
  systemVolume: number; // 0 to 1
}

export interface CursorPosition {
  xPercent: number; // 0 to 100 relative to active viewport width
  yPercent: number; // 0 to 100 relative to active viewport height
  isDown: boolean;
  activeViewport: 'desktop' | 'mobile' | 'none';
  targetLabel?: string;
}

export interface TourStep {
  id: string;
  type: 'move' | 'click' | 'scroll' | 'type' | 'wait';
  targetXPercent: number;
  targetYPercent: number;
  viewport: 'desktop' | 'mobile';
  durationMs: number;
  label: string;
  textToType?: string;
  scrollAmount?: number;
}

export interface TourPreset {
  id: string;
  name: string;
  description: string;
  steps: TourStep[];
}

export interface RecoveredChunkRecord {
  id: string;
  recordingId: string;
  timestamp: number;
  blob: Blob;
  durationMs: number;
  resolution: string;
  fps: number;
}

export interface RecordingMetadata {
  id: string;
  startTime: number;
  durationMs: number;
  resolution: ResolutionPreset;
  fps: number;
  format: VideoFormat;
  chunkCount: number;
  totalSizeBytes: number;
  websiteUrl: string;
}

export interface HotkeyConfig {
  startStopKey: string;
  pauseResumeKey: string;
  toggleCursorKey: string;
  muteMicKey: string;
}
