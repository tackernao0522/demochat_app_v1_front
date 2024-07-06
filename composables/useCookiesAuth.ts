// useCookiesAuth.ts
import { useCookies } from "vue3-cookies";
import { useRequestHeaders } from "nuxt/app";
import CryptoJS from "crypto-js";
import { useRuntimeConfig } from "#app";

export const useCookiesAuth = () => {
  const { cookies } = useCookies();
  const cookieOptions = { path: "/", secure: true, sameSite: "Lax" };
  const config = useRuntimeConfig();
  let encryptionKey = config.public.NUXT_ENV_ENCRYPTION_KEY;

  if (!encryptionKey) {
    console.warn(
      "NUXT_ENV_ENCRYPTION_KEY is not set. Using fallback key for development."
    );
    encryptionKey = "development_fallback_key";
  }

  const encrypt = (text: string): string => {
    return CryptoJS.AES.encrypt(text, encryptionKey).toString();
  };

  const decrypt = (ciphertext: string): string => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
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

  const getAuthData = () => {
    if (process.server) {
      const headers = useRequestHeaders(["cookie"]);
      const cookieHeader = headers.cookie || "";
      const parsedCookies = parseCookieHeader(cookieHeader);

      return {
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
    } else {
      return {
        token: cookies.get("access-token")
          ? decrypt(cookies.get("access-token"))
          : null,
        client: cookies.get("client") ? decrypt(cookies.get("client")) : null,
        uid: cookies.get("uid") ? decrypt(cookies.get("uid")) : null,
        user: parseUserCookie(cookies.get("user")),
        expiry: cookies.get("expiry") ? decrypt(cookies.get("expiry")) : null,
      };
    }
  };

  const saveAuthData = (headers: any, userData: any) => {
    if (process.server) return;

    clearAuthData();

    const authDataToSave = {
      "access-token": encrypt(headers["access-token"]),
      client: encrypt(headers.client),
      uid: encrypt(headers.uid),
      expiry: encrypt(headers.expiry),
      user: encrypt(JSON.stringify(userData)),
    };

    Object.entries(authDataToSave).forEach(([key, value]) => {
      if (value) {
        cookies.set(key, value, cookieOptions);
      }
    });
  };

  const clearAuthData = () => {
    if (process.server) return;

    ["access-token", "client", "uid", "user", "expiry"].forEach(
      (cookieName) => {
        cookies.remove(cookieName);
      }
    );
  };

  const isAuthenticated = () => {
    if (process.server) return false;
    const { token, client, uid } = getAuthData();
    return !!token && !!client && !!uid && !isTokenExpired();
  };

  const isTokenExpired = () => {
    if (process.server) return true;
    const expiry = getAuthData().expiry;
    if (!expiry) return true;
    const expiryDate = new Date(parseInt(expiry) * 1000);
    return new Date() > expiryDate;
  };

  return {
    getAuthData,
    saveAuthData,
    clearAuthData,
    isAuthenticated,
    isTokenExpired,
  };
};
