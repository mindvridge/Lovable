"use client";

import { File, FolderClosed, FolderOpen, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectFile } from "@/types";
import { useState } from "react";

interface FileTreeProps {
  files: ProjectFile[];
  selectedFileId: string | null;
  onSelectFile: (id: string) => void;
  onAddFile: () => void;
  onDeleteFile: (id: string) => void;
}

export function FileTree({
  files,
  selectedFileId,
  onSelectFile,
  onAddFile,
  onDeleteFile,
}: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".tsx") || fileName.endsWith(".jsx")) {
      return "⚛️";
    }
    if (fileName.endsWith(".ts") || fileName.endsWith(".js")) {
      return "📜";
    }
    if (fileName.endsWith(".css")) {
      return "🎨";
    }
    return "📄";
  };

  return (
    <div className="h-full flex flex-col bg-card border-r">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="font-semibold text-sm">Files</h3>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={onAddFile}
          title="New File"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {files.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm p-4">
            No files yet. Click + to add one.
          </div>
        ) : (
          <div className="space-y-1">
            {files.map((file) => (
              <div
                key={file.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-accent group ${
                  selectedFileId === file.id ? "bg-accent" : ""
                }`}
                onClick={() => onSelectFile(file.id)}
              >
                <span className="text-sm">{getFileIcon(file.name)}</span>
                <span className="flex-1 text-sm truncate">{file.name}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile(file.id);
                  }}
                  title="Delete File"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
