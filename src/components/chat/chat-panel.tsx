"use client";

import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/store/chat-store";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Attachment } from "@/types";
import { MessageSquare, AlertCircle } from "lucide-react";

interface ImageAnalysisResult {
  colors: string[];
  layout: string;
  style: string;
  components: string[];
  typography?: string;
  suggestions: string[];
}

interface WebScrapingResult {
  url: string;
  title: string;
  description?: string;
  structure: string;
  colors: string[];
  fonts: string[];
  components: string[];
  designPatterns: string[];
}

export function ChatPanel() {
  const {
    messages,
    isLoading,
    addMessage,
    setLoading,
    setCurrentCode,
  } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [processingStatus, setProcessingStatus] = useState<string>("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeImage = async (
    imageBase64: string
  ): Promise<ImageAnalysisResult | null> => {
    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Image analysis error:", error);
      return null;
    }
  };

  const scrapeWebsite = async (
    url: string
  ): Promise<WebScrapingResult | null> => {
    try {
      const response = await fetch("/api/scrape-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Web scraping error:", error);
      return null;
    }
  };

  const handleSend = async (content: string, attachments?: Attachment[]) => {
    // Add user message
    addMessage({
      role: "user",
      content,
      attachments,
    });

    setLoading(true);

    try {
      let enrichedContent = content;
      const analysisResults: string[] = [];

      // Process attachments if present
      if (attachments && attachments.length > 0) {
        for (const attachment of attachments) {
          if (attachment.type === "image") {
            setProcessingStatus("Analyzing image design...");
            const analysis = await analyzeImage(attachment.url);
            if (analysis) {
              analysisResults.push(`
Image Analysis Results:
- Colors: ${analysis.colors.join(", ")}
- Layout: ${analysis.layout}
- Style: ${analysis.style}
- Components: ${analysis.components.join(", ")}
- Typography: ${analysis.typography || "Not specified"}
- Suggestions: ${analysis.suggestions.join("; ")}
`);
            }
          } else if (attachment.type === "url") {
            setProcessingStatus(`Analyzing ${attachment.url}...`);
            const scrapingResult = await scrapeWebsite(attachment.url);
            if (scrapingResult) {
              analysisResults.push(`
Website Analysis (${scrapingResult.url}):
- Title: ${scrapingResult.title}
- Description: ${scrapingResult.description || "N/A"}
- Structure: ${scrapingResult.structure}
- Colors: ${scrapingResult.colors.join(", ")}
- Fonts: ${scrapingResult.fonts.join(", ")}
- Components: ${scrapingResult.components.join(", ")}
- Design Patterns: ${scrapingResult.designPatterns.join(", ")}
`);
            }
          }
        }

        if (analysisResults.length > 0) {
          enrichedContent = `${analysisResults.join("\n")}\n\nUser Request: ${content}`;
        }
      }

      setProcessingStatus("Generating code...");

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
            { role: "user", content: enrichedContent },
          ],
          attachments,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Server error: ${response.status}`
        );
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
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      addMessage({
        role: "assistant",
        content: `Sorry, I encountered an error: ${errorMessage}\n\nPlease make sure your API keys are configured correctly in the .env.local file.`,
      });
    } finally {
      setLoading(false);
      setProcessingStatus("");
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
        {processingStatus && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
            <AlertCircle className="h-4 w-4" />
            {processingStatus}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
