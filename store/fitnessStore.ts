import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  goal: string;
  level: string;
  location: string;
  diet: string;
  medical?: string;
  stress?: string;
}

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes: string;
}

export interface DayPlan {
  day: string;
  exercises: Exercise[];
}

export interface MealPlan {
  day: string;
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string[];
  };
}

export interface FitnessPlan {
  workoutPlan: DayPlan[];
  dietPlan: MealPlan[];
  tips: string[];
  motivation: string[];
}

interface FitnessState {
  profile: UserProfile | null;
  plan: FitnessPlan | null;
  isLoading: boolean;
  error: string | null;
  setProfile: (profile: UserProfile) => void;
  setPlan: (plan: FitnessPlan | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearPlan: () => void;
}

export const useFitnessStore = create<FitnessState>()(
  persist(
    (set) => ({
      profile: null,
      plan: null,
      isLoading: false,
      error: null,
      setProfile: (profile) => set({ profile }),
      setPlan: (plan) => set({ plan, isLoading: false, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      clearPlan: () => set({ plan: null, profile: null }),
    }),
    {
      name: 'fitness-storage',
    }
  )
);

