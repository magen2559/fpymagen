/**
 * TypeScript types for Supabase database schema
 * Structured to match @supabase/supabase-js v2 Database generic
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    username: string;
                    avatar_url: string | null;
                    xp: number;
                    level: number;
                    coins: number;
                    garden_theme: 'zen' | 'forest' | 'desert' | 'ocean';
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    username: string;
                    avatar_url?: string | null;
                    xp?: number;
                    level?: number;
                    coins?: number;
                    garden_theme?: 'zen' | 'forest' | 'desert' | 'ocean';
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    username?: string;
                    avatar_url?: string | null;
                    xp?: number;
                    level?: number;
                    coins?: number;
                    garden_theme?: 'zen' | 'forest' | 'desert' | 'ocean';
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            sessions: {
                Row: {
                    id: string;
                    user_id: string;
                    start_time: string;
                    end_time: string | null;
                    duration_seconds: number | null;
                    tag: string | null;
                    status: 'completed' | 'abandoned';
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    start_time: string;
                    end_time?: string | null;
                    duration_seconds?: number | null;
                    tag?: string | null;
                    status: 'completed' | 'abandoned';
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    start_time?: string;
                    end_time?: string | null;
                    duration_seconds?: number | null;
                    tag?: string | null;
                    status?: 'completed' | 'abandoned';
                    created_at?: string;
                };
                Relationships: [];
            };
            plants: {
                Row: {
                    id: string;
                    user_id: string;
                    type: 'bonsai' | 'sakura' | 'fern' | 'bamboo' | 'lotus';
                    stage: number;
                    health: number;
                    position_x: number;
                    position_y: number;
                    position_z: number;
                    is_harvestable: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    type: 'bonsai' | 'sakura' | 'fern' | 'bamboo' | 'lotus';
                    stage?: number;
                    health?: number;
                    position_x: number;
                    position_y: number;
                    position_z: number;
                    is_harvestable?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    type?: 'bonsai' | 'sakura' | 'fern' | 'bamboo' | 'lotus';
                    stage?: number;
                    health?: number;
                    position_x?: number;
                    position_y?: number;
                    position_z?: number;
                    is_harvestable?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            achievements: {
                Row: {
                    id: string;
                    user_id: string;
                    key: string;
                    unlocked_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    key: string;
                    unlocked_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    key?: string;
                    unlocked_at?: string;
                };
                Relationships: [];
            };
            chat_messages: {
                Row: {
                    id: string;
                    user_id: string;
                    role: 'user' | 'assistant';
                    content: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    role: 'user' | 'assistant';
                    content: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    role?: 'user' | 'assistant';
                    content?: string;
                    created_at?: string;
                };
                Relationships: [];
            };
            voucher_claims: {
                Row: {
                    id: string;
                    user_id: string;
                    voucher_key: string;
                    coins_spent: number;
                    claimed_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    voucher_key: string;
                    coins_spent: number;
                    claimed_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    voucher_key?: string;
                    coins_spent?: number;
                    claimed_at?: string;
                };
                Relationships: [];
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
        CompositeTypes: Record<string, never>;
    };
}

// Convenience re-export of individual row types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Session = Database['public']['Tables']['sessions']['Row'];
export type Plant = Database['public']['Tables']['plants']['Row'];
export type Achievement = Database['public']['Tables']['achievements']['Row'];
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
export type VoucherClaim = Database['public']['Tables']['voucher_claims']['Row'];
