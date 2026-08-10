import styles from '../styles/CartPage.module.css';

export function HieroDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`${styles.hieroDivider} ${className}`}>
      <div className={styles.dividerLine} />
      <span className={styles.hieroSymbol}>𓂀</span>
      <div className={styles.dividerLine} />
    </div>
  );
}
