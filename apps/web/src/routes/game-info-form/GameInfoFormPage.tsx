import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import {
  saveGameInfoDraft,
  getGameInfoDraft,
  clearGameInfoDraft,
  EMPTY_GAME_DRAFT,
  GameInfoDraft,
  SystemReqSpec,
} from './gameInfoCache';
import { apiClient } from '../../services/api/index';
import { GameInfoFormHeader } from './-components/GameInfoFormHeader';
import { BasicDetailsCard } from './-components/BasicDetailsCard';
import { ClassificationCard } from './-components/ClassificationCard';
import { MediaAssetsCard } from './-components/MediaAssetsCard';
import { SystemReqsCard } from './-components/SystemReqsCard';
import styles from './-styles/GameInfoFormPage.module.css';

export default function GameInfoFormPage({ initialGame }: { initialGame?: any }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<GameInfoDraft>(() => initialGame || getGameInfoDraft() || EMPTY_GAME_DRAFT);
  const [savedToast, setSavedToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gameIdParam = params.get('gameId');

    async function loadGame() {
      if (gameIdParam) {
        setLoading(true);
        try {
          const res = (await apiClient.GET('/creator/games/{gameId}' as any, {
            params: { path: { gameId: gameIdParam } },
          })) as any;

          if (res.error || !res.data) {
            console.error('Forbidden or not owner of this game:', res.error);
            navigate({ to: '/', replace: true });
            window.location.replace('/');
            return;
          }

          const data = res.data;

          if (data) {
            const mappedDraft: GameInfoDraft = {
              id: data.id,
              status: (data.status as any) || 'draft',
              title: data.title || '',
              shortDesc: data.shortDescription || '',
              priceEgp: data.priceEgp || '0.00',
              genre: (data.genre as any)?.name || '',
              tags: (data.tags || []).map((t: any) => (typeof t === 'string' ? t : t.name || t.slug || '')),
              bannerUrl: data.bannerUrl || '',
              trailerUrl: data.trailerUrl || '',
              minReq: (data.systemRequirements as any)?.minReq || EMPTY_GAME_DRAFT.minReq,
              recReq: (data.systemRequirements as any)?.recReq || EMPTY_GAME_DRAFT.recReq,
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
            };
            setDraft(mappedDraft);
            saveGameInfoDraft(mappedDraft);
          }
        } catch (err) {
          console.error('Failed to fetch game details for editing:', err);
          navigate({ to: '/', replace: true });
          window.location.replace('/');
          return;
        } finally {
          setLoading(false);
        }
      } else {
        const existing = getGameInfoDraft();
        if (existing && existing.id !== 'draft_new_game') {
          // New game mode: start clean if previous draft had an id
          setDraft(EMPTY_GAME_DRAFT);
          clearGameInfoDraft();
        } else if (existing) {
          setDraft(existing);
        }
      }
    }

    loadGame();
  }, []);

  function handleFieldChange<K extends keyof GameInfoDraft>(key: K, val: GameInfoDraft[K]) {
    setDraft((prev) => {
      const updated = { ...prev, [key]: val };
      saveGameInfoDraft(updated);
      return updated;
    });
  }

  function handleTierChange(tier: 'minReq' | 'recReq', key: keyof SystemReqSpec, val: any) {
    setDraft((prev) => {
      const updated = {
        ...prev,
        [tier]: { ...prev[tier], [key]: val },
      };
      saveGameInfoDraft(updated);
      return updated;
    });
  }

  async function handleContinue() {
    if (!draft.title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      let targetGameId = draft.id;

      if (targetGameId && targetGameId !== 'draft_new_game') {
        // Update existing game in database
        await apiClient.PUT('/creator/games/{gameId}' as any, {
          params: { path: { gameId: targetGameId } },
          body: {
            title: draft.title.trim(),
            shortDescription: draft.shortDesc.trim(),
            shortDesc: draft.shortDesc.trim(),
            fullDescription: draft.shortDesc.trim(),
            priceEgp: draft.priceEgp || '0.00',
            genre: draft.genre,
            tags: draft.tags,
            bannerUrl: draft.bannerUrl,
            trailerUrl: draft.trailerUrl,
            systemRequirements: {
              minReq: draft.minReq,
              recReq: draft.recReq,
            },
          },
        });
        saveGameInfoDraft(draft);
      } else {
        // Create new draft in catalog-service
        const res = (await apiClient.POST('/creator/games' as any, {
          body: {
            title: draft.title.trim(),
            shortDescription: draft.shortDesc.trim(),
            shortDesc: draft.shortDesc.trim(),
            fullDescription: draft.shortDesc.trim(),
            priceEgp: draft.priceEgp || '0.00',
            genre: draft.genre,
            tags: draft.tags,
            bannerUrl: draft.bannerUrl,
            trailerUrl: draft.trailerUrl,
            systemRequirements: {
              minReq: draft.minReq,
              recReq: draft.recReq,
            },
          },
        })) as any;

        if (res.data && res.data.id) {
          targetGameId = res.data.id;
          const updated = { ...draft, id: targetGameId };
          setDraft(updated);
          saveGameInfoDraft(updated);
        }
      }

      setSavedToast(true);
      setTimeout(() => {
        navigate({
          to: '/designer-page',
          search: targetGameId && targetGameId !== 'draft_new_game' ? { gameId: targetGameId } : undefined,
        });
      }, 400);
    } catch (err) {
      console.error('Failed to submit game info to catalog-service:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const canContinue = draft.title.trim().length > 0 && !isSubmitting;

  return (
    <div className={styles.pageContainer}>
      {/* Navigation Top Bar */}
      <GameInfoFormHeader />

      {/* Main Form Content */}
      <div className={styles.contentArea}>
        <div className={styles.contentInner}>
          {/* Heading */}
          <div className={styles.headerSection}>
            <p className={styles.stepSubTag}>Catalog Metadata Entry</p>
            <h1 className={styles.mainHeading}>Game Information & Specifications</h1>
            <p className={styles.mainSubheading}>
              Enter basic metadata, genre classification, and system requirements. This info is
              cached in draft state and directly populates your store layout components in the Page
              Designer.
            </p>
          </div>

          {/* Grid Layout: Left Column (Details/Media) & Right Column (System Specs) */}
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: 12, color: '#fd7014' }}>
              <Loader2 size={24} className="animate-spin" />
              <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#eeeeee' }}>Loading game specifications...</span>
            </div>
          ) : (
            <div className={styles.gridContainer}>
              {/* Left Column */}
              <div className={styles.leftColumn}>
                <BasicDetailsCard
                  title={draft.title}
                  shortDesc={draft.shortDesc}
                  priceEgp={draft.priceEgp}
                  onChangeTitle={(v) => handleFieldChange('title', v)}
                  onChangeShortDesc={(v) => handleFieldChange('shortDesc', v)}
                  onChangePriceEgp={(v) => handleFieldChange('priceEgp', v)}
                />

                <ClassificationCard
                  genre={draft.genre}
                  tags={draft.tags}
                  onChangeGenre={(v) => handleFieldChange('genre', v)}
                  onChangeTags={(v) => handleFieldChange('tags', v)}
                />

                <MediaAssetsCard
                  bannerUrl={draft.bannerUrl}
                  trailerUrl={draft.trailerUrl}
                  onChangeBannerUrl={(v) => handleFieldChange('bannerUrl', v)}
                  onChangeTrailerUrl={(v) => handleFieldChange('trailerUrl', v)}
                />
              </div>

              {/* Right Column */}
              <div className={styles.rightColumn}>
                <SystemReqsCard
                  minReq={draft.minReq}
                  recReq={draft.recReq}
                  onChangeTier={handleTierChange}
                />
              </div>
            </div>
          )}

          {/* Footer Action */}
          <div className={styles.footerContainer}>
            <div className={styles.statusText}>
              {savedToast ? (
                <span
                  style={{
                    color: '#38d39f',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Check size={14} /> Draft Saved & Cached
                </span>
              ) : (
                <span>
                  Catalog Status: <span style={{ color: '#FD7014' }}>"draft"</span> (cached locally)
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue}
              className={styles.continueBtn}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  Save & Continue to Store Designer
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
