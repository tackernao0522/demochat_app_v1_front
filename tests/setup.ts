import { config } from "@vue/test-utils";
import { vi } from "vitest";

// Vue Test Utilsのグローバル設定
config.global.mocks = {
  $t: (key: string) => key,
  $nuxt: {
    $config: {
      public: {
        NUXT_ENV_ENCRYPTION_KEY: "test-key",
      },
    },
  },
};

// Nuxtのグローバルコンポーネントのスタブ
config.global.stubs = {
  NuxtLink: true,
  NuxtPage: true,
  ClientOnly: true,
};

// Nuxtの関数のモック
vi.mock("#imports", () => ({
  useNuxtApp: () => ({
    $axios: {
      post: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
    },
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useRoute: () => ({
    params: {},
    query: {},
    fullPath: "/",
  }),
  useRuntimeConfig: () => ({
    public: {
      NUXT_ENV_ENCRYPTION_KEY: "test-key",
    },
  }),
  useCookie: () => ({
    value: null,
    set: vi.fn(),
    remove: vi.fn(),
  }),
  defineNuxtPlugin: vi.fn(),
  useHead: vi.fn(),
  navigateTo: vi.fn(),
  useState: vi.fn(),
  useFetch: vi.fn(),
  useAsyncData: vi.fn(),
}));

// グローバルなモックの設定
vi.mock("vue3-cookies", () => ({
  useCookies: () => ({
    cookies: {
      set: vi.fn(),
      remove: vi.fn(),
      get: vi.fn(),
    },
  }),
}));

// Nuxt固有の関数やオブジェクトのモック
vi.mock("#app", () => ({
  useNuxtApp: vi.fn(() => ({
    $axios: {
      post: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
    },
  })),
  useState: vi.fn(),
  useAsyncData: vi.fn(),
  useFetch: vi.fn(),
  useError: vi.fn(() => ({
    value: null,
  })),
  clearError: vi.fn(),
  defineNuxtRouteMiddleware: vi.fn(),
  abortNavigation: vi.fn(),
  addRouteMiddleware: vi.fn(),
  showError: vi.fn(),
  clearNuxtData: vi.fn(),
  refreshNuxtData: vi.fn(),
  defineNuxtComponent: vi.fn(),
  useRequestHeaders: vi.fn(),
  setResponseStatus: vi.fn(),
}));

// コンソールの警告を抑制（必要に応じて）
// console.warn = vi.fn();

// Nuxtのページトランジションのモック
vi.mock("#build/nuxt.config.mjs", () => ({
  default: {
    app: {
      pageTransition: { name: "page", mode: "out-in" },
    },
  },
}));
