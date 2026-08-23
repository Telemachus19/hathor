import { useState } from 'react';
import { Wand2, Loader2, X, Check } from 'lucide-react';
import { apiClient } from '../../../../services/api/index';

interface AiThemeModalProps {
  gameId: string;
  currentTheme: any;
  onClose: () => void;
  onAccept: (newTheme: any) => void;
}

export function AiThemeModal({ gameId, currentTheme, onClose, onAccept }: AiThemeModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [proposal, setProposal] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setProposal(null);

    try {
      const { data, error } = await apiClient.POST('/creator/games/{gameId}/ai/theme-proposals', {
        params: { path: { gameId } },
        body: {
          prompt,
          currentTheme,
        },
      });

      if (error) {
        setError(error.error?.message || 'Failed to generate proposal');
      } else if (data) {
        setProposal(data);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (!proposal) return;

    // In a real application, we would apply the JSON Patch (RFC 6902) to the currentTheme.
    // For this demonstration with the mock AI, we'll manually apply the specific patch changes.
    const newTheme = JSON.parse(JSON.stringify(currentTheme));

    // Apply the mock patch
    proposal.patch.forEach((p: any) => {
      if (p.op === 'replace') {
        const parts = p.path.split('/').filter(Boolean);
        if (parts.length === 2) {
          if (!newTheme[parts[0]]) newTheme[parts[0]] = {};
          newTheme[parts[0]][parts[1]] = p.value;
        }
      }
    });

    onAccept(newTheme);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          width: '500px',
          maxWidth: '90vw',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card-hover)',
          }}
        >
          <h2
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: 0,
              fontSize: '1.25rem',
              color: 'var(--accent-orange)',
            }}
          >
            <Wand2 size={20} /> AI Theme Proposal
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!proposal ? (
            <>
              <p
                style={{
                  color: 'var(--text-light)',
                  margin: 0,
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                }}
              >
                Describe how you want your game store page to look. The AI will analyze your prompt
                and suggest layout and styling changes.
              </p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Make it darker, more aggressive, with orange accents and a large hero image..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-white)',
                  padding: '1rem',
                  borderRadius: '4px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
              {error && (
                <div
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '4px',
                    color: '#ef4444',
                    fontSize: '0.85rem',
                  }}
                >
                  {error}
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(56, 211, 159, 0.1)',
                  border: '1px solid rgba(56, 211, 159, 0.2)',
                  borderRadius: '4px',
                }}
              >
                <h3
                  style={{ color: 'var(--accent-green)', margin: '0 0 0.5rem 0', fontSize: '1rem' }}
                >
                  AI Summary
                </h3>
                <p
                  style={{
                    color: 'var(--text-light)',
                    margin: 0,
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                  }}
                >
                  {proposal.summary}
                </p>
              </div>

              <div>
                <h4
                  style={{ color: 'var(--text-white)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}
                >
                  Proposed Changes:
                </h4>
                <div
                  style={{
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    padding: '1rem',
                    maxHeight: '150px',
                    overflowY: 'auto',
                  }}
                >
                  <pre
                    style={{
                      margin: 0,
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                    }}
                  >
                    {JSON.stringify(proposal.patch, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            padding: '1.5rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            background: 'var(--bg-card-hover)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-light)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Cancel
          </button>

          {!proposal ? (
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--accent-orange)',
                border: 'none',
                color: '#fff',
                borderRadius: '4px',
                cursor: isLoading || !prompt.trim() ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: isLoading || !prompt.trim() ? 0.7 : 1,
              }}
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
              {isLoading ? 'Generating...' : 'Propose Theme'}
            </button>
          ) : (
            <button
              onClick={handleAccept}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--accent-green)',
                border: 'none',
                color: '#fff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Check size={16} /> Accept Proposal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
