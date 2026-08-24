import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Check } from 'lucide-react';
import { getGameInfoDraft } from '../game-info-form/gameInfoCache';
import { apiClient } from '../../services/api/index';
import {
  Section,
  PageSettings,
  DEFAULT_PAGE_SETTINGS,
  Device,
  SectionType,
  ElementType,
  GREEN_ACCENT,
  createSection,
  createGridElement,
  uid,
} from './types/designerTypes';
import { INITIAL, syncSectionsWithDraft, generatePageJSON } from './utils/schemaUtils';
import { BLOCK_META } from './components/sidebar/paletteConfig';
import { DesignerHeader } from './components/header/DesignerHeader';
import { BlockPalette } from './components/sidebar/BlockPalette';
import { DesignerCanvas } from './components/canvas/DesignerCanvas';
import { PropertiesPanel } from './components/inspector/PropertiesPanel';
import { TemplateModal } from './components/modals/TemplateModal';
import { PublishModal } from './components/modals/PublishModal';
import { ImportModal } from './components/modals/ImportModal';
import { PreviewModal } from './components/modals/PreviewModal';
import { AiAssistantSidebar } from './components/sidebar/AiAssistantSidebar';
import { validateThemeAgainstDocument } from '../../utils/themeValidator';
import styles from './DesignerPage.module.css';

