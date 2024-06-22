import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import FormField from "../../components/FormField.vue";

describe("FormField", () => {
  it("正しいタイプとプレースホルダーで入力をレンダリングする", () => {
    const wrapper = mount(FormField, {
      props: {
        type: "email",
        placeholder: "メールアドレスを入力してください",
        modelValue: "",
      },
    });

    const input = wrapper.find("input");
    expect(input.exists()).toBe(true);
    expect(input.attributes("type")).toBe("email");
    expect(input.attributes("placeholder")).toBe(
      "メールアドレスを入力してください"
    );
  });

  it("inputのtypeがpasswordのとき、正しいタイプでレンダリングする", () => {
    const wrapper = mount(FormField, {
      props: {
        type: "password",
        placeholder: "パスワードを入力してください",
        modelValue: "",
      },
    });

    const input = wrapper.find("input");
    expect(input.attributes("type")).toBe("password");
  });

  it("inputの初期値が設定されている場合に正しくレンダリングする", () => {
    const wrapper = mount(FormField, {
      props: {
        type: "text",
        placeholder: "名前を入力してください",
        modelValue: "テストユーザー",
      },
    });

    const input = wrapper.find("input");
    expect(input.element.value).toBe("テストユーザー");
  });

  it("入力時にupdate:modelValueイベントを発行する", async () => {
    const wrapper = mount(FormField, {
      props: {
        modelValue: "",
      },
    });

    const input = wrapper.find("input");
    await input.setValue("test@example.com");

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    expect(wrapper.emitted("update:modelValue")[0]).toEqual([
      "test@example.com",
    ]);
  });
});
