import { Film, Image as ImageIcon, X } from "lucide-react";
import { SelField, TxtInput } from "./BasicControls";
import { isMediaVideo, getMediaUrl, getMediaPoster } from "../../utils/mediaUtils";
import { BORDER, HATHOR_ORANGE, TEXT_MUTED } from "../../types/designerTypes";
import styles from "../../DesignerPage.module.css";

export function MediaManagerList({ items = [], onChange, label = "Media Items" }: { items: any[]; onChange: (items: any[]) => void; label?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
      <p className={styles.propLabel}>{label} ({items.length})</p>
      {items.map((item: any, i: number) => {
        const isObj = typeof item === "object";
        const type = isObj ? (item.type || (isMediaVideo(item) ? "video" : "image")) : (isMediaVideo(item) ? "video" : "image");
        const url = getMediaUrl(item);
        const poster = getMediaPoster(item);

        return (
          <div key={i} style={{ border: `1px solid ${BORDER}`, padding: 8, background: "rgba(20, 24, 32, 0.6)", borderRadius: 4, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: HATHOR_ORANGE, display: "flex", alignItems: "center", gap: 4 }}>
                {type === "video" ? <Film size={11} /> : <ImageIcon size={11} />}
                Item #{i + 1} ({type.toUpperCase()})
              </span>
              <button onClick={() => onChange(items.filter((_, j) => j !== i))}
                style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${BORDER}`, background: "transparent", color: TEXT_MUTED, cursor: "pointer", borderRadius: 2 }}>
                <X size={10} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <SelField
                value={type}
                onChange={t => {
                  const copy = [...items];
                  copy[i] = { type: t, url, poster };
                  onChange(copy);
                }}
                options={[{ label: "Image", value: "image" }, { label: "Video (MP4 / YT)", value: "video" }]}
              />
              <TxtInput
                value={url}
                onChange={u => {
                  const copy = [...items];
                  copy[i] = { type, url: u, poster };
                  onChange(copy);
                }}
                placeholder={type === "video" ? "https://...mp4 or YouTube" : "https://...jpg"}
              />
            </div>

            {type === "video" && (
              <TxtInput
                value={poster}
                onChange={p => {
                  const copy = [...items];
                  copy[i] = { type: "video", url, poster: p };
                  onChange(copy);
                }}
                placeholder="Optional Thumbnail Poster Image URL"
              />
            )}
          </div>
        );
      })}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        <button
          onClick={() => onChange([...items, { type: "image", url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop" }])}
          style={{ padding: 6, border: `1px dashed ${BORDER}`, background: "transparent", color: TEXT_MUTED, fontSize: 10, cursor: "pointer", borderRadius: 3 }}
        >
          + Add Image
        </button>
        <button
          onClick={() => onChange([...items, { type: "video", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop" }])}
          style={{ padding: 6, border: `1px dashed ${HATHOR_ORANGE}`, background: "rgba(242, 107, 33, 0.08)", color: HATHOR_ORANGE, fontSize: 10, fontWeight: 700, cursor: "pointer", borderRadius: 3 }}
        >
          + Add Video
        </button>
      </div>
    </div>
  );
}
