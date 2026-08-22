import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import IdentityCard from './components/IdentityCard';
import ChangeEmailSection from './components/ChangeEmailSection';
import ChangePasswordSection from './components/ChangePasswordSection';
import styles from './styles/ProfilePage.module.css';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [currentEmail, setCurrentEmail] = useState(user?.email || 'user@example.com');

  useEffect(() => {
    if (user?.email) {
      setCurrentEmail(user.email);
    }
  }, [user?.email]);

  const username = user?.displayName || 'User';

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Page Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Account Settings</h1>
          <p className={styles.subtitle}>
            Manage your credentials and preferences for your Hathor account.
          </p>
        </header>

        {/* Identity Summary Card */}
        <IdentityCard
          username={username}
          email={currentEmail}
          roles={user?.roles}
        />

        {/* Action Sections */}
        <div className={styles.sectionsStack}>
          <ChangeEmailSection
            currentEmail={currentEmail}
            onEmailUpdated={(newEmail) => setCurrentEmail(newEmail)}
          />

          <ChangePasswordSection />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
