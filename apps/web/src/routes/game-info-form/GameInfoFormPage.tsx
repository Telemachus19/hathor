import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, Check } from 'lucide-react';
import { saveGameInfoDraft, getGameInfoDraft, EMPTY_GAME_DRAFT, GameInfoDraft, SystemReqSpec } from './gameInfoCache';
import { GameInfoFormHeader } from './-components/GameInfoFormHeader';
import { BasicDetailsCard } from './-components/BasicDetailsCard';
import { ClassificationCard } from './-components/ClassificationCard';
import { MediaAssetsCard } from './-components/MediaAssetsCard';
import { SystemReqsCard } from './-components/SystemReqsCard';
import styles from './-styles/GameInfoFormPage.module.css';

export default function GameInfoFormPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<GameInfoDraft>(() => getGameInfoDraft() || EMPTY_GAME_DRAFT);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    const existing = getGameInfoDraft();
    if (existing) {
      setDraft(existing);
    }
  }, []);

  function handleFieldChange<K extends keyof GameInfoDraft>(key: K, val: GameInfoDraft[K]) {
    setDraft(prev => {
      const updated = { ...prev, [key]: val };
      saveGameInfoDraft(updated);
      return updated;
    });
  }

  function handleTierChange(tier: 'minReq' | 'recReq', key: keyof SystemReqSpec, val: any) {
    setDraft(prev => {
      const updated = {
        ...prev,
        [tier]: { ...prev[tier], [key]: val }
      };
      saveGameInfoDraft(updated);
      return updated;
    });
  }

  function handleContinue() {
    saveGameInfoDraft(draft);
    setSavedToast(true);
    setTimeout(() => {
      navigate({ to: '/designer-page' });
    }, 350);
  }

  const canContinue = draft.title.trim().length > 0;

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
              Enter basic metadata, genre classification, and system requirements. This info is cached in draft state and directly populates your store layout components in the Page Designer.
            </p>
          </div>

          {/* Grid Layout: Left Column (Details/Media) & Right Column (System Specs) */}
          <div className={styles.gridContainer}>

            {/* Left Column */}
            <div className={styles.leftColumn}>
              <BasicDetailsCard
                title={draft.title}
                shortDesc={draft.shortDesc}
                priceEgp={draft.priceEgp}
                onChangeTitle={v => handleFieldChange('title', v)}
                onChangeShortDesc={v => handleFieldChange('shortDesc', v)}
                onChangePriceEgp={v => handleFieldChange('priceEgp', v)}
              />

              <ClassificationCard
                genre={draft.genre}
                tags={draft.tags}
                onChangeGenre={v => handleFieldChange('genre', v)}
                onChangeTags={v => handleFieldChange('tags', v)}
              />

              <MediaAssetsCard
                bannerUrl={draft.bannerUrl}
                trailerUrl={draft.trailerUrl}
                onChangeBannerUrl={v => handleFieldChange('bannerUrl', v)}
                onChangeTrailerUrl={v => handleFieldChange('trailerUrl', v)}
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

          {/* Footer Action */}
          <div className={styles.footerContainer}>
            <div className={styles.statusText}>
              {savedToast ? (
                <span style={{ color: '#38d39f', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={14} /> Draft Saved & Cached
                </span>
              ) : (
                <span>Catalog Status: <span style={{ color: '#FD7014' }}>"draft"</span> (cached locally)</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue}
              className={styles.continueBtn}
            >
              Save & Continue to Store Designer
              <ArrowRight size={14} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
