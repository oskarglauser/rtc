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
      trips: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: string;
          start_date: string | null;
          end_date: string | null;
          origin_name: string | null;
          origin_location: unknown | null;
          destination_name: string | null;
          destination_location: unknown | null;
          total_distance_km: number | null;
          total_driving_hours: number | null;
          preferences: Json;
          ai_conversation: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          origin_name?: string | null;
          origin_location?: unknown | null;
          destination_name?: string | null;
          destination_location?: unknown | null;
          total_distance_km?: number | null;
          total_driving_hours?: number | null;
          preferences?: Json;
          ai_conversation?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          origin_name?: string | null;
          origin_location?: unknown | null;
          destination_name?: string | null;
          destination_location?: unknown | null;
          total_distance_km?: number | null;
          total_driving_hours?: number | null;
          preferences?: Json;
          ai_conversation?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      itinerary_days: {
        Row: {
          id: string;
          trip_id: string;
          day_number: number;
          date: string | null;
          summary: string | null;
          driving_km: number | null;
          driving_hours: number | null;
        };
        Insert: {
          id?: string;
          trip_id: string;
          day_number: number;
          date?: string | null;
          summary?: string | null;
          driving_km?: number | null;
          driving_hours?: number | null;
        };
        Update: {
          id?: string;
          trip_id?: string;
          day_number?: number;
          date?: string | null;
          summary?: string | null;
          driving_km?: number | null;
          driving_hours?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "itinerary_days_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
      itinerary_items: {
        Row: {
          id: string;
          day_id: string;
          trip_id: string;
          sort_order: number;
          item_type: string;
          title: string;
          description: string | null;
          location_name: string | null;
          location: unknown | null;
          address: string | null;
          arrival_time: string | null;
          departure_time: string | null;
          duration_minutes: number | null;
          metadata: Json;
          external_url: string | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          day_id: string;
          trip_id: string;
          sort_order: number;
          item_type: string;
          title: string;
          description?: string | null;
          location_name?: string | null;
          location?: unknown | null;
          address?: string | null;
          arrival_time?: string | null;
          departure_time?: string | null;
          duration_minutes?: number | null;
          metadata?: Json;
          external_url?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          day_id?: string;
          trip_id?: string;
          sort_order?: number;
          item_type?: string;
          title?: string;
          description?: string | null;
          location_name?: string | null;
          location?: unknown | null;
          address?: string | null;
          arrival_time?: string | null;
          departure_time?: string | null;
          duration_minutes?: number | null;
          metadata?: Json;
          external_url?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "itinerary_items_day_id_fkey";
            columns: ["day_id"];
            isOneToOne: false;
            referencedRelation: "itinerary_days";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "itinerary_items_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
      charging_stations_cache: {
        Row: {
          id: string;
          source: string;
          name: string | null;
          operator: string | null;
          location: unknown;
          address: string | null;
          country_code: string | null;
          connectors: Json | null;
          is_fast_charge: boolean | null;
          max_power_kw: number | null;
          status: string | null;
          raw_data: Json | null;
          fetched_at: string;
          expires_at: string;
        };
        Insert: {
          id: string;
          source: string;
          name?: string | null;
          operator?: string | null;
          location: unknown;
          address?: string | null;
          country_code?: string | null;
          connectors?: Json | null;
          is_fast_charge?: boolean | null;
          max_power_kw?: number | null;
          status?: string | null;
          raw_data?: Json | null;
          fetched_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          source?: string;
          name?: string | null;
          operator?: string | null;
          location?: unknown;
          address?: string | null;
          country_code?: string | null;
          connectors?: Json | null;
          is_fast_charge?: boolean | null;
          max_power_kw?: number | null;
          status?: string | null;
          raw_data?: Json | null;
          fetched_at?: string;
          expires_at?: string;
        };
        Relationships: [];
      };
      poi_cache: {
        Row: {
          id: string;
          source: string;
          name: string;
          category: string | null;
          location: unknown;
          address: string | null;
          rating: number | null;
          price_level: number | null;
          cuisine_types: string[] | null;
          is_kid_friendly: boolean | null;
          opening_hours: Json | null;
          photos: Json | null;
          raw_data: Json | null;
          fetched_at: string;
          expires_at: string;
        };
        Insert: {
          id: string;
          source: string;
          name: string;
          category?: string | null;
          location: unknown;
          address?: string | null;
          rating?: number | null;
          price_level?: number | null;
          cuisine_types?: string[] | null;
          is_kid_friendly?: boolean | null;
          opening_hours?: Json | null;
          photos?: Json | null;
          raw_data?: Json | null;
          fetched_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          source?: string;
          name?: string;
          category?: string | null;
          location?: unknown;
          address?: string | null;
          rating?: number | null;
          price_level?: number | null;
          cuisine_types?: string[] | null;
          is_kid_friendly?: boolean | null;
          opening_hours?: Json | null;
          photos?: Json | null;
          raw_data?: Json | null;
          fetched_at?: string;
          expires_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
