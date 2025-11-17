"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjects, Project } from "@/hooks/use-projects";
import { useChatStore } from "@/store/chat-store";
import {
  FolderOpen,
  Save,
  Trash2,
  Loader2,
  Plus,
  Clock,
} from "lucide-react";

interface ProjectManagerProps {
  onClose: () => void;
}

export function ProjectManager({ onClose }: ProjectManagerProps) {
  const { projects, loading, createProject, deleteProject, loadProjectMessages } =
    useProjects();
  const { messages, currentCode, setFiles, clearMessages, addMessage, setCurrentCode } =
    useChatStore();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!projectName.trim()) return;

    setSaving(true);
    try {
      await createProject(projectName, currentCode, undefined, messages);
      setShowSaveDialog(false);
      setProjectName("");
      alert("Project saved successfully!");
    } catch {
      alert("Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = async (project: Project) => {
    try {
      clearMessages();
      setCurrentCode(project.code);

      // Load messages
      const savedMessages = await loadProjectMessages(project.id);
      savedMessages.forEach((msg) => {
        addMessage({
          role: msg.role,
          content: msg.content,
        });
      });

      onClose();
    } catch {
      alert("Failed to load project");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(id);
      } catch {
        alert("Failed to delete project");
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Projects</h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setShowSaveDialog(true)}
              disabled={!currentCode}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Current
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        {showSaveDialog && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Save Project</h3>
            <div className="flex gap-2">
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name"
              />
              <Button onClick={handleSave} disabled={saving || !projectName.trim()}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No projects yet</p>
              <p className="text-sm">Save your first project to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{project.name}</h4>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(project.updated_at)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleLoad(project)}
                    >
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(project.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
