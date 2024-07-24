import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SignupForm from "../../components/SignupForm.vue";
import { createTestingPinia } from "@pinia/testing";
import { createPinia, setActivePinia } from "pinia";

// Nuxtのコンポーネントをモック
const mockAxiosPost = vi.fn();
vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $axios: {
      post: mockAxiosPost,
    },
  }),
}));

// useRedirectとuseCookiesAuthをモック
const mockRedirectToChatroom = vi.fn();
vi.mock("../../composables/useRedirect", () => ({
  useRedirect: () => ({
    redirectToChatroom: mockRedirectToChatroom,
  }),
}));

const mockSaveAuthData = vi.fn();
vi.mock("../../composables/useCookiesAuth", () => ({
  useCookiesAuth: () => ({
    saveAuthData: mockSaveAuthData,
  }),
}));

describe("SignupForm", () => {
  let wrapper: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    wrapper = mount(SignupForm, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          FontAwesomeIcon: true,
        },
      },
    });
    // モックをリセット
    vi.clearAllMocks();
  });

  it("コンポーネントが正しくマウントされること", () => {
    expect(wrapper.vm).toBeTruthy();
  });

  it("フォームフィールドが正しく表示されること", () => {
    expect(wrapper.find('input[placeholder="名前"]').exists()).toBe(true);
    expect(wrapper.find('input[placeholder="メールアドレス"]').exists()).toBe(
      true
    );
    expect(wrapper.find('input[placeholder="パスワード"]').exists()).toBe(true);
    expect(
      wrapper.find('input[placeholder="パスワード(確認用)"]').exists()
    ).toBe(true);
  });

  it("パスワードの表示/非表示を切り替えられること", async () => {
    const passwordInput = wrapper.find('input[placeholder="パスワード"]');
    expect(passwordInput.attributes("type")).toBe("password");

    await wrapper.vm.togglePasswordVisibility();
    expect(passwordInput.attributes("type")).toBe("text");

    await wrapper.vm.togglePasswordVisibility();
    expect(passwordInput.attributes("type")).toBe("password");
  });

  it("フォームの送信時にsignup関数が呼ばれること", async () => {
    mockAxiosPost.mockResolvedValue({
      data: { data: { id: 1, name: "Test User", email: "test@example.com" } },
      headers: { "access-token": "token", client: "client", uid: "uid" },
    });

    await wrapper.find('input[placeholder="名前"]').setValue("Test User");
    await wrapper
      .find('input[placeholder="メールアドレス"]')
      .setValue("test@example.com");
    await wrapper
      .find('input[placeholder="パスワード"]')
      .setValue("password123");
    await wrapper
      .find('input[placeholder="パスワード(確認用)"]')
      .setValue("password123");

    await wrapper.find("form").trigger("submit.prevent");

    expect(mockAxiosPost).toHaveBeenCalledWith("/auth", {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      password_confirmation: "password123",
    });
  });

  it("バリデーションエラーが表示されること", async () => {
    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.text()).toContain(
      "名前、メールアドレス、パスワードを入力してください。"
    );
  });

  it("パスワードと確認用パスワードが一致しない場合にエラーが表示されること", async () => {
    await wrapper.find('input[placeholder="名前"]').setValue("Test User");
    await wrapper
      .find('input[placeholder="メールアドレス"]')
      .setValue("test@example.com");
    await wrapper
      .find('input[placeholder="パスワード"]')
      .setValue("password123");
    await wrapper
      .find('input[placeholder="パスワード(確認用)"]')
      .setValue("password456");

    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.text()).toContain(
      "パスワードと確認用パスワードが一致しません。"
    );
  });

  it("登録成功時にリダイレクトされること", async () => {
    mockAxiosPost.mockResolvedValue({
      data: { data: { id: 1, name: "Test User", email: "test@example.com" } },
      headers: { "access-token": "token", client: "client", uid: "uid" },
    });

    await wrapper.find('input[placeholder="名前"]').setValue("Test User");
    await wrapper
      .find('input[placeholder="メールアドレス"]')
      .setValue("test@example.com");
    await wrapper
      .find('input[placeholder="パスワード"]')
      .setValue("password123");
    await wrapper
      .find('input[placeholder="パスワード(確認用)"]')
      .setValue("password123");

    await wrapper.find("form").trigger("submit.prevent");

    expect(mockAxiosPost).toHaveBeenCalled();
    expect(mockSaveAuthData).toHaveBeenCalled();
    expect(mockRedirectToChatroom).toHaveBeenCalled();
  });
});
