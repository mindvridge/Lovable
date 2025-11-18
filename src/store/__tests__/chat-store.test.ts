import { describe, it, expect, beforeEach } from "vitest";
import { useChatStore } from "../chat-store";

describe("ChatStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useChatStore.setState({
      messages: [],
      currentCode: "",
      isLoading: false,
      files: [],
      selectedFileId: null,
    });
  });

  it("adds messages correctly", () => {
    const { addMessage } = useChatStore.getState();

    addMessage({
      role: "user",
      content: "Hello",
    });

    const { messages } = useChatStore.getState();
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toBe("Hello");
    expect(messages[0].role).toBe("user");
  });

  it("sets current code", () => {
    const { setCurrentCode } = useChatStore.getState();

    setCurrentCode("const App = () => <div>Hello</div>");

    const { currentCode } = useChatStore.getState();
    expect(currentCode).toBe("const App = () => <div>Hello</div>");
  });

  it("sets loading state", () => {
    const { setLoading } = useChatStore.getState();

    setLoading(true);
    expect(useChatStore.getState().isLoading).toBe(true);

    setLoading(false);
    expect(useChatStore.getState().isLoading).toBe(false);
  });

  it("clears messages", () => {
    const { addMessage, clearMessages } = useChatStore.getState();

    addMessage({ role: "user", content: "Message 1" });
    addMessage({ role: "assistant", content: "Message 2" });

    expect(useChatStore.getState().messages).toHaveLength(2);

    clearMessages();

    expect(useChatStore.getState().messages).toHaveLength(0);
  });

  it("maintains message order", () => {
    const { addMessage } = useChatStore.getState();

    addMessage({ role: "user", content: "First" });
    addMessage({ role: "assistant", content: "Second" });
    addMessage({ role: "user", content: "Third" });

    const { messages } = useChatStore.getState();
    expect(messages[0].content).toBe("First");
    expect(messages[1].content).toBe("Second");
    expect(messages[2].content).toBe("Third");
  });
});
