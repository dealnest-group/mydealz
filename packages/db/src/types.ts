type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      deals: {
        Row: {
          id: string
          retailer_id: string | null
          external_id: string
          title: string
          description: string | null
          url: string
          affiliate_url: string
          image_url: string | null
          price_current: number
          price_was: number | null
          discount_pct: number | null
          authenticity_score: number
          category: string | null
          status: string
          rejection_reason: string | null
          embedding: number[] | null
          created_at: string
          updated_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          retailer_id?: string | null
          external_id: string
          title: string
          description?: string | null
          url: string
          affiliate_url: string
          image_url?: string | null
          price_current: number
          price_was?: number | null
          discount_pct?: number | null
          authenticity_score?: number
          category?: string | null
          status?: string
          rejection_reason?: string | null
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          retailer_id?: string | null
          external_id?: string
          title?: string
          description?: string | null
          url?: string
          affiliate_url?: string
          image_url?: string | null
          price_current?: number
          price_was?: number | null
          discount_pct?: number | null
          authenticity_score?: number
          category?: string | null
          status?: string
          rejection_reason?: string | null
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
      }
      retailers: {
        Row: {
          id: string
          name: string
          slug: string
          affiliate_network: string | null
          affiliate_id: string | null
          base_url: string | null
          feed_url: string | null
          commission_pct: number | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          affiliate_network?: string | null
          affiliate_id?: string | null
          base_url?: string | null
          feed_url?: string | null
          commission_pct?: number | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          affiliate_network?: string | null
          affiliate_id?: string | null
          base_url?: string | null
          feed_url?: string | null
          commission_pct?: number | null
          active?: boolean
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          signals_enabled: boolean
          embedding: number[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          signals_enabled?: boolean
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          signals_enabled?: boolean
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
      }
      user_signals: {
        Row: {
          id: string
          user_id: string | null
          session_id: string
          signal_type: string
          retailer_slug: string | null
          product_title: string | null
          product_category: string | null
          price_seen: number | null
          dwell_seconds: number | null
          processed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id: string
          signal_type: string
          retailer_slug?: string | null
          product_title?: string | null
          product_category?: string | null
          price_seen?: number | null
          dwell_seconds?: number | null
          processed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string
          signal_type?: string
          retailer_slug?: string | null
          product_title?: string | null
          product_category?: string | null
          price_seen?: number | null
          dwell_seconds?: number | null
          processed?: boolean
          created_at?: string
        }
      }
      agent_logs: {
        Row: {
          id: string
          agent: string
          status: string
          items_processed: number
          errors: number
          duration_ms: number | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          agent: string
          status: string
          items_processed?: number
          errors?: number
          duration_ms?: number | null
          metadata?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          agent?: string
          status?: string
          items_processed?: number
          errors?: number
          duration_ms?: number | null
          metadata?: any | null
          created_at?: string
        }
      }
      price_history: {
        Row: {
          id: string
          deal_id: string | null
          price: number
          recorded_at: string
        }
        Insert: {
          id?: string
          deal_id?: string | null
          price: number
          recorded_at?: string
        }
        Update: {
          id?: string
          deal_id?: string | null
          price?: number
          recorded_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}