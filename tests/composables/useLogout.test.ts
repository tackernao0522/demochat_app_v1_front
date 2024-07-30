import { describe, it, expect, vi, beforeEach } from "vitest";
import { useLogout } from "../../composables/useLogout";

// Nuxtのコンポーネントをモック
const mockAxiosDelete = vi.fn();
vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $axios: {
      delete: mockAxiosDelete,
    },
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// useCookiesAuthをモック
const mockGetAuthData = vi.fn();
const mockClearAuthData = vi.fn();
vi.mock("../../composables/useCookiesAuth", () => ({
  useCookiesAuth: () => ({
    getAuthData: mockGetAuthData,
    clearAuthData: mockClearAuthData,
  }),
}));

describe("useLogout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthData.mockReturnValue({
      token: "mockToken",
      client: "mockClient",
      uid: "mockUid",
    });
  });

  it("ログアウトが成功した場合、正しく処理されること", async () => {
    mockAxiosDelete.mockResolvedValue({ status: 200 });
    const { logout, error } = useLogout();

    await logout();

    expect(mockAxiosDelete).toHaveBeenCalledWith("/auth/sign_out", {
      headers: {
        "access-token": "mockToken",
        client: "mockClient",
        uid: "mockUid",
      },
    });
    expect(mockClearAuthData).toHaveBeenCalled();
    expect(error.value).toBeNull();
  });

  // it("ログアウトが失敗した場合、エラーメッセージが設定されること", async () => {
  //   const errorMessage = "Logout failed";
  //   mockAxiosDelete.mockRejectedValue({
  //     response: { data: errorMessage },
  //   });
  //   const { logout, error } = useLogout();

  //   await logout();

  //   expect(mockAxiosDelete).toHaveBeenCalled();
  //   expect(mockClearAuthData).not.toHaveBeenCalled();
  //   expect(error.value).toBe(errorMessage);
  // });

  // it("サーバーからエラーレスポンスがない場合、一般的なエラーメッセージが設定されること", async () => {
  //   mockAxiosDelete.mockRejectedValue(new Error("Network error"));
  //   const { logout, error } = useLogout();

  //   await logout();

  //   expect(mockAxiosDelete).toHaveBeenCalled();
  //   expect(mockClearAuthData).not.toHaveBeenCalled();
  //   expect(error.value).toBe("Network error");
  // });
});
