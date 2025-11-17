"use client";

import { useChatStore } from "@/store/chat-store";
import { FileCode } from "lucide-react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <span className="text-sm text-muted-foreground">Loading editor...</span>
    </div>
  ),
});

export function CodeEditor() {
  const { currentCode, setCurrentCode } = useChatStore();

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCurrentCode(value);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="border-b p-4 flex items-center gap-2">
        <FileCode className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Code Editor</h2>
      </div>
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={currentCode}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 2,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
