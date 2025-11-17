"use client";

import { useChatStore } from "@/store/chat-store";
import { Code2, Eye, Loader2 } from "lucide-react";
import { useMemo } from "react";

export function CodePreview() {
  const { currentCode, isLoading } = useChatStore();

  const previewHtml = useMemo(() => {
    if (!currentCode) return "";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body {
      margin: 0;
      font-family: system-ui, -apple-system, sans-serif;
    }
    #root {
      min-height: 100vh;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${currentCode}

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>
    `;
  }, [currentCode]);

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="border-b p-4 flex items-center gap-2">
        <Eye className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Preview</h2>
      </div>
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm">Generating code...</span>
            </div>
          </div>
        )}
        {currentCode ? (
          <iframe
            key={currentCode}
            srcDoc={previewHtml}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
            title="Preview"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
            <Code2 className="h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No preview available</h3>
            <p className="text-sm max-w-md">
              Start a conversation with the AI to generate code. Your live
              preview will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
