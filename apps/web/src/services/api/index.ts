import { createApiClient, type ApiClient } from '@hathor/contracts';

let rawUrl = (import.meta.env.VITE_API_URL as string)?.trim();
if (!rawUrl) {
  rawUrl = 'http://localhost:5000/api/v1';
}
const cleanUrl = rawUrl.replace(/\/$/, '');
export const apiBaseUrl = cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;

export const apiClient: ApiClient = createApiClient({
  baseUrl: apiBaseUrl,
});

export { ApiClient };
