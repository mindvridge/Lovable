import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a lazy-initialized Supabase client
let supabaseInstance: SupabaseClient | null = null;

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!supabaseInstance) {
      if (!supabaseUrl || !supabaseAnonKey) {
        // Return a mock client that throws helpful errors
        const notConfiguredError = () => {
          throw new Error(
            "Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file."
          );
        };

        return prop === "auth"
          ? {
              getSession: () => Promise.resolve({ data: { session: null }, error: null }),
              onAuthStateChange: () => ({
                data: { subscription: { unsubscribe: () => {} } },
              }),
              signInWithPassword: notConfiguredError,
              signUp: notConfiguredError,
              signOut: () => Promise.resolve({ error: null }),
            }
          : prop === "from"
          ? () => ({
              select: notConfiguredError,
              insert: notConfiguredError,
              update: notConfiguredError,
              delete: notConfiguredError,
            })
          : undefined;
      }
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    }
    return (supabaseInstance as unknown as Record<string, unknown>)[prop as string];
  },
});

// Database types (to be generated from Supabase)
export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          code: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          code?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          project_id: string;
          role: "user" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          role: "user" | "assistant";
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          role?: "user" | "assistant";
          content?: string;
          created_at?: string;
        };
      };
    };
  };
}
