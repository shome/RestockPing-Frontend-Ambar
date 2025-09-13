// JWT Token Management Utilities

export interface TokenData {
  token: string;
  expiresAt: number;
}

const TOKEN_KEY = 'team_session_token';
const EXPIRES_KEY = 'team_token_expires';

/**
 * Store JWT token and expiration time
 */
export const storeToken = (token: string, expiresIn: number): void => {
  const expiresAt = Date.now() + (expiresIn * 1000); // Convert seconds to milliseconds
  
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXPIRES_KEY, expiresAt.toString());
  
  console.log('Token stored, expires at:', new Date(expiresAt).toISOString());
};

/**
 * Get stored JWT token
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get token expiration time
 */
export const getTokenExpiration = (): number | null => {
  const expiresStr = localStorage.getItem(EXPIRES_KEY);
  return expiresStr ? parseInt(expiresStr, 10) : null;
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (): boolean => {
  const expiresAt = getTokenExpiration();
  if (!expiresAt) return true;
  
  return Date.now() >= expiresAt;
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;
  
  return !isTokenExpired();
};

/**
 * Clear stored token
 */
export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_KEY);
  console.log('Token cleared');
};

/**
 * Get time until token expires (in seconds)
 */
export const getTimeUntilExpiry = (): number => {
  const expiresAt = getTokenExpiration();
  if (!expiresAt) return 0;
  
  const timeLeft = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  return timeLeft;
};

/**
 * Redirect to team login page
 */
export const redirectToTeamLogin = (): void => {
  clearToken();
  window.location.href = '/team/login';
};
