export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiErrorDetail {
  field?: string;
  code: string;
  message: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
    correlationId?: string;
  };
}

export interface HealthStatus {
  service: string;
  status: 'live' | 'ready' | 'not_ready';
  timestamp: string;
  checks?: Record<string, 'up' | 'down'>;
}
