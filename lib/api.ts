import { UserProfile, FitnessPlan } from '@/store/fitnessStore';
import { useFitnessStore } from '@/store/fitnessStore';

export async function generatePlan(profile: UserProfile): Promise<FitnessPlan> {
  const response = await fetch('/api/generate-plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Failed to generate plan: ${response.status} ${response.statusText}`);
  }

  const plan: FitnessPlan = await response.json();
  useFitnessStore.getState().setPlan(plan);
  return plan;
}

export async function generateImage(prompt: string): Promise<string> {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate image');
  }

  const data = await response.json();
  return data.imageUrl;
}

export async function generateVoice(text: string, section: 'workout' | 'diet'): Promise<{ audioUrl: string | null; useBrowserTTS: boolean; text: string }> {
  const response = await fetch('/api/generate-voice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, section }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate voice');
  }

  const data = await response.json();
  return data;
}

