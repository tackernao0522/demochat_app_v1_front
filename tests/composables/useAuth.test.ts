import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import axios from "axios";

const mockUseCookiesAuth = {
  saveAuthData: vi.fn(),
  getAuthData: vi.fn(),
  clearAuthData: vi.fn(),
};

vi.mock("../../composables/useCookiesAuth", () => ({
  useCookiesAuth: () => mockUseCookiesAuth,
}));

const mockUseRedirect = {
  redirectToChatroom: vi.fn(),
  redirectToLogin: vi.fn(),
};

vi.mock("../../composables/useRedirect", () => ({
  useRedirect: () => mockUseRedirect,
}));

vi.mock("axios");

vi.mock("#app", () => ({
  useRuntimeConfig: () => ({
    public: {
      apiUrl: "http://test-api-url.com",
    },
  }),
}));

describe("useAuth", () => {
  let auth: any;
  const mockAxiosPost = vi.fn();
  const mockAxiosDelete = vi.fn();

  beforeEach(async () => {
    vi.resetAllMocks();
    mockUseCookiesAuth.getAuthData.mockReturnValue({
      token: "mockToken",
      client: "mockClient",
      uid: "mockUid",
    });

    vi.mocked(axios.create).mockReturnValue({
      post: mockAxiosPost,
      delete: mockAxiosDelete,
    } as any);

    const { useAuth } = await import("../../composables/useAuth");
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
      expect(mockUseCookiesAuth.saveAuthData).toHaveBeenCalled();
      expect(mockUseRedirect.redirectToChatroom).toHaveBeenCalled();
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
      expect(mockUseCookiesAuth.saveAuthData).toHaveBeenCalled();
      expect(mockUseRedirect.redirectToChatroom).toHaveBeenCalled();
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
      expect(mockUseCookiesAuth.clearAuthData).toHaveBeenCalled();
      expect(mockUseRedirect.redirectToLogin).toHaveBeenCalled();
    });

    it("ログアウトが失敗した場合、エラーメッセージが設定されること", async () => {
      mockAxiosDelete.mockRejectedValue(new Error("Network error"));

      await auth.logout();

      expect(auth.errorMessage.value).toBe("ログアウトに失敗しました");
    });
  });
});
