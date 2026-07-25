import { GatewayApiError } from '../services/api/ApiClient';

export type FormFieldErrors = Record<string, string>;

export interface ProcessedApiError {
  code: string;
  userMessage: string;
  correlationId?: string;
  fieldErrors: FormFieldErrors;
}

/**
 * Parses Gateway API errors ({ error: { code, message, correlationId, details } })
 * and maps standard codes (UNAUTHENTICATED, VALIDATION_FAILED, etc.) to user-facing form validation and toast alerts.
 */
export function parseApiError(error: unknown): ProcessedApiError {
  if (error instanceof GatewayApiError) {
    const fieldErrors: FormFieldErrors = {};

    if (error.details) {
      for (const [key, val] of Object.entries(error.details)) {
        fieldErrors[key] = Array.isArray(val) ? val.join(', ') : val;
      }
    }

    let userMessage = error.message;

    switch (error.code) {
      case 'UNAUTHENTICATED':
        userMessage = 'Your session has expired. Please sign in again.';
        break;
      case 'INVALID_CREDENTIALS':
        userMessage = 'Invalid email address or password. Please check your credentials.';
        break;
      case 'VALIDATION_FAILED':
        userMessage = error.message || 'Please correct the highlighted form errors.';
        break;
      case 'FORBIDDEN':
        userMessage = 'Access denied. You do not have permission to perform this action.';
        break;
      case 'CONFLICT':
      case 'USER_EXISTS':
        userMessage = error.message || 'An account with this email address already exists.';
        break;
      case 'RATE_LIMITED':
        userMessage = 'Too many requests. Please wait a moment before trying again.';
        break;
      case 'NETWORK_ERROR':
        userMessage = 'Network connection failed. Please check your internet connection.';
        break;
      case 'INTERNAL_ERROR':
        userMessage = 'A server error occurred. Please try again later.';
        break;
      default:
        if (!userMessage) {
          userMessage = 'An unexpected error occurred. Please try again.';
        }
        break;
    }

    return {
      code: error.code,
      userMessage,
      correlationId: error.correlationId,
      fieldErrors,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'GENERIC_ERROR',
      userMessage: error.message || 'An unexpected error occurred.',
      fieldErrors: {},
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    userMessage: 'An unknown error occurred.',
    fieldErrors: {},
  };
}
