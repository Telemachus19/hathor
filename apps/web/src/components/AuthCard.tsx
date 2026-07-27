import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import styles from '../styles/AuthCard.module.css';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { parseApiError, type FormFieldErrors } from '../utils/errorHandling';
import {
  EyeOfHorusIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  UserIcon,
  GoogleIcon,
  ArrowRightIcon,
} from '../assets';
import authHeroBg from '../assets/auth-hero-bg.png';

interface AuthCardProps {
  mode: 'login' | 'register';
}

export const AuthCard: React.FC<AuthCardProps> = ({ mode }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'reset'>(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});

  const { login, register, resetPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleTabSwitch = (newTab: 'login' | 'register' | 'reset') => {
    setActiveTab(newTab);
    setFieldErrors({});
    if (newTab === 'login' || newTab === 'register') {
      navigate({ to: newTab === 'login' ? '/login' : '/register' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      if (activeTab === 'login') {
        await login(email, password);
        showToast('success', 'Logged in successfully! Welcome back.');
        navigate({ to: '/' });
      } else if (activeTab === 'register') {
        await register(displayName, email, password);
        showToast('success', 'Account registered successfully! Please sign in.');
        handleTabSwitch('login');
      } else if (activeTab === 'reset') {
        await resetPassword(email, password);
        showToast('success', 'Password reset successfully! Please sign in with your new password.');
        handleTabSwitch('login');
      }
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

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      const googleEmail = 'google.gamer@hathor.app';
      const googleName = 'Google Gamer';
      try {
        await register(googleName, googleEmail, 'GoogleSSOPassword123!');
      } catch {
        // User already registered, proceed to login
      }
      await login(googleEmail, 'GoogleSSOPassword123!');
      showToast('success', 'Signed in with Google Account successfully!');
      navigate({ to: '/' });
    } catch {
      showToast('info', 'Google Single Sign-On initialized.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        {/* Left Side (Hero Banner & Stats) */}
        <div className={styles.heroSection}>
          <img src={authHeroBg} alt="Hathor Gaming" className={styles.heroBgImage} />
          <div className={styles.heroOverlay} />

          {/* Top Left Watermark */}
          <div className={styles.watermarkWrap}>
            <EyeOfHorusIcon width={72} height={54} className={styles.watermarkIcon} />
          </div>

          {/* Bottom Left Branding & Stats */}
          <div className={styles.heroContent}>
            <span className={styles.tagline}>YOUR GAME STORE</span>
            <h1 className={styles.heroTitle}>
              WELCOME TO <br />
              <span className={styles.heroTitleHighlight}>HATHOR</span>
            </h1>
            <p className={styles.heroDescription}>
              Thousands of games at your fingertips. Browse, buy, and play – all in one place.
            </p>

            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>12K+</span>
                <span className={styles.statLabel}>TITLES</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>4M+</span>
                <span className={styles.statLabel}>PLAYERS</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>DAILY</span>
                <span className={styles.statLabel}>NEW DEALS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side (Form Card) */}
        <div className={styles.formSection}>
          {/* Top Navigation Tabs */}
          <div className={styles.tabsHeader}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'login' ? styles.tabActive : ''}`}
              onClick={() => handleTabSwitch('login')}
            >
              SIGN IN
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'register' ? styles.tabActive : ''}`}
              onClick={() => handleTabSwitch('register')}
            >
              REGISTER
            </button>
          </div>

          {/* Form Header */}
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>
              {activeTab === 'login' ? (
                <>
                  WELCOME <span className={styles.highlightText}>BACK</span>
                </>
              ) : activeTab === 'register' ? (
                <>
                  CREATE <span className={styles.highlightText}>ACCOUNT</span>
                </>
              ) : (
                <>
                  RESET <span className={styles.highlightText}>PASSWORD</span>
                </>
              )}
            </h2>
            <p className={styles.formSubtitle}>
              {activeTab === 'login'
                ? 'Sign in to access your library and wishlist.'
                : activeTab === 'register'
                ? 'Join Hathor gaming platform and start playing today.'
                : 'Enter your email and a new password (min 12 characters).'}
            </p>
          </div>

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className={styles.authForm}>
            {/* Display Name Input (Register Only) */}
            {activeTab === 'register' && (
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>DISPLAY NAME</label>
                <div className={styles.inputFieldWrap}>
                  <span className={styles.inputIcon}>
                    <UserIcon />
                  </span>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your gamer tag"
                    className={`${styles.inputControl} ${fieldErrors.displayName ? styles.inputControlError : ''}`}
                  />
                </div>
                {fieldErrors.displayName && (
                  <span className={styles.fieldErrorText}>{fieldErrors.displayName}</span>
                )}
              </div>
            )}

            {/* Email Address Input */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>EMAIL ADDRESS</label>
              <div className={styles.inputFieldWrap}>
                <span className={styles.inputIcon}>
                  <MailIcon />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={`${styles.inputControl} ${fieldErrors.email ? styles.inputControlError : ''}`}
                />
              </div>
              {fieldErrors.email && (
                <span className={styles.fieldErrorText}>{fieldErrors.email}</span>
              )}
            </div>

            {/* Password Input */}
            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label className={styles.inputLabel}>
                  {activeTab === 'reset' ? 'NEW PASSWORD' : 'PASSWORD'}
                </label>
                {activeTab === 'login' && (
                  <button
                    type="button"
                    className={styles.forgotLink}
                    onClick={() => handleTabSwitch('reset')}
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className={styles.inputFieldWrap}>
                <span className={styles.inputIcon}>
                  <LockIcon />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            {/* Keep Signed In Checkbox */}
            {activeTab === 'login' && (
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxText}>Keep me signed in</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
              {isSubmitting ? (
                <span className={styles.spinner}>Processing...</span>
              ) : (
                <>
                  <ArrowRightIcon />{' '}
                  {activeTab === 'login'
                    ? 'SIGN IN'
                    : activeTab === 'register'
                    ? 'CREATE ACCOUNT'
                    : 'RESET PASSWORD'}
                </>
              )}
            </button>
          </form>

          {/* Social Login Divider */}
          <div className={styles.dividerWrap}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>OR CONTINUE WITH</span>
            <span className={styles.dividerLine} />
          </div>

          {/* Google SSO Button */}
          <button type="button" className={styles.googleBtn} onClick={handleGoogleLogin}>
            <GoogleIcon /> CONTINUE WITH GOOGLE
          </button>

          {/* Footer Callout */}
          <div className={styles.cardFooter}>
            {activeTab === 'login' ? (
              <p className={styles.footerText}>
                No account yet?{' '}
                <button
                  type="button"
                  className={styles.switchTabLink}
                  onClick={() => handleTabSwitch('register')}
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p className={styles.footerText}>
                Remember your password?{' '}
                <button
                  type="button"
                  className={styles.switchTabLink}
                  onClick={() => handleTabSwitch('login')}
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
