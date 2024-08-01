import { useCookies } from "vue3-cookies";
import CryptoJS from "crypto-js";
import { logger } from "~/utils/logger";

export const useCookiesAuth = (runtimeConfig?: any) => {
  const { cookies } = useCookies();

  const getEncryptionKey = () => {
    if (
      runtimeConfig &&
      runtimeConfig.public &&
      runtimeConfig.public.NUXT_ENV_ENCRYPTION_KEY
    ) {
      return runtimeConfig.public.NUXT_ENV_ENCRYPTION_KEY;
    }
    return process.env.NUXT_ENV_ENCRYPTION_KEY || "default_encryption_key";
  };

  const encryptionKey = getEncryptionKey();

  const encrypt = (value: string): string => {
    if (!value) return "";
    return CryptoJS.AES.encrypt(value, encryptionKey).toString();
  };

  const decrypt = (value: string): string => {
    if (!value) return "";
    try {
      return CryptoJS.AES.decrypt(value, encryptionKey).toString(
        CryptoJS.enc.Utf8
      );
    } catch (error) {
      logger.error("Decryption failed:", error);
      return "";
    }
  };

  const saveAuthData = (headers: any, userData: any) => {
    if (typeof window === "undefined") return;

    const cookieOptions = {
      path: "/",
      secure: process.env.NODE_ENV !== "development",
      sameSite: "Lax" as const,
    };

    cookies.set(
      "access-token",
      encrypt(headers["access-token"]),
      cookieOptions
    );
    cookies.set("client", encrypt(headers.client), cookieOptions);
    cookies.set("uid", encrypt(headers.uid), cookieOptions);
    cookies.set("expiry", encrypt(headers.expiry.toString()), cookieOptions);
    cookies.set("user", encrypt(JSON.stringify(userData)), cookieOptions);
  };

  const getAuthData = () => {
    const getDecryptedCookie = (key: string) => decrypt(cookies.get(key) || "");

    return {
      token: getDecryptedCookie("access-token"),
      client: getDecryptedCookie("client"),
      uid: getDecryptedCookie("uid"),
      expiry: getDecryptedCookie("expiry"),
      user: safeJsonParse(getDecryptedCookie("user")),
    };
  };

  const safeJsonParse = (value: string) => {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (error) {
      logger.error("JSON parse failed:", error);
      return null;
    }
  };

  const clearAuthData = () => {
    if (typeof window === "undefined") return;

    cookies.remove("access-token");
    cookies.remove("client");
    cookies.remove("uid");
    cookies.remove("user");
    cookies.remove("expiry");
  };

  const isAuthenticated = () => {
    if (typeof window === "undefined") return false;

    const { token, client, uid, expiry } = getAuthData();
    return !!(token && client && uid && expiry && !isTokenExpired());
  };

  const isTokenExpired = () => {
    if (typeof window === "undefined") return true;

    const { expiry } = getAuthData();
    if (!expiry) return true;

    const expiryTimestamp = parseInt(expiry, 10);
    const currentTimestamp = Math.floor(Date.now() / 1000);

    return currentTimestamp >= expiryTimestamp;
  };

  return {
    saveAuthData,
    getAuthData,
    clearAuthData,
    isAuthenticated,
    isTokenExpired,
  };
};
