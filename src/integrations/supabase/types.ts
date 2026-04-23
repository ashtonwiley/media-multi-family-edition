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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      child_accounts: {
        Row: {
          child_name: string
          created_at: string
          id: string
          parent_user_id: string
          password_hash: string
          updated_at: string
          username: string
        }
        Insert: {
          child_name: string
          created_at?: string
          id?: string
          parent_user_id: string
          password_hash: string
          updated_at?: string
          username: string
        }
        Update: {
          child_name?: string
          created_at?: string
          id?: string
          parent_user_id?: string
          password_hash?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      family_posts: {
        Row: {
          author: string
          content: string
          created_at: string
          id: string
          mood: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author: string
          content: string
          created_at?: string
          id?: string
          mood?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author?: string
          content?: string
          created_at?: string
          id?: string
          mood?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      family_profiles: {
        Row: {
          auto_moderate_content: boolean
          bedtime_curfew: boolean
          block_strangers: boolean
          child_age_group: string
          child_name: string | null
          child_pin_hash: string | null
          connected_apps: string[]
          created_at: string
          daily_screen_time_minutes: number
          hide_algorithmic_feeds: boolean
          id: string
          no_ads: boolean
          parent_name: string | null
          require_reply_approval: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_moderate_content?: boolean
          bedtime_curfew?: boolean
          block_strangers?: boolean
          child_age_group?: string
          child_name?: string | null
          child_pin_hash?: string | null
          connected_apps?: string[]
          created_at?: string
          daily_screen_time_minutes?: number
          hide_algorithmic_feeds?: boolean
          id?: string
          no_ads?: boolean
          parent_name?: string | null
          require_reply_approval?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_moderate_content?: boolean
          bedtime_curfew?: boolean
          block_strangers?: boolean
          child_age_group?: string
          child_name?: string | null
          child_pin_hash?: string | null
          connected_apps?: string[]
          created_at?: string
          daily_screen_time_minutes?: number
          hide_algorithmic_feeds?: boolean
          id?: string
          no_ads?: boolean
          parent_name?: string | null
          require_reply_approval?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _validate_child_password: {
        Args: { _password: string }
        Returns: undefined
      }
      _validate_child_username: {
        Args: { _username: string }
        Returns: undefined
      }
      create_child_account: {
        Args: { _child_name: string; _password: string; _username: string }
        Returns: string
      }
      has_child_pin: { Args: never; Returns: boolean }
      kid_create_post: {
        Args: {
          _content: string
          _mood: string
          _password: string
          _username: string
        }
        Returns: string
      }
      kid_list_posts: {
        Args: { _password: string; _username: string }
        Returns: {
          author: string
          content: string
          created_at: string
          id: string
          mood: string
          status: string
        }[]
      }
      set_child_pin: { Args: { _pin: string }; Returns: undefined }
      update_child_account: {
        Args: {
          _child_name?: string
          _id: string
          _password?: string
          _username?: string
        }
        Returns: undefined
      }
      verify_child_login: {
        Args: { _password: string; _username: string }
        Returns: {
          child_name: string
          parent_user_id: string
          username: string
        }[]
      }
      verify_child_pin: { Args: { _pin: string }; Returns: boolean }
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
