import { describe, it, expect, vi, beforeEach } from "vitest";
import auth from "../../middleware/auth";
import { navigateTo } from "nuxt/app";

vi.mock("nuxt/app", () => ({
  navigateTo: vi.fn(),
  defineNuxtRouteMiddleware: (fn: any) => fn,
}));

vi.mock("../../composables/useCookiesAuth", () => ({
  useCookiesAuth: vi.fn(() => ({
    isAuthenticated: vi.fn(),
  })),
}));

describe("Auth Middleware", () => {
  let mockTo: any;
  let mockFrom: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTo = { meta: {} };
    mockFrom = {};
  });

  it("認証が必要なルートで未認証の場合、ルートページにリダイレクトすること", async () => {
    mockTo.meta.requiresAuth = true;
    const { useCookiesAuth } = await import("../../composables/useCookiesAuth");
    vi.mocked(useCookiesAuth).mockReturnValue({
      isAuthenticated: vi.fn().mockResolvedValue(false),
    });

    await auth(mockTo, mockFrom);

    expect(navigateTo).toHaveBeenCalledWith("/");
  });

  it("認証が必要なルートで認証済みの場合、リダイレクトしないこと", async () => {
    mockTo.meta.requiresAuth = true;
    const { useCookiesAuth } = await import("../../composables/useCookiesAuth");
    vi.mocked(useCookiesAuth).mockReturnValue({
      isAuthenticated: vi.fn().mockResolvedValue(true),
    });

    await auth(mockTo, mockFrom);

    expect(navigateTo).not.toHaveBeenCalled();
  });

  it("認証が不要なルートでは、認証状態に関わらずリダイレクトしないこと", async () => {
    mockTo.meta.requiresAuth = false;
    const { useCookiesAuth } = await import("../../composables/useCookiesAuth");
    vi.mocked(useCookiesAuth).mockReturnValue({
      isAuthenticated: vi.fn().mockResolvedValue(false),
    });

    await auth(mockTo, mockFrom);

    expect(navigateTo).not.toHaveBeenCalled();
  });

  it("ルートページにアクセスして認証済みの場合、チャットルームにリダイレクトすること", async () => {
    mockTo.path = "/";
    const { useCookiesAuth } = await import("../../composables/useCookiesAuth");
    vi.mocked(useCookiesAuth).mockReturnValue({
      isAuthenticated: vi.fn().mockResolvedValue(true),
    });

    await auth(mockTo, mockFrom);

    expect(navigateTo).toHaveBeenCalledWith("/chatroom");
  });

  it("ルートページにアクセスして未認証の場合、リダイレクトしないこと", async () => {
    mockTo.path = "/";
    const { useCookiesAuth } = await import("../../composables/useCookiesAuth");
    vi.mocked(useCookiesAuth).mockReturnValue({
      isAuthenticated: vi.fn().mockResolvedValue(false),
    });

    await auth(mockTo, mockFrom);

    expect(navigateTo).not.toHaveBeenCalled();
  });
});
