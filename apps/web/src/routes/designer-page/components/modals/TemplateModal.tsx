import { LayoutGrid, Layers } from 'lucide-react';
import { HATHOR_ORANGE, GREEN_ACCENT } from '../../types/designerTypes';
import styles from '../../DesignerPage.module.css';

export function TemplateModal({
  onSelectDefault,
  onSelectBlank,
}: {
  onSelectDefault: () => void;
  onSelectBlank: () => void;
}) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <h2 className={styles.modalTitle}>Choose Your Starting Canvas</h2>
        <p className={styles.modalSub}>
          Select how you would like to start building your store page
        </p>

        <div className={styles.modalOptionsGrid}>
          <div className={styles.modalOptionCard} onClick={onSelectDefault}>
            <div
              className={styles.modalIconWrap}
              style={{ background: 'rgba(242, 107, 33, 0.18)', color: HATHOR_ORANGE }}
            >
              <LayoutGrid size={28} />
            </div>
            <h3>Default Game Layout</h3>
            <p>
              Start with the pre-built Elden Throne store page layout featuring media showcase
              carousel, two-column content, system specs, reviews, and recommendations.
            </p>
            <button className={styles.modalBtnPrimary}>Load Default Layout</button>
          </div>

          <div className={styles.modalOptionCard} onClick={onSelectBlank}>
            <div
              className={styles.modalIconWrap}
              style={{ background: 'rgba(56, 211, 159, 0.15)', color: GREEN_ACCENT }}
            >
              <Layers size={28} />
            </div>
            <h3>Blank Slate</h3>
            <p>
              Start with an empty canvas and build your page block-by-block using custom grids,
              heroes, text, media, and game components.
            </p>
            <button className={styles.modalBtnSecondary}>Start From Scratch</button>
          </div>
        </div>
      </div>
    </div>
  );
}
