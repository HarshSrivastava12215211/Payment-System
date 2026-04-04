export const environment = {
  production: false,
  apiBaseUrl: typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:7505' : ''
};
