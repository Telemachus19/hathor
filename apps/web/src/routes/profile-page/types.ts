export type FieldError = string | null;

export interface PasswordStrength {
  label: 'Weak' | 'Fair' | 'Strong';
  color: string;
  width: string;
  score: number;
}
