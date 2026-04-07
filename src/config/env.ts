/** Client env — only EXPO_PUBLIC_* from .env (see https://docs.expo.dev/guides/environment-variables/) */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Google OAuth client IDs (platform-specific)
export const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
export const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

// Back-compat (older env name). Prefer the platform-specific ones above.
export const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
