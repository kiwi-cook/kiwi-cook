import { boot } from 'quasar/wrappers';
import type { AxiosInstance, AxiosError } from 'axios';
import axios from 'axios';
import { useAnalytics } from 'src/composables/useAnalytics';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

const { trackEvent } = useAnalytics();

const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://taste-buddy.uk'
  : 'http://localhost:8000';

// Create an Axios instance with global configuration
const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000, // 30 seconds
});

// Add interceptors for logging and handling errors globally
api.interceptors.request.use(
  (config) => {
    // Modify or log the request before sending it
    trackEvent('apiRequest', { method: config.method, url: config.url });
    return config;
  },
  (error: AxiosError) => {
    console.error('[Request Error]', error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    // Log or modify the response
    trackEvent('apiResponse', { status: response.status, url: response.config.url });
    return response;
  },
  (error: AxiosError) => {
    trackEvent('apiError', { status: error.response?.status, url: error?.config?.url });
    return Promise.reject(error);
  },
);

export default boot(({ app }) => {
  // Attach axios instances to Vue's global properties
  app.config.globalProperties.$axios = axios; // For generic axios
  app.config.globalProperties.$api = api; // For API instance
});

export { api };
