import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import Navbar from "../../components/Navbar.vue";

// モックの作成
const mockRouter = {
  push: vi.fn(),
};

const mockAxios = {
  delete: vi.fn(),
};

const mockUseNuxtApp = vi.fn().mockReturnValue({
  $axios: mockAxios,
});

// #app のモックを最初に定義
vi.mock("#app", () => ({
  useRouter: () => mockRouter,
  useNuxtApp: () => mockUseNuxtApp(),
}));

// useLogout のモックを作成
const mockLogout = vi.fn();
const mockError = ref("");

vi.mock("../../composables/useLogout", () => ({
  useLogout: () => ({
    logout: mockLogout,
    error: mockError,
  }),
}));

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "localStorage", { value: mockLocalStorage });
    mockLocalStorage.getItem.mockImplementation((key) => {
      const storage = {
        name: "John Doe",
        uid: "john@example.com",
        "access-token": "token123",
        client: "client123",
      };
      return storage[key] || null;
    });
    mockError.value = "";
  });

  it("正しくレンダリングされる", async () => {
    const wrapper = mount(Navbar);
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("こんにちは、John Doeさん");
    expect(wrapper.text()).toContain("現在、john@example.comでログイン中です");
  });

  it("ログアウト成功時にlocalStorageがクリアされ、リダイレクトされる", async () => {
    const wrapper = mount(Navbar);
    mockLogout.mockResolvedValueOnce();

    await wrapper.find("button").trigger("click");
    await wrapper.vm.$nextTick();

    expect(mockLogout).toHaveBeenCalled();
    expect(mockError.value).toBe("");
  });

  it("ログアウト失敗時にエラーメッセージが表示される", async () => {
    const wrapper = mount(Navbar);

    // エラーを設定
    mockError.value = "ログアウトできませんでした";

    // コンポーネントの更新を待つ
    await wrapper.vm.$nextTick();

    // エラーメッセージが表示されていることを確認
    expect(wrapper.find(".text-red-500").text()).toBe(
      "ログアウトできませんでした"
    );
  });
});
