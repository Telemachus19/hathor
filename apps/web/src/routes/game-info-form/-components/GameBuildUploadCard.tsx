import React, { useRef, useState } from 'react';
import { UploadCloud, FileArchive, X, CheckCircle, AlertCircle } from 'lucide-react';
import styles from '../-styles/GameInfoFormPage.module.css';

export interface ExistingBuildInfo {
  id?: string;
  version?: string;
  objectKey?: string;
  sizeBytes?: number;
  checksumSha256?: string;
  state?: string;
}

export interface GameBuildUploadCardProps {
  buildFile: File | null;
  existingBuild: ExistingBuildInfo | null;
  onChangeBuildFile: (file: File | null) => void;
  error?: string | null;
}

function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const GameBuildUploadCard: React.FC<GameBuildUploadCardProps> = ({
  buildFile,
  existingBuild,
  onChangeBuildFile,
  error,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    onChangeBuildFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const getArchiveTypeBadge = (name: string) => {
    const ext = name.split('.').pop()?.toUpperCase();
    return ext ? `${ext} ARCHIVE` : 'ARCHIVE';
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.accentBar} />
        <h2 className={styles.cardTitle}>
          Game Build Package
          <span className={styles.requiredBadge}>REQUIRED</span>
        </h2>
      </div>

      <div className={styles.cardBody}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip,.rar,.7z,.tar,.tar.gz,.gz,application/zip,application/x-zip-compressed,application/x-rar-compressed,application/x-7z-compressed"
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelect(e.target.files)}
        />

        {/* Existing build badge if editing a game */}
        {existingBuild && !buildFile && (
          <div className={styles.existingBuildBox}>
            <div className={styles.existingBuildHeader}>
              <div className={styles.existingBuildStatus}>
                <CheckCircle size={14} color="#38d39f" />
                <span>Current Build Package Active</span>
              </div>
              <span className={styles.fileBadge}>{existingBuild.version || 'v1.0.0'}</span>
            </div>
            <div className={styles.existingBuildDetails}>
              {existingBuild.sizeBytes ? (
                <span>Package Size: {formatBytes(existingBuild.sizeBytes)}</span>
              ) : null}
            </div>
          </div>
        )}

        {/* Display selected file */}
        {buildFile ? (
          <div className={styles.fileInfoBox}>
            <div className={styles.fileInfoLeft}>
              <FileArchive size={28} className={styles.fileIcon} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className={styles.fileName} title={buildFile.name}>
                  {buildFile.name}
                </div>
                <div className={styles.fileSize}>
                  {formatBytes(buildFile.size)} &bull; Ready for upload
                </div>
              </div>
              <span className={styles.fileBadge}>{getArchiveTypeBadge(buildFile.name)}</span>
            </div>
            <button
              type="button"
              className={styles.removeFileBtn}
              onClick={(e) => {
                e.stopPropagation();
                onChangeBuildFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              title="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          /* Dropzone */
          <div
            className={`${styles.uploadDropzone} ${isDragOver ? styles.uploadDropzoneActive : ''} ${error ? styles.uploadDropzoneError : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <UploadCloud size={32} className={styles.uploadIcon} />
            <div className={styles.uploadTitle}>
              {existingBuild
                ? 'Drop a new package to replace build or click to browse'
                : 'Drop compressed game package here or click to browse'}
            </div>
            <div className={styles.uploadSubtitle}>
              Supports .ZIP, .RAR, .7Z, .TAR.GZ (Max 500MB)
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className={styles.errorMessage}>
            <AlertCircle size={13} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
