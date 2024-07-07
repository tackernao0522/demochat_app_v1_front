import { useCookies } from "vue3-cookies";
import { useRequestHeaders } from "nuxt/app";
import CryptoJS from "crypto-js";
import { useRuntimeConfig } from "#app";
import { logger } from "~/utils/logger"; // 新しく追加したloggerをインポート

export const useCookiesAuth = () => {
  const { cookies } = useCookies();
  const cookieOptions = {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  };
  const config = useRuntimeConfig();
  let encryptionKey = config.public.NUXT_ENV_ENCRYPTION_KEY;

  if (!encryptionKey) {
    logger.warn(
      "NUXT_ENV_ENCRYPTION_KEY is not set. Using fallback key for development."
    );
    encryptionKey = "development_fallback_key";
  }

  const encrypt = (text: string): string => {
    try {
      return CryptoJS.AES.encrypt(text, encryptionKey).toString();
    } catch (error) {
      logger.error("Encryption error:", error);
      return "";
    }
  };

  const decrypt = (ciphertext: string): string => {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      logger.error("Decryption error:", error);
      return "";
    }
  };

  const parseUserCookie = (userCookie: string | null): any => {
    if (!userCookie) return null;
    try {
      const decryptedUserCookie = decrypt(userCookie);
      return JSON.parse(decryptedUserCookie);
    } catch (e) {
      logger.error("Error parsing user cookie:", e);
      return null;
    }
  };

  const parseCookieHeader = (cookieHeader: string) => {
    const cookies = {};
    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      if (parts.length === 2) {
        const key = parts[0].trim();
        const value = parts[1].trim();
        cookies[key] = decodeURIComponent(value);
      }
    });
    return cookies;
  };

  const saveAuthData = (headers: any, userData: any) => {
    logger.debug("Saving auth data to cookies");
    if (process.server) {
      logger.debug("Skipping auth data save on server side");
      return;
    }

    logger.debug("Headers received:", headers);
    logger.debug("User data received:", userData);
    clearAuthData();

    const authDataToSave = {
      "access-token": headers["access-token"] || "",
      client: headers["client"] || "",
      uid: headers["uid"] || "",
      expiry: headers["expiry"] || "",
      user: userData ? JSON.stringify(userData) : "",
    };

    Object.entries(authDataToSave).forEach(([key, value]) => {
      if (value) {
        try {
          const encryptedValue = encrypt(value);
          cookies.set(key, encryptedValue, cookieOptions);
          logger.debug(`Set ${key} cookie with encrypted value`);
        } catch (error) {
          logger.error(`Error setting ${key} cookie:`, error);
        }
      } else {
        logger.warn(`Empty value for ${key}, cookie not set`);
      }
    });

    logger.info("Auth data saved successfully");
  };

  const getAuthData = () => {
    logger.debug("Getting auth data from cookies");
    if (process.server) {
      const headers = useRequestHeaders(["cookie"]);
      const cookieHeader = headers.cookie || "";
      const parsedCookies = parseCookieHeader(cookieHeader);

      const authData = {
        token: parsedCookies["access-token"]
          ? decrypt(parsedCookies["access-token"])
          : null,
        client: parsedCookies["client"]
          ? decrypt(parsedCookies["client"])
          : null,
        uid: parsedCookies["uid"] ? decrypt(parsedCookies["uid"]) : null,
        user: parseUserCookie(parsedCookies["user"]),
        expiry: parsedCookies["expiry"]
          ? decrypt(parsedCookies["expiry"])
          : null,
      };

      logger.debug("Auth data retrieved on server:", authData);
      return authData;
    } else {
      const authData = {
        token: cookies.get("access-token")
          ? decrypt(cookies.get("access-token"))
          : null,
        client: cookies.get("client") ? decrypt(cookies.get("client")) : null,
        uid: cookies.get("uid") ? decrypt(cookies.get("uid")) : null,
        user: parseUserCookie(cookies.get("user")),
        expiry: cookies.get("expiry") ? decrypt(cookies.get("expiry")) : null,
      };
      logger.debug("Auth data retrieved from cookies:", authData);
      return authData;
    }
  };

  const clearAuthData = () => {
    if (process.server) return;

    ["access-token", "client", "uid", "user", "expiry"].forEach(
      (cookieName) => {
        try {
          cookies.remove(cookieName);
          logger.debug(`Removed ${cookieName} cookie`);
        } catch (error) {
          logger.error(`Error removing ${cookieName} cookie:`, error);
        }
      }
    );
  };

  const isAuthenticated = () => {
    if (process.server) return false;
    const { token, client, uid } = getAuthData();
    const authenticated = !!token && !!client && !!uid && !isTokenExpired();
    logger.debug("Is authenticated:", authenticated);
    return authenticated;
  };

  const isTokenExpired = () => {
    if (process.server) return true;
    const expiry = getAuthData().expiry;
    if (!expiry) {
      logger.debug("No expiry found, token considered expired");
      return true;
    }
    const expiryDate = new Date(parseInt(expiry) * 1000);
    const isExpired = new Date() > expiryDate;
    logger.debug("Token expiry:", expiryDate, "Is expired:", isExpired);
    return isExpired;
  };

  return {
    getAuthData,
    saveAuthData,
    clearAuthData,
    isAuthenticated,
    isTokenExpired,
  };
};
