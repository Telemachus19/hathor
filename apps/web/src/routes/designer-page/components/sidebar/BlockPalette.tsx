import { Plus } from "lucide-react";
import { SectionType, ElementType, TEXT_MUTED } from "../../types/designerTypes";
import { PALETTE } from "./paletteConfig";
import { PaletteGridCard } from "./PaletteGridCard";
import styles from "../../DesignerPage.module.css";

export function BlockPalette({ onAdd, onAddGridWithCols }: { onAdd: (type: SectionType | ElementType) => void; onAddGridWithCols: (template: string) => void }) {
  return (
    <div className={styles.leftSidebar}>
      <div className={styles.paletteHeader}>
        Add Block
      </div>
      <div>
        {PALETTE.map(group => (
          <div key={group.group}>
            <p className={styles.groupTitle}>{group.group}</p>
            <div className={styles.groupGrid}>
              {group.items.map(item => item.type === "grid" ? (
                <PaletteGridCard key={item.type} item={item} onAdd={onAdd} onAddGridWithCols={onAddGridWithCols} />
              ) : (
                <button key={item.type} onClick={() => onAdd(item.type)} className={styles.paletteCard}>
                  <div className={styles.paletteIconWrap}>
                    <item.Icon size={14} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p className={styles.paletteCardLabel}>{item.label}</p>
                    <p className={styles.paletteCardDesc}>{item.desc}</p>
                  </div>
                  <Plus size={12} style={{ color: TEXT_MUTED, opacity: 0.5, flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
