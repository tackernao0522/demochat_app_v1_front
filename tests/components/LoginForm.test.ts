import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import LoginForm from "../../components/LoginForm.vue";
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

describe("LoginForm", () => {
  it("フォームが正しくレンダリングされる", () => {
    const wrapper = mount(LoginForm);
    expect(wrapper.find("h2").text()).toBe("ログイン");
    expect(wrapper.findAllComponents(FormField)).toHaveLength(2);
    expect(wrapper.find("button").text()).toBe("ログインする");
  });

  it("フォームを送信し、ログイン成功を処理する", async () => {
    const wrapper = mount(LoginForm);

    await wrapper.find('input[type="email"]').setValue("test@example.com");
    await wrapper.find('input[type="password"]').setValue("password123");

    const mockAxios = wrapper.vm.$axios;
    mockAxios.post.mockResolvedValueOnce({
      data: { message: "Login successful" },
    });

    await wrapper.find("form").trigger("submit");

    expect(mockAxios.post).toHaveBeenCalledWith("/auth/sign_in", {
      email: "test@example.com",
      password: "password123",
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.find(".text-green-500").text()).toBe(
      "ログインに成功しました！"
    );

    // 新たに追加したリダイレクトの確認
    expect(mockRouter.push).toHaveBeenCalledWith("/Chatroom");
  });

  it("ログインエラーを処理する", async () => {
    const wrapper = mount(LoginForm);

    await wrapper.find('input[type="email"]').setValue("test@example.com");
    await wrapper.find('input[type="password"]').setValue("password123");

    const mockAxios = wrapper.vm.$axios;
    mockAxios.post.mockRejectedValueOnce({
      response: { data: { errors: ["Invalid credentials"] } },
    });

    await wrapper.find("form").trigger("submit");

    await wrapper.vm.$nextTick();
    expect(wrapper.find(".text-red-500").text()).toBe("Invalid credentials");
  });

  it("入力フィールドが空の場合にエラーメッセージを表示する", async () => {
    const wrapper = mount(LoginForm);

    await wrapper.find("form").trigger("submit");

    await wrapper.vm.$nextTick();
    expect(wrapper.find(".text-red-500").text()).toBe(
      "メールアドレスとパスワードを入力してください。"
    );
  });

  it("サーバーが応答しない場合のエラーハンドリングを確認する", async () => {
    const wrapper = mount(LoginForm);

    await wrapper.find('input[type="email"]').setValue("test@example.com");
    await wrapper.find('input[type="password"]').setValue("password123");

    const mockAxios = wrapper.vm.$axios;
    mockAxios.post.mockRejectedValueOnce(new Error("Network Error"));

    await wrapper.find("form").trigger("submit");

    await wrapper.vm.$nextTick();
    expect(wrapper.find(".text-red-500").text()).toBe(
      "ログイン中にエラーが発生しました。"
    );
  });

  // 新たなテストケースの追加
  it("ログイン成功時に成功メッセージが表示される", async () => {
    const wrapper = mount(LoginForm);

    await wrapper.find('input[type="email"]').setValue("test@example.com");
    await wrapper.find('input[type="password"]').setValue("password123");

    const mockAxios = wrapper.vm.$axios;
    mockAxios.post.mockResolvedValueOnce({
      data: { message: "Login successful" },
    });

    await wrapper.find("form").trigger("submit");

    await wrapper.vm.$nextTick();
    expect(wrapper.find(".text-green-500").text()).toBe(
      "ログインに成功しました！"
    );
  });

  it("フォーム送信後、入力フィールドがリセットされる", async () => {
    const wrapper = mount(LoginForm);

    await wrapper.find('input[type="email"]').setValue("test@example.com");
    await wrapper.find('input[type="password"]').setValue("password123");

    const mockAxios = wrapper.vm.$axios;
    mockAxios.post.mockResolvedValueOnce({
      data: { message: "Login successful" },
    });

    await wrapper.find("form").trigger("submit");

    await wrapper.vm.$nextTick();
    expect(wrapper.find('input[type="email"]').element.value).toBe("");
    expect(wrapper.find('input[type="password"]').element.value).toBe("");
  });
});
