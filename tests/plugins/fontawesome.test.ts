import { describe, it, expect, vi, beforeEach } from "vitest";
import { library, config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faHeart,
  faEye,
  faEyeSlash,
  faBars,
} from "@fortawesome/free-solid-svg-icons";

// defineNuxtPluginのモック
vi.mock("#app", () => ({
  defineNuxtPlugin: vi.fn((callback) => callback),
}));

// FontAwesome プラグインのインポート
import fontawesomePlugin, { setupFontAwesome } from "../../plugins/fontawesome";

// Nuxtアプリケーションのモック
const mockNuxtApp = {
  vueApp: {
    component: vi.fn(),
  },
};

// libraryとconfigのモック
vi.mock("@fortawesome/fontawesome-svg-core", () => ({
  library: {
    add: vi.fn(),
  },
  config: {
    autoAddCss: true,
  },
}));

describe("FontAwesome Plugin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("autoAddCssが無効になっていること", () => {
    setupFontAwesome();
    expect(config.autoAddCss).toBe(false);
  });

  it("必要なアイコンがライブラリに追加されていること", () => {
    setupFontAwesome();
    expect(library.add).toHaveBeenCalledTimes(1);
    expect(library.add).toHaveBeenCalledWith(
      faHeart,
      faEye,
      faEyeSlash,
      faBars
    );
  });

  it("FontAwesomeIconコンポーネントがグローバルに登録されていること", () => {
    fontawesomePlugin(mockNuxtApp);
    expect(mockNuxtApp.vueApp.component).toHaveBeenCalledWith(
      "font-awesome-icon",
      FontAwesomeIcon
    );
  });
});
