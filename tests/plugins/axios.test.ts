import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import axiosPlugin from "../../plugins/axios";
import { useCookiesAuth } from "../../composables/useCookiesAuth";

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}));

vi.mock("#app", () => ({
  useRuntimeConfig: vi.fn(() => ({
    public: {
      apiUrl: "https://api.example.com",
    },
  })),
  defineNuxtPlugin: vi.fn((plugin) => plugin),
}));

const mockSaveAuthData = vi.fn();
const mockGetAuthData = vi.fn(() => ({
  token: "mockToken",
  client: "mockClient",
  uid: "mockUid",
  user: { id: 1 },
}));

vi.mock("../../composables/useCookiesAuth", () => ({
  useCookiesAuth: vi.fn(() => ({
    saveAuthData: mockSaveAuthData,
    getAuthData: mockGetAuthData,
  })),
}));

describe("Axios Plugin", () => {
  let plugin: any;
  let axiosInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    plugin = axiosPlugin();
    axiosInstance = (axios.create as any).mock.results[0].value;
  });

  it("creates an Axios instance with correct base URL", () => {
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "https://api.example.com",
      withCredentials: true,
    });
  });

  it("adds request interceptor", () => {
    expect(axiosInstance.interceptors.request.use).toHaveBeenCalled();
  });

  it("adds response interceptor", () => {
    expect(axiosInstance.interceptors.response.use).toHaveBeenCalled();
  });

  it("provides axios instance", () => {
    expect(plugin).toHaveProperty("provide.axios");
  });

  it("adds auth headers to request", () => {
    const requestInterceptor =
      axiosInstance.interceptors.request.use.mock.calls[0][0];

    const config = { headers: {} };
    const result = requestInterceptor(config);

    expect(result.headers["access-token"]).toBe("mockToken");
    expect(result.headers["client"]).toBe("mockClient");
    expect(result.headers["uid"]).toBe("mockUid");
  });

  it("saves auth data from response headers", () => {
    const responseInterceptor =
      axiosInstance.interceptors.response.use.mock.calls[0][0];

    const response = {
      headers: {
        "access-token": "newToken",
        client: "newClient",
        uid: "newUid",
        expiry: "12345",
      },
    };

    responseInterceptor(response);

    expect(mockSaveAuthData).toHaveBeenCalledWith(
      {
        "access-token": "newToken",
        client: "newClient",
        uid: "newUid",
        expiry: "12345",
      },
      { id: 1 }
    );
  });
});
