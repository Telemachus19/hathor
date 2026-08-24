import React from 'react';
import { Star, Clock, Zap, Download } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { DisplayGame } from '../types';
import { useSimulatePayment } from '../../../services/api';
import { useDownload } from '../../../context/DownloadContext';
import styles from '../styles/LibraryPage.module.css';

interface GridCardProps {
  game: DisplayGame;
}

export const GridCard: React.FC<GridCardProps> = ({ game }) => {
  const navigate = useNavigate();
  const simulatePaymentMutation = useSimulatePayment();
  const { startDownload } = useDownload();

  const handleSimulatePayment = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!game.sourceOrderId) return;
    try {
      await simulatePaymentMutation.mutateAsync({ orderId: game.sourceOrderId, outcome: 'paid' });
    } catch (err: any) {
      // Error captured by mutation state
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    startDownload(game.id, game.title);
  };

  return (
    <div
      className={styles.card}
      onClick={() => {
        if (game.slug || game.id) {
          navigate({ to: '/store/games/$slug', params: { slug: game.slug || game.id } });
        }
      }}
    >
      {/* Pending status ribbon */}
      {game.isPending && (
        <div
          className={styles.cardUpdateRibbon}
          style={{ background: 'linear-gradient(90deg, #f26b21, #e55c10)' }}
        >
          <span className={styles.ribbonBadge}>
            <Clock size={8} />
            Pending Payment
          </span>
        </div>
      )}

      {/* Cover image */}
      <div className={styles.coverWrap}>
        <img src={game.coverImage} alt={game.title} className={styles.coverImage} />
        <div className={styles.coverGradient} />
      </div>

      {/* Footer / Meta info */}
      <div className={styles.cardFooter}>
        <h4 className={styles.cardTitle} title={game.title}>
          {game.title}
        </h4>

        <div className={styles.cardGenreRow}>
          <span className={styles.genreText}>
            {typeof game.genre === 'string' ? game.genre : (game.genre as any)?.name || 'Action / Strategy'}
          </span>
          <div className={styles.ratingBox}>
            <Star size={9} className={styles.ratingStar} />
            <span className={styles.ratingValue}>{(game.rating || 4.8).toFixed(1)}</span>
          </div>
        </div>

        <div className={styles.tagRow}>
          {(game.tags || []).slice(0, 2).map((tag, idx) => {
            const tagName = typeof tag === 'string' ? tag : (tag as any)?.name || 'Tag';
            return (
              <span key={`${tagName}-${idx}`} className={styles.tagPill}>
                {tagName}
              </span>
            );
          })}
        </div>

        {game.isPending ? (
          <div
            style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
          >
            <div
              style={{
                fontSize: '0.6rem',
                color: 'var(--primary-color, #f26b21)',
                fontFamily: 'monospace',
                fontWeight: 800,
              }}
            >
              REF: {game.paymentReference || 'PENDING'}
            </div>
            <button
              type="button"
              onClick={handleSimulatePayment}
              disabled={simulatePaymentMutation.isPending}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                backgroundColor: 'var(--primary-color, #f26b21)',
                color: '#0e1116',
                border: 'none',
                padding: '0.35rem 0.6rem',
                borderRadius: '3px',
                fontSize: '0.6rem',
                fontWeight: 900,
                fontFamily: "'Cinzel', serif",
                cursor: 'pointer',
                letterSpacing: '0.1em',
              }}
            >
              <Zap size={10} />{' '}
              {simulatePaymentMutation.isPending ? 'Processing...' : 'Simulate Payment'}
            </button>
          </div>
        ) : (
          <div
            style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
          >
            <div
              style={{
                fontSize: '0.6rem',
                color: '#38d39f',
                fontFamily: 'monospace',
              }}
            >
              ✓ OWNED · {game.purchaseDate}
            </div>
            <button
              type="button"
              onClick={handleDownload}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                backgroundColor: 'rgba(56, 211, 159, 0.15)',
                border: '1px solid rgba(56, 211, 159, 0.35)',
                color: '#38d39f',
                padding: '0.35rem 0.6rem',
                borderRadius: '3px',
                fontSize: '0.6rem',
                fontWeight: 900,
                fontFamily: "'Cinzel', serif",
                cursor: 'pointer',
                letterSpacing: '0.1em',
                width: '100%',
                textTransform: 'uppercase',
              }}
            >
              <Download size={10} /> Download
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GridCard;
