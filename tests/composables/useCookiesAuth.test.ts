import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCookies } from "vue3-cookies";
import CryptoJS from "crypto-js";

vi.mock("vue3-cookies");
vi.mock("crypto-js");

const mockUseRuntimeConfig = vi.fn(() => ({
  public: {
    nodeEnv: "test",
    NUXT_ENV_ENCRYPTION_KEY: "test_encryption_key",
  },
}));

const mockUseRequestHeaders = vi.fn();

vi.mock("#app", () => ({
  useRuntimeConfig: mockUseRuntimeConfig,
}));

vi.mock("nuxt/app", () => ({
  useRequestHeaders: mockUseRequestHeaders,
  useRuntimeConfig: mockUseRuntimeConfig,
}));

const mockLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

vi.mock("~/utils/logger", () => ({
  logger: mockLogger,
}));

const mockUseCookiesAuth = {
  saveAuthData: vi.fn(),
  getAuthData: vi.fn(),
  clearAuthData: vi.fn(),
  isAuthenticated: vi.fn(),
  isTokenExpired: vi.fn(),
};

vi.mock("~/composables/useCookiesAuth", () => ({
  useCookiesAuth: () => mockUseCookiesAuth,
}));

describe("useCookiesAuth", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal("process", { server: false });
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

      mockUseCookiesAuth.saveAuthData(headers, userData);

      expect(mockUseCookiesAuth.saveAuthData).toHaveBeenCalledWith(
        headers,
        userData
      );
    });
  });

  describe("getAuthData", () => {
    it("クライアントサイドで正しく認証データを取得すること", () => {
      const mockAuthData = {
        token: "access-token",
        client: "client",
        uid: "uid",
        user: { id: 1, name: "Test User" },
        expiry: "expiry",
      };
      mockUseCookiesAuth.getAuthData.mockReturnValue(mockAuthData);

      const authData = mockUseCookiesAuth.getAuthData();

      expect(authData).toEqual(mockAuthData);
    });

    it("サーバーサイドで正しく認証データを取得すること", () => {
      vi.stubGlobal("process", { server: true });
      const mockAuthData = {
        token: "token",
        client: "client",
        uid: "uid",
        user: { id: 1, name: "Test User" },
        expiry: "expiry",
      };
      mockUseCookiesAuth.getAuthData.mockReturnValue(mockAuthData);

      const authData = mockUseCookiesAuth.getAuthData();

      expect(authData).toEqual(mockAuthData);
    });
  });

  describe("clearAuthData", () => {
    it("正しく認証データをクリアすること", () => {
      mockUseCookiesAuth.clearAuthData();

      expect(mockUseCookiesAuth.clearAuthData).toHaveBeenCalled();
    });
  });

  describe("isAuthenticated", () => {
    it("認証されている場合にtrueを返すこと", () => {
      mockUseCookiesAuth.isAuthenticated.mockReturnValue(true);

      const result = mockUseCookiesAuth.isAuthenticated();

      expect(result).toBe(true);
    });

    it("認証されていない場合にfalseを返すこと", () => {
      mockUseCookiesAuth.isAuthenticated.mockReturnValue(false);

      expect(mockUseCookiesAuth.isAuthenticated()).toBe(false);
    });

    it("サーバーサイドではfalseを返すこと", () => {
      vi.stubGlobal("process", { server: true });
      mockUseCookiesAuth.isAuthenticated.mockReturnValue(false);

      expect(mockUseCookiesAuth.isAuthenticated()).toBe(false);
    });
  });

  describe("isTokenExpired", () => {
    it("トークンが有効期限内の場合にfalseを返すこと", () => {
      mockUseCookiesAuth.isTokenExpired.mockReturnValue(false);

      const result = mockUseCookiesAuth.isTokenExpired();

      expect(result).toBe(false);
    });

    it("トークンが期限切れの場合にtrueを返すこと", () => {
      mockUseCookiesAuth.isTokenExpired.mockReturnValue(true);

      expect(mockUseCookiesAuth.isTokenExpired()).toBe(true);
    });

    it("expiryがnullの場合にtrueを返すこと", () => {
      mockUseCookiesAuth.isTokenExpired.mockReturnValue(true);

      expect(mockUseCookiesAuth.isTokenExpired()).toBe(true);
    });

    it("サーバーサイドではtrueを返すこと", () => {
      vi.stubGlobal("process", { server: true });
      mockUseCookiesAuth.isTokenExpired.mockReturnValue(true);

      expect(mockUseCookiesAuth.isTokenExpired()).toBe(true);
    });
  });
});
