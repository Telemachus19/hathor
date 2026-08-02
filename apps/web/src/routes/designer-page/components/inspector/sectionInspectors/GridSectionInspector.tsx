import { Section, HATHOR_ORANGE, BORDER, TEXT_MUTED, createGridElement, uid } from "../../../types/designerTypes";
import { PropSection, PropRow, SelField, ColorField, NumField } from "../../controls";
import styles from "../../../DesignerPage.module.css";

export function GridSectionInspector({
  targetObj,
  gridColIdx,
  setGridColIdx,
  selectedElementId,
  setSelectedElementId,
  updateTarget
}: {
  targetObj: Section;
  gridColIdx: number;
  setGridColIdx: (idx: number) => void;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  updateTarget: (updates: Partial<Section>, skipHistory?: boolean) => void;
}) {
  const activeCols = targetObj.gridCols || [];
  const currentCol = activeCols[gridColIdx] || activeCols[0];

  const updateCurrentCol = (updates: Partial<any>) => {
    if (!currentCol) return;
    const newCols = activeCols.map((c, idx) => idx === gridColIdx ? { ...c, ...updates } : c);
    updateTarget({ gridCols: newCols });
  };

  return (
    <>
      <PropSection title="Multi-Column Layout & Grid Ratios">
        <PropRow label="Column Template & Ratio">
          <SelField
            value={targetObj.gridTemplate || "2:1"}
            onChange={v => {
              const colCountMap: Record<string, number> = {
                "1": 1,
                "1:1": 2, "1:2": 2, "2:1": 2,
                "1:1:1": 3, "1:2:1": 3, "2:1:1": 3, "1:1:2": 3,
                "1:1:1:1": 4
              };
              const reqCols = colCountMap[v] || 2;
              let newCols = [...(targetObj.gridCols || [])];
              if (newCols.length < reqCols) {
                while (newCols.length < reqCols) {
                  newCols.push({ id: uid(), bg: "transparent", pt: 0, pb: 0, ph: 0, radius: 0, elements: [] });
                }
              } else if (newCols.length > reqCols) {
                newCols = newCols.slice(0, reqCols);
              }
              updateTarget({ gridTemplate: v, gridCols: newCols });
            }}
            options={[
              { label: "1 Column (Full Width 100%)", value: "1" },
              { label: "2 Columns Equal (1:1 / 50% - 50%)", value: "1:1" },
              { label: "2 Columns Wide Left (2:1 / 67% - 33%)", value: "2:1" },
              { label: "2 Columns Wide Right (1:2 / 33% - 67%)", value: "1:2" },
              { label: "3 Columns Equal (1:1:1 / 33% each)", value: "1:1:1" },
              { label: "3 Columns Wide Center (1:2:1 / 25%-50%-25%)", value: "1:2:1" },
              { label: "3 Columns Wide Left (2:1:1 / 50%-25%-25%)", value: "2:1:1" },
              { label: "3 Columns Wide Right (1:1:2 / 25%-25%-50%)", value: "1:1:2" },
              { label: "4 Columns Equal (1:1:1:1 / 25% each)", value: "1:1:1:1" },
            ]}
          />
        </PropRow>

        <PropRow label="Column Gap Spacing">
          <NumField value={targetObj.gridGap ?? 32} onChange={v => updateTarget({ gridGap: v })} unit="px" max={100} />
        </PropRow>
      </PropSection>

      {/* Column Selector Tab Buttons */}
      <PropSection title={`Custom Grid Column Editor (${activeCols.length} Columns)`}>
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {activeCols.map((col, idx) => (
            <button
              key={col.id || idx}
              onClick={() => {
                setGridColIdx(idx);
                setSelectedElementId(null);
              }}
              style={{
                flex: 1,
                padding: "6px 0",
                fontSize: 10,
                fontFamily: "monospace",
                fontWeight: 800,
                borderRadius: 4,
                border: gridColIdx === idx ? `1px solid ${HATHOR_ORANGE}` : `1px solid ${BORDER}`,
                background: gridColIdx === idx ? "rgba(242, 107, 33, 0.18)" : "#141820",
                color: gridColIdx === idx ? HATHOR_ORANGE : TEXT_MUTED,
                cursor: "pointer"
              }}
            >
              Col #{idx + 1} ({col.elements.length})
            </button>
          ))}
        </div>

        {currentCol && (
          <>
            <PropRow label="Column Background">
              <ColorField value={currentCol.bg || "transparent"} onChange={v => updateCurrentCol({ bg: v })} />
            </PropRow>

            <PropRow label="Top Accent Border Line Color">
              <ColorField value={currentCol.borderTopColor || "transparent"} onChange={v => updateCurrentCol({ borderTopColor: v })} />
            </PropRow>

            {/* Quick Add Element to Active Column */}
            <div style={{ marginTop: 12, borderTop: `1px solid ${BORDER}`, paddingTop: 10 }}>
              <p className={styles.propLabel} style={{ fontWeight: 700, color: HATHOR_ORANGE, marginBottom: 6 }}>Add Component to Col #{gridColIdx + 1}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                {[
                  { label: "+ Header", type: "game-header" },
                  { label: "+ Ownership", type: "ownership-banner" },
                  { label: "+ About", type: "about-game" },
                  { label: "+ Reqs", type: "system-reqs" },
                  { label: "+ Reviews", type: "user-reviews" },
                  { label: "+ Sidebar CTA", type: "sidebar-cta" },
                  { label: "+ Sidebar Info", type: "sidebar-info" },
                  { label: "+ Ratings", type: "sidebar-ratings" },
                  { label: "+ Community", type: "sidebar-community" },
                  { label: "+ Text", type: "text" },
                  { label: "+ Heading", type: "heading" },
                  { label: "+ Button", type: "button" },
                  { label: "+ Image", type: "image" },
                  { label: "+ Features", type: "features" },
                ].map(b => (
                  <button
                    key={b.type}
                    onClick={() => {
                      const newEl = createGridElement(b.type as any);
                      updateCurrentCol({ elements: [...currentCol.elements, newEl] });
                      setSelectedElementId(newEl.id);
                    }}
                    style={{
                      padding: "5px 6px",
                      background: "#181c24",
                      border: `1px solid ${BORDER}`,
                      color: TEXT_MUTED,
                      fontSize: 10,
                      cursor: "pointer",
                      borderRadius: 3,
                      textAlign: "left"
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List & Rearrange Elements inside Active Column */}
            <div style={{ marginTop: 12, borderTop: `1px solid ${BORDER}`, paddingTop: 10 }}>
              <p className={styles.propLabel} style={{ fontWeight: 700, marginBottom: 6 }}>Column #{gridColIdx + 1} Elements ({currentCol.elements.length})</p>
              {currentCol.elements.length === 0 ? (
                <p style={{ fontSize: 10, color: TEXT_MUTED, fontStyle: "italic", margin: 0 }}>No components in this column yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {currentCol.elements.map((el, elIdx) => {
                    const isElSelected = selectedElementId === el.id;
                    return (
                      <div
                        key={el.id}
                        onClick={() => setSelectedElementId(el.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 8px",
                          borderRadius: 3,
                          background: isElSelected ? "rgba(242, 107, 33, 0.15)" : "#141820",
                          border: isElSelected ? `1px solid ${HATHOR_ORANGE}` : `1px solid ${BORDER}`,
                          cursor: "pointer"
                        }}
                      >
                        <span style={{ fontSize: 10, fontWeight: 700, color: isElSelected ? HATHOR_ORANGE : TEXT_MUTED }}>
                          #{elIdx + 1} {el.type}
                        </span>
                        <div style={{ display: "flex", gap: 2 }}>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              if (elIdx <= 0) return;
                              const arr = [...currentCol.elements];
                              [arr[elIdx - 1], arr[elIdx]] = [arr[elIdx], arr[elIdx - 1]];
                              updateCurrentCol({ elements: arr });
                            }}
                            disabled={elIdx <= 0}
                            style={{ background: "transparent", border: "none", color: TEXT_MUTED, cursor: "pointer", fontSize: 10 }}
                          >
                            ▲
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              if (elIdx >= currentCol.elements.length - 1) return;
                              const arr = [...currentCol.elements];
                              [arr[elIdx], arr[elIdx + 1]] = [arr[elIdx + 1], arr[elIdx]];
                              updateCurrentCol({ elements: arr });
                            }}
                            disabled={elIdx >= currentCol.elements.length - 1}
                            style={{ background: "transparent", border: "none", color: TEXT_MUTED, cursor: "pointer", fontSize: 10 }}
                          >
                            ▼
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              updateCurrentCol({ elements: currentCol.elements.filter((_, j) => j !== elIdx) });
                              if (selectedElementId === el.id) setSelectedElementId(null);
                            }}
                            style={{ background: "transparent", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: 10, marginLeft: 4 }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </PropSection>
    </>
  );
}
