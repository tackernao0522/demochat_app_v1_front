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
