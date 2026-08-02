import { FileJson, X, Layers, Check, Copy, Download, Upload } from "lucide-react";
import { Section, PageSettings, HATHOR_ORANGE, GREEN_ACCENT, BORDER, TEXT_MUTED, TEXT_PRIMARY } from "../../types/designerTypes";
import { generatePageJSON, isCustomTheme } from "../../utils/schemaUtils";
import styles from "../../DesignerPage.module.css";

export function PublishModal({
  sections,
  pageSettings,
  gameTitle,
  onClose,
  onShowToast
}: {
  sections: Section[];
  pageSettings: PageSettings;
  gameTitle: string;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}) {
  const isCustom = isCustomTheme(sections);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} style={{ maxWidth: 740, width: "92%", textAlign: "left" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, borderBottom: `1px solid ${BORDER}`, paddingBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FileJson size={22} style={{ color: HATHOR_ORANGE }} />
            <h2 className={styles.modalTitle} style={{ margin: 0, fontSize: 18 }}>Store Page JSON Output</h2>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: TEXT_MUTED, cursor: "pointer", display: "flex", padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <p className={styles.modalSub} style={{ marginBottom: 14 }}>
          This JSON schema is saved to <code style={{ color: HATHOR_ORANGE, fontFamily: "monospace" }}>pageTheme</code> in the database to render the published store page.
        </p>

        {/* Automatic Theme Mode Badge */}
        {isCustom ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(242, 107, 33, 0.12)", border: "1px solid rgba(242, 107, 33, 0.4)", padding: "10px 14px", borderRadius: 6, marginBottom: 16, color: HATHOR_ORANGE, fontSize: 11, fontFamily: "monospace", fontWeight: 800 }}>
            <Layers size={15} />
            <span>THEME MODE: "custom" — Custom components or styling modifications detected</span>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(56, 211, 159, 0.12)", border: "1px solid rgba(56, 211, 159, 0.4)", padding: "10px 14px", borderRadius: 6, marginBottom: 16, color: GREEN_ACCENT, fontSize: 11, fontFamily: "monospace", fontWeight: 800 }}>
            <Check size={15} />
            <span>THEME MODE: "default" — Standard unmodified layout & styling</span>
          </div>
        )}

        {/* Formatted JSON Code Container */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <pre style={{
            background: "#0d1017",
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            padding: 16,
            maxHeight: 340,
            overflowY: "auto",
            fontFamily: "monospace",
            fontSize: 11,
            lineHeight: 1.5,
            color: GREEN_ACCENT,
            margin: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word"
          }}>
            {JSON.stringify(generatePageJSON(sections, pageSettings), null, 2)}
          </pre>
        </div>

        {/* Modal Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => {
              const jsonStr = JSON.stringify(generatePageJSON(sections, pageSettings), null, 2);
              navigator.clipboard.writeText(jsonStr);
              onShowToast("JSON schema copied to clipboard!");
            }}
            style={{
              background: "transparent",
              border: `1px solid ${BORDER}`,
              color: TEXT_PRIMARY,
              padding: "10px 16px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 800,
              fontFamily: "monospace",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <Copy size={13} /> COPY JSON
          </button>

          <button
            onClick={() => {
              const jsonStr = JSON.stringify(generatePageJSON(sections), null, 2);
              const blob = new Blob([jsonStr], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${gameTitle.toLowerCase().replace(/\s+/g, '-')}-pageTheme.json`;
              a.click();
              URL.revokeObjectURL(url);
              onShowToast("Downloaded pageTheme.json file!");
            }}
            style={{
              background: "transparent",
              border: `1px solid ${GREEN_ACCENT}`,
              color: GREEN_ACCENT,
              padding: "10px 16px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 800,
              fontFamily: "monospace",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <Download size={13} /> DOWNLOAD .JSON
          </button>

          <button
            onClick={() => {
              onClose();
              onShowToast(`Page Published to Database (${isCustom ? 'theme: custom' : 'theme: default'})!`);
            }}
            style={{
              background: HATHOR_ORANGE,
              border: "none",
              color: "#ffffff",
              padding: "10px 20px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 900,
              fontFamily: "monospace",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <Upload size={13} /> PUBLISH TO CATALOG
          </button>
        </div>

      </div>
    </div>
  );
}
