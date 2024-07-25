import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ChatWindow from "../../components/ChatWindow.vue";
import { useCookiesAuth } from "../../composables/useCookiesAuth";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

vi.mock("../../composables/useCookiesAuth", () => ({
  useCookiesAuth: vi.fn(() => ({
    getAuthData: vi.fn(() => ({
      user: { id: 1, email: "test@example.com", name: "Test User" },
      token: "mock-token",
      client: "mock-client",
      uid: "mock-uid",
    })),
  })),
}));

vi.mock("date-fns", async () => {
  const actual = await vi.importActual("date-fns");
  return {
    ...actual,
    formatDistanceToNow: vi.fn().mockReturnValue("1年以上前"),
  };
});

vi.mock("date-fns/locale", () => ({
  ja: {},
}));

vi.mock("@fortawesome/vue-fontawesome", () => ({
  FontAwesomeIcon: {
    name: "FontAwesomeIcon",
    template: "<span />",
  },
}));

vi.mock("#app", () => ({
  useNuxtApp: vi.fn(() => ({
    $axios: {
      post: vi.fn().mockResolvedValue({ data: { id: 1 } }),
    },
  })),
}));

describe("ChatWindow", () => {
  const messages = [
    {
      id: 1,
      user_id: 1,
      name: "User 1",
      content: "Hello",
      email: "user1@example.com",
      created_at: "2023-01-01T00:00:00Z",
      likes: [],
    },
    {
      id: 2,
      user_id: 2,
      name: "User 2",
      content: "Hi",
      email: "user2@example.com",
      created_at: "2023-01-01T00:00:01Z",
      likes: [],
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  const mountChatWindow = (props = {}) => {
    return mount(ChatWindow, {
      props: { messages, ...props },
      global: {
        stubs: {
          FontAwesomeIcon: true,
        },
      },
    });
  };

  it("メッセージが正しくレンダリングされること", () => {
    const wrapper = mountChatWindow();
    expect(wrapper.findAll(".message-wrapper")).toHaveLength(2);
    expect(wrapper.text()).toContain("Hello");
    expect(wrapper.text()).toContain("Hi");
  });

  it("送信済みと受信済みのメッセージに正しいクラスが適用されること", () => {
    const wrapper = mountChatWindow();
    const messageWrappers = wrapper.findAll(".message-wrapper");
    expect(messageWrappers[0].classes()).toContain("sent");
    expect(messageWrappers[1].classes()).toContain("received");
  });

  it("日付が正しくフォーマットされること", () => {
    const wrapper = mountChatWindow();
    expect(wrapper.text()).toContain("1年以上前");
  });

  it("いいねがないメッセージではいいねボタンが表示されないこと", () => {
    const wrapper = mountChatWindow();
    expect(wrapper.findAll(".like-button")).toHaveLength(0);
  });

  it("いいねがあるメッセージではいいねボタンが表示されること", () => {
    const messagesWithLikes = [
      { ...messages[0], likes: [{ id: 1, email: "liker@example.com" }] },
    ];
    const wrapper = mountChatWindow({ messages: messagesWithLikes });
    expect(wrapper.findAll(".like-button")).toHaveLength(1);
  });

  it("いいねアクションが正しく処理されること", async () => {
    const messagesWithLikes = [
      { ...messages[0], likes: [{ id: 1, email: "liker@example.com" }] },
    ];
    const wrapper = mountChatWindow({ messages: messagesWithLikes });
    const createLikeSpy = vi.spyOn(wrapper.vm, "createLike");
    await wrapper.find(".like-button").trigger("click");
    expect(createLikeSpy).toHaveBeenCalled();
  });

  it("いいねの数が正しく表示されること", async () => {
    const messagesWithLikes = [
      { ...messages[0], likes: [{ id: 1, email: "liker@example.com" }] },
    ];
    const wrapper = mountChatWindow({ messages: messagesWithLikes });
    expect(wrapper.find(".like-count").text()).toBe("1");
  });

  it("createLike呼び出し時にupdateMessagesイベントが発行されること", async () => {
    const wrapper = mountChatWindow();
    const message = { ...messages[0], likes: [] };

    await wrapper.vm.createLike(message);

    await flushPromises();

    expect(wrapper.emitted()).toHaveProperty("updateMessages");
    expect(wrapper.emitted().updateMessages[0]).toEqual([expect.any(Object)]);
  });

  it("新しいメッセージが追加された時に最下部にスクロールすること", async () => {
    const wrapper = mountChatWindow();
    const initialScrollToBottomCalled = wrapper.vm.scrollToBottomCalled;

    const newMessages = [
      ...messages,
      {
        id: 3,
        user_id: 1,
        name: "User 1",
        content: "New message",
        email: "user1@example.com",
        created_at: "2023-01-02T00:00:00Z",
        likes: [],
      },
    ];

    await wrapper.setProps({ messages: newMessages });

    // Wait for Vue to update the DOM
    await wrapper.vm.$nextTick();

    // Run all timers
    vi.runAllTimers();

    // Wait for all pending promises to resolve
    await flushPromises();

    // Force a re-render and wait for it to complete
    await wrapper.vm.$forceUpdate();
    await wrapper.vm.$nextTick();

    // Run any remaining timers
    vi.runAllTimers();

    // Wait for any remaining promises
    await flushPromises();

    // Log the current state of the component
    console.log("Component state:", wrapper.vm.$data);
    console.log("Props:", wrapper.props());
    console.log("DOM:", wrapper.html());

    // Log the number of times scrollToBottom was called
    console.log(
      `scrollToBottom was called ${wrapper.vm.scrollToBottomCalled - initialScrollToBottomCalled} times`
    );

    // Check if scrollToBottom was called
    expect(wrapper.vm.scrollToBottomCalled).toBeGreaterThan(
      initialScrollToBottomCalled
    );

    // Check if scrolledToBottom flag is true
    expect(wrapper.vm.scrolledToBottom).toBe(true);

    // Additional assertion to ensure the log is visible in test output
    expect(
      wrapper.vm.scrollToBottomCalled - initialScrollToBottomCalled
    ).toBeGreaterThan(0);
  });
});
