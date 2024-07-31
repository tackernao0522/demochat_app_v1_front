import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRedirect } from "../../composables/useRedirect";

// モックの設定
const mockPush = vi.fn();
vi.mock("#app", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("useRedirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirectToChatroomが/chatroomにリダイレクトすること", async () => {
    const { redirectToChatroom } = useRedirect();
    await redirectToChatroom();
    expect(mockPush).toHaveBeenCalledWith("/chatroom");
  });

  it("redirectToLoginが/にリダイレクトすること", async () => {
    const { redirectToLogin } = useRedirect();
    await redirectToLogin();
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("redirectToChatroomがエラーをキャッチして処理すること", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockPush.mockRejectedValueOnce(new Error("リダイレクトエラー"));

    const { redirectToChatroom } = useRedirect();
    await redirectToChatroom();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error redirecting to chatroom:",
      expect.any(Error)
    );
    consoleErrorSpy.mockRestore();
  });

  it("redirectToLoginがエラーをキャッチして処理すること", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockPush.mockRejectedValueOnce(new Error("リダイレクトエラー"));

    const { redirectToLogin } = useRedirect();
    await redirectToLogin();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error redirecting to login:",
      expect.any(Error)
    );
    consoleErrorSpy.mockRestore();
  });
});
