"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image, Link, Loader2 } from "lucide-react";
import { Attachment } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface ChatInputProps {
  onSend: (message: string, attachments?: Attachment[]) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSend(message, attachments.length > 0 ? attachments : undefined);
      setMessage("");
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachments((prev) => [
            ...prev,
            {
              id: uuidv4(),
              type: "image",
              url: reader.result as string,
              name: file.name,
            },
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUrlAdd = () => {
    const url = prompt("Enter a URL to reference:");
    if (url) {
      setAttachments((prev) => [
        ...prev,
        {
          id: uuidv4(),
          type: "url",
          url: url,
        },
      ]);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="border-t bg-background p-4">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="relative group bg-muted rounded-md p-2 pr-6"
            >
              {attachment.type === "image" ? (
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="h-16 w-16 object-cover rounded"
                />
              ) : (
                <div className="text-xs text-muted-foreground max-w-[150px] truncate">
                  {attachment.url}
                </div>
              )}
              <button
                onClick={() => removeAttachment(attachment.id)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full h-4 w-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build..."
            className="min-h-[80px] resize-none pr-24"
            disabled={isLoading}
          />
          <div className="absolute bottom-2 right-2 flex gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Image className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={handleUrlAdd}
              disabled={isLoading}
            >
              <Link className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button
          onClick={handleSend}
          disabled={isLoading || (!message.trim() && attachments.length === 0)}
          className="self-end"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
