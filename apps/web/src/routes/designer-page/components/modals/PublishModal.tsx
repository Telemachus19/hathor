import { useState } from 'react';
import { FileJson, X, Layers, Check, Copy, Download, Upload, Loader2 } from 'lucide-react';
import {
  Section,
  PageSettings,
  HATHOR_ORANGE,
  GREEN_ACCENT,
  BORDER,
  TEXT_MUTED,
  TEXT_PRIMARY,
} from '../../types/designerTypes';
import { generatePageJSON, isCustomTheme } from '../../utils/schemaUtils';
import { apiClient } from '../../../../services/api/index';
import styles from '../../DesignerPage.module.css';

export function PublishModal({
  gameId,
  sections,
  pageSettings,
  gameTitle,
  onClose,
  onShowToast,
  onPublishSuccess,
}: {
  gameId?: string;
  sections: Section[];
  pageSettings: PageSettings;
  gameTitle: string;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  onPublishSuccess?: () => void;
}) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const isCustom = isCustomTheme(sections);

  const handlePublishToCatalog = async () => {
    if (!gameId || gameId === 'draft_new_game') {
      setPublishError('Cannot publish without an active game ID. Please complete game info first.');
      return;
    }

    setIsPublishing(true);
    setPublishError(null);
    try {
      const pageThemeJson = generatePageJSON(sections, pageSettings);

      // 1. Save theme to database
      const themeRes = (await apiClient.PUT('/creator/games/{gameId}/theme' as any, {
        params: { path: { gameId } },
        body: pageThemeJson as any,
      })) as any;

      if (themeRes.error) {
        const details = themeRes.error?.error?.details || themeRes.error?.details;
        let errorDetail =
          themeRes.error?.error?.message ||
          themeRes.error?.message ||
          'Failed to validate theme JSON with server.';
        if (Array.isArray(details) && details.length > 0) {
          const firstErr = details[0];
          errorDetail = `Validation Failed (${firstErr.code || 'ERROR'}): ${firstErr.message || 'Invalid value'}${
            firstErr.path ? ` at [${firstErr.path}]` : ''
          }`;
        }
        setPublishError(errorDetail);
        return;
      }

      // 2. Submit status transition to pending_review
      const statusRes = (await apiClient.PATCH('/creator/games/{gameId}/status' as any, {
        params: { path: { gameId } },
        body: { status: 'pending_review' as any },
      })) as any;

      if (statusRes.error) {
        const statusDetail =
          statusRes.error?.error?.message ||
          statusRes.error?.message ||
          'Failed to update game status to pending_review.';
        setPublishError(statusDetail);
        return;
      }

      onShowToast(`Game submitted for review (${isCustom ? 'theme: custom' : 'theme: default'})!`);
      onClose();

      if (onPublishSuccess) {
        onPublishSuccess();
      }
    } catch (err: any) {
      console.error('Failed to publish game to catalog:', err);
      setPublishError(
        err?.message || 'Failed to submit game for review. Please check your page inputs.'
      );
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalCard}
        style={{ maxWidth: 740, width: '92%', textAlign: 'left' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
            borderBottom: `1px solid ${BORDER}`,
            paddingBottom: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileJson size={22} style={{ color: HATHOR_ORANGE }} />
            <h2 className={styles.modalTitle} style={{ margin: 0, fontSize: 18 }}>
              Store Page JSON Output
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: TEXT_MUTED,
              cursor: 'pointer',
              display: 'flex',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <p className={styles.modalSub} style={{ marginBottom: 14 }}>
          This JSON schema is saved to{' '}
          <code style={{ color: HATHOR_ORANGE, fontFamily: 'monospace' }}>pageTheme</code> in the
          database to render the published store page.
        </p>

        {/* Error Alert Box */}
        {publishError && (
          <div
            style={{
              background: 'rgba(231, 76, 60, 0.15)',
              border: '1px solid #e74c3c',
              borderRadius: 6,
              padding: '12px 14px',
              marginBottom: 16,
              color: '#e74c3c',
              fontSize: 12,
              fontFamily: 'monospace',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <X size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ margin: 0, fontWeight: 900 }}>Submission Failed:</p>
              <p style={{ margin: '4px 0 0', fontWeight: 500, color: '#fca5a5' }}>{publishError}</p>
            </div>
          </div>
        )}

        {/* Automatic Theme Mode Badge */}
        {isCustom ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(242, 107, 33, 0.12)',
              border: '1px solid rgba(242, 107, 33, 0.4)',
              padding: '10px 14px',
              borderRadius: 6,
              marginBottom: 16,
              color: HATHOR_ORANGE,
              fontSize: 11,
              fontFamily: 'monospace',
              fontWeight: 800,
            }}
          >
            <Layers size={15} />
            <span>THEME MODE: "custom" — Custom components or styling modifications detected</span>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(56, 211, 159, 0.12)',
              border: '1px solid rgba(56, 211, 159, 0.4)',
              padding: '10px 14px',
              borderRadius: 6,
              marginBottom: 16,
              color: GREEN_ACCENT,
              fontSize: 11,
              fontFamily: 'monospace',
              fontWeight: 800,
            }}
          >
            <Check size={15} />
            <span>THEME MODE: "default" — Standard unmodified layout & styling</span>
          </div>
        )}

        {/* Formatted JSON Code Container */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <pre
            style={{
              background: '#0d1017',
              border: `1px solid ${BORDER}`,
              borderRadius: 6,
              padding: 16,
              maxHeight: 340,
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: 11,
              lineHeight: 1.5,
              color: GREEN_ACCENT,
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {JSON.stringify(generatePageJSON(sections, pageSettings), null, 2)}
          </pre>
        </div>

        {/* Modal Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => {
              const jsonStr = JSON.stringify(generatePageJSON(sections, pageSettings), null, 2);
              navigator.clipboard.writeText(jsonStr);
              onShowToast('JSON schema copied to clipboard!');
            }}
            style={{
              background: 'transparent',
              border: `1px solid ${BORDER}`,
              color: TEXT_PRIMARY,
              padding: '10px 16px',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 800,
              fontFamily: 'monospace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Copy size={13} /> COPY JSON
          </button>

          <button
            onClick={() => {
              const jsonStr = JSON.stringify(generatePageJSON(sections), null, 2);
              const blob = new Blob([jsonStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${gameTitle.toLowerCase().replace(/\s+/g, '-')}-pageTheme.json`;
              a.click();
              URL.revokeObjectURL(url);
              onShowToast('Downloaded pageTheme.json file!');
            }}
            style={{
              background: 'transparent',
              border: `1px solid ${GREEN_ACCENT}`,
              color: GREEN_ACCENT,
              padding: '10px 16px',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 800,
              fontFamily: 'monospace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Download size={13} /> DOWNLOAD .JSON
          </button>

          <button
            type="button"
            disabled={isPublishing}
            onClick={handlePublishToCatalog}
            style={{
              background: HATHOR_ORANGE,
              border: 'none',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 900,
              fontFamily: 'monospace',
              cursor: isPublishing ? 'not-allowed' : 'pointer',
              opacity: isPublishing ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {isPublishing ? (
              <>
                <Loader2 size={13} className="animate-spin" /> SUBMITTING...
              </>
            ) : (
              <>
                <Upload size={13} /> PUBLISH TO CATALOG
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
