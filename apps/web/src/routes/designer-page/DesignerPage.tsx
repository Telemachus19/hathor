import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { getGameInfoDraft } from "../game-info-form/gameInfoCache";
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
  uid
} from "./types/designerTypes";
import { INITIAL, syncSectionsWithDraft, generatePageJSON } from "./utils/schemaUtils";
import { BLOCK_META } from "./components/sidebar/paletteConfig";
import { DesignerHeader } from "./components/header/DesignerHeader";
import { BlockPalette } from "./components/sidebar/BlockPalette";
import { DesignerCanvas } from "./components/canvas/DesignerCanvas";
import { PropertiesPanel } from "./components/inspector/PropertiesPanel";
import { TemplateModal } from "./components/modals/TemplateModal";
import { PublishModal } from "./components/modals/PublishModal";
import { ImportModal } from "./components/modals/ImportModal";
import { PreviewModal } from "./components/modals/PreviewModal";
import styles from "./DesignerPage.module.css";

export default function DesignerPage() {
  const [state, setState] = useState(() => {
    const synced = syncSectionsWithDraft(INITIAL);
    return { sections: synced, history: [synced], historyIdx: 0 };
  });

  const [pageSettings, setPageSettings] = useState<PageSettings>(DEFAULT_PAGE_SETTINGS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedColIdx, setSelectedColIdx] = useState<number | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedId(null);
        setSelectedColIdx(null);
        setSelectedElementId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [showModal, setShowModal] = useState<boolean>(true);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>("");
  const [importError, setImportError] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<Device>("desktop");

  const [device, setDevice] = useState<Device>("desktop");
  const [gameTitle, setGameTitle] = useState(() => getGameInfoDraft().title || "YOUR GAME TITLE");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const draft = getGameInfoDraft();
    if (draft) {
      if (draft.title) setGameTitle(draft.title.toUpperCase());
      setState(prev => {
        const synced = syncSectionsWithDraft(prev.sections);
        return {
          ...prev,
          sections: synced,
          history: prev.historyIdx === 0 ? [synced] : prev.history,
        };
      });
    }
  }, []);

  const { sections, history, historyIdx } = state;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function mutateSections(newSections: Section[], skipHistory = false) {
    setState(prev => {
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
    setState(prev => {
      if (prev.historyIdx <= 0) return prev;
      const idx = prev.historyIdx - 1;
      return { sections: prev.history[idx], history: prev.history, historyIdx: idx };
    });
  }

  function redo() {
    setState(prev => {
      if (prev.historyIdx >= prev.history.length - 1) return prev;
      const idx = prev.historyIdx + 1;
      return { sections: prev.history[idx], history: prev.history, historyIdx: idx };
    });
  }

  function handleImportJSON(jsonString: string) {
    try {
      if (!jsonString.trim()) {
        setImportError("Please paste JSON content or select a .json file.");
        return;
      }
      const parsed = JSON.parse(jsonString);
      let importedSections: Section[] = [];
      let importedSettings: Partial<PageSettings> | null = null;

      if (Array.isArray(parsed)) {
        importedSections = parsed;
      } else if (parsed && typeof parsed === "object") {
        if (Array.isArray(parsed.sections)) {
          importedSections = parsed.sections;
        }
        if (parsed.pageSettings && typeof parsed.pageSettings === "object") {
          importedSettings = parsed.pageSettings;
        } else if (parsed.pageBody && typeof parsed.pageBody === "object") {
          importedSettings = parsed.pageBody;
        }
      }

      if (!importedSections || importedSections.length === 0) {
        setImportError("No valid sections found in JSON. Expected { sections: [...] } or Section[].");
        return;
      }

      const normalizeItem = (item: any) => {
        let t = item.type || item.component || "text";
        if (t === "GameHero" || t === "game-hero" || t === "MediaCarousel" || t === "media-carousel" || t === "CarouselShowcase" || t === "carousel") {
          t = "media-carousel";
        }
        const imgs = item.heroImages || item.carouselImages || item.mediaItems || item.images || [];
        return {
          ...item,
          type: t,
          id: item.id || uid(),
          heroImages: imgs,
          carouselImages: imgs,
          mediaItems: imgs,
        };
      };

      const sanitizedSections = importedSections.map(sec => {
        const normSec = normalizeItem(sec);
        return {
          ...normSec,
          gridCols: normSec.gridCols ? normSec.gridCols.map((col: any) => ({
            ...col,
            id: col.id || uid(),
            elements: (col.elements || []).map((el: any) => normalizeItem(el))
          })) : normSec.gridCols
        };
      });

      if (importedSettings) {
        setPageSettings(prev => ({ ...prev, ...importedSettings }));
      }

      mutateSections(sanitizedSections);
      setSelectedId(null);
      setSelectedColIdx(null);
      setSelectedElementId(null);
      setShowImportModal(false);
      setImportJsonText("");
      setImportError(null);
      showToast("Layout JSON imported and rendered successfully!");
    } catch (err: any) {
      setImportError(`Invalid JSON format: ${err?.message || "Syntax error"}`);
    }
  }

  function addSection(type: SectionType | ElementType) {
    const activeSection = sections.find(s => s.id === selectedId);

    if (activeSection && activeSection.type === "grid" && selectedColIdx !== null && selectedColIdx !== undefined) {
      if (type === "grid") {
        showToast("Cannot nest a Multi-Column Layout inside another Column");
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

  function addGridSection(template: string = "1:1") {
    const colCountMap: Record<string, number> = {
      "1": 1,
      "1:1": 2, "1:2": 2, "2:1": 2,
      "1:1:1": 3, "1:2:1": 3, "2:1:1": 3, "1:1:2": 3,
      "1:1:1:1": 4
    };
    const reqCols = colCountMap[template] || 2;
    const gridCols = Array.from({ length: reqCols }, () => ({
      id: uid(), bg: "transparent", pt: 0, pb: 0, ph: 0, radius: 0, elements: []
    }));

    const newGrid: Section = {
      id: uid(),
      type: "grid",
      bg: "transparent",
      bgImage: "",
      overlay: 0,
      pt: 32,
      pb: 48,
      ph: 32,
      pl: 32,
      pr: 32,
      radius: 0,
      gridTemplate: template,
      gridGap: 40,
      gridCols: gridCols
    };

    mutateSections([...sections, newGrid]);
    setSelectedId(newGrid.id);
    setSelectedColIdx(0);
    setSelectedElementId(null);
    showToast(`Added ${reqCols}-Column Layout (${template})`);
  }

  function updateSection(id: string, updates: Partial<Section>, skipHistory = false) {
    mutateSections(sections.map(s => s.id === id ? { ...s, ...updates } : s), skipHistory);
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
    showToast("Block duplicated");
  }

  function deleteSection(i: number) {
    mutateSections(sections.filter((_, j) => j !== i));
    setSelectedId(null);
    setSelectedColIdx(null);
    setSelectedElementId(null);
  }

  const selectedSection = sections.find(s => s.id === selectedId) ?? null;

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
            showToast("Loaded Default Game Details Layout");
          }}
          onSelectBlank={() => {
            setState({ sections: [], history: [[]], historyIdx: 0 });
            setSelectedId(null);
            setSelectedColIdx(null);
            setSelectedElementId(null);
            setShowModal(false);
            showToast("Started with Blank Canvas");
          }}
        />
      )}

      {/* Publish & JSON Export Modal */}
      {showPublishModal && (
        <PublishModal
          sections={sections}
          pageSettings={pageSettings}
          gameTitle={gameTitle}
          onClose={() => setShowPublishModal(false)}
          onShowToast={showToast}
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
        onSaveDraft={() => {
          showToast("Draft saved as JSON");
          console.log("Draft pageTheme JSON:", generatePageJSON(sections, pageSettings));
        }}
        onOpenPublish={() => setShowPublishModal(true)}
      />

      {/* Main Workspace Body */}
      <div className={styles.editorBody}>
        {/* Left Sidebar — Block Palette */}
        <BlockPalette onAdd={addSection} onAddGridWithCols={addGridSection} />

        {/* Center Canvas */}
        <DesignerCanvas
          sections={sections}
          pageSettings={pageSettings}
          device={device}
          selectedId={selectedId}
          selectedColIdx={selectedColIdx}
          selectedElementId={selectedElementId}
          onDeselectAll={() => {
            setSelectedId(null);
            setSelectedColIdx(null);
            setSelectedElementId(null);
          }}
          onSelectSection={id => {
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
      </div>
    </div>
  );
}
