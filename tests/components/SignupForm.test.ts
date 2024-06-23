import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import SignupForm from "../../components/SignupForm.vue";
import FormField from "../../components/FormField.vue";

const mockRouter = {
  push: vi.fn(),
};

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $axios: {
      post: vi.fn(),
    },
  }),
  useRouter: () => mockRouter,
}));

describe("SignupForm", () => {
  it("フォームが正しくレンダリングされる", () => {
    const wrapper = mount(SignupForm);
    expect(wrapper.find("h2").text()).toBe("アカウントを登録");
    expect(wrapper.findAllComponents(FormField)).toHaveLength(4);
    expect(wrapper.find("button").text()).toBe("登録する");
  });

  it("フォームを送信し、サインアップ成功を処理する", async () => {
    const wrapper = mount(SignupForm);

    await wrapper.find('input[placeholder="名前"]').setValue("John Doe");
    await wrapper
      .find('input[placeholder="メールアドレス"]')
      .setValue("john@example.com");
    await wrapper
      .find('input[placeholder="パスワード"]')
      .setValue("password123");
    await wrapper
      .find('input[placeholder="パスワード(確認用)"]')
      .setValue("password123");

    const mockAxios = wrapper.vm.$axios;
    mockAxios.post.mockResolvedValueOnce({
      data: { message: "Signup successful" },
    });

    await wrapper.find("form").trigger("submit");

    expect(mockAxios.post).toHaveBeenCalledWith("/auth", {
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      password_confirmation: "password123",
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.find(".text-green-500").text()).toBe(
      "アカウントが登録されました。"
    );

    // 新たに追加したリダイレクトの確認
    expect(mockRouter.push).toHaveBeenCalledWith("/Chatroom");
  });

  it("サインアップエラーを処理する", async () => {
    const wrapper = mount(SignupForm);

    await wrapper.find('input[placeholder="名前"]').setValue("John Doe");
    await wrapper
      .find('input[placeholder="メールアドレス"]')
      .setValue("john@example.com");
    await wrapper
      .find('input[placeholder="パスワード"]')
      .setValue("password123");
    await wrapper
      .find('input[placeholder="パスワード(確認用)"]')
      .setValue("password123");

    const mockAxios = wrapper.vm.$axios;
    mockAxios.post.mockRejectedValueOnce({
      response: { data: { errors: ["Email already taken"] } },
    });

    await wrapper.find("form").trigger("submit");

    await wrapper.vm.$nextTick();
    expect(wrapper.find(".text-red-500").text()).toBe(
      "アカウントを登録できませんでした。"
    );
  });

  it("入力フィールドが空の場合にエラーメッセージを表示する", async () => {
    const wrapper = mount(SignupForm);

    await wrapper.find("form").trigger("submit");

    await wrapper.vm.$nextTick();
    expect(wrapper.find(".text-red-500").text()).toBe(
      "名前、メールアドレス、パスワードを入力してください。"
    );
  });

  it("パスワードと確認用パスワードが一致しない場合にエラーメッセージを表示する", async () => {
    const wrapper = mount(SignupForm);

    await wrapper.find('input[placeholder="名前"]').setValue("John Doe");
    await wrapper
      .find('input[placeholder="メールアドレス"]')
      .setValue("john@example.com");
    await wrapper
      .find('input[placeholder="パスワード"]')
      .setValue("password123");
    await wrapper
      .find('input[placeholder="パスワード(確認用)"]')
      .setValue("password456");

    await wrapper.find("form").trigger("submit");

    await wrapper.vm.$nextTick();
    expect(wrapper.find(".text-red-500").text()).toBe(
      "パスワードと確認用パスワードが一致しません。"
    );
  });

  it("サーバーが応答しない場合のエラーハンドリングを確認する", async () => {
    const wrapper = mount(SignupForm);

    await wrapper.find('input[placeholder="名前"]').setValue("John Doe");
    await wrapper
      .find('input[placeholder="メールアドレス"]')
      .setValue("john@example.com");
    await wrapper
      .find('input[placeholder="パスワード"]')
      .setValue("password123");
    await wrapper
      .find('input[placeholder="パスワード(確認用)"]')
      .setValue("password123");

    const mockAxios = wrapper.vm.$axios;
    mockAxios.post.mockRejectedValueOnce(new Error("Network Error"));

    await wrapper.find("form").trigger("submit");

    await wrapper.vm.$nextTick();
    expect(wrapper.find(".text-red-500").text()).toBe(
      "アカウントを登録できませんでした。"
    );
  });

  it("サインアップ成功時に成功メッセージが表示される", async () => {
    const wrapper = mount(SignupForm);

    await wrapper.find('input[placeholder="名前"]').setValue("John Doe");
    await wrapper
      .find('input[placeholder="メールアドレス"]')
      .setValue("john@example.com");
    await wrapper
      .find('input[placeholder="パスワード"]')
      .setValue("password123");
    await wrapper
      .find('input[placeholder="パスワード(確認用)"]')
      .setValue("password123");

    const mockAxios = wrapper.vm.$axios;
    mockAxios.post.mockResolvedValueOnce({
      data: { message: "Signup successful" },
    });

    await wrapper.find("form").trigger("submit");

    await wrapper.vm.$nextTick();
    expect(wrapper.find(".text-green-500").text()).toBe(
      "アカウントが登録されました。"
    );
  });

  it("フォーム送信後、入力フィールドがリセットされる", async () => {
    const wrapper = mount(SignupForm);

    await wrapper.find('input[placeholder="名前"]').setValue("John Doe");
    await wrapper
      .find('input[placeholder="メールアドレス"]')
      .setValue("john@example.com");
    await wrapper
      .find('input[placeholder="パスワード"]')
      .setValue("password123");
    await wrapper
      .find('input[placeholder="パスワード(確認用)"]')
      .setValue("password123");

    const mockAxios = wrapper.vm.$axios;
    mockAxios.post.mockResolvedValueOnce({
      data: { message: "Signup successful" },
    });

    await wrapper.find("form").trigger("submit");

    await wrapper.vm.$nextTick();
    expect(wrapper.find('input[placeholder="名前"]').element.value).toBe("");
    expect(
      wrapper.find('input[placeholder="メールアドレス"]').element.value
    ).toBe("");
    expect(wrapper.find('input[placeholder="パスワード"]').element.value).toBe(
      ""
    );
    expect(
      wrapper.find('input[placeholder="パスワード(確認用)"]').element.value
    ).toBe("");
  });
});
