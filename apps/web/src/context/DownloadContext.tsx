import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { requestDownloadUrl } from '../services/api/library';

export type DownloadStatus =
  | 'idle'
  | 'authorizing'
  | 'downloading'
  | 'verifying'
  | 'success'
  | 'error';

export interface DownloadContextValue {
  gameId: string | null;
  gameTitle: string | null;
  status: DownloadStatus;
  progress: number;
  error: string | null;
  computedSha256: string | null;
  expectedSha256: string | null;
  isOpen: boolean;
  fileName: string | null;
  fileSize: string | null;
  startDownload: (gameId: string, gameTitle: string) => Promise<void>;
  closeDrawer: () => void;
  resetDownload: () => void;
}

const DownloadContext = createContext<DownloadContextValue | undefined>(undefined);

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameTitle, setGameTitle] = useState<string | null>(null);
  const [status, setStatus] = useState<DownloadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [computedSha256, setComputedSha256] = useState<string | null>(null);
  const [expectedSha256, setExpectedSha256] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);

  const resetDownload = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setError(null);
    setComputedSha256(null);
    setExpectedSha256(null);
    setFileName(null);
    setFileSize(null);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const startDownload = useCallback(async (targetGameId: string, targetGameTitle: string) => {
    setGameId(targetGameId);
    setGameTitle(targetGameTitle);
    setIsOpen(true);
    setStatus('authorizing');
    setProgress(0);
    setError(null);
    setComputedSha256(null);
    setExpectedSha256(null);
    setFileName(`${targetGameTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.zip`);
    setFileSize(null);

    try {
      // Step A: Request download token/presigned URL from backend
      const data = await requestDownloadUrl(targetGameId);
      setExpectedSha256(data.sha256);
      setStatus('downloading');

      // Step B: Stream download from the signed URL to capture progress
      const response = await fetch(data.url);
      if (!response.ok) {
        throw new Error(`Cloud storage rejected access (HTTP ${response.status})`);
      }

      const contentLengthHeader = response.headers.get('content-length');
      const contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
      if (contentLength > 0) {
        setFileSize(formatBytes(contentLength));
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Readable stream not supported in this browser.');
      }

      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (value) {
          chunks.push(value);
          receivedLength += value.length;
          if (contentLength > 0) {
            setProgress(Math.min(100, Math.round((receivedLength / contentLength) * 100)));
          }
        }
      }

      if (contentLength === 0) {
        setFileSize(formatBytes(receivedLength));
        setProgress(100);
      }

      // Step C: Verify checksum integrity
      setStatus('verifying');
      const blob = new Blob(chunks, { type: 'application/zip' });
      const arrayBuffer = await blob.arrayBuffer();

      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setComputedSha256(hashHex);

      const targetHash = data.sha256.toLowerCase();
      if (hashHex !== targetHash) {
        throw new Error(
          `Integrity Verification Failed: SHA-256 mismatch.\nExpected: ${targetHash.slice(0, 16)}...\nCalculated: ${hashHex.slice(0, 16)}...`
        );
      }

      // Step D: Trigger browser download prompt to save local file
      setStatus('success');
      const localUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = localUrl;
      a.download = `${targetGameTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(localUrl);
    } catch (err: any) {
      console.error('Download workflow failed:', err);
      setStatus('error');
      setError(err.message || 'An unexpected error occurred during the download.');
    }
  }, []);

  const value = useMemo(
    () => ({
      gameId,
      gameTitle,
      status,
      progress,
      error,
      computedSha256,
      expectedSha256,
      isOpen,
      fileName,
      fileSize,
      startDownload,
      closeDrawer,
      resetDownload,
    }),
    [
      gameId,
      gameTitle,
      status,
      progress,
      error,
      computedSha256,
      expectedSha256,
      isOpen,
      fileName,
      fileSize,
      startDownload,
      closeDrawer,
      resetDownload,
    ]
  );

  return <DownloadContext.Provider value={value}>{children}</DownloadContext.Provider>;
};

export const useDownload = () => {
  const context = useContext(DownloadContext);
  if (!context) {
    throw new Error('useDownload must be used inside DownloadProvider');
  }
  return context;
};
