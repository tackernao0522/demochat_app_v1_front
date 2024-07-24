import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import LoginForm from "../../components/LoginForm.vue";
import * as useAuthModule from "../../composables/useAuth";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

vi.mock("../../composables/useAuth");

describe("LoginForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const mockUseAuth = () => {
    const login = vi.fn();
    const errorMessage = ref("");
    const successMessage = ref("");
    const isLoading = ref(false);

    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      login,
      errorMessage,
      successMessage,
      isLoading,
    });

    return { login, errorMessage, successMessage, isLoading };
  };

  const mountLoginForm = () => {
    return mount(LoginForm, {
      global: {
        components: {
          FontAwesomeIcon,
        },
        stubs: {
          FontAwesomeIcon: true,
        },
      },
    });
  };

  it("正しくレンダリングされること", () => {
    mockUseAuth();
    const wrapper = mountLoginForm();
    expect(wrapper.find("h2").text()).toBe("ログイン");
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.find("button").text()).toBe("ログインする");
  });

  it("入力時にv-modelが更新されること", async () => {
    mockUseAuth();
    const wrapper = mountLoginForm();
    const emailInput = wrapper.find('input[type="email"]');
    await emailInput.setValue("test@example.com");
    expect(wrapper.vm.email).toBe("test@example.com");
  });

  it("送信時にローディング状態が表示されること", async () => {
    const { isLoading } = mockUseAuth();
    const wrapper = mountLoginForm();
    isLoading.value = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.find("button").text()).toBe("ログイン中...");
  });

  it("フォーム送信時にログインメソッドが呼ばれること", async () => {
    const { login } = mockUseAuth();
    const wrapper = mountLoginForm();
    await wrapper.find('input[type="email"]').setValue("test@example.com");
    await wrapper.find('input[type="password"]').setValue("password");
    await wrapper.find("form").trigger("submit.prevent");

    expect(login).toHaveBeenCalledWith("test@example.com", "password");
  });

  it("ログイン失敗時にエラーメッセージが表示されること", async () => {
    const { errorMessage } = mockUseAuth();
    const wrapper = mountLoginForm();
    errorMessage.value = "ログインに失敗しました";
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("ログインに失敗しました");
  });

  it("目のアイコンクリック時にパスワードの表示/非表示が切り替わること", async () => {
    mockUseAuth();
    const wrapper = mountLoginForm();
    const passwordInput = wrapper.find('input[type="password"]');
    const eyeIcon = wrapper.findComponent(FontAwesomeIcon);

    await eyeIcon.trigger("click");
    await wrapper.vm.$nextTick();
    expect(passwordInput.attributes("type")).toBe("text");

    await eyeIcon.trigger("click");
    await wrapper.vm.$nextTick();
    expect(passwordInput.attributes("type")).toBe("password");
  });
});
