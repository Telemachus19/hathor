import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, Check, Loader2, AlertCircle } from 'lucide-react';
import {
  saveGameInfoDraft,
  getGameInfoDraft,
  clearGameInfoDraft,
  EMPTY_GAME_DRAFT,
  GameInfoDraft,
  SystemReqSpec,
} from './gameInfoCache';
import { apiClient, apiBaseUrl } from '../../services/api/index';
import { GameInfoFormHeader } from './-components/GameInfoFormHeader';
import { BasicDetailsCard } from './-components/BasicDetailsCard';
import { ClassificationCard } from './-components/ClassificationCard';
import { MediaAssetsCard } from './-components/MediaAssetsCard';
import { GameBuildUploadCard, ExistingBuildInfo } from './-components/GameBuildUploadCard';
import { SystemReqsCard } from './-components/SystemReqsCard';
import styles from './-styles/GameInfoFormPage.module.css';

export default function GameInfoFormPage({ initialGame }: { initialGame?: any }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<GameInfoDraft>(
    () => initialGame || getGameInfoDraft() || EMPTY_GAME_DRAFT
  );
  const [savedToast, setSavedToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buildFile, setBuildFile] = useState<File | null>(null);
  const [existingBuild, setExistingBuild] = useState<ExistingBuildInfo | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [buildError, setBuildError] = useState<string | null>(null);

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
              tags: (data.tags || []).map((t: any) =>
                typeof t === 'string' ? t : t.name || t.slug || ''
              ),
              bannerUrl: data.bannerUrl || '',
              trailerUrl: data.trailerUrl || '',
              minReq: (data.systemRequirements as any)?.minReq || EMPTY_GAME_DRAFT.minReq,
              recReq: (data.systemRequirements as any)?.recReq || EMPTY_GAME_DRAFT.recReq,
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
            };
            setDraft(mappedDraft);
            saveGameInfoDraft(mappedDraft);
            if (data.build) {
              setExistingBuild(data.build);
            }
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

  function handleBuildFileChange(file: File | null) {
    setBuildFile(file);
    if (file) {
      setBuildError(null);
      setSubmitError(null);
    }
  }

  const isBasicDetailsValid = Boolean(
    draft.title.trim() && draft.shortDesc.trim() && draft.priceEgp.trim()
  );

  const isClassificationValid = Boolean(draft.genre.trim() && draft.tags && draft.tags.length > 0);

  const isSystemReqsValid = Boolean(
    draft.minReq?.os &&
    draft.minReq.os.length > 0 &&
    draft.minReq?.cpu?.trim() &&
    draft.minReq?.gpu?.trim() &&
    draft.minReq?.ram?.trim() &&
    draft.minReq?.storageNum?.trim()
  );

  const hasBuild = Boolean(buildFile || existingBuild);

  const canContinue =
    isBasicDetailsValid && isClassificationValid && isSystemReqsValid && hasBuild && !isSubmitting;

  async function handleContinue() {
    if (isSubmitting) return;

    if (!draft.title.trim()) {
      setSubmitError('Game title is required.');
      return;
    }
    if (!draft.shortDesc.trim()) {
      setSubmitError('Short description is required in Basic Details.');
      return;
    }
    if (!draft.priceEgp.trim()) {
      setSubmitError('Price is required in Basic Details.');
      return;
    }
    if (!draft.genre.trim()) {
      setSubmitError('Genre is required. Please select a genre.');
      return;
    }
    if (!draft.tags || draft.tags.length === 0) {
      setSubmitError('Tags are required. Please select at least one tag.');
      return;
    }
    if (!draft.minReq?.os || draft.minReq.os.length === 0) {
      setSubmitError('Please select at least one supported OS in System Requirements.');
      return;
    }
    if (
      !draft.minReq?.cpu?.trim() ||
      !draft.minReq?.gpu?.trim() ||
      !draft.minReq?.ram?.trim() ||
      !draft.minReq?.storageNum?.trim()
    ) {
      setSubmitError('Please complete all minimum system specifications (CPU, GPU, RAM, Storage).');
      return;
    }
    if (!hasBuild) {
      setBuildError(
        'Game build package is required. Please choose a compressed (.zip, .rar, etc.) file.'
      );
      setSubmitError('Game build package is required.');
      return;
    }

    setBuildError(null);
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      let targetGameId = draft.id;
      const isUpdate = targetGameId && targetGameId !== 'draft_new_game';
      const url = isUpdate
        ? `${apiBaseUrl}/creator/games/${targetGameId}`
        : `${apiBaseUrl}/creator/games`;
      const method = isUpdate ? 'PUT' : 'POST';

      // Build multipart/form-data payload with game info & build archive
      const formData = new FormData();
      formData.append('title', draft.title.trim());
      formData.append('shortDescription', draft.shortDesc.trim());
      formData.append('shortDesc', draft.shortDesc.trim());
      formData.append('fullDescription', draft.shortDesc.trim());
      formData.append('priceEgp', draft.priceEgp || '0.00');
      if (draft.genre) formData.append('genre', draft.genre);
      formData.append('tags', JSON.stringify(draft.tags || []));
      if (draft.bannerUrl) formData.append('bannerUrl', draft.bannerUrl);
      if (draft.trailerUrl) formData.append('trailerUrl', draft.trailerUrl);
      formData.append(
        'systemRequirements',
        JSON.stringify({
          minReq: draft.minReq,
          recReq: draft.recReq,
        })
      );

      if (buildFile) {
        formData.append('build', buildFile, buildFile.name);
      }

      const token = apiClient.getAccessToken();
      const response = await fetch(url, {
        method,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.error?.message ||
            `Failed to save game info and build package (HTTP ${response.status})`
        );
      }

      const resJson = await response.json();
      const savedGame = resJson?.data || resJson;

      if (savedGame && savedGame.id) {
        targetGameId = savedGame.id;
        const updated = { ...draft, id: targetGameId };
        setDraft(updated);
        saveGameInfoDraft(updated);
        if (savedGame.build) {
          setExistingBuild(savedGame.build);
        }
      }

      setSavedToast(true);
      setTimeout(() => {
        navigate({
          to: '/designer-page',
          search:
            targetGameId && targetGameId !== 'draft_new_game'
              ? { gameId: targetGameId }
              : undefined,
        });
      }, 400);
    } catch (err: any) {
      console.error('Failed to submit game info and build to catalog-service:', err);
      setSubmitError(err.message || 'Failed to upload game build and save metadata.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.pageContainer}>
      {/* Navigation Top Bar */}
      <GameInfoFormHeader />

      {/* Main Form Content */}
      <div className={styles.contentArea}>
        <div className={styles.contentInner}>
          {/* Heading */}
          <div className={styles.headerSection}>
            <p className={styles.stepSubTag}>Catalog Metadata & Build Entry</p>
            <h1 className={styles.mainHeading}>Game Information & Specifications</h1>
            <p className={styles.mainSubheading}>
              Enter basic metadata, classification, media assets, and upload your game build
              package. All data and build artifacts are securely stored in MinIO/R2 and catalog
              services before launching the Page Designer.
            </p>
          </div>

          {/* Grid Layout: Left Column (Details/Media) & Right Column (System Specs/Build) */}
          {loading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 320,
                gap: 12,
                color: '#fd7014',
              }}
            >
              <Loader2 size={24} className="animate-spin" />
              <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#eeeeee' }}>
                Loading game specifications...
              </span>
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

                {/* Game Build Upload Card (Required) */}
                <GameBuildUploadCard
                  buildFile={buildFile}
                  existingBuild={existingBuild}
                  onChangeBuildFile={handleBuildFileChange}
                  error={buildError}
                />
              </div>
            </div>
          )}

          {/* Submission Error Banner if upload fails */}
          {submitError && (
            <div
              style={{
                marginTop: 24,
                padding: '14px 18px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: '#fca5a5',
                fontFamily: 'monospace',
                fontSize: 12,
              }}
            >
              <AlertCircle size={16} color="#ef4444" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Footer Action */}
          <div className={styles.footerContainer}>
            <div className={styles.statusText}>
              {savedToast && (
                <span
                  style={{
                    color: '#38d39f',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Check size={14} /> Draft & Build Saved to MinIO
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
                  <Loader2 size={14} className="animate-spin" /> Uploading & Saving...
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
