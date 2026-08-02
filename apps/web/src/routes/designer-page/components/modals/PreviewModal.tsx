import { createPortal } from "react-dom";
import { Eye, Monitor, Tablet, Smartphone, X } from "lucide-react";
import { Section, PageSettings, Device, HATHOR_ORANGE, GREEN_ACCENT, BORDER, TEXT_MUTED } from "../../types/designerTypes";
import { generatePageJSON, isCustomTheme } from "../../utils/schemaUtils";
import GameDetailsPage from "../../../game-details/GameDetailsPage";

export function PreviewModal({
  sections,
  pageSettings,
  previewDevice,
  setPreviewDevice,
  onClose
}: {
  sections: Section[];
  pageSettings: PageSettings;
  previewDevice: Device;
  setPreviewDevice: (d: Device) => void;
  onClose: () => void;
}) {
  const isCustom = isCustomTheme(sections);

  return createPortal(
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999999, background: "#0a0c10",
      display: "flex", flexDirection: "column", overflow: "hidden"
    }}>
      <div style={{
        height: 52, background: "#141820", borderBottom: `1px solid ${BORDER}`,
        padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: GREEN_ACCENT, fontWeight: 800, fontSize: 12, fontFamily: "monospace" }}>
            <Eye size={14} /> LIVE GAME DETAILS PAGE PREVIEW
          </div>
          <span style={{ fontSize: 10, color: TEXT_MUTED, fontFamily: "monospace", borderLeft: `1px solid ${BORDER}`, paddingLeft: 12 }}>
            {isCustom ? 'Theme Mode: "custom"' : 'Theme Mode: "default"'}
          </span>
        </div>

        {/* Preview Responsive Device Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.4)", padding: 3, borderRadius: 6, border: `1px solid ${BORDER}` }}>
          <button
            onClick={() => setPreviewDevice("desktop")}
            style={{
              padding: "4px 10px",
              background: previewDevice === "desktop" ? HATHOR_ORANGE : "transparent",
              color: previewDevice === "desktop" ? "#fff" : TEXT_MUTED,
              border: "none", borderRadius: 4, fontSize: 10, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 5
            }}
          >
            <Monitor size={12} /> Desktop
          </button>
          <button
            onClick={() => setPreviewDevice("tablet")}
            style={{
              padding: "4px 10px",
              background: previewDevice === "tablet" ? HATHOR_ORANGE : "transparent",
              color: previewDevice === "tablet" ? "#fff" : TEXT_MUTED,
              border: "none", borderRadius: 4, fontSize: 10, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 5
            }}
          >
            <Tablet size={12} /> Tablet (768px)
          </button>
          <button
            onClick={() => setPreviewDevice("mobile")}
            style={{
              padding: "4px 10px",
              background: previewDevice === "mobile" ? HATHOR_ORANGE : "transparent",
              color: previewDevice === "mobile" ? "#fff" : TEXT_MUTED,
              border: "none", borderRadius: 4, fontSize: 10, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 5
            }}
          >
            <Smartphone size={12} /> Mobile (375px)
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.08)", border: `1px solid ${BORDER}`, color: "#fff",
              padding: "6px 14px", borderRadius: 4, fontWeight: 800, fontSize: 11,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6
            }}
          >
            <X size={14} /> CLOSE PREVIEW
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", background: "#06080b", padding: previewDevice === "desktop" ? 0 : "24px 0", display: "flex", justifyContent: "center" }}>
        <div style={{
          width: "100%",
          maxWidth: previewDevice === "mobile" ? 375 : previewDevice === "tablet" ? 768 : "100%",
          minHeight: "100%",
          boxShadow: previewDevice === "desktop" ? "none" : "0 0 50px rgba(0,0,0,0.8)",
          borderLeft: previewDevice === "desktop" ? "none" : `1px solid ${BORDER}`,
          borderRight: previewDevice === "desktop" ? "none" : `1px solid ${BORDER}`,
          transition: "all 0.25s ease",
          boxSizing: "border-box"
        }}>
          <GameDetailsPage themeConfig={generatePageJSON(sections, { ...pageSettings, device: previewDevice })} />
        </div>
      </div>
    </div>,
    document.body
  );
}
