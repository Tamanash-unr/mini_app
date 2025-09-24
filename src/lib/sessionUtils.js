import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

/**
 * Session Key Management Utilities
 * Based on the reference implementation patterns
 */

// Storage keys
const SESSION_KEY_STORAGE = 'line_crypto_session_key';
const JWT_KEY = 'line_crypto_jwt_token';

export const generateSessionKey = () => {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  return { 
    privateKey, 
    address: account.address 
  };
};

export const getStoredSessionKey = () => {
  try {
    const stored = localStorage.getItem(SESSION_KEY_STORAGE);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (!parsed.privateKey || !parsed.address) return null;

    return parsed;
  } catch {
    return null;
  }
};

export const storeSessionKey = (sessionKey) => {
  try {
    localStorage.setItem(SESSION_KEY_STORAGE, JSON.stringify(sessionKey));
  } catch {
    // Storage failed - continue without caching
    console.warn('Failed to store session key');
  }
};

export const removeSessionKey = () => {
  try {
    localStorage.removeItem(SESSION_KEY_STORAGE);
  } catch {
    // Removal failed - not critical
    console.warn('Failed to remove session key');
  }
};

// JWT helpers
export const getStoredJWT = () => {
  try {
    return localStorage.getItem(JWT_KEY);
  } catch {
    return null;
  }
};

export const storeJWT = (token) => {
  try {
    localStorage.setItem(JWT_KEY, token);
  } catch {
    console.warn('Failed to store JWT token');
  }
};

export const removeJWT = () => {
  try {
    localStorage.removeItem(JWT_KEY);
  } catch {
    console.warn('Failed to remove JWT token');
  }
};

// EIP-712 domain configuration - MUST match the documentation exactly
export const getAuthDomain = () => ({
  name: 'Line Crypto',
  // According to the documentation, the domain should only have name as string
  // The EIP-712 types are defined within the Nitrolite SDK
});

// Authentication constants
export const AUTH_SCOPE = process.env.REACT_APP_AUTH_SCOPE || 'line-crypto.app';
export const APP_NAME = process.env.REACT_APP_APP_NAME || 'Line Crypto';
export const SESSION_DURATION = 3600; // 1 hour
