import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
}

if (!supabaseKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface Ingredient {
  id: string;
  user_id: string;
  name: string;
  quantity?: string;
  unit?: string;
  expiry_date?: string;
  category?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FavoriteRecipe {
  id: string;
  user_id: string;
  youtube_video_id: string;
  title: string;
  channel_name?: string;
  thumbnail_url?: string;
  description?: string;
  duration?: string;
  view_count?: number;
  published_at?: string;
  tags?: string[];
  created_at: string;
}

export interface ShoppingList {
  id: string;
  user_id: string;
  recipe_id?: string;
  ingredient_name: string;
  quantity?: string;
  unit?: string;
  is_purchased: boolean;
  priority: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// YouTube API types
export interface YouTubeVideo {
  videoId: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  description: string;
  duration: string;
  viewCount: number;
  publishedAt: string;
}
