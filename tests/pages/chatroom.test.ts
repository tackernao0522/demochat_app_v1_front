import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
    mockIsAuthenticated.mockResolvedValue(true);

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
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("コンポーネントが正しくマウントされること", () => {
    expect(wrapper.vm).toBeTruthy();
  });

  it("認証されていない場合、ようこそページにリダイレクトされること", async () => {
    mockIsAuthenticated.mockResolvedValueOnce(false);
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
    await flushPromises();
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

    expect(mockAxiosGet).toHaveBeenCalledWith("/messages", {
      headers: {
        "access-token": "mock-token",
        client: "mock-client",
        uid: "mock-uid",
      },
    });
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

  it("WebSocket接続が切断された場合、再接続が試みられること", async () => {
    vi.useFakeTimers();
    let disconnectedCallback;
    mockCableSubscriptionsCreate.mockImplementation((channel, callbacks) => {
      disconnectedCallback = callbacks.disconnected;
      return {
        perform: mockPerform,
        unsubscribe: mockUnsubscribe,
      };
    });

    await wrapper.vm.setupActionCable();
    disconnectedCallback();

    expect(wrapper.vm.isConnected).toBe(false);
    expect(wrapper.vm.reconnectAttempts).toBe(1);

    vi.advanceTimersByTime(2000);
    expect(mockCableSubscriptionsCreate).toHaveBeenCalledTimes(3); // 初期接続 + 2回の再接続

    vi.useRealTimers();
  });

  // 修正: ペンディングメッセージのテストケースを簡略化
  it("ペンディングメッセージが正しく処理されること", async () => {
    const pendingMessage = {
      content: "Pending message",
      email: "test@example.com",
      timestamp: Date.now(),
    };
    wrapper.vm.pendingMessages = [pendingMessage];
    wrapper.vm.isConnected = true;
    wrapper.vm.messageChannel = { perform: mockPerform };

    await wrapper.vm.sendPendingMessages();

    expect(mockPerform).toHaveBeenCalledWith("receive", pendingMessage);
    expect(wrapper.vm.pendingMessages).toHaveLength(0);
  });

  it("エラー時にアラートが表示されること", async () => {
    const mockAlert = vi.spyOn(window, "alert").mockImplementation(() => {});
    mockAxiosGet.mockRejectedValueOnce(new Error("API Error"));

    await wrapper.vm.getMessages();

    expect(mockAlert).toHaveBeenCalledWith(
      "メッセージの取得に失敗しました。ページをリロードしてください。"
    );
    mockAlert.mockRestore();
  });

  it("WebSocketの接続状態が変更されたときにログが出力されること", async () => {
    const loggerInfoSpy = vi.spyOn(console, "log");

    wrapper.vm.isConnected = true;
    await wrapper.vm.$nextTick();
    expect(loggerInfoSpy).toHaveBeenCalledWith("WebSocket connected");

    wrapper.vm.isConnected = false;
    await wrapper.vm.$nextTick();
    expect(loggerInfoSpy).toHaveBeenCalledWith("WebSocket disconnected");

    loggerInfoSpy.mockRestore();
  });
});
