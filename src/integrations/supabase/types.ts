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
      anvisa_products: {
        Row: {
          cnpj: string | null
          company_name: string | null
          created_at: string
          finalization_date: string | null
          id: string
          process_number: string | null
          product_category: string | null
          product_name: string
          product_type: string | null
          registration_expiry: string | null
          registration_number: string | null
          status: string | null
        }
        Insert: {
          cnpj?: string | null
          company_name?: string | null
          created_at?: string
          finalization_date?: string | null
          id?: string
          process_number?: string | null
          product_category?: string | null
          product_name: string
          product_type?: string | null
          registration_expiry?: string | null
          registration_number?: string | null
          status?: string | null
        }
        Update: {
          cnpj?: string | null
          company_name?: string | null
          created_at?: string
          finalization_date?: string | null
          id?: string
          process_number?: string | null
          product_category?: string | null
          product_name?: string
          product_type?: string | null
          registration_expiry?: string | null
          registration_number?: string | null
          status?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          professional_name: string | null
          specialty: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          professional_name?: string | null
          specialty?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          professional_name?: string | null
          specialty?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author: string | null
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_timeline: {
        Row: {
          ai_observations: string | null
          condition_tag: string | null
          created_at: string
          created_by: string
          description: string | null
          entry_type: string
          evolution_score: number | null
          id: string
          image_url: string | null
          patient_id: string
          tenant_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_observations?: string | null
          condition_tag?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          entry_type?: string
          evolution_score?: number | null
          id?: string
          image_url?: string | null
          patient_id: string
          tenant_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_observations?: string | null
          condition_tag?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          entry_type?: string
          evolution_score?: number | null
          id?: string
          image_url?: string | null
          patient_id?: string
          tenant_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_timeline_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_branding: {
        Row: {
          accent_color: string
          font_body: string
          font_heading: string
          id: string
          logo_url: string | null
          primary_color: string
          secondary_color: string
          site_name: string
          updated_at: string
        }
        Insert: {
          accent_color?: string
          font_body?: string
          font_heading?: string
          id?: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          site_name?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string
          font_body?: string
          font_heading?: string
          id?: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          site_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          product_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_search_history: {
        Row: {
          analysis: Json
          brand: string | null
          created_at: string
          id: string
          image_url: string | null
          product_name: string
          user_id: string
        }
        Insert: {
          analysis: Json
          brand?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          product_name: string
          user_id: string
        }
        Update: {
          analysis?: Json
          brand?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          product_name?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          avg_rating: number
          brand: string | null
          category: string | null
          created_at: string
          id: string
          image_url: string | null
          name: string
          normalized_key: string
          reviews_count: number
          updated_at: string
        }
        Insert: {
          avg_rating?: number
          brand?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          normalized_key: string
          reviews_count?: number
          updated_at?: string
        }
        Update: {
          avg_rating?: number
          brand?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          normalized_key?: string
          reviews_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string
          age: number | null
          clinic_name: string | null
          created_at: string
          display_name: string | null
          email: string | null
          gender: string | null
          id: string
          is_approved: boolean
          phone: string | null
          questionnaire_answers: Json | null
          questionnaire_completed: boolean
          region: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type?: string
          age?: number | null
          clinic_name?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          is_approved?: boolean
          phone?: string | null
          questionnaire_answers?: Json | null
          questionnaire_completed?: boolean
          region?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: string
          age?: number | null
          clinic_name?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          is_approved?: boolean
          phone?: string | null
          questionnaire_answers?: Json | null
          questionnaire_completed?: boolean
          region?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_pages: {
        Row: {
          created_at: string
          html_content: string
          id: string
          is_published: boolean
          meta_description: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          html_content?: string
          id?: string
          is_published?: boolean
          meta_description?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          html_content?: string
          id?: string
          is_published?: boolean
          meta_description?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      skin_diary_entries: {
        Row: {
          created_at: string
          entry_date: string
          id: string
          mood: Database["public"]["Enums"]["skin_mood"]
          note: string
          tags: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_date?: string
          id?: string
          mood: Database["public"]["Enums"]["skin_mood"]
          note?: string
          tags?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_date?: string
          id?: string
          mood?: Database["public"]["Enums"]["skin_mood"]
          note?: string
          tags?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      skincare_calendar_events: {
        Row: {
          completed_at: string | null
          created_at: string
          custom_label: string | null
          event_date: string
          id: string
          is_skipped: boolean
          moment: string
          patient_id: string
          product_id: string | null
          step_id: string | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          custom_label?: string | null
          event_date: string
          id?: string
          is_skipped?: boolean
          moment: string
          patient_id: string
          product_id?: string | null
          step_id?: string | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          custom_label?: string | null
          event_date?: string
          id?: string
          is_skipped?: boolean
          moment?: string
          patient_id?: string
          product_id?: string | null
          step_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "skincare_calendar_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "user_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skincare_calendar_events_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "skincare_routine_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      skincare_routine_steps: {
        Row: {
          created_at: string
          custom_label: string | null
          id: string
          moment: string
          order_index: number
          patient_id: string
          product_id: string | null
          routine_id: string
          suggested_time: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_label?: string | null
          id?: string
          moment: string
          order_index?: number
          patient_id: string
          product_id?: string | null
          routine_id: string
          suggested_time?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_label?: string | null
          id?: string
          moment?: string
          order_index?: number
          patient_id?: string
          product_id?: string | null
          routine_id?: string
          suggested_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "skincare_routine_steps_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "user_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skincare_routine_steps_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "skincare_routines"
            referencedColumns: ["id"]
          },
        ]
      }
      skincare_routines: {
        Row: {
          active_weekdays: number[]
          created_at: string
          created_by_ai: boolean
          id: string
          name: string
          patient_id: string
          updated_at: string
        }
        Insert: {
          active_weekdays?: number[]
          created_at?: string
          created_by_ai?: boolean
          id?: string
          name?: string
          patient_id: string
          updated_at?: string
        }
        Update: {
          active_weekdays?: number[]
          created_at?: string
          created_by_ai?: boolean
          id?: string
          name?: string
          patient_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenant_features: {
        Row: {
          created_at: string
          enabled: boolean
          feature_key: string
          id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          feature_key: string
          id?: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          feature_key?: string
          id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_features_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_invite_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          max_uses: number | null
          tenant_id: string
          uses: number | null
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          tenant_id: string
          uses?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          tenant_id?: string
          uses?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_invite_codes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_limits: {
        Row: {
          created_at: string
          id: string
          max_analyses_per_month: number | null
          max_patients: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_analyses_per_month?: number | null
          max_patients?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          max_analyses_per_month?: number | null
          max_patients?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_limits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_patients: {
        Row: {
          created_at: string
          id: string
          invite_code: string | null
          patient_id: string
          status: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code?: string | null
          patient_id: string
          status?: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string | null
          patient_id?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_patients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          primary_color: string | null
          secondary_color: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_products: {
        Row: {
          brand: string | null
          category: string
          created_at: string
          id: string
          image_url: string | null
          is_archived: boolean
          key_ingredients: string | null
          moment: string
          name: string
          notes: string | null
          patient_id: string
          product_id: string | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_archived?: boolean
          key_ingredients?: string | null
          moment?: string
          name: string
          notes?: string | null
          patient_id: string
          product_id?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_archived?: boolean
          key_ingredients?: string | null
          moment?: string
          name?: string
          notes?: string | null
          patient_id?: string
          product_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_patient_linked_to_tenant: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "super_admin"
      skin_mood: "good" | "neutral" | "bad"
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
    Enums: {
      app_role: ["admin", "moderator", "user", "super_admin"],
      skin_mood: ["good", "neutral", "bad"],
    },
  },
} as const
