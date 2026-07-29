import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RecordingState,
  LayoutMode,
  ResolutionPreset,
  VideoFormat,
  CursorConfig,
  AudioConfig,
  CursorPosition,
  TourPreset,
  RecordingMetadata,
  CaptureSource,
} from './types';
import { Navbar } from './components/Navbar';
import { ControlToolbar } from './components/ControlToolbar';
import { DualPreviewCanvas } from './components/DualPreviewCanvas';
import { RecordingOverlay } from './components/RecordingOverlay';
import { AutomationTourPanel } from './components/AutomationTourPanel';
import { CursorSettingsModal } from './components/CursorSettingsModal';
import { VideoPlaybackModal } from './components/VideoPlaybackModal';
import { CrashRecoveryModal } from './components/CrashRecoveryModal';

import { AudioMixer } from './utils/audioMixer';
import {
  saveChunkToDB,
  saveRecordingMetadata,
  getUnrecoveredRecordings,
  clearRecordingFromDB,
} from './utils/indexedDB';

import { fixWebmDuration } from './utils/fixWebmDuration';

export default function App() {
  // Website & Proxy State
  const [websiteUrl, setWebsiteUrl] = useState('https://www.google.com');
  const [activeSiteId, setActiveSiteId] = useState('app');
  const [useProxy, setUseProxy] = useState(true);

  // Recording Studio Configuration
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('side-by-side');
  const [captureSource, setCaptureSource] = useState<CaptureSource>('duaen-canvas');
  const [resolution, setResolution] = useState<ResolutionPreset>('1080p');
  const [fps, setFps] = useState<number>(60);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(3);
  const [currentCountdown, setCurrentCountdown] = useState<number>(0);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);

  // Audio Configuration & Meter
  const [audioConfig, setAudioConfig] = useState<AudioConfig>({
    micEnabled: true,
    systemAudioEnabled: true,
    selectedMicDeviceId: 'default',
    micVolume: 1.0,
    systemVolume: 0.8,
  });
  const [availableMics, setAvailableMics] = useState<MediaDeviceInfo[]>([]);
  const [liveAudioLevel, setLiveAudioLevel] = useState<number>(0);

  // Cursor Configuration & Position
  const [cursorConfig, setCursorConfig] = useState<CursorConfig>({
    style: 'mac-arrow',
    color: '#6366f1',
    size: 18,
    showRipple: true,
    rippleColor: 'rgba(239, 68, 68, 0.4)',
    smoothing: 0.8,
    trail: true,
  });

  const [cursorPos, setCursorPos] = useState<CursorPosition>({
    xPercent: 45,
    yPercent: 30,
    isDown: false,
    activeViewport: 'desktop',
  });

  // Recorded Blobs & Modals
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [unrecoveredList, setUnrecoveredList] = useState<
    { metadata: RecordingMetadata; chunks: Blob[] }[]
  >([]);

  // Modals visibility flags
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [isCursorModalOpen, setIsCursorModalOpen] = useState(false);
  const [isPlaybackModalOpen, setIsPlaybackModalOpen] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

  // Refs for Recording MediaRecorder and Canvas Stream
  const canvasStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioMixerRef = useRef<AudioMixer | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIdRef = useRef<string>('');
  const recordingTimerRef = useRef<any>(null);
  const durationSecondsRef = useRef<number>(0);

  // Query Microphones on Mount
  useEffect(() => {
    async function initDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices.filter((d) => d.kind === 'audioinput');
        setAvailableMics(mics);
      } catch (e) {
        console.warn('Could not enumerate audio devices:', e);
      }
    }
    initDevices();

    // Check for crash recovered recordings in IndexedDB
    getUnrecoveredRecordings().then((list) => {
      if (list.length > 0) {
        setUnrecoveredList(list);
      }
    });
  }, []);

  // Poll Live Audio Meter
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioMixerRef.current) {
        setLiveAudioLevel(audioMixerRef.current.getLiveAudioLevel());
      } else {
        setLiveAudioLevel(0);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Load URL
  const handleLoadWebsite = (url: string) => {
    setWebsiteUrl(url);
    if (url.startsWith('demo://')) {
      const siteId = url.replace('demo://', '');
      setActiveSiteId(siteId);
    }
  };

  // Canvas Stream Setter Callback
  const handleCanvasStreamReady = useCallback((stream: MediaStream) => {
    canvasStreamRef.current = stream;
  }, []);

  // START RECORDING FLOW
  const executeStartRecording = async () => {
    let activeVideoStream: MediaStream | null = null;

    if (captureSource === 'screen-share') {
      try {
        activeVideoStream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: 'browser' },
          audio: true,
        });
      } catch (err) {
        console.warn('Screen share display media cancelled or failed:', err);
        activeVideoStream = canvasStreamRef.current;
      }
    } else {
      activeVideoStream = canvasStreamRef.current;
    }

    if (!activeVideoStream) return;

    recordedChunksRef.current = [];
    const currentRecId = `rec_${Date.now()}`;
    recordingIdRef.current = currentRecId;

    // 1. Setup Audio Mixer
    const audioMixer = new AudioMixer();
    audioMixerRef.current = audioMixer;
    const audioTrack = await audioMixer.setup(
      audioConfig.micEnabled ? audioConfig.selectedMicDeviceId : 'none',
      activeVideoStream
    );

    // 2. Combine Video Track + Mixed Audio Track
    const compositeStream = new MediaStream();
    activeVideoStream.getVideoTracks().forEach((vt) => compositeStream.addTrack(vt));
    if (audioTrack) {
      compositeStream.addTrack(audioTrack);
    }

    // 3. Choose robust MIME Type matching stream audio presence
    const hasAudio = !!audioTrack;
    const audioCodecs = hasAudio ? ',opus' : '';
    const candidateTypes = [
      `video/webm;codecs=vp9${audioCodecs}`,
      `video/webm;codecs=vp8${audioCodecs}`,
      `video/webm;codecs=h264${audioCodecs}`,
      'video/webm',
      'video/mp4',
    ];

    let mimeType = '';
    for (const type of candidateTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        mimeType = type;
        break;
      }
    }

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(compositeStream, {
        mimeType: mimeType || undefined,
        videoBitsPerSecond: resolution === '4k' ? 18000000 : resolution === '1440p' ? 10000000 : 6000000,
      });
    } catch (e) {
      console.warn('Failed to construct MediaRecorder with options, trying default:', e);
      recorder = new MediaRecorder(compositeStream);
    }

    mediaRecorderRef.current = recorder;

    // Realtime Auto-Save Chunks to IndexedDB every 1000ms
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunksRef.current.push(event.data);

        // Save chunk to IndexedDB for crash recovery
        saveChunkToDB({
          id: `chunk_${currentRecId}_${Date.now()}`,
          recordingId: currentRecId,
          timestamp: Date.now(),
          blob: event.data,
          durationMs: durationSeconds * 1000,
          resolution,
          fps,
        });
      }
    };

    recorder.onstop = async () => {
      const fullBlob = new Blob(recordedChunksRef.current, { type: mimeType });
      const finalDurationMs = (durationSecondsRef.current || 1) * 1000;
      const patchedBlob = await fixWebmDuration(fullBlob, finalDurationMs);
      setRecordedBlob(patchedBlob);
      setIsPlaybackModalOpen(true);
      setRecordingState('completed');

      // Clear recording timer
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

      // Clean up audio mixer
      if (audioMixerRef.current) {
        audioMixerRef.current.cleanup();
        audioMixerRef.current = null;
      }
    };

    // Save initial metadata in IndexedDB
    saveRecordingMetadata({
      id: currentRecId,
      startTime: Date.now(),
      durationMs: 0,
      resolution,
      fps,
      format: 'mp4',
      chunkCount: 0,
      totalSizeBytes: 0,
      websiteUrl,
    });

    recorder.start(1000); // 1s slice chunks
    setRecordingState('recording');
    setDurationSeconds(0);
    durationSecondsRef.current = 0;

    // Start Timer
    recordingTimerRef.current = setInterval(() => {
      setDurationSeconds((prev) => {
        const next = prev + 1;
        durationSecondsRef.current = next;
        return next;
      });
    }, 1000);
  };

  // Trigger Start with Countdown
  const handleStartRecording = async () => {
    if (countdownSeconds > 0) {
      setRecordingState('countdown');
      setCurrentCountdown(countdownSeconds);

      let count = countdownSeconds;
      const cdInterval = setInterval(() => {
        count -= 1;
        setCurrentCountdown(count);
        if (count <= 0) {
          clearInterval(cdInterval);
          executeStartRecording();
        }
      }, 1000);
    } else {
      executeStartRecording();
    }
  };

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const handleResumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
      recordingTimerRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // RUN AUTOMATED TOUR & RECORD
  const handleRunTourAndRecord = async (tour: TourPreset) => {
    await handleStartRecording();

    // Step-by-step cursor walkthrough animation
    let currentStepIdx = 0;

    const animateStep = () => {
      if (currentStepIdx >= tour.steps.length) {
        // Tour completed -> Finish recording automatically!
        setTimeout(() => {
          handleStopRecording();
        }, 1500);
        return;
      }

      const step = tour.steps[currentStepIdx];
      const startX = cursorPos.xPercent;
      const startY = cursorPos.yPercent;
      const endX = step.targetXPercent;
      const endY = step.targetYPercent;
      const duration = step.durationMs;
      const startTime = performance.now();

      const stepAnim = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Smooth Bezier Ease-In-Out
        const easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        setCursorPos({
          xPercent: startX + (endX - startX) * easeProgress,
          yPercent: startY + (endY - startY) * easeProgress,
          isDown: step.type === 'click' && progress > 0.8,
          activeViewport: step.viewport,
        });

        if (progress < 1) {
          requestAnimationFrame(stepAnim);
        } else {
          currentStepIdx++;
          setTimeout(animateStep, 400);
        }
      };

      requestAnimationFrame(stepAnim);
    };

    setTimeout(animateStep, 2000);
  };

  // Crash Recovery Handlers
  const handleRecoverRecording = (record: { metadata: RecordingMetadata; chunks: Blob[] }) => {
    const combinedBlob = new Blob(record.chunks, { type: 'video/webm' });
    setRecordedBlob(combinedBlob);
    setResolution(record.metadata.resolution);
    setFps(record.metadata.fps);
    setIsPlaybackModalOpen(true);
    setIsRecoveryModalOpen(false);
  };

  const handleClearRecording = async (recId: string) => {
    await clearRecordingFromDB(recId);
    setUnrecoveredList((prev) => prev.filter((item) => item.metadata.id !== recId));
  };

  return (
    <div className="w-screen h-screen bg-slate-950 flex flex-col font-sans overflow-hidden select-none">
      {/* Top Header */}
      <Navbar
        recordingState={recordingState}
        resolution={resolution}
        fps={fps}
        hasUnrecoveredRecordings={unrecoveredList.length > 0}
        onOpenRecoveryModal={() => setIsRecoveryModalOpen(true)}
      />

      {/* Main Studio Toolbar */}
      <ControlToolbar
        recordingState={recordingState}
        onStartRecording={handleStartRecording}
        onPauseRecording={handlePauseRecording}
        onResumeRecording={handleResumeRecording}
        onStopRecording={handleStopRecording}
        websiteUrl={websiteUrl}
        onWebsiteUrlChange={setWebsiteUrl}
        useProxy={useProxy}
        onToggleProxy={setUseProxy}
        onLoadWebsite={handleLoadWebsite}
        layoutMode={layoutMode}
        onChangeLayoutMode={setLayoutMode}
        captureSource={captureSource}
        onChangeCaptureSource={setCaptureSource}
        resolution={resolution}
        onChangeResolution={setResolution}
        fps={fps}
        onChangeFps={setFps}
        countdownSeconds={countdownSeconds}
        onChangeCountdownSeconds={setCountdownSeconds}
        audioConfig={audioConfig}
        onChangeAudioConfig={setAudioConfig}
        availableMics={availableMics}
        liveAudioLevel={liveAudioLevel}
        onOpenTourModal={() => setIsTourModalOpen(true)}
        onOpenCursorModal={() => setIsCursorModalOpen(true)}
      />

      {/* Central Studio Dual Preview Canvas Engine */}
      <div className="flex-1 relative overflow-hidden">
        {/* Fullscreen Countdown Overlay */}
        {recordingState === 'countdown' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-lg z-50 flex flex-col items-center justify-center animate-in fade-in">
            <span className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-rose-500 to-indigo-500 animate-ping">
              {currentCountdown}
            </span>
            <span className="text-sm font-bold text-slate-300 mt-6 tracking-widest uppercase">
              GET READY... RECORDING BEGINS
            </span>
          </div>
        )}

        <DualPreviewCanvas
          websiteUrl={websiteUrl}
          useProxy={useProxy}
          layoutMode={layoutMode}
          cursorConfig={cursorConfig}
          cursorPos={cursorPos}
          onCursorMove={setCursorPos}
          onCanvasStreamReady={handleCanvasStreamReady}
          fps={fps}
          resolution={resolution}
          activeSiteId={activeSiteId}
        />
      </div>

      {/* Footer */}
      <footer className="py-2 text-center text-[11px] text-slate-500 bg-slate-950 border-t border-slate-900/80 shrink-0">
        Powered by: <a href="https://BerithSystems.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors font-medium text-slate-400">BerithSystems.com</a>
      </footer>

      {/* Floating Low-CPU Minimal Recording Overlay */}
      <RecordingOverlay
        recordingState={recordingState}
        durationSeconds={durationSeconds}
        onPause={handlePauseRecording}
        onResume={handleResumeRecording}
        onStop={handleStopRecording}
        liveAudioLevel={liveAudioLevel}
        resolution={resolution}
      />

      {/* Modals */}
      <AutomationTourPanel
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
        onRunTourAndRecord={handleRunTourAndRecord}
      />

      <CursorSettingsModal
        isOpen={isCursorModalOpen}
        onClose={() => setIsCursorModalOpen(false)}
        cursorConfig={cursorConfig}
        onChangeCursorConfig={setCursorConfig}
      />

      <VideoPlaybackModal
        isOpen={isPlaybackModalOpen}
        onClose={() => setIsPlaybackModalOpen(false)}
        recordedBlob={recordedBlob}
        durationMs={durationSeconds * 1000}
        resolution={resolution}
        fps={fps}
      />

      <CrashRecoveryModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
        unrecoveredList={unrecoveredList}
        onRecoverRecording={handleRecoverRecording}
        onClearRecording={handleClearRecording}
      />
    </div>
  );
}
