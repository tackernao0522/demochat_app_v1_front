import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
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

// localStorageのモック
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

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
      data: { data: { name: "Test User" } },
      headers: {
        "access-token": "token123",
        client: "client123",
        uid: "uid123",
      },
    });

    await wrapper.find("form").trigger("submit");
    await flushPromises();
    await wrapper.vm.$nextTick();

    await new Promise((resolve) => setTimeout(resolve, 50));

    const successMessage = wrapper.find('[data-testid="success-message"]');
    expect(successMessage.exists()).toBe(true);
    expect(successMessage.text()).toBe("ログインに成功しました！");

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(wrapper.find('[data-testid="success-message"]').exists()).toBe(
      false
    );
    expect(successMessage.exists()).toBe(true);
    expect(successMessage.text()).toBe("ログインに成功しました！");

    // 新たに追加したlocalStorageの確認
    expect(localStorage.getItem("access-token")).toBe("token123");
    expect(localStorage.getItem("client")).toBe("client123");
    expect(localStorage.getItem("uid")).toBe("uid123");
    expect(localStorage.getItem("name")).toBe("Test User");

    // 新たに追加したリダイレクトの確認
    expect(mockRouter.push).toHaveBeenCalledWith("/chatroom");
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

  it("ログイン成功時にlocalStorageに値を保存する", async () => {
    const wrapper = mount(LoginForm);

    await wrapper.find('input[type="email"]').setValue("test@example.com");
    await wrapper.find('input[type="password"]').setValue("password123");

    const mockAxios = wrapper.vm.$axios;
    mockAxios.post.mockResolvedValueOnce({
      data: { data: { name: "Test User" } },
      headers: {
        "access-token": "token123",
        client: "client123",
        uid: "uid123",
      },
    });

    await wrapper.find("form").trigger("submit");

    await wrapper.vm.$nextTick();

    // localStorageに値が保存されたことを確認
    expect(localStorage.getItem("access-token")).toBe("token123");
    expect(localStorage.getItem("client")).toBe("client123");
    expect(localStorage.getItem("uid")).toBe("uid123");
    expect(localStorage.getItem("name")).toBe("Test User");
  });

  it("フォーム送信後、入力フィールドがリセットされる", async () => {
    const wrapper = mount(LoginForm);

    await wrapper.find('input[type="email"]').setValue("test@example.com");
    await wrapper.find('input[type="password"]').setValue("password123");

    const mockAxios = wrapper.vm.$axios;
    mockAxios.post.mockResolvedValueOnce({
      data: { data: { name: "Test User" } },
      headers: {
        "access-token": "token123",
        client: "client123",
        uid: "uid123",
      },
    });

    await wrapper.find("form").trigger("submit");
    await flushPromises();
    await wrapper.vm.$nextTick();

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(wrapper.find('input[type="email"]').element.value).toBe("");
    expect(wrapper.find('input[type="password"]').element.value).toBe("");
  });
});
