import React, { useState } from 'react';
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { parseApiError, type FormFieldErrors } from '../utils/errorHandling';
import { LockIcon, EyeIcon, EyeOffIcon, ArrowRightIcon, EyeOfHorusIcon } from '../assets';
import styles from '../styles/AuthCard.module.css';

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === 'string' ? search.token : '',
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = useSearch({ from: '/reset-password' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});

  const { confirmPasswordReset } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (!token) {
      showToast('error', 'Invalid or missing password reset token in URL.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFieldErrors({ password: 'Passwords do not match' });
      showToast('error', 'Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmPasswordReset(token, newPassword);
      showToast('success', 'Password reset successfully! Please sign in with your new password.');
      navigate({ to: '/login' });
    } catch (error: unknown) {
      const parsed = parseApiError(error);
      setFieldErrors(parsed.fieldErrors);
      const alertMessage = parsed.correlationId
        ? `${parsed.userMessage} (Ref: ${parsed.correlationId})`
        : parsed.userMessage;
      showToast('error', alertMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div className={styles.authContainer} style={{ maxWidth: '480px', width: '100%' }}>
        <div className={styles.authCard} style={{ gridTemplateColumns: '1fr' }}>
          <div className={styles.formSection} style={{ padding: '32px' }}>
            <div className={styles.formHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <EyeOfHorusIcon width={36} height={28} />
                <h2 className={styles.formTitle} style={{ margin: 0 }}>
                  SET NEW <span className={styles.highlightText}>PASSWORD</span>
                </h2>
              </div>
              <p className={styles.formSubtitle}>
                Enter your new password below. Passwords must be between 12 and 128 characters.
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.authForm}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>NEW PASSWORD</label>
                <div className={styles.inputFieldWrap}>
                  <span className={styles.inputIcon}>
                    <LockIcon />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={12}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`${styles.inputControl} ${fieldErrors.password ? styles.inputControlError : ''}`}
                  />
                  <button
                    type="button"
                    className={styles.eyeToggleBtn}
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label="Toggle Password Visibility"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <span className={styles.fieldErrorText}>{fieldErrors.password}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>CONFIRM NEW PASSWORD</label>
                <div className={styles.inputFieldWrap}>
                  <span className={styles.inputIcon}>
                    <LockIcon />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={12}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`${styles.inputControl} ${fieldErrors.password ? styles.inputControlError : ''}`}
                  />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting || !token} className={styles.submitBtn}>
                {isSubmitting ? (
                  <span className={styles.spinner}>Processing...</span>
                ) : (
                  <>
                    <ArrowRightIcon /> RESET PASSWORD
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
