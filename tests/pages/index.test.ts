import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Index from "../../pages/index.vue";
import { createTestingPinia } from "@pinia/testing";
import LoginForm from "../../components/LoginForm.vue";
import SignupForm from "../../components/SignupForm.vue";

// Nuxtのコンポーネントをモック
vi.mock("#imports", () => ({
  definePageMeta: vi.fn(),
}));

// useCookiesAuthをモック
vi.mock("../../composables/useCookiesAuth", () => ({
  useCookiesAuth: () => ({
    isAuthenticated: vi.fn().mockReturnValue(false),
  }),
}));

// useRedirectをモック
vi.mock("../../composables/useRedirect", () => ({
  useRedirect: vi.fn().mockReturnValue({
    redirectToChatroom: vi.fn(),
  }),
}));

describe("Index", () => {
  let wrapper: any;

  beforeEach(async () => {
    wrapper = mount(Index, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          LoginForm: true,
          SignupForm: true,
          Teleport: true,
          ClientOnly: {
            template: "<div><slot /></div>",
          },
        },
      },
    });
    await flushPromises();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it("コンポーネントが正しくマウントされること", () => {
    expect(wrapper.vm).toBeTruthy();
  });

  it("初期状態で新規登録ボタンが表示されること", async () => {
    await wrapper.vm.$nextTick();
    const button = wrapper.find("button.btn-primary");
    expect(button.exists()).toBe(true);
    expect(button.text()).toBe("新規登録");
    expect(wrapper.text()).toContain("ようこそ！");
    expect(wrapper.text()).toContain(
      "ようこそ！新規登録アカウントをお持ちの方は  こちら  をクリック"
    );
  });

  it("フォームの切り替えボタンをクリックすると、ログインボタンが表示されること", async () => {
    const toggleButton = wrapper.find("span.text-blue-500.cursor-pointer");
    expect(toggleButton.exists()).toBe(true);
    await toggleButton.trigger("click");
    await wrapper.vm.$nextTick();
    const loginButton = wrapper.find("button.btn-primary");
    expect(loginButton.text()).toBe("ログイン");
    expect(wrapper.text()).toContain(
      "ようこそ！ログイン初めての方は  こちら  をクリック"
    );
  });

  it("新規登録ボタンをクリックすると、SignupFormコンポーネントが表示されること", async () => {
    const button = wrapper.find("button.btn-primary");
    await button.trigger("click");
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(SignupForm).exists()).toBe(true);
  });

  it("ログインボタンをクリックすると、LoginFormコンポーネントが表示されること", async () => {
    const toggleButton = wrapper.find("span.text-blue-500.cursor-pointer");
    await toggleButton.trigger("click");
    await wrapper.vm.$nextTick();
    const loginButton = wrapper.find("button.btn-primary");
    await loginButton.trigger("click");
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(LoginForm).exists()).toBe(true);
  });

  it("モーダルが開閉できること", async () => {
    // モーダルを開く
    const openButton = wrapper.find("button.btn-primary");
    await openButton.trigger("click");
    await wrapper.vm.$nextTick();

    // showModalの値を直接チェック
    expect(wrapper.vm.state.showModal).toBe(true);

    // モーダルが実際にDOMに存在することを確認
    const modal = wrapper.find(".fixed.inset-0");
    expect(modal.exists()).toBe(true);

    // モーダルを閉じる
    const closeButton = modal.find("button");
    expect(closeButton.exists()).toBe(true);
    await closeButton.trigger("click");
    await wrapper.vm.$nextTick();

    // showModalの値を再度チェック
    expect(wrapper.vm.state.showModal).toBe(false);

    // モーダルがDOMから削除されたことを確認
    expect(wrapper.find(".fixed.inset-0").exists()).toBe(false);
  });

  it("v-ifの動作を確認する", async () => {
    expect(wrapper.html()).toContain("新規登録");

    const toggleButton = wrapper.find("span.text-blue-500.cursor-pointer");
    await toggleButton.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.html()).toContain("ログイン");
  });

  it("openModalとcloseModalが正しく動作すること", async () => {
    // openModalを呼び出す
    await wrapper.vm.openModal();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.state.showModal).toBe(true);

    // closeModalを呼び出す
    await wrapper.vm.closeModal();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.state.showModal).toBe(false);
  });

  it("toggleFormが正しく動作すること", async () => {
    expect(wrapper.vm.state.shouldShowLoginForm).toBe(false);
    await wrapper.vm.toggleForm();
    expect(wrapper.vm.state.shouldShowLoginForm).toBe(true);
    await wrapper.vm.toggleForm();
    expect(wrapper.vm.state.shouldShowLoginForm).toBe(false);
  });
});
