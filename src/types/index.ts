export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
  codeBlocks?: CodeBlock[];
}

export interface Attachment {
  id: string;
  type: "image" | "url";
  url: string;
  name?: string;
}

export interface CodeBlock {
  id: string;
  language: string;
  code: string;
  filename?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  files: ProjectFile[];
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
}

export interface GeneratedCode {
  files: ProjectFile[];
  mainComponent: string;
  dependencies?: string[];
}

export interface ImageGenerationRequest {
  prompt: string;
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
}

export interface ImageAnalysisResult {
  colors: string[];
  layout: string;
  style: string;
  components: string[];
  suggestions: string[];
}

export interface WebScrapingResult {
  url: string;
  title: string;
  description?: string;
  structure: string;
  colors: string[];
  fonts: string[];
  components: string[];
}
