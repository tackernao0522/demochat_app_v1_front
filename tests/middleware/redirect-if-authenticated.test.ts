import { describe, it, expect, vi, beforeEach } from "vitest";
import redirectIfAuthenticatedMiddleware from "../../middleware/redirect-if-authenticated";
import { useCookies } from "vue3-cookies";
import { useRedirect } from "../../composables/useRedirect";

vi.mock("vue3-cookies", () => ({
  useCookies: vi.fn(),
}));

vi.mock("../../composables/useRedirect", () => ({
  useRedirect: vi.fn(),
}));

vi.mock("nuxt/app", () => ({
  defineNuxtRouteMiddleware: (fn: any) => fn,
}));

describe("Redirect If Authenticated Middleware", () => {
  let mockCookies: any;
  let mockRedirectToChatroom: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCookies = {
      get: vi.fn(),
    };
    mockRedirectToChatroom = vi.fn();

    vi.mocked(useCookies).mockReturnValue({ cookies: mockCookies });
    vi.mocked(useRedirect).mockReturnValue({
      redirectToChatroom: mockRedirectToChatroom,
    });

    // Mock console.log
    console.log = vi.fn();
  });

  it("サーバーサイドでは何もしないこと", async () => {
    vi.stubGlobal("process", { server: true });

    await redirectIfAuthenticatedMiddleware();

    expect(mockCookies.get).not.toHaveBeenCalled();
    expect(mockRedirectToChatroom).not.toHaveBeenCalled();
  });

  it("認証されていない場合、リダイレクトしないこと", async () => {
    vi.stubGlobal("process", { server: false });
    mockCookies.get.mockReturnValue(null);

    await redirectIfAuthenticatedMiddleware();

    expect(mockCookies.get).toHaveBeenCalledTimes(3);
    expect(mockRedirectToChatroom).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalledWith("既にログインしています。");
  });

  it("認証されている場合、チャットルームにリダイレクトすること", async () => {
    vi.stubGlobal("process", { server: false });
    mockCookies.get
      .mockReturnValueOnce("token")
      .mockReturnValueOnce("client")
      .mockReturnValueOnce("uid");

    await redirectIfAuthenticatedMiddleware();

    expect(mockCookies.get).toHaveBeenCalledTimes(3);
    expect(mockRedirectToChatroom).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("既にログインしています。");
  });

  it("一部の認証情報のみが存在する場合、リダイレクトしないこと", async () => {
    vi.stubGlobal("process", { server: false });
    mockCookies.get
      .mockReturnValueOnce("token")
      .mockReturnValueOnce(null)
      .mockReturnValueOnce("uid");

    await redirectIfAuthenticatedMiddleware();

    expect(mockCookies.get).toHaveBeenCalledTimes(3);
    expect(mockRedirectToChatroom).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalledWith("既にログインしています。");
  });
});
