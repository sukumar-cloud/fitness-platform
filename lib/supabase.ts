import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { FitnessPlan, UserProfile } from '@/store/fitnessStore';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export interface SavedPlan {
  id?: string;
  user_id?: string;
  profile: UserProfile;
  plan: FitnessPlan;
  created_at?: string;
  updated_at?: string;
}

export async function savePlanToSupabase(profile: UserProfile, plan: FitnessPlan): Promise<string | null> {
  if (!supabase) {
    console.warn('Supabase not configured; skipping save.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('fitness_plans')
      .insert({
        profile,
        plan,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving plan:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error saving plan to Supabase:', error);
    return null;
  }
}

export async function getPlansFromSupabase(userId?: string): Promise<SavedPlan[]> {
  if (!supabase) {
    console.warn('Supabase not configured; skipping fetch.');
    return [];
  }

  try {
    let query = supabase
      .from('fitness_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching plans:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching plans from Supabase:', error);
    return [];
  }
}

export async function deletePlanFromSupabase(planId: string): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase not configured; skipping delete.');
    return false;
  }

  try {
    const { error } = await supabase
      .from('fitness_plans')
      .delete()
      .eq('id', planId);

    if (error) {
      console.error('Error deleting plan:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting plan from Supabase:', error);
    return false;
  }
}

