"use client";

import { useState } from "react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { CodePreview } from "@/components/preview/code-preview";
import { CodeEditor } from "@/components/editor/code-editor";
import { AuthModal } from "@/components/auth/auth-modal";
import { ProjectManager } from "@/components/project/project-manager";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useChatStore } from "@/store/chat-store";
import {
  Code2,
  Eye,
  Menu,
  User,
  FolderOpen,
  Download,
  LogOut,
  FilePlus,
} from "lucide-react";

type ViewMode = "preview" | "code" | "split";

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [showChat, setShowChat] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);

  const { user, signOut, loading: authLoading } = useAuth();
  const { currentCode, clearMessages, setCurrentCode } = useChatStore();

  const handleNewProject = () => {
    if (
      currentCode &&
      !confirm("Start a new project? Any unsaved changes will be lost.")
    ) {
      return;
    }
    clearMessages();
    setCurrentCode("");
  };

  const handleDownload = () => {
    if (!currentCode) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Website</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${currentCode}

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "website.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          {/* View Mode Buttons */}
          <div className="hidden sm:flex items-center gap-1 mr-2">
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

          {/* New Project Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewProject}
            title="New Project"
          >
            <FilePlus className="h-4 w-4" />
          </Button>

          {/* Download Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!currentCode}
            title="Download as HTML"
          >
            <Download className="h-4 w-4" />
          </Button>

          {/* Project Manager */}
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProjectManager(true)}
              title="Projects"
            >
              <FolderOpen className="h-4 w-4" />
            </Button>
          )}

          {/* Auth Button */}
          {authLoading ? (
            <Button variant="outline" size="sm" disabled>
              <User className="h-4 w-4" />
            </Button>
          ) : user ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground hidden md:block">
                {user.email?.split("@")[0]}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAuthModal(true)}
            >
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          )}
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

      {/* Modals */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showProjectManager && (
        <ProjectManager onClose={() => setShowProjectManager(false)} />
      )}
    </div>
  );
}
