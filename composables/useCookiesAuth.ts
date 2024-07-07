import { useCookies } from "vue3-cookies";
import { useRequestHeaders } from "nuxt/app";
import CryptoJS from "crypto-js";
import { useRuntimeConfig } from "#app";

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
    console.warn(
      "NUXT_ENV_ENCRYPTION_KEY is not set. Using fallback key for development."
    );
    encryptionKey = "development_fallback_key";
  }

  const encrypt = (text: string): string => {
    try {
      return CryptoJS.AES.encrypt(text, encryptionKey).toString();
    } catch (error) {
      console.error("Encryption error:", error);
      return "";
    }
  };

  const decrypt = (ciphertext: string): string => {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("Decryption error:", error);
      return "";
    }
  };

  const parseUserCookie = (userCookie: string | null): any => {
    if (!userCookie) return null;
    try {
      const decryptedUserCookie = decrypt(userCookie);
      return JSON.parse(decryptedUserCookie);
    } catch (e) {
      console.error("Error parsing user cookie:", e);
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
    console.log("Saving auth data to cookies");
    if (process.server) {
      console.log("Skipping auth data save on server side");
      return;
    }

    console.log("Headers received:", headers);
    console.log("User data received:", userData);
    clearAuthData();

    const authDataToSave = {
      "access-token": headers["access-token"]
        ? encrypt(headers["access-token"])
        : "",
      client: headers.client ? encrypt(headers.client) : "",
      uid: headers.uid ? encrypt(headers.uid) : "",
      expiry: headers.expiry ? encrypt(headers.expiry) : "",
      user: userData ? encrypt(JSON.stringify(userData)) : "",
    };

    Object.entries(authDataToSave).forEach(([key, value]) => {
      if (value) {
        try {
          cookies.set(key, value, cookieOptions);
          console.log(`Set ${key} cookie with encrypted value`);
        } catch (error) {
          console.error(`Error setting ${key} cookie:`, error);
        }
      } else {
        console.warn(`Empty value for ${key}, cookie not set`);
      }
    });

    console.log("Auth data saved successfully");
  };

  const getAuthData = () => {
    console.log("Getting auth data from cookies");
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

      console.log("Auth data retrieved on server:", authData);
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
      console.log("Auth data retrieved from cookies:", authData);
      return authData;
    }
  };

  const clearAuthData = () => {
    if (process.server) return;

    ["access-token", "client", "uid", "user", "expiry"].forEach(
      (cookieName) => {
        try {
          cookies.remove(cookieName);
          console.log(`Removed ${cookieName} cookie`);
        } catch (error) {
          console.error(`Error removing ${cookieName} cookie:`, error);
        }
      }
    );
  };

  const isAuthenticated = () => {
    if (process.server) return false;
    const { token, client, uid } = getAuthData();
    const authenticated = !!token && !!client && !!uid && !isTokenExpired();
    console.log("Is authenticated:", authenticated);
    return authenticated;
  };

  const isTokenExpired = () => {
    if (process.server) return true;
    const expiry = getAuthData().expiry;
    if (!expiry) {
      console.log("No expiry found, token considered expired");
      return true;
    }
    const expiryDate = new Date(parseInt(expiry) * 1000);
    const isExpired = new Date() > expiryDate;
    console.log("Token expiry:", expiryDate, "Is expired:", isExpired);
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
