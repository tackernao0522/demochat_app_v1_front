import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CryptoJS from "crypto-js";

const mockCookies = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
};

vi.mock("vue3-cookies", () => ({
  useCookies: () => ({ cookies: mockCookies }),
}));

vi.mock("~/utils/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

const mockRuntimeConfig = {
  public: {
    NUXT_ENV_ENCRYPTION_KEY: "test_encryption_key",
  },
};

const { useCookiesAuth } = await import("../../composables/useCookiesAuth");

describe("useCookiesAuth", () => {
  let cookiesAuth: ReturnType<typeof useCookiesAuth>;

  beforeEach(() => {
    vi.resetAllMocks();
    cookiesAuth = useCookiesAuth(mockRuntimeConfig);
    vi.stubGlobal("window", {});
    vi.stubGlobal("process", { env: { NODE_ENV: "test" } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("saveAuthData", () => {
    it("正しく認証データを保存すること", () => {
      const headers = {
        "access-token": "test-token",
        client: "test-client",
        uid: "test@example.com",
        expiry: "12345",
      };
      const userData = { id: 1, name: "Test User" };

      cookiesAuth.saveAuthData(headers, userData);

      expect(mockCookies.set).toHaveBeenCalledTimes(5);
      expect(mockCookies.set).toHaveBeenCalledWith(
        "access-token",
        expect.any(String),
        expect.any(Object)
      );
      expect(mockCookies.set).toHaveBeenCalledWith(
        "client",
        expect.any(String),
        expect.any(Object)
      );
      expect(mockCookies.set).toHaveBeenCalledWith(
        "uid",
        expect.any(String),
        expect.any(Object)
      );
      expect(mockCookies.set).toHaveBeenCalledWith(
        "expiry",
        expect.any(String),
        expect.any(Object)
      );
      expect(mockCookies.set).toHaveBeenCalledWith(
        "user",
        expect.any(String),
        expect.any(Object)
      );
    });

    it("サーバーサイドでは認証データを保存しないこと", () => {
      vi.stubGlobal("window", undefined);
      const headers = {
        "access-token": "test-token",
        client: "test-client",
        uid: "test@example.com",
        expiry: "12345",
      };
      const userData = { id: 1, name: "Test User" };

      cookiesAuth.saveAuthData(headers, userData);

      expect(mockCookies.set).not.toHaveBeenCalled();
    });
  });

  describe("getAuthData", () => {
    it("正しく認証データを取得すること", () => {
      const encryptedToken = CryptoJS.AES.encrypt(
        "mockToken",
        mockRuntimeConfig.public.NUXT_ENV_ENCRYPTION_KEY
      ).toString();
      const encryptedClient = CryptoJS.AES.encrypt(
        "mockClient",
        mockRuntimeConfig.public.NUXT_ENV_ENCRYPTION_KEY
      ).toString();
      const encryptedUid = CryptoJS.AES.encrypt(
        "mockUid",
        mockRuntimeConfig.public.NUXT_ENV_ENCRYPTION_KEY
      ).toString();
      const encryptedUser = CryptoJS.AES.encrypt(
        JSON.stringify({ id: 1, name: "Test User" }),
        mockRuntimeConfig.public.NUXT_ENV_ENCRYPTION_KEY
      ).toString();
      const encryptedExpiry = CryptoJS.AES.encrypt(
        "9999999999",
        mockRuntimeConfig.public.NUXT_ENV_ENCRYPTION_KEY
      ).toString();

      mockCookies.get.mockImplementation((key) => {
        const values = {
          "access-token": encryptedToken,
          client: encryptedClient,
          uid: encryptedUid,
          user: encryptedUser,
          expiry: encryptedExpiry,
        };
        return values[key];
      });

      const authData = cookiesAuth.getAuthData();

      expect(authData).toEqual({
        token: "mockToken",
        client: "mockClient",
        uid: "mockUid",
        user: { id: 1, name: "Test User" },
        expiry: "9999999999",
      });
    });
  });

  describe("clearAuthData", () => {
    it("正しく認証データをクリアすること", () => {
      cookiesAuth.clearAuthData();

      expect(mockCookies.remove).toHaveBeenCalledTimes(5);
      expect(mockCookies.remove).toHaveBeenCalledWith("access-token");
      expect(mockCookies.remove).toHaveBeenCalledWith("client");
      expect(mockCookies.remove).toHaveBeenCalledWith("uid");
      expect(mockCookies.remove).toHaveBeenCalledWith("user");
      expect(mockCookies.remove).toHaveBeenCalledWith("expiry");
    });

    it("サーバーサイドでは認証データをクリアしないこと", () => {
      vi.stubGlobal("window", undefined);
      cookiesAuth.clearAuthData();

      expect(mockCookies.remove).not.toHaveBeenCalled();
    });
  });

  describe("isAuthenticated", () => {
    it("認証されている場合にtrueを返すこと", () => {
      const futureDate = Math.floor(Date.now() / 1000) + 3600; // 1時間後
      const encryptedToken = CryptoJS.AES.encrypt(
        "mockToken",
        mockRuntimeConfig.public.NUXT_ENV_ENCRYPTION_KEY
      ).toString();
      const encryptedClient = CryptoJS.AES.encrypt(
        "mockClient",
        mockRuntimeConfig.public.NUXT_ENV_ENCRYPTION_KEY
      ).toString();
      const encryptedUid = CryptoJS.AES.encrypt(
        "mockUid",
        mockRuntimeConfig.public.NUXT_ENV_ENCRYPTION_KEY
      ).toString();
      const encryptedExpiry = CryptoJS.AES.encrypt(
        futureDate.toString(),
        mockRuntimeConfig.public.NUXT_ENV_ENCRYPTION_KEY
      ).toString();

      mockCookies.get.mockImplementation((key) => {
        const values = {
          "access-token": encryptedToken,
          client: encryptedClient,
          uid: encryptedUid,
          expiry: encryptedExpiry,
        };
        return values[key];
      });

      expect(cookiesAuth.isAuthenticated()).toBe(true);
    });

    it("認証されていない場合にfalseを返すこと", () => {
      mockCookies.get.mockReturnValue(null);

      expect(cookiesAuth.isAuthenticated()).toBe(false);
    });

    it("サーバーサイドではfalseを返すこと", () => {
      vi.stubGlobal("window", undefined);

      expect(cookiesAuth.isAuthenticated()).toBe(false);
    });
  });

  describe("isTokenExpired", () => {
    it("トークンが有効期限内の場合にfalseを返すこと", () => {
      const futureDate = Math.floor(Date.now() / 1000) + 3600; // 1時間後
      const encryptedExpiry = CryptoJS.AES.encrypt(
        futureDate.toString(),
        mockRuntimeConfig.public.NUXT_ENV_ENCRYPTION_KEY
      ).toString();
      mockCookies.get.mockReturnValue(encryptedExpiry);

      expect(cookiesAuth.isTokenExpired()).toBe(false);
    });

    it("トークンが期限切れの場合にtrueを返すこと", () => {
      const pastDate = Math.floor(Date.now() / 1000) - 3600; // 1時間前
      const encryptedExpiry = CryptoJS.AES.encrypt(
        pastDate.toString(),
        mockRuntimeConfig.public.NUXT_ENV_ENCRYPTION_KEY
      ).toString();
      mockCookies.get.mockReturnValue(encryptedExpiry);

      expect(cookiesAuth.isTokenExpired()).toBe(true);
    });

    it("expiryがnullの場合にtrueを返すこと", () => {
      mockCookies.get.mockReturnValue(null);

      expect(cookiesAuth.isTokenExpired()).toBe(true);
    });

    it("サーバーサイドではtrueを返すこと", () => {
      vi.stubGlobal("window", undefined);

      expect(cookiesAuth.isTokenExpired()).toBe(true);
    });
  });
});
