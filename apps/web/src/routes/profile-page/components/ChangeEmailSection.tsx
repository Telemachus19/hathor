import React, { useState } from 'react';
import { Mail, ChevronRight } from 'lucide-react';
import Section from './Section';
import InputField from './InputField';
import { FieldError } from '../types';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import styles from '../styles/ProfilePage.module.css';

interface ChangeEmailSectionProps {
  currentEmail: string;
  onEmailUpdated?: (newEmail: string) => void;
}

function validateEmail(value: string): FieldError {
  if (!value.trim()) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
  return null;
}

export const ChangeEmailSection: React.FC<ChangeEmailSectionProps> = ({
  currentEmail,
  onEmailUpdated,
}) => {
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState<FieldError>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { changeEmail } = useAuth();
  const { showToast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateEmail(newEmail);
    setEmailError(error);

    if (error) return;

    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setEmailError('This is already your current email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await changeEmail(newEmail);
      onEmailUpdated?.(newEmail);
      showToast('success', 'Email updated successfully.');
      setNewEmail('');
    } catch (err: any) {
      const msg =
        err?.message ||
        err?.error?.message ||
        'Failed to update email. Please try again.';
      setEmailError(msg);
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section title="Change Email" icon={<Mail size={16} />}>
      <form onSubmit={handleEmailSubmit} noValidate className={styles.form}>
        <div className={styles.currentBanner}>
          Current: <span className={styles.currentValue}>{currentEmail}</span>
        </div>

        <InputField
          id="profile-new-email"
          label="New Email Address"
          type="email"
          value={newEmail}
          onChange={(val) => {
            setNewEmail(val);
            if (emailError) setEmailError(null);
          }}
          error={emailError}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Email'}
            <ChevronRight size={14} />
          </button>
        </div>
      </form>
    </Section>
  );
};

export default ChangeEmailSection;

