import { VideoFormat } from '../types';

/**
 * Custom local Video Exporter:
 * Converts/Wraps recorded WebM blob into target container format (MP4, WebM, MKV, AVI)
 * with correct MIME headers and triggers local browser download.
 */

export interface ExportVideoOptions {
  blob: Blob;
  format: VideoFormat;
  filename?: string;
  resolution?: string;
  fps?: number;
}

export function getMimeTypeForFormat(format: VideoFormat): string {
  switch (format) {
    case 'mp4':
      return 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';
    case 'mkv':
      return 'video/x-matroska;codecs=vp9,opus';
    case 'avi':
      return 'video/x-msvideo';
    case 'webm':
    default:
      return 'video/webm;codecs=vp9,opus';
  }
}

export async function exportVideoFile({ blob, format, filename, resolution, fps }: ExportVideoOptions): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const defaultName = filename || `DuaEn_Studio_${resolution || '1080p'}_${fps || 60}fps_${timestamp}.${format}`;

  let finalBlob = blob;

  // Convert Blob type header to target container type for OS player compatibility
  const targetMime = getMimeTypeForFormat(format);
  if (blob.type !== targetMime) {
    finalBlob = new Blob([blob], { type: targetMime });
  }

  // Check if modern File System Access API is available (supports direct local save dialog)
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: defaultName,
        types: [
          {
            description: `${format.toUpperCase()} Video File`,
            accept: {
              [targetMime.split(';')[0]]: [`.${format}`],
            },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(finalBlob);
      await writable.close();
      return;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // User canceled save dialog
      }
      console.warn('File System Access API failed, falling back to standard download link:', err);
    }
  }

  // Standard direct local download link fallback
  const url = URL.createObjectURL(finalBlob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = defaultName;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
}
