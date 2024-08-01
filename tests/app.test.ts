import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { nextTick } from "vue";
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
  let removeEventListenerSpy: any;

  beforeEach(async () => {
    // documentのaddEventListenerとremoveEventListenerをスパイ
    addEventListenerSpy = vi.spyOn(document, "addEventListener");
    removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    // 既存のmetaタグをシミュレート
    document.head.innerHTML = '<meta name="viewport" content="old-content">';

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
    await nextTick();
  });

  afterEach(() => {
    wrapper.unmount();
    vi.restoreAllMocks();
    document.head.innerHTML = "";
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

  it("既存のビューポートメタタグが削除されること", () => {
    const oldMetaTag = document.querySelector(
      'meta[name="viewport"][content="old-content"]'
    );
    expect(oldMetaTag).toBeFalsy();
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

  it("タッチ操作でのズームが防止されること", () => {
    const preventDefaultSpy = vi.fn();
    const touchMoveEvent = new TouchEvent("touchmove", {
      touches: [{}, {}] as any,
    });
    Object.defineProperty(touchMoveEvent, "preventDefault", {
      value: preventDefaultSpy,
    });

    const eventListener = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === "touchmove"
    )[1];
    eventListener(touchMoveEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("ダブルタップによるズームが防止されること", async () => {
    vi.useFakeTimers();
    const preventDefaultSpy = vi.fn();
    const touchEndEvent = new TouchEvent("touchend");
    Object.defineProperty(touchEndEvent, "preventDefault", {
      value: preventDefaultSpy,
    });

    const eventListener = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === "touchend"
    )[1];
    eventListener(touchEndEvent);
    vi.advanceTimersByTime(100);
    eventListener(touchEndEvent);

    await nextTick();
    expect(preventDefaultSpy).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("PCでのズームが防止されること", () => {
    const preventDefaultSpy = vi.fn();
    const wheelEvent = new Event("wheel");
    Object.defineProperty(wheelEvent, "ctrlKey", { value: true });
    Object.defineProperty(wheelEvent, "deltaY", { value: 100 });
    Object.defineProperty(wheelEvent, "preventDefault", {
      value: preventDefaultSpy,
    });

    const eventListener = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === "wheel"
    )[1];
    eventListener(wheelEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("キーボードショートカットでのズームが防止されること", () => {
    const preventDefaultSpy = vi.fn();
    const keydownEvent = new KeyboardEvent("keydown", {
      key: "+",
      ctrlKey: true,
    });
    Object.defineProperty(keydownEvent, "preventDefault", {
      value: preventDefaultSpy,
    });

    const eventListener = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === "keydown"
    )[1];
    eventListener(keydownEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("コンポーネントがアンマウントされたときにイベントリスナーが削除されること", async () => {
    const removeEventListenerSpyBefore =
      removeEventListenerSpy.mock.calls.length;

    await wrapper.unmount();
    await nextTick();

    const removeEventListenerSpyAfter =
      removeEventListenerSpy.mock.calls.length;
    expect(removeEventListenerSpyAfter).toBe(removeEventListenerSpyBefore + 5); // 5つのイベントリスナーが削除されることを確認
  });
});
