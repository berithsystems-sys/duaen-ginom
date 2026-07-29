import { RecoveredChunkRecord, RecordingMetadata } from '../types';

const DB_NAME = 'AutoDocRecDB';
const DB_VERSION = 1;
const CHUNKS_STORE = 'recording_chunks';
const METADATA_STORE = 'recording_metadata';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(CHUNKS_STORE)) {
        const chunkStore = db.createObjectStore(CHUNKS_STORE, { keyPath: 'id' });
        chunkStore.createIndex('recordingId', 'recordingId', { unique: false });
      }
      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        db.createObjectStore(METADATA_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveChunkToDB(chunkRecord: RecoveredChunkRecord): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(CHUNKS_STORE, 'readwrite');
    const store = tx.objectStore(CHUNKS_STORE);
    store.put(chunkRecord);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to save chunk to IndexedDB:', err);
  }
}

export async function saveRecordingMetadata(metadata: RecordingMetadata): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(METADATA_STORE, 'readwrite');
    const store = tx.objectStore(METADATA_STORE);
    store.put(metadata);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to save metadata to IndexedDB:', err);
  }
}

export async function getUnrecoveredRecordings(): Promise<{ metadata: RecordingMetadata; chunks: Blob[] }[]> {
  try {
    const db = await openDB();
    const tx = db.transaction([METADATA_STORE, CHUNKS_STORE], 'readonly');
    const metaStore = tx.objectStore(METADATA_STORE);
    const chunkStore = tx.objectStore(CHUNKS_STORE);

    const metadataList: RecordingMetadata[] = await new Promise((resolve, reject) => {
      const req = metaStore.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    const result: { metadata: RecordingMetadata; chunks: Blob[] }[] = [];

    for (const meta of metadataList) {
      const chunks: RecoveredChunkRecord[] = await new Promise((resolve, reject) => {
        const index = chunkStore.index('recordingId');
        const req = index.getAll(meta.id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      if (chunks.length > 0) {
        // Sort chunks by timestamp
        chunks.sort((a, b) => a.timestamp - b.timestamp);
        result.push({
          metadata: meta,
          chunks: chunks.map((c) => c.blob),
        });
      }
    }

    return result;
  } catch (err) {
    console.error('Failed to query unrecovered recordings from IndexedDB:', err);
    return [];
  }
}

export async function clearRecordingFromDB(recordingId: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction([METADATA_STORE, CHUNKS_STORE], 'readwrite');
    const metaStore = tx.objectStore(METADATA_STORE);
    const chunkStore = tx.objectStore(CHUNKS_STORE);

    metaStore.delete(recordingId);

    const index = chunkStore.index('recordingId');
    const req = index.getAllKeys(recordingId);
    req.onsuccess = () => {
      const keys = req.result;
      keys.forEach((key) => chunkStore.delete(key));
    };

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to clear recording from IndexedDB:', err);
  }
}
