import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { basicAuthMiddleware } from "../../middleware/basic-auth.global";

vi.mock("#app", () => ({
  defineNuxtRouteMiddleware: vi.fn((handler) => handler),
  useRuntimeConfig: vi.fn(),
  useRequestEvent: vi.fn(),
}));

vi.mock("h3", () => ({
  createError: vi.fn((options) => ({ ...options })),
}));

describe("Basic Auth Global Middleware", () => {
  let mockEvent: any;
  let mockConfig: any;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEvent = {
      node: {
        req: { headers: {} },
        res: { setHeader: vi.fn() },
      },
    };
    mockConfig = {
      basicAuthUser: "testuser",
      basicAuthPassword: "testpass",
    };
    originalEnv = process.env;
    process.env = { ...originalEnv };
    vi.stubGlobal("process", {
      ...process,
      server: true,
      env: { ...process.env },
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("開発環境では認証をスキップすること", () => {
    process.env.NODE_ENV = "development";
    const result = basicAuthMiddleware(mockEvent, mockConfig);
    expect(result).toBeUndefined();
  });

  it("本番環境で認証ヘッダーがない場合、401エラーを返すこと", () => {
    process.env.NODE_ENV = "production";
    const result = basicAuthMiddleware(mockEvent, mockConfig);
    expect(result).toEqual({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
    expect(mockEvent.node.res.setHeader).toHaveBeenCalledWith(
      "WWW-Authenticate",
      'Basic realm="Secure Area"'
    );
  });

  it("本番環境で不正な認証情報の場合、401エラーを返すこと", () => {
    process.env.NODE_ENV = "production";
    mockEvent.node.req.headers.authorization = "Basic aW52YWxpZDppbnZhbGlk"; // invalid:invalid
    const result = basicAuthMiddleware(mockEvent, mockConfig);
    expect(result).toEqual({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  });

  it("本番環境で正しい認証情報の場合、認証を通過すること", () => {
    process.env.NODE_ENV = "production";
    mockEvent.node.req.headers.authorization = "Basic dGVzdHVzZXI6dGVzdHBhc3M="; // testuser:testpass
    const result = basicAuthMiddleware(mockEvent, mockConfig);
    expect(result).toBeUndefined();
  });
});
