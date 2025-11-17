"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/store/chat-store";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Attachment } from "@/types";
import { MessageSquare } from "lucide-react";

export function ChatPanel() {
  const { messages, isLoading, addMessage, setLoading, setCurrentCode, setFiles } =
    useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string, attachments?: Attachment[]) => {
    // Add user message
    addMessage({
      role: "user",
      content,
      attachments,
    });

    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            { role: "user", content },
          ],
          attachments,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      // Add assistant message
      addMessage({
        role: "assistant",
        content: data.message,
      });

      // Update code if generated
      if (data.code) {
        setCurrentCode(data.code);
      }

      // Update files if provided
      if (data.files) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error("Error:", error);
      addMessage({
        role: "assistant",
        content:
          "Sorry, I encountered an error. Please make sure your API keys are configured correctly in the .env.local file.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">AI Assistant</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
            <p className="text-sm max-w-md">
              Describe the website you want to build, and I&apos;ll generate the
              code for you. You can also attach images for design reference or
              add URLs to analyze existing websites.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
