"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./use-auth";
import { Message } from "@/types";

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  code: string;
  created_at: string;
  updated_at: string;
}

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (
    name: string,
    code: string,
    description?: string,
    messages?: Message[]
  ) => {
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        code,
      })
      .select()
      .single();

    if (error) throw error;

    // Save messages if provided
    if (messages && messages.length > 0 && data) {
      const messagesToInsert = messages.map((m) => ({
        project_id: data.id,
        role: m.role,
        content: m.content,
      }));

      await supabase.from("messages").insert(messagesToInsert);
    }

    await fetchProjects();
    return data;
  };

  const updateProject = async (
    id: string,
    updates: Partial<Pick<Project, "name" | "description" | "code">>
  ) => {
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
    await fetchProjects();
  };

  const deleteProject = async (id: string) => {
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) throw error;
    await fetchProjects();
  };

  const loadProjectMessages = async (projectId: string): Promise<Message[]> => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return (data || []).map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
      timestamp: new Date(m.created_at),
    }));
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
    }
  }, [user]);

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    loadProjectMessages,
    refreshProjects: fetchProjects,
  };
}
