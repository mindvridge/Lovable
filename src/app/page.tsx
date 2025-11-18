"use client";

import { useState } from "react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { CodePreview } from "@/components/preview/code-preview";
import { CodeEditor } from "@/components/editor/code-editor";
import { AuthModal } from "@/components/auth/auth-modal";
import { ProjectManager } from "@/components/project/project-manager";
import { ErrorBoundary } from "@/components/error-boundary";
import { FileTree } from "@/components/files/file-tree";
import { NewFileDialog } from "@/components/files/new-file-dialog";
import { DeploymentDialog } from "@/components/deployment/deployment-dialog";
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
  FileCode,
  Rocket,
} from "lucide-react";

type ViewMode = "preview" | "code" | "split";

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [showChat, setShowChat] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showFileTree, setShowFileTree] = useState(false);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [showDeploymentDialog, setShowDeploymentDialog] = useState(false);

  const { user, signOut, loading: authLoading } = useAuth();
  const {
    currentCode,
    clearMessages,
    setCurrentCode,
    files,
    selectedFileId,
    addFile,
    updateFile,
    selectFile,
    setFiles,
  } = useChatStore();

  const handleNewProject = () => {
    if (
      (currentCode || files.length > 0) &&
      !confirm("Start a new project? Any unsaved changes will be lost.")
    ) {
      return;
    }
    clearMessages();
    setCurrentCode("");
    setFiles([]);
    selectFile(null);
  };

  const handleCreateFile = (name: string, type: string) => {
    addFile({
      name,
      path: `src/${name}`,
      content: getDefaultFileContent(type),
      language: type === "css" ? "css" : "typescript",
    });
  };

  const handleDeleteFile = (id: string) => {
    if (!confirm("Delete this file?")) return;

    const newFiles = files.filter((f) => f.id !== id);
    setFiles(newFiles);

    if (selectedFileId === id) {
      selectFile(newFiles.length > 0 ? newFiles[0].id : null);
    }
  };

  const getDefaultFileContent = (type: string): string => {
    if (type === "tsx") {
      return `export function Component() {\n  return <div>New Component</div>;\n}\n`;
    }
    if (type === "ts") {
      return `export function helper() {\n  // Add your logic here\n}\n`;
    }
    if (type === "css") {
      return `/* Add your styles here */\n`;
    }
    return "";
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

          {/* File Tree Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFileTree(!showFileTree)}
            title="Toggle File Tree"
          >
            <FileCode className="h-4 w-4" />
          </Button>

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

          {/* Deploy Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeploymentDialog(true)}
            disabled={!currentCode}
            title="Deploy Project"
          >
            <Rocket className="h-4 w-4" />
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
          <ErrorBoundary>
            <ChatPanel />
          </ErrorBoundary>
        </div>

        {/* File Tree */}
        {showFileTree && (
          <div className="w-[250px] flex-shrink-0">
            <FileTree
              files={files}
              selectedFileId={selectedFileId}
              onSelectFile={selectFile}
              onAddFile={() => setShowNewFileDialog(true)}
              onDeleteFile={handleDeleteFile}
            />
          </div>
        )}

        {/* Preview/Code Panel */}
        <div className="flex-1 flex overflow-hidden">
          {viewMode === "preview" && (
            <div className="w-full">
              <ErrorBoundary>
                <CodePreview />
              </ErrorBoundary>
            </div>
          )}
          {viewMode === "code" && (
            <div className="w-full">
              <ErrorBoundary>
                <CodeEditor />
              </ErrorBoundary>
            </div>
          )}
          {viewMode === "split" && (
            <>
              <div className="w-1/2 border-r">
                <ErrorBoundary>
                  <CodeEditor />
                </ErrorBoundary>
              </div>
              <div className="w-1/2">
                <ErrorBoundary>
                  <CodePreview />
                </ErrorBoundary>
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
      <NewFileDialog
        open={showNewFileDialog}
        onClose={() => setShowNewFileDialog(false)}
        onCreateFile={handleCreateFile}
      />
      <DeploymentDialog
        open={showDeploymentDialog}
        onClose={() => setShowDeploymentDialog(false)}
      />
    </div>
  );
}
