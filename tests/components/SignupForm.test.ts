import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
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

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

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
      data: { data: { name: "John Doe" } },
      headers: {
        "access-token": "token123",
        client: "client123",
        uid: "john@example.com",
      },
    });

    await wrapper.find("form").trigger("submit");
    await flushPromises();

    await wrapper.vm.$nextTick();

    expect(localStorage.getItem("access-token")).toBe("token123");
    expect(localStorage.getItem("client")).toBe("client123");
    expect(localStorage.getItem("uid")).toBe("john@example.com");
    expect(localStorage.getItem("name")).toBe("John Doe");

    // リダイレクトの確認
    expect(mockRouter.push).toHaveBeenCalledWith("/chatroom");
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
    expect(wrapper.find(".text-red-500").text()).toBe("Email already taken");
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

  it("サインアップ成功時にlocalStorageに値を保存する", async () => {
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
      data: { data: { name: "John Doe" } },
      headers: {
        "access-token": "token123",
        client: "client123",
        uid: "john@example.com",
      },
    });

    await wrapper.find("form").trigger("submit");

    await wrapper.vm.$nextTick();

    // localStorageに値が保存されたことを確認
    expect(localStorage.getItem("access-token")).toBe("token123");
    expect(localStorage.getItem("client")).toBe("client123");
    expect(localStorage.getItem("uid")).toBe("john@example.com");
    expect(localStorage.getItem("name")).toBe("John Doe");
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
      data: { data: { name: "John Doe" } },
      headers: {
        "access-token": "token123",
        client: "client123",
        uid: "john@example.com",
      },
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

  it("サインアップ成功後にリダイレクトされない場合の処理を確認する", async () => {
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
      data: { data: { name: "John Doe" } },
      headers: {
        "access-token": "token123",
        client: "client123",
        uid: "john@example.com",
      },
    });

    // リダイレクトしないようにモックする
    mockRouter.push.mockImplementationOnce(() => {
      throw new Error("Navigation aborted");
    });

    await wrapper.find("form").trigger("submit");
    await flushPromises();
    await wrapper.vm.$nextTick();

    // localStorageに値が保存されたことを確認
    expect(localStorage.getItem("access-token")).toBe("token123");
    expect(localStorage.getItem("client")).toBe("client123");
    expect(localStorage.getItem("uid")).toBe("john@example.com");
    expect(localStorage.getItem("name")).toBe("John Doe");

    // リダイレクトが試みられたが失敗したことを確認
    expect(mockRouter.push).toHaveBeenCalledWith("/chatroom");
  });
});
