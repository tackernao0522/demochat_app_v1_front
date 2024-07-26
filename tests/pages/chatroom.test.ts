import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Chatroom from "../../pages/chatroom.vue";
import { createTestingPinia } from "@pinia/testing";
import { createPinia, setActivePinia } from "pinia";

// Nuxtのコンポーネントをモック
const mockAxiosGet = vi.fn();
const mockCableSubscriptionsCreate = vi.fn();
const mockConsumer = {
  subscriptions: {
    create: mockCableSubscriptionsCreate,
  },
};

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $axios: {
      get: mockAxiosGet,
    },
    $cable: mockConsumer,
  }),
}));

// definePageMetaをグローバルにモック
vi.mock("#imports", () => ({
  definePageMeta: vi.fn(),
}));

// useCookiesAuthをモック
const mockGetAuthData = vi.fn();
const mockIsAuthenticated = vi.fn();
vi.mock("../../composables/useCookiesAuth", () => ({
  useCookiesAuth: () => ({
    getAuthData: mockGetAuthData,
    isAuthenticated: mockIsAuthenticated,
  }),
}));

// useRedirectをモック
const mockRedirectToLogin = vi.fn();
vi.mock("../../composables/useRedirect", () => ({
  useRedirect: () => ({
    redirectToLogin: mockRedirectToLogin,
  }),
}));

describe("Chatroom", () => {
  let wrapper: any;
  let mockPerform: any;
  let mockUnsubscribe: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    mockGetAuthData.mockReturnValue({
      user: { id: 1, name: "Test User", email: "test@example.com" },
      token: "mock-token",
      client: "mock-client",
      uid: "mock-uid",
    });
    mockAxiosGet.mockResolvedValue({ data: [] });
    mockIsAuthenticated.mockReturnValue(true);

    // ActionCableのモックをリセット
    mockCableSubscriptionsCreate.mockReset();

    // ActionCableの接続をシミュレート
    mockPerform = vi.fn();
    mockUnsubscribe = vi.fn();
    mockCableSubscriptionsCreate.mockImplementation(() => ({
      perform: mockPerform,
      unsubscribe: mockUnsubscribe,
    }));

    wrapper = mount(Chatroom, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          Navbar: true,
          ChatWindow: true,
          NewChatForm: true,
        },
      },
    });
    vi.clearAllMocks();
  });

  it("コンポーネントが正しくマウントされること", () => {
    expect(wrapper.vm).toBeTruthy();
  });

  it("認証されていない場合、ログインページにリダイレクトされること", async () => {
    mockIsAuthenticated.mockReturnValueOnce(false);
    await mount(Chatroom, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          Navbar: true,
          ChatWindow: true,
          NewChatForm: true,
        },
      },
    });
    expect(mockRedirectToLogin).toHaveBeenCalled();
  });

  it("メッセージが正しく取得されること", async () => {
    const mockMessages = [
      {
        id: 1,
        content: "Hello",
        user_id: 1,
        name: "User 1",
        email: "user1@example.com",
        created_at: "2023-01-01T00:00:00Z",
        likes: [],
      },
      {
        id: 2,
        content: "Hi",
        user_id: 2,
        name: "User 2",
        email: "user2@example.com",
        created_at: "2023-01-01T00:00:01Z",
        likes: [],
      },
    ];
    mockAxiosGet.mockResolvedValueOnce({ data: mockMessages });

    await wrapper.vm.getMessages();

    expect(mockAxiosGet).toHaveBeenCalledWith("/messages");
    expect(wrapper.vm.messages).toEqual(
      mockMessages.map((message) => ({
        ...message,
        sent_by_current_user: message.user_id === 1,
      }))
    );
  });

  it("新しいメッセージを送信できること", async () => {
    const newMessage = "New message";

    // WebSocket接続が確立されたことをシミュレート
    wrapper.vm.isConnected = true;
    wrapper.vm.messageChannel = { perform: mockPerform };

    await wrapper.vm.sendMessage(newMessage);

    expect(mockPerform).toHaveBeenCalledWith("receive", {
      content: newMessage,
      email: "test@example.com",
      timestamp: expect.any(Number),
    });
  });

  it("メッセージが更新されること", () => {
    const updatedMessage = {
      id: 1,
      content: "Updated message",
      user_id: 1,
      name: "User 1",
      email: "user1@example.com",
      created_at: "2023-01-01T00:00:00Z",
      likes: [],
    };
    wrapper.vm.messages = [
      {
        id: 1,
        content: "Original message",
        user_id: 1,
        name: "User 1",
        email: "user1@example.com",
        created_at: "2023-01-01T00:00:00Z",
        likes: [],
      },
    ];

    wrapper.vm.updateMessages(updatedMessage);

    expect(wrapper.vm.messages[0]).toEqual(updatedMessage);
  });

  it("ActionCable経由で新しいメッセージを受信できること", async () => {
    const newMessage = {
      id: 3,
      content: "New message",
      user_id: 2,
      name: "User 2",
      email: "user2@example.com",
      created_at: "2023-01-01T00:00:02Z",
      likes: [],
    };

    // ActionCableのsubscriptionsを模倣
    let connectedCallback;
    let receivedCallback;
    mockCableSubscriptionsCreate.mockImplementation((channel, callbacks) => {
      connectedCallback = callbacks.connected;
      receivedCallback = callbacks.received;
      return {
        perform: mockPerform,
        unsubscribe: mockUnsubscribe,
      };
    });

    // コンポーネントのsetupActionCableメソッドを呼び出す
    await wrapper.vm.setupActionCable();

    // connected コールバックを呼び出す
    connectedCallback();

    // received関数を直接呼び出す
    receivedCallback(newMessage);

    // メッセージが正しく追加されたことを確認
    expect(wrapper.vm.messages).toContainEqual({
      ...newMessage,
      sent_by_current_user: false,
    });
  });
});
