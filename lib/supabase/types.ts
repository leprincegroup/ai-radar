export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      tools: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          full_description: string | null;
          url: string;
          logo_url: string | null;
          category: string | null;
          tags: string[] | null;
          source: string;
          source_id: string | null;
          source_url: string | null;
          hype_score: number;
          upvotes: number;
          is_free: boolean | null;
          has_api: boolean | null;
          is_open_source: boolean | null;
          status: string;
          launched_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tools']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tools']['Insert']>;
      };
      papers: {
        Row: {
          id: string;
          title: string;
          slug: string;
          summary: string | null;
          abstract: string | null;
          authors: string[] | null;
          arxiv_id: string | null;
          arxiv_url: string | null;
          pdf_url: string | null;
          categories: string[] | null;
          tags: string[] | null;
          hype_score: number;
          citation_count: number;
          published_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['papers']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['papers']['Insert']>;
      };
      hype_posts: {
        Row: {
          id: string;
          title: string | null;
          content: string | null;
          url: string;
          source: string;
          author_name: string | null;
          author_handle: string | null;
          author_avatar: string | null;
          likes: number;
          reposts: number;
          views: number;
          hype_score: number;
          related_tool_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['hype_posts']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['hype_posts']['Insert']>;
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          item_type: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookmarks']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['bookmarks']['Insert']>;
      };
    };
  };
}
