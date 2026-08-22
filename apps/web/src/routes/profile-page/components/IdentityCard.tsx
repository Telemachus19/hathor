import React from 'react';
import { User, Shield, LayoutDashboard, ArrowUpRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import styles from '../styles/ProfilePage.module.css';

interface IdentityCardProps {
  username: string;
  email: string;
  roles?: string[];
}

export const IdentityCard: React.FC<IdentityCardProps> = ({ username, email, roles = [] }) => {
  const isAdmin = Array.isArray(roles) && roles.includes('admin');
  const isCreator = Array.isArray(roles) && roles.includes('creator');
  const primaryRole = Array.isArray(roles) && roles.length > 0 ? roles[0] : 'Gamer';

  return (
    <div className={styles.identityCard}>
      <div className={styles.identityLeft}>
        <div className={styles.avatar}>
          <User size={26} />
        </div>
        <div className={styles.identityInfo}>
          <div className={styles.identityNameRow}>
            <span className={styles.username}>{username}</span>
            <span className={styles.roleBadge}>{primaryRole}</span>
          </div>
          <span className={styles.email}>{email}</span>
        </div>
      </div>

      {isAdmin ? (
        <div className={styles.dashboardActions}>
          <Link to="/admin" className={`${styles.dashboardBtn} ${styles.adminDashboardBtn}`}>
            <span className={styles.dashboardBtnIconWrap}>
              <Shield size={15} />
            </span>
            <span className={styles.dashboardBtnText}>Admin Dashboard</span>
            <ArrowUpRight size={14} className={styles.dashboardBtnArrow} />
          </Link>
        </div>
      ) : isCreator ? (
        <div className={styles.dashboardActions}>
          <Link to="/creator" className={`${styles.dashboardBtn} ${styles.creatorDashboardBtn}`}>
            <span className={styles.dashboardBtnIconWrap}>
              <LayoutDashboard size={15} />
            </span>
            <span className={styles.dashboardBtnText}>Creator Dashboard</span>
            <ArrowUpRight size={14} className={styles.dashboardBtnArrow} />
          </Link>
        </div>
      ) : null}
    </div>
  );
};

export default IdentityCard;
