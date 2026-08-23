import React, { useState, useMemo } from 'react';
import { Lock, ChevronRight } from 'lucide-react';
import Section from './Section';
import InputField from './InputField';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { FieldError, PasswordStrength } from '../types';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import styles from '../styles/ProfilePage.module.css';

interface ChangePasswordSectionProps {
  onPasswordUpdated?: () => void;
}

function validatePassword(value: string): FieldError {
  if (!value) return 'Password is required.';
  if (value.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(value)) return 'Include at least one uppercase letter.';
  if (!/[0-9]/.test(value)) return 'Include at least one number.';
  return null;
}

export const ChangePasswordSection: React.FC<ChangePasswordSectionProps> = ({
  onPasswordUpdated,
}) => {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const [currentPwError, setCurrentPwError] = useState<FieldError>(null);
  const [newPwError, setNewPwError] = useState<FieldError>(null);
  const [confirmPwError, setConfirmPwError] = useState<FieldError>(null);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { changePassword } = useAuth();
  const { showToast } = useToast();

  const passwordStrength = useMemo<PasswordStrength | null>(() => {
    if (!newPw) return null;
    let score = 0;
    if (newPw.length >= 8) score++;
    if (newPw.length >= 12) score++;
    if (/[A-Z]/.test(newPw)) score++;
    if (/[0-9]/.test(newPw)) score++;
    if (/[^A-Za-z0-9]/.test(newPw)) score++;

    if (score <= 2) return { label: 'Weak', color: '#e55151', width: '33%', score };
    if (score <= 3) return { label: 'Fair', color: '#f0a500', width: '66%', score };
    return { label: 'Strong', color: '#38d39f', width: '100%', score };
  }, [newPw]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!currentPw) {
      setCurrentPwError('Current password is required.');
      hasError = true;
    } else {
      setCurrentPwError(null);
    }

    const newError = validatePassword(newPw);
    setNewPwError(newError);
    if (newError) hasError = true;

    if (!confirmPw) {
      setConfirmPwError('Please confirm your new password.');
      hasError = true;
    } else if (confirmPw !== newPw) {
      setConfirmPwError('Passwords do not match.');
      hasError = true;
    } else {
      setConfirmPwError(null);
    }

    if (newPw && currentPw && newPw === currentPw) {
      setNewPwError('New password must differ from current password.');
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);
    try {
      await changePassword(currentPw, newPw);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      showToast('success', 'Password changed successfully.');
      onPasswordUpdated?.();
    } catch (err: any) {
      const msg =
        err?.message ||
        err?.error?.message ||
        'Failed to change password. Please verify your current password.';
      if (msg.toLowerCase().includes('current password')) {
        setCurrentPwError(msg);
      } else {
        setNewPwError(msg);
      }
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section title="Change Password" icon={<Lock size={16} />}>
      <form onSubmit={handlePasswordSubmit} noValidate className={styles.form}>
        <InputField
          id="profile-current-password"
          label="Current Password"
          type="password"
          value={currentPw}
          onChange={(val) => {
            setCurrentPw(val);
            if (currentPwError) setCurrentPwError(null);
          }}
          error={currentPwError}
          placeholder="Enter your current password"
          autoComplete="current-password"
          reveal={showCurrent}
          onToggleReveal={() => setShowCurrent((prev) => !prev)}
        />

        <InputField
          id="profile-new-password"
          label="New Password"
          type="password"
          value={newPw}
          onChange={(val) => {
            setNewPw(val);
            if (newPwError) setNewPwError(null);
          }}
          error={newPwError}
          placeholder="Min. 8 characters, one uppercase, one number"
          autoComplete="new-password"
          reveal={showNew}
          onToggleReveal={() => setShowNew((prev) => !prev)}
        />

        <PasswordStrengthMeter strength={passwordStrength} />

        <InputField
          id="profile-confirm-password"
          label="Confirm New Password"
          type="password"
          value={confirmPw}
          onChange={(val) => {
            setConfirmPw(val);
            if (confirmPwError) setConfirmPwError(null);
          }}
          error={confirmPwError}
          placeholder="Re-enter new password"
          autoComplete="new-password"
          reveal={showConfirm}
          onToggleReveal={() => setShowConfirm((prev) => !prev)}
        />

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Change Password'}
            <ChevronRight size={14} />
          </button>
        </div>
      </form>
    </Section>
  );
};

export default ChangePasswordSection;