export default function DesignerPage({ initialGame }: { initialGame?: any }) {
  const navigate = useNavigate();
  const [activeGameId, setActiveGameId] = useState<string | undefined>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('gameId') || initialGame?.id || undefined;
  });

  const [state, setState] = useState(() => {
    const synced = syncSectionsWithDraft(INITIAL);
    return { sections: synced, history: [synced], historyIdx: 0 };
  });

  const [pageSettings, setPageSettings] = useState<PageSettings>(DEFAULT_PAGE_SETTINGS);
  const [previewTheme, setPreviewTheme] = useState<{
    sections?: Section[];
    pageSettings?: PageSettings;
    settings?: PageSettings;
  } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedColIdx, setSelectedColIdx] = useState<number | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedId(null);
        setSelectedColIdx(null);
        setSelectedElementId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<Device>('desktop');

  const [device, setDevice] = useState<Device>('desktop');
  const [gameTitle, setGameTitle] = useState(() => getGameInfoDraft().title || 'YOUR GAME TITLE');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const handleOpenAiModal = () => setShowAiModal(true);
    document.addEventListener('openAiThemeModal', handleOpenAiModal);
    return () => document.removeEventListener('openAiThemeModal', handleOpenAiModal);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gid = params.get('gameId') || initialGame?.id || undefined;
    if (gid) setActiveGameId(gid);

    async function loadDesignerContent() {
      if (gid && gid !== 'draft_new_game') {
        try {
          const res = (await apiClient.GET('/creator/games/{gameId}' as any, {
            params: { path: { gameId: gid } },
          })) as any;

          if (res.error || !res.data) {
            console.error('Forbidden or not owner of this game:', res.error);
            navigate({ to: '/', replace: true });
            window.location.replace('/');
            return;
          }

          const data = res.data;

          if (data) {
            if (data.title) setGameTitle(data.title.toUpperCase());

            const rawTheme = data.pageTheme ?? (data as any).theme;
            let theme = rawTheme;
            if (typeof rawTheme === 'string') {
              try {
                theme = JSON.parse(rawTheme);
              } catch (e) {
                console.error('Error parsing theme JSON:', e);
              }
            }

            const hasExistingLayout =
              theme &&
              typeof theme === 'object' &&
              ((Array.isArray(theme.sections) && theme.sections.length > 0) ||
                (Array.isArray(theme) && theme.length > 0) ||
                (theme.layout &&
                  typeof theme.layout === 'object' &&
                  Object.keys(theme.layout).length > 0) ||
                (theme.pageLayout &&
                  typeof theme.pageLayout === 'object' &&
                  Object.keys(theme.pageLayout).length > 0));

            if (hasExistingLayout) {
              // Existing game with saved layout: skip template modal and load JSON
              setShowModal(false);
              handleImportJSON(typeof rawTheme === 'string' ? rawTheme : JSON.stringify(rawTheme));
            } else {
              // New game / no saved layout: open template selector modal
              setShowModal(true);
              const draft = getGameInfoDraft();
              if (draft) {
                setState((prev) => {
                  const synced = syncSectionsWithDraft(prev.sections);
                  return {
                    ...prev,
                    sections: synced,
                    history: prev.historyIdx === 0 ? [synced] : prev.history,
                  };
                });
              }
            }
          }
        } catch (err) {
          console.error('Error fetching game for designer:', err);
          navigate({ to: '/', replace: true });
          window.location.replace('/');
          return;
        }
      } else {
        // No persistent ID: open template selector
        setShowModal(true);
        const draft = getGameInfoDraft();
        if (draft) {
          if (draft.title) setGameTitle(draft.title.toUpperCase());
          setState((prev) => {
            const synced = syncSectionsWithDraft(prev.sections);
            return {
              ...prev,
              sections: synced,
              history: prev.historyIdx === 0 ? [synced] : prev.history,
            };
          });
        }
      }
    }

    loadDesignerContent();
  }, []);

  const { sections, history, historyIdx } = state;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function mutateSections(newSections: Section[], skipHistory = false) {
    setState((prev) => {
      if (skipHistory) {
        const newHistory = [...prev.history];
        newHistory[prev.historyIdx] = newSections;
        return {
          ...prev,
          sections: newSections,
          history: newHistory,
        };
      }
      return {
        sections: newSections,
        history: [...prev.history.slice(0, prev.historyIdx + 1), newSections],
        historyIdx: prev.historyIdx + 1,
      };
    });
  }

  function undo() {
    setState((prev) => {
      if (prev.historyIdx <= 0) return prev;
      const idx = prev.historyIdx - 1;
      return { sections: prev.history[idx], history: prev.history, historyIdx: idx };
    });
  }

  function redo() {
    setState((prev) => {
      if (prev.historyIdx >= prev.history.length - 1) return prev;
      const idx = prev.historyIdx + 1;
      return { sections: prev.history[idx], history: prev.history, historyIdx: idx };
    });
  }

  function handleImportJSON(jsonString: string) {
    try {
      if (!jsonString.trim()) {
        setImportError('Please paste JSON content or select a .json file.');
        return;
      }
      const parsed = JSON.parse(jsonString);

      let rawSections: any[] = [];
      let importedSettings: Partial<PageSettings> | null = null;

      if (Array.isArray(parsed)) {
        rawSections = parsed;
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.sections)) {
          rawSections = parsed.sections;
        } else if (parsed.layout && typeof parsed.layout === 'object') {
          rawSections = Object.values(parsed.layout);
        } else if (parsed.pageLayout && typeof parsed.pageLayout === 'object') {
          rawSections = Object.values(parsed.pageLayout);
        }
        if (parsed.pageSettings && typeof parsed.pageSettings === 'object') {
          importedSettings = parsed.pageSettings;
        } else if (parsed.pageBody && typeof parsed.pageBody === 'object') {
          importedSettings = parsed.pageBody;
        }
      }

      if (!rawSections || rawSections.length === 0) {
        setImportError(
          'No valid sections found in JSON. Expected { sections: [...] } or Section[].'
        );
        return;
      }

      const normalizeItem = (item: any) => {
        let t = item.type || item.component || 'text';
        if (
          t === 'GameHero' ||
          t === 'game-hero' ||
          t === 'MediaCarousel' ||
          t === 'media-carousel' ||
          t === 'CarouselShowcase' ||
          t === 'carousel'
        ) {
          t = 'media-carousel';
        }
        const res: any = { ...item, type: t, id: item.id || uid() };
        if (t === 'media-carousel') {
          const imgs =
            item.heroImages || item.carouselImages || item.mediaItems || item.images || [];
          res.heroImages = imgs;
          res.carouselImages = imgs;
          delete res.mediaItems;
        } else {
          delete res.heroImages;
          delete res.carouselImages;
          delete res.mediaItems;
        }
        return res;
      };

      const cleanItemTree = (item: any): any => {
        const cleaned = normalizeItem(item);
        if (cleaned.type === 'grid' && Array.isArray(cleaned.gridCols)) {
          cleaned.gridCols = cleaned.gridCols.map((col: any) => ({
            ...col,
            id: col.id || uid(),
            elements: Array.isArray(col.elements) ? col.elements.map(cleanItemTree) : [],
          }));
        }
        return cleaned;
      };

      const cleanedSections = rawSections.map(cleanItemTree);
      const payloadToValidate = Array.isArray(parsed)
        ? cleanedSections
        : { ...parsed, sections: cleanedSections };

      // Validate theme against ThemeDocument specification & anti-injection rules
      const validation = validateThemeAgainstDocument(payloadToValidate);
      if (!validation.valid) {
        const primaryError = validation.errors[0];
        const errorMsg = `Validation Rejected (${primaryError.code}): ${primaryError.message}${
          primaryError.path ? ` at [${primaryError.path}]` : ''
        }`;
        console.error('Designer theme validation rejected:', errorMsg, validation.errors);
        setImportError(errorMsg);
        return;
      }

      if (importedSettings) {
        setPageSettings((prev) => ({ ...prev, ...importedSettings }));
      }

      mutateSections(cleanedSections);
      setSelectedId(null);
      setSelectedColIdx(null);
      setSelectedElementId(null);
      setShowImportModal(false);
      setImportJsonText('');
      setImportError(null);
      showToast('Layout JSON imported and rendered successfully!');
    } catch (err: any) {
      setImportError(`Invalid JSON format: ${err?.message || 'Syntax error'}`);
    }
  }

  function addSection(type: SectionType | ElementType) {
    const activeSection = sections.find((s) => s.id === selectedId);

    if (
      activeSection &&
      activeSection.type === 'grid' &&
      selectedColIdx !== null &&
      selectedColIdx !== undefined
    ) {
      if (type === 'grid') {
        showToast('Cannot nest a Multi-Column Layout inside another Column');
        return;
      }

      const newEl = createGridElement(type as ElementType);
      const updatedCols = (activeSection.gridCols || []).map((c, idx) =>
        idx === selectedColIdx ? { ...c, elements: [...c.elements, newEl] } : c
      );

      updateSection(activeSection.id, { gridCols: updatedCols });
      setSelectedElementId(newEl.id);
      showToast(`Inserted into Col ${selectedColIdx + 1}: ${BLOCK_META[type]?.label || type}`);
      return;
    }

    const s = createSection(type as SectionType);
    mutateSections([...sections, s]);
    setSelectedId(s.id);
    setSelectedColIdx(null);
    setSelectedElementId(null);
    showToast(`Added Section: ${BLOCK_META[type]?.label || type}`);
  }

  function addGridSection(template: string = '1:1') {
    const colCountMap: Record<string, number> = {
      '1': 1,
      '1:1': 2,
      '1:2': 2,
      '2:1': 2,
      '1:1:1': 3,
      '1:2:1': 3,
      '2:1:1': 3,
      '1:1:2': 3,
      '1:1:1:1': 4,
    };
    const reqCols = colCountMap[template] || 2;
    const gridCols = Array.from({ length: reqCols }, () => ({
      id: uid(),
      bg: 'transparent',
      pt: 0,
      pb: 0,
      ph: 0,
      radius: 0,
      elements: [],
    }));

    const newGrid: Section = {
      id: uid(),
      type: 'grid',
      bg: 'transparent',
      bgImage: '',
      overlay: 0,
      pt: 32,
      pb: 48,
      ph: 32,
      pl: 32,
      pr: 32,
      radius: 0,
      gridTemplate: template,
      gridGap: 40,
      gridCols: gridCols,
    };

    mutateSections([...sections, newGrid]);
    setSelectedId(newGrid.id);
    setSelectedColIdx(0);
    setSelectedElementId(null);
    showToast(`Added ${reqCols}-Column Layout (${template})`);
  }

  function updateSection(id: string, updates: Partial<Section>, skipHistory = false) {
    mutateSections(
      sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      skipHistory
    );
  }

  function moveUp(i: number) {
    if (i <= 0) return;
    const arr = [...sections];
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    mutateSections(arr);
  }

  function moveDown(i: number) {
    if (i >= sections.length - 1) return;
    const arr = [...sections];
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    mutateSections(arr);
  }

  function duplicateSection(i: number) {
    const duped = { ...sections[i], id: uid() };
    const arr = [...sections];
    arr.splice(i + 1, 0, duped);
    mutateSections(arr);
    setSelectedId(duped.id);
    setSelectedColIdx(null);
    setSelectedElementId(null);
    showToast('Block duplicated');
  }

  function deleteSection(i: number) {
    mutateSections(sections.filter((_, j) => j !== i));
    setSelectedId(null);
    setSelectedColIdx(null);
    setSelectedElementId(null);
  }

  const selectedSection = sections.find((s) => s.id === selectedId) ?? null;

  const handleSaveDraft = async () => {
    try {
      const pageThemeJson = generatePageJSON(sections, pageSettings);
      if (activeGameId && activeGameId !== 'draft_new_game') {
        await apiClient.PUT('/creator/games/{gameId}/theme' as any, {
          params: { path: { gameId: activeGameId } },
          body: pageThemeJson as any,
        });
        try {
          await apiClient.PATCH('/creator/games/{gameId}/status' as any, {
            params: { path: { gameId: activeGameId } },
            body: { status: 'draft' as any },
          });
        } catch {
          // Status might already be 'draft'
        }
      }
      showToast('Draft layout saved to database');
    } catch (err) {
      console.error('Failed to save draft layout:', err);
      showToast('Failed to save draft layout');
    }
  };

  return (
    <div className={styles.designerContainer}>
      {/* Choice Modal Overlay */}
      {showModal && (
        <TemplateModal
          onSelectDefault={() => {
            const synced = syncSectionsWithDraft(INITIAL);
            setState({ sections: synced, history: [synced], historyIdx: 0 });
            setSelectedId(null);
            setSelectedColIdx(null);
            setSelectedElementId(null);
            setShowModal(false);
            showToast('Loaded Default Game Details Layout');
          }}
          onSelectBlank={() => {
            setState({ sections: [], history: [[]], historyIdx: 0 });
            setSelectedId(null);
            setSelectedColIdx(null);
            setSelectedElementId(null);
            setShowModal(false);
            showToast('Started with Blank Canvas');
          }}
        />
      )}

      {/* Publish & JSON Export Modal */}
      {showPublishModal && (
        <PublishModal
          gameId={activeGameId}
          sections={sections}
          pageSettings={pageSettings}
          gameTitle={gameTitle}
          onClose={() => setShowPublishModal(false)}
          onShowToast={showToast}
          onPublishSuccess={() => {
            navigate({ to: '/creator/my-games' });
          }}
        />
      )}

      {/* Import JSON Modal */}
      {showImportModal && (
        <ImportModal
          importJsonText={importJsonText}
          setImportJsonText={setImportJsonText}
          importError={importError}
          setImportError={setImportError}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportJSON}
        />
      )}

      {/* Live Game Details Page Full-screen Preview Modal */}
      {showPreviewModal && (
        <PreviewModal
          sections={sections}
          pageSettings={pageSettings}
          previewDevice={previewDevice}
          setPreviewDevice={setPreviewDevice}
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={styles.toast}>
          <Check size={12} style={{ color: GREEN_ACCENT }} />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Toolbar */}
      <DesignerHeader
        gameTitle={gameTitle}
        setGameTitle={setGameTitle}
        device={device}
        setDevice={setDevice}
        historyIdx={historyIdx}
        historyLength={history.length}
        onUndo={undo}
        onRedo={redo}
        onOpenTemplates={() => setShowModal(true)}
        onOpenPreview={() => setShowPreviewModal(true)}
        onOpenImport={() => setShowImportModal(true)}
        onSaveDraft={handleSaveDraft}
        onOpenPublish={() => setShowPublishModal(true)}
        onToggleAi={() => setShowAiModal((prev) => !prev)}
        isAiOpen={showAiModal}
      />

      {/* Main Workspace Body */}
      <div className={styles.editorBody}>
        {/* Left Sidebar — Block Palette */}
        <BlockPalette onAdd={addSection} onAddGridWithCols={addGridSection} />

        {/* Center Canvas */}
        <DesignerCanvas
          sections={
            previewTheme?.sections ||
            (Array.isArray(previewTheme) ? (previewTheme as any) : sections)
          }
          pageSettings={previewTheme?.pageSettings || previewTheme?.settings || pageSettings}
          device={device}
          selectedId={selectedId}
          selectedColIdx={selectedColIdx}
          selectedElementId={selectedElementId}
          onDeselectAll={() => {
            setSelectedId(null);
            setSelectedColIdx(null);
            setSelectedElementId(null);
          }}
          onSelectSection={(id) => {
            setSelectedId(id);
            setSelectedColIdx(null);
            setSelectedElementId(null);
          }}
          onSelectChild={(sectionId, colIdx, elementId) => {
            setSelectedId(sectionId);
            setSelectedColIdx(colIdx);
            setSelectedElementId(elementId);
          }}
          onMoveUp={moveUp}
          onMoveDown={moveDown}
          onDuplicate={duplicateSection}
          onDelete={deleteSection}
          onOpenTemplateModal={() => setShowModal(true)}
        />

        {/* Right Inspector Panel */}
        <PropertiesPanel
          section={selectedSection}
          selectedColIdx={selectedColIdx}
          selectedElementId={selectedElementId}
          onChange={updateSection}
          pageSettings={pageSettings}
          onPageSettingsChange={setPageSettings}
          onDeselectAll={() => {
            setSelectedId(null);
            setSelectedColIdx(null);
            setSelectedElementId(null);
          }}
        />

        {/* AI Assistant Sidebar */}
        <AiAssistantSidebar
          isOpen={showAiModal}
          onClose={() => {
            setShowAiModal(false);
            setPreviewTheme(null);
          }}
          gameId={activeGameId || initialGame?.id || 'draft'}
          currentTheme={{ sections, pageSettings }}
          onPreviewTheme={(theme) => {
            if (theme) {
              setPreviewTheme(theme);
            } else {
              setPreviewTheme(null);
            }
          }}
          onAcceptTheme={(theme) => {
            const incomingSections = theme?.sections || (Array.isArray(theme) ? theme : null);
            const incomingSettings = theme?.pageSettings || theme?.settings || theme?.pageBody;
            if (incomingSections && incomingSections.length > 0) {
              mutateSections(incomingSections);
            }
            if (incomingSettings) {
              setPageSettings((prev) => ({ ...prev, ...incomingSettings }));
            }
            setPreviewTheme(null);
            showToast('AI Theme Applied successfully!');
          }}
        />
      </div>
    </div>
  );
}
