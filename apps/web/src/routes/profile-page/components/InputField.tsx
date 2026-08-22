import React from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { FieldError } from '../types';
import styles from '../styles/ProfilePage.module.css';

interface InputFieldProps {
  id?: string;
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  error?: FieldError;
  placeholder?: string;
  autoComplete?: string;
  reveal?: boolean;
  onToggleReveal?: () => void;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  reveal,
  onToggleReveal,
}) => {
  const isPassword = type === 'password' || (type === 'text' && onToggleReveal);
  const inputType = isPassword ? (reveal ? 'text' : 'password') : type;

  return (
    <div className={styles.fieldGroup}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}
      </label>
      <div className={styles.inputWrapper}>
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          spellCheck={false}
          className={`${styles.inputField} ${onToggleReveal ? styles.inputFieldWithReveal : ''} ${error ? styles.inputError : ''}`}
        />
        {onToggleReveal && (
          <button
            type="button"
            onClick={onToggleReveal}
            className={styles.revealToggle}
            tabIndex={-1}
            aria-label={reveal ? 'Hide password' : 'Show password'}
          >
            {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <div className={styles.errorMessage} role="alert">
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default InputField;
