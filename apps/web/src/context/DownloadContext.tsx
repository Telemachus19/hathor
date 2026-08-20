import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { requestDownloadUrl } from '../services/api/library';
import { useToast } from './ToastContext';

export interface DownloadContextValue {
  startDownload: (gameId: string, gameTitle: string) => Promise<void>;
}

const DownloadContext = createContext<DownloadContextValue | undefined>(undefined);

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  const startDownload = useCallback(
    async (targetGameId: string, targetGameTitle: string) => {
      try {
        showToast('info', 'Download has started');
        const data = await requestDownloadUrl(targetGameId);

        const a = document.createElement('a');
        a.href = data.url;
        a.download = `${targetGameTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err: any) {
        console.error('Download initiation failed:', err);
        showToast('error', err.message || 'Download failed');
      }
    },
    [showToast]
  );

  const value = useMemo(() => ({ startDownload }), [startDownload]);

  return <DownloadContext.Provider value={value}>{children}</DownloadContext.Provider>;
};

export const useDownload = () => {
  const context = useContext(DownloadContext);
  if (!context) {
    throw new Error('useDownload must be used inside DownloadProvider');
  }
  return context;
};
