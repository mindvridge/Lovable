"use client";

import { useState } from "react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { CodePreview } from "@/components/preview/code-preview";
import { CodeEditor } from "@/components/editor/code-editor";
import { Button } from "@/components/ui/button";
import { Code2, Eye, Menu } from "lucide-react";

type ViewMode = "preview" | "code" | "split";

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [showChat, setShowChat] = useState(true);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setShowChat(!showChat)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            AI Website Builder
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "preview" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("preview")}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            variant={viewMode === "code" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("code")}
          >
            <Code2 className="h-4 w-4 mr-2" />
            Code
          </Button>
          <Button
            variant={viewMode === "split" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("split")}
            className="hidden lg:flex"
          >
            Split
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div
          className={`${
            showChat ? "w-full md:w-[400px] lg:w-[450px]" : "hidden"
          } border-r flex-shrink-0 transition-all duration-300`}
        >
          <ChatPanel />
        </div>

        {/* Preview/Code Panel */}
        <div className="flex-1 flex overflow-hidden">
          {viewMode === "preview" && (
            <div className="w-full">
              <CodePreview />
            </div>
          )}
          {viewMode === "code" && (
            <div className="w-full">
              <CodeEditor />
            </div>
          )}
          {viewMode === "split" && (
            <>
              <div className="w-1/2 border-r">
                <CodeEditor />
              </div>
              <div className="w-1/2">
                <CodePreview />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
