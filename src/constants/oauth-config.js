import Constants from 'expo-constants';

// Read extras from either manifest (classic) or expoConfig (web / newer SDK behavior)
const extra = Constants.manifest?.extra || Constants.expoConfig?.extra || {};

export const GOOGLE_CLIENT_ID_EXPO = extra.GOOGLE_CLIENT_ID_EXPO || '<YOUR_GOOGLE_CLIENT_ID_FOR_EXPO>';
export const GOOGLE_CLIENT_ID_WEB = extra.GOOGLE_CLIENT_ID_WEB || '<YOUR_GOOGLE_CLIENT_ID_FOR_WEB>';
export const GITHUB_CLIENT_ID = extra.GITHUB_CLIENT_ID || '<YOUR_GITHUB_CLIENT_ID>';

export const GOOGLE_SCOPES = ['openid', 'profile', 'email'];
export const GITHUB_SCOPES = ['read:user', 'user:email'];
