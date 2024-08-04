import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";
import { loadNuxt, buildNuxt } from "@nuxt/kit";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("Nuxt設定", () => {
  let nuxt: any;

  beforeAll(async () => {
    // 環境変数をモック
    process.env.BASIC_AUTH_USER = "testuser";
    process.env.BASIC_AUTH_PASSWORD = "testpass";
    process.env.NUXT_ENV_ENCRYPTION_KEY = "testkey";
    process.env.API_URL = "https://test-api.example.com";
    process.env.NODE_ENV = "test";
    process.env.LOG_LEVEL = "debug";
    process.env.FRONT_PORT = "3000";

    nuxt = await loadNuxt({
      cwd: resolve(__dirname, ".."),
      dev: false,
      overrides: {
        ssr: true,
      },
    });
    await buildNuxt(nuxt);
  }, 60000);

  afterAll(async () => {
    await nuxt.close();
  });

  it("正しいCSSファイルが設定されていること", () => {
    const css = nuxt.options.css;
    expect(css).toContain("@fortawesome/fontawesome-svg-core/styles.css");
    expect(css).toContain("@/assets/css/tailwind.css");
  });

  it("正しいビルドトランスパイル設定があること", () => {
    const transpile = nuxt.options.build.transpile;
    expect(transpile).toContain("@nuxtjs/tailwindcss");
  });

  it("正しいランタイム設定があること", () => {
    const runtimeConfig = nuxt.options.runtimeConfig;
    expect(runtimeConfig.basicAuthUser).toBe("testuser");
    expect(runtimeConfig.basicAuthPassword).toBe("testpass");
    expect(runtimeConfig.public.NUXT_ENV_ENCRYPTION_KEY).toBe("testkey");
    expect(runtimeConfig.public.apiUrl).toBe("https://test-api.example.com");
    expect(runtimeConfig.public.nodeEnv).toBe("test");
    expect(runtimeConfig.public.logLevel).toBe("debug");
  });

  it("正しいモジュールが設定されていること", () => {
    const modules = nuxt.options.modules;
    expect(modules).toContain("@nuxtjs/tailwindcss");
  });

  it("正しいプラグインが設定されていること", () => {
    const plugins = nuxt.options.plugins;
    const expectedPlugins = [
      "~/plugins/fontawesome.ts",
      "~/plugins/axios.ts",
      "~/plugins/actioncable.ts",
    ];
    expectedPlugins.forEach((plugin) => {
      expect(plugins).toContainEqual(plugin);
    });
  });

  it("正しいNitroプリセットが設定されていること", () => {
    expect(nuxt.options.nitro.preset).toBe("vercel");
  });

  it("正しい実験的設定があること", () => {
    expect(nuxt.options.experimental.payloadExtraction).toBe(false);
  });

  it("開発サーバーの設定が正しいこと", () => {
    expect(nuxt.options.devServer.port).toBe(3000);
    expect(nuxt.options.devServer.host).toBe("0.0.0.0");
  });

  it("SSRが有効になっていること", () => {
    expect(nuxt.options.ssr).toBe(true);
  });

  it("互換性の日付が設定されていること", () => {
    const compatibilityDate = nuxt.options.compatibilityDate;
    expect(compatibilityDate).toHaveProperty("default", "2024-03-18");
  });

  it("本番環境でコンソールログが削除されること", () => {
    const terserOptions = nuxt.options.build.terser.terserOptions;
    expect(terserOptions.compress.drop_console).toBe(
      process.env.NODE_ENV === "production"
    );
  });
});
