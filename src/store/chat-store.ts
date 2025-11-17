import { create } from "zustand";
import { Message, ProjectFile } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentCode: string;
  files: ProjectFile[];
  selectedFileId: string | null;

  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  setLoading: (loading: boolean) => void;
  setCurrentCode: (code: string) => void;
  setFiles: (files: ProjectFile[]) => void;
  addFile: (file: Omit<ProjectFile, "id">) => void;
  updateFile: (id: string, content: string) => void;
  selectFile: (id: string | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  currentCode: "",
  files: [],
  selectedFileId: null,

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: uuidv4(),
          timestamp: new Date(),
        },
      ],
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setCurrentCode: (code) => set({ currentCode: code }),

  setFiles: (files) => set({ files }),

  addFile: (file) =>
    set((state) => ({
      files: [...state.files, { ...file, id: uuidv4() }],
    })),

  updateFile: (id, content) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, content } : f)),
    })),

  selectFile: (id) => set({ selectedFileId: id }),

  clearMessages: () => set({ messages: [], currentCode: "", files: [] }),
}));
