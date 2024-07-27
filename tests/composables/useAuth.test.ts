import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useAuth } from "../../composables/useAuth";
import { useCookiesAuth } from "../../composables/useCookiesAuth";
import { useRedirect } from "../../composables/useRedirect";
import axios from "axios";

vi.mock("../../composables/useCookiesAuth");
vi.mock("../../composables/useRedirect");
vi.mock("axios");

// Nuxtの機能をモック
vi.mock("#app", () => ({
  useRuntimeConfig: () => ({
    public: {
      apiUrl: "http://test-api-url.com",
    },
  }),
}));

describe("useAuth", () => {
  let auth: ReturnType<typeof useAuth>;
  const mockSaveAuthData = vi.fn();
  const mockGetAuthData = vi.fn();
  const mockClearAuthData = vi.fn();
  const mockRedirectToChatroom = vi.fn();
  const mockRedirectToLogin = vi.fn();
  const mockAxiosPost = vi.fn();
  const mockAxiosDelete = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    (useCookiesAuth as jest.Mock).mockReturnValue({
      saveAuthData: mockSaveAuthData,
      getAuthData: mockGetAuthData,
      clearAuthData: mockClearAuthData,
    });
    (useRedirect as jest.Mock).mockReturnValue({
      redirectToChatroom: mockRedirectToChatroom,
      redirectToLogin: mockRedirectToLogin,
    });
    mockGetAuthData.mockReturnValue({
      token: "mockToken",
      client: "mockClient",
      uid: "mockUid",
    });

    // axiosのcreateメソッドをモック
    (axios.create as jest.Mock).mockReturnValue({
      post: mockAxiosPost,
      delete: mockAxiosDelete,
    });

    auth = useAuth();
  });

  describe("login", () => {
    it("ログインが成功した場合、正しく処理されること", async () => {
      const mockResponse = {
        status: 200,
        data: { data: { id: 1, email: "test@example.com" } },
        headers: {
          "access-token": "mockToken",
          client: "mockClient",
          uid: "mockUid",
          expiry: "12345",
        },
      };
      mockAxiosPost.mockResolvedValue(mockResponse);

      await auth.login("test@example.com", "password");

      expect(mockAxiosPost).toHaveBeenCalledWith(
        "/auth/sign_in",
        { email: "test@example.com", password: "password" },
        expect.any(Object)
      );
      expect(mockSaveAuthData).toHaveBeenCalled();
      expect(mockRedirectToChatroom).toHaveBeenCalled();
      expect(auth.successMessage.value).toBeTruthy();
      expect(auth.errorMessage.value).toBeFalsy();
    });

    it("ログインが失敗した場合、エラーメッセージが設定されること", async () => {
      mockAxiosPost.mockRejectedValue({
        response: { data: { errors: ["ログインに失敗しました"] } },
      });

      await auth.login("test@example.com", "wrongpassword");

      expect(auth.errorMessage.value).toBe("ログインに失敗しました");
      expect(auth.successMessage.value).toBeFalsy();
    });
  });

  describe("signup", () => {
    it("サインアップが成功した場合、正しく処理されること", async () => {
      const mockResponse = {
        status: 200,
        data: {
          data: { id: 1, email: "newuser@example.com", name: "New User" },
        },
        headers: {
          "access-token": "newToken",
          client: "newClient",
          uid: "newUid",
          expiry: "12345",
        },
      };
      mockAxiosPost.mockResolvedValue(mockResponse);

      await auth.signup("newuser@example.com", "password", "New User");

      expect(mockAxiosPost).toHaveBeenCalledWith(
        "/auth",
        {
          email: "newuser@example.com",
          password: "password",
          name: "New User",
        },
        expect.any(Object)
      );
      expect(mockSaveAuthData).toHaveBeenCalled();
      expect(mockRedirectToChatroom).toHaveBeenCalled();
      expect(auth.successMessage.value).toBeTruthy();
      expect(auth.errorMessage.value).toBeFalsy();
    });

    it("サインアップが失敗した場合、エラーメッセージが設定されること", async () => {
      mockAxiosPost.mockRejectedValue({
        response: { data: { errors: ["サインアップに失敗しました"] } },
      });

      await auth.signup(
        "existinguser@example.com",
        "password",
        "Existing User"
      );

      expect(auth.errorMessage.value).toBe("サインアップに失敗しました");
      expect(auth.successMessage.value).toBeFalsy();
    });
  });

  describe("logout", () => {
    it("ログアウトが成功した場合、正しく処理されること", async () => {
      mockAxiosDelete.mockResolvedValue({});

      await auth.logout();

      expect(mockAxiosDelete).toHaveBeenCalledWith(
        "/auth/sign_out",
        expect.any(Object)
      );
      expect(mockClearAuthData).toHaveBeenCalled();
      expect(mockRedirectToLogin).toHaveBeenCalled();
    });

    it("ログアウトが失敗した場合、エラーメッセージが設定されること", async () => {
      mockAxiosDelete.mockRejectedValue(new Error("Network error"));

      await auth.logout();

      expect(auth.errorMessage.value).toBe("ログアウトに失敗しました");
    });
  });
});
