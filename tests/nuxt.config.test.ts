import { describe, it, expect } from "vitest";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";
import { loadNuxt, buildNuxt } from "@nuxt/kit";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("Nuxt設定", () => {
  let nuxt: any;

  beforeAll(async () => {
    nuxt = await loadNuxt({
      cwd: resolve(__dirname, ".."),
      dev: false,
      overrides: {
        ssr: false,
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
    expect(runtimeConfig).toHaveProperty("basicAuthUser");
    expect(runtimeConfig).toHaveProperty("basicAuthPassword");
    expect(runtimeConfig.public).toHaveProperty("NUXT_ENV_ENCRYPTION_KEY");
    expect(runtimeConfig.public).toHaveProperty("apiUrl");
    expect(runtimeConfig.public).toHaveProperty("nodeEnv");
    expect(runtimeConfig.public).toHaveProperty("logLevel");
  });

  it("正しいモジュールが設定されていること", () => {
    const modules = nuxt.options.modules;
    expect(modules).toContain("@nuxtjs/tailwindcss");
  });

  it("正しいプラグインが設定されていること", () => {
    const plugins = nuxt.options.plugins;
    const customPlugins = [
      "~/plugins/fontawesome.ts",
      "~/plugins/axios.ts",
      "~/plugins/actioncable.ts",
    ];
    customPlugins.forEach((plugin) => {
      expect(plugins).toContain(plugin);
    });
  });

  it("正しいNitroプリセットが設定されていること", () => {
    expect(nuxt.options.nitro.preset).toBe("vercel");
  });

  it("正しい実験的設定があること", () => {
    expect(nuxt.options.experimental.payloadExtraction).toBe(false);
  });
});
