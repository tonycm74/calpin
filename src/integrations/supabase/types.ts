export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      calendar_adds: {
        Row: {
          calendar_type: string
          created_at: string
          event_page_id: string
          id: string
        }
        Insert: {
          calendar_type: string
          created_at?: string
          event_page_id: string
          id?: string
        }
        Update: {
          calendar_type?: string
          created_at?: string
          event_page_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_adds_event_page_id_fkey"
            columns: ["event_page_id"]
            isOneToOne: false
            referencedRelation: "event_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      event_pages: {
        Row: {
          capacity: number | null
          category: string | null
          created_at: string
          description: string | null
          end_time: string | null
          id: string
          image_url: string | null
          is_recurring_parent: boolean
          location: string | null
          page_type: string
          parent_event_id: string | null
          recurrence_rule: Json | null
          reminder_minutes: number[] | null
          slug: string
          start_time: string
          title: string
          ui_schema: Json | null
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          capacity?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          image_url?: string | null
          is_recurring_parent?: boolean
          location?: string | null
          page_type?: string
          parent_event_id?: string | null
          recurrence_rule?: Json | null
          reminder_minutes?: number[] | null
          slug: string
          start_time: string
          title: string
          ui_schema?: Json | null
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          capacity?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          image_url?: string | null
          is_recurring_parent?: boolean
          location?: string | null
          page_type?: string
          parent_event_id?: string | null
          recurrence_rule?: Json | null
          reminder_minutes?: number[] | null
          slug?: string
          start_time?: string
          title?: string
          ui_schema?: Json | null
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      event_rsvps: {
        Row: {
          created_at: string
          email: string
          event_page_id: string
          id: string
          name: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          event_page_id: string
          id?: string
          name: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          event_page_id?: string
          id?: string
          name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_page_id_fkey"
            columns: ["event_page_id"]
            isOneToOne: false
            referencedRelation: "event_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          created_at: string
          event_page_id: string
          id: string
          referrer: string | null
          user_agent: string | null
          visitor_id: string | null
        }
        Insert: {
          created_at?: string
          event_page_id: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Update: {
          created_at?: string
          event_page_id?: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_views_event_page_id_fkey"
            columns: ["event_page_id"]
            isOneToOne: false
            referencedRelation: "event_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          updated_at: string
          user_id: string
          username: string | null
          venue_name: string | null
          venue_description: string | null
          venue_address: string | null
          venue_image_url: string | null
          venue_phone: string | null
          venue_website: string | null
          google_place_id: string | null
          venue_images: string[] | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
          venue_name?: string | null
          venue_description?: string | null
          venue_address?: string | null
          venue_image_url?: string | null
          venue_phone?: string | null
          venue_website?: string | null
          google_place_id?: string | null
          venue_images?: string[] | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
          venue_name?: string | null
          venue_description?: string | null
          venue_address?: string | null
          venue_image_url?: string | null
          venue_phone?: string | null
          venue_website?: string | null
          google_place_id?: string | null
          venue_images?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_event_analytics: { Args: { p_event_page_id: string }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
