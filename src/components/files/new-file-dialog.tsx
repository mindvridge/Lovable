"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface NewFileDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateFile: (name: string, type: string) => void;
}

export function NewFileDialog({
  open,
  onClose,
  onCreateFile,
}: NewFileDialogProps) {
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("tsx");

  const handleCreate = () => {
    if (!fileName.trim()) return;

    const fullName = fileName.includes(".")
      ? fileName
      : `${fileName}.${fileType}`;

    onCreateFile(fullName, fileType);
    setFileName("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New File</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">File Name</label>
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g., Button or Button.tsx"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">File Type</label>
            <div className="grid grid-cols-4 gap-2">
              {["tsx", "ts", "jsx", "js", "css"].map((type) => (
                <Button
                  key={type}
                  variant={fileType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFileType(type)}
                >
                  .{type}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!fileName.trim()}>
            Create File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
