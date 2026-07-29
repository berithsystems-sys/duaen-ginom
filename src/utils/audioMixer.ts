/**
 * AudioMixer creates a unified MediaStreamTrack from multiple audio sources:
 * - Microphone input (`getUserMedia`)
 * - System Audio / Desktop audio (from `getDisplayMedia` or canvas tab)
 */
export class AudioMixer {
  private ctx: AudioContext | null = null;
  private destNode: MediaStreamAudioDestinationNode | null = null;
  private micSourceNode: MediaStreamAudioSourceNode | null = null;
  private systemSourceNode: MediaStreamAudioSourceNode | null = null;
  private micGainNode: GainNode | null = null;
  private systemGainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;

  private micStream: MediaStream | null = null;
  private systemStream: MediaStream | null = null;

  public async setup(micDeviceId?: string, systemAudioStream?: MediaStream): Promise<MediaStreamTrack | null> {
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      this.destNode = this.ctx.createMediaStreamDestination();
      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 64;

      // Setup Microphone if requested
      if (micDeviceId !== 'none') {
        const constraints: MediaStreamConstraints = {
          audio: micDeviceId ? { deviceId: { exact: micDeviceId } } : true,
        };
        try {
          this.micStream = await navigator.mediaDevices.getUserMedia(constraints);
          this.micSourceNode = this.ctx.createMediaStreamSource(this.micStream);
          this.micGainNode = this.ctx.createGain();
          this.micGainNode.gain.value = 1.0;

          this.micSourceNode.connect(this.micGainNode);
          this.micGainNode.connect(this.destNode);
          this.micGainNode.connect(this.analyserNode);
        } catch (err) {
          console.warn('Microphone access denied or unavailable:', err);
        }
      }

      // Setup System Audio if available
      if (systemAudioStream && systemAudioStream.getAudioTracks().length > 0) {
        this.systemStream = systemAudioStream;
        this.systemSourceNode = this.ctx.createMediaStreamSource(systemAudioStream);
        this.systemGainNode = this.ctx.createGain();
        this.systemGainNode.gain.value = 0.8;

        this.systemSourceNode.connect(this.systemGainNode);
        this.systemGainNode.connect(this.destNode);
        this.systemGainNode.connect(this.analyserNode);
      }

      const tracks = this.destNode.stream.getAudioTracks();
      return tracks.length > 0 ? tracks[0] : null;
    } catch (err) {
      console.error('Failed to setup AudioMixer:', err);
      return null;
    }
  }

  public setMicVolume(volume: number) {
    if (this.micGainNode) {
      this.micGainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  public setSystemVolume(volume: number) {
    if (this.systemGainNode) {
      this.systemGainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  public getLiveAudioLevel(): number {
    if (!this.analyserNode) return 0;
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    return Math.min(100, Math.round((average / 255) * 100));
  }

  public cleanup() {
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
