import React from "react";
import styles from "../../DesignerPage.module.css";

export function PropSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.propSection}>
      <p className={styles.propSectionTitle}>{title}</p>
      <div className={styles.propSectionContent}>{children}</div>
    </div>
  );
}

export function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.propRow}>
      <p className={styles.propLabel}>{label}</p>
      {children}
    </div>
  );
}
