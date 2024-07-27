import { describe, it, expect, vi, beforeEach } from "vitest";
import { createConsumer } from "@rails/actioncable";
import actionCablePlugin from "../../plugins/actioncable";

vi.mock("@rails/actioncable", () => ({
  createConsumer: vi.fn(),
}));

describe("ActionCable Plugin", () => {
  let nuxtApp: any;

  beforeEach(() => {
    vi.resetAllMocks();
    nuxtApp = {
      provide: vi.fn(),
    };
    // NODE_ENVをリセット
    delete process.env.NODE_ENV;
  });

  it("開発環境では正しいWebSocket URLを使用すること", async () => {
    process.env.NODE_ENV = "development";
    const plugin = await actionCablePlugin(nuxtApp);

    expect(createConsumer).toHaveBeenCalledWith("ws://localhost:3000/cable");
    expect(plugin).toHaveProperty("provide.cable");
  });

  it("本番環境では正しいWebSocket URLを使用すること", async () => {
    process.env.NODE_ENV = "production";
    const plugin = await actionCablePlugin(nuxtApp);

    expect(createConsumer).toHaveBeenCalledWith(
      "wss://demochat-api.fly.dev/cable"
    );
    expect(plugin).toHaveProperty("provide.cable");
  });

  it("環境変数が設定されていない場合、デフォルトで開発環境のURLを使用すること", async () => {
    const plugin = await actionCablePlugin(nuxtApp);

    expect(createConsumer).toHaveBeenCalledWith("ws://localhost:3000/cable");
    expect(plugin).toHaveProperty("provide.cable");
  });
});
