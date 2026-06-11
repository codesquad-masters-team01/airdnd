export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8080',
  oauthBaseUrl: import.meta.env.VITE_OAUTH_BASE_URL || 'http://127.0.0.1:8080',
};

export function getGoogleOAuthUrl() {
  return `${env.oauthBaseUrl.replace(/\/$/, '')}/oauth2/authorization/google`;
}
