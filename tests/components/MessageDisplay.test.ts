import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import MessageDisplay from "../../components/MessageDisplay.vue";

describe("MessageDisplay", () => {
  it("エラーメッセージを正しくレンダリングする", () => {
    const wrapper = mount(MessageDisplay, {
      props: {
        message: "エラーが発生しました",
        isError: true,
      },
    });
    expect(wrapper.text()).toBe("エラーが発生しました");
    expect(wrapper.classes()).toContain("text-red-500");
  });

  it("成功メッセージを正しくレンダリングする", () => {
    const wrapper = mount(MessageDisplay, {
      props: {
        message: "操作が成功しました",
        isError: false,
      },
    });
    expect(wrapper.text()).toBe("操作が成功しました");
    expect(wrapper.classes()).toContain("text-green-500");
  });

  it("メッセージが空の場合はレンダリングしない", () => {
    const wrapper = mount(MessageDisplay, {
      props: {
        message: "",
        isError: false,
      },
    });
    expect(wrapper.text()).toBe("");
  });

  it("メッセージが動的に変わる場合に正しくレンダリングする", async () => {
    const wrapper = mount(MessageDisplay, {
      props: {
        message: "最初のメッセージ",
        isError: false,
      },
    });
    expect(wrapper.text()).toBe("最初のメッセージ");
    expect(wrapper.classes()).toContain("text-green-500");

    await wrapper.setProps({ message: "新しいメッセージ", isError: true });
    expect(wrapper.text()).toBe("新しいメッセージ");
    expect(wrapper.classes()).toContain("text-red-500");
  });
});
