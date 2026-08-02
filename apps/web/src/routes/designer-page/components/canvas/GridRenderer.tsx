import { Section, Device, PageSettings, BORDER, TEXT_MUTED } from "../../types/designerTypes";
import {
  GameDetailsHeader,
  GameOwnershipBanner,
  GameAbout,
  GameSystemReqs,
  GameReviews,
  GameSidebarCta,
  GameSidebarInfo,
  GameSidebarRatings,
  GameSidebarCommunity,
  MoreLikeThis,
  GameCarousel,
  GameFeatures,
  GameTwoCol,
  GameCtaBlock,
  HeadingRenderer,
  TextRenderer,
  ImageRenderer,
  ButtonRenderer,
  DividerRenderer,
  SpacerRenderer,
} from "../../../game-details/components";
import styles from "../../DesignerPage.module.css";

export function GridRenderer({ s, device, selectedColIdx, selectedElementId, onSelectChild, pageSettings }: {
  s: Section; device: Device; selectedColIdx?: number | null; selectedElementId?: string | null; onSelectChild?: (colIdx: number, elementId: string) => void; pageSettings?: PageSettings;
}) {
  const ratioMap: Record<string, string> = {
    "1": "1fr",
    "1:1": "1fr 1fr",
    "1:2": "1fr 2fr",
    "2:1": "1fr 340px",
    "1:1:1": "1fr 1fr 1fr",
    "1:2:1": "1fr 2fr 1fr",
    "2:1:1": "2fr 1fr 1fr",
    "1:1:2": "1fr 1fr 2fr",
    "1:1:1:1": "1fr 1fr 1fr 1fr",
  };

  const cols = s.gridCols || [];

  let template = ratioMap[s.gridTemplate || "2:1"] || `repeat(${cols.length || 1}, 1fr)`;
  if (device === "mobile") {
    template = "1fr";
  } else if (device === "tablet") {
    if (s.gridTemplate === "2:1" || s.gridTemplate === "1:2") template = "1fr 1fr";
    else if (s.gridTemplate === "1:1:1:1") template = "1fr 1fr";
  }

  const responsiveGap = device === "mobile" ? Math.min(s.gridGap || 40, 20) : (s.gridGap || 40);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: template,
      gap: responsiveGap,
      alignItems: "stretch",
      width: "100%",
      boxSizing: "border-box",
      transition: "all 0.25s ease"
    }}>
      {cols.map((col, cIdx) => {
        const isColSelected = selectedColIdx === cIdx;
        return (
          <div key={col.id}
            className={`${styles.gridColWrapper} ${isColSelected ? styles.gridColSelected : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectChild) onSelectChild(cIdx, "");
            }}
            style={{
              background: col.bg || "transparent",
              paddingTop: col.pt || 0, paddingBottom: col.pb || 0,
              paddingLeft: col.pl ?? col.ph ?? 0, paddingRight: col.pr ?? col.ph ?? 0,
              borderRadius: col.radius || 0,
              borderTop: col.borderTopColor ? `2px solid ${col.borderTopColor}` : "none",
              display: "flex", flexDirection: "column", gap: 16,
              height: "100%", minHeight: 80, minWidth: 0, boxSizing: "border-box"
            }}>
            {col.elements.length === 0 ? (
              <div style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                padding: "20px 12px", border: `1px dashed ${BORDER}`, borderRadius: 4,
                color: TEXT_MUTED, fontSize: 11, fontFamily: "monospace", width: "100%", boxSizing: "border-box"
              }}>
                Empty Column
              </div>
            ) : (
              col.elements.map(el => {
                const isElSelected = isColSelected && selectedElementId === el.id;
                return (
                  <div key={el.id}
                    className={`${styles.childElementWrapper} ${isElSelected ? styles.childElementSelected : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectChild) onSelectChild(cIdx, el.id);
                    }}
                    style={{ width: "100%", minWidth: 0, boxSizing: "border-box" }}>
                    {isElSelected && <span className={styles.childElementTag}>{el.type}</span>}

                    {(el.type === "game-hero" || el.type === "media-carousel" || el.type === "carousel") && <GameCarousel s={el as any} device={device} pageSettings={pageSettings} />}
                    {el.type === "game-header" && <GameDetailsHeader s={el} device={device} pageSettings={pageSettings} />}
                    {el.type === "ownership-banner" && <GameOwnershipBanner s={el} device={device} />}
                    {el.type === "about-game" && <GameAbout s={el} device={device} pageSettings={pageSettings} />}
                    {el.type === "system-reqs" && <GameSystemReqs s={el} device={device} pageSettings={pageSettings} />}
                    {el.type === "user-reviews" && <GameReviews s={el} device={device} pageSettings={pageSettings} />}
                    {el.type === "sidebar-cta" && <GameSidebarCta s={el} device={device} pageSettings={pageSettings} />}
                    {el.type === "sidebar-info" && <GameSidebarInfo s={el} device={device} pageSettings={pageSettings} />}
                    {el.type === "sidebar-ratings" && <GameSidebarRatings s={el} device={device} pageSettings={pageSettings} />}
                    {el.type === "sidebar-community" && <GameSidebarCommunity s={el} device={device} pageSettings={pageSettings} />}
                    {el.type === "recommendations" && <MoreLikeThis s={el} device={device} pageSettings={pageSettings} />}
                    {el.type === "features" && <GameFeatures s={el as any} device={device} pageSettings={pageSettings} />}
                    {el.type === "two-col" && <GameTwoCol s={el as any} device={device} pageSettings={pageSettings} />}
                    {el.type === "cta" && <GameCtaBlock s={el as any} device={device} pageSettings={pageSettings} />}

                    {el.type === "heading" && <HeadingRenderer s={el} device={device} pageSettings={pageSettings} />}
                    {el.type === "text" && <TextRenderer s={el} device={device} pageSettings={pageSettings} />}
                    {el.type === "image" && <ImageRenderer s={el} />}
                    {el.type === "button" && <ButtonRenderer s={el} />}
                    {el.type === "divider" && <DividerRenderer s={el} />}
                    {el.type === "spacer" && <SpacerRenderer s={el} />}
                  </div>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
}
