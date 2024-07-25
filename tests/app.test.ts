import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import App from "../app.vue";

// Nuxtのコンポーネントをモック
vi.mock("#imports", () => ({
  definePageMeta: vi.fn(),
}));

// NuxtPageコンポーネントをモック
const NuxtPage = {
  name: "NuxtPage",
  template: "<div>Mocked Page Content</div>",
};

describe("App", () => {
  let wrapper: any;
  let addEventListenerSpy: any;

  beforeEach(async () => {
    // documentのaddEventListenerをスパイ
    addEventListenerSpy = vi.spyOn(document, "addEventListener");

    wrapper = mount(App, {
      global: {
        stubs: {
          NuxtPage: NuxtPage,
        },
        components: {
          NuxtPage,
        },
      },
    });
    await flushPromises();
  });

  afterEach(() => {
    wrapper.unmount();
    vi.restoreAllMocks();
  });

  it("コンポーネントが正しくマウントされること", () => {
    expect(wrapper.vm).toBeTruthy();
  });

  it("NuxtPageコンポーネントが含まれていること", () => {
    expect(wrapper.findComponent({ name: "NuxtPage" }).exists()).toBe(true);
  });

  it("ビューポートのメタタグが正しく設定されていること", () => {
    const metaTag = document.querySelector('meta[name="viewport"]');
    expect(metaTag).toBeTruthy();
    expect(metaTag?.getAttribute("content")).toBe(
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    );
  });

  it("ズーム防止のイベントリスナーが追加されていること", () => {
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "touchmove",
      expect.any(Function),
      { passive: false }
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "touchstart",
      expect.any(Function),
      { passive: false }
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "touchend",
      expect.any(Function),
      { passive: false }
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "wheel",
      expect.any(Function),
      { passive: false }
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
  });
});
