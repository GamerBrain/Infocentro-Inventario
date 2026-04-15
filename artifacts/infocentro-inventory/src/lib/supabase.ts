import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: "admin" | "user";
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: "admin" | "user";
        };
        Update: {
          full_name?: string | null;
          role?: "admin" | "user";
        };
      };
      inventory_items: {
        Row: {
          id: string;
          name: string;
          category: string;
          item_type: string;
          serial: string;
          description: string | null;
          condition: string;
          location: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          category: string;
          item_type: string;
          serial?: string;
          description?: string | null;
          condition: string;
          location?: string | null;
          created_by: string;
        };
        Update: {
          name?: string;
          category?: string;
          item_type?: string;
          serial?: string;
          description?: string | null;
          condition?: string;
          location?: string | null;
        };
      };
    };
  };
};
