import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

interface PlanShape {
  workoutPlan: Array<{ day: string; exercises: Array<{ name: string; sets: string; reps: string; rest: string; notes: string }> }>;
  dietPlan: Array<{ day: string; meals: { breakfast: string; lunch: string; dinner: string; snacks: string[] } }>;
  tips: string[];
  motivation: string[];
}

const samplePlan: PlanShape = {
  workoutPlan: [
    {
      day: 'Day 1',
      exercises: [
        { name: 'Bodyweight Squat', sets: '3', reps: '12', rest: '60 sec', notes: 'Keep chest up, knees out' },
        { name: 'Push-ups', sets: '3', reps: '10', rest: '60 sec', notes: 'Neutral spine' },
      ],
    },
  ],
  dietPlan: [
    {
      day: 'Day 1',
      meals: {
        breakfast: 'Oats with berries and almonds',
        lunch: 'Grilled chicken with brown rice and veggies',
        dinner: 'Baked salmon with quinoa and greens',
        snacks: ['Greek yogurt', 'Apple with peanut butter'],
      },
    },
  ],
  tips: [
    'Stay hydrated: 2-3L water/day',
    'Warm up 5-10 minutes before training',
    'Prioritize sleep 7-8 hours',
  ],
  motivation: [
    'Day 1: Small steps lead to big changes.',
    'Day 2: Consistency beats intensity.',
    'Day 3: You’re stronger than you think.',
    'Day 4: Progress, not perfection.',
    'Day 5: Keep showing up.',
    'Day 6: Form over ego.',
    'Day 7: Celebrate every win.',
  ],
};

const promptTemplate = (profile: any) => `You are an expert AI Fitness Coach and Nutrition Specialist.

Generate a highly personalized 7-day workout plan, diet plan, and motivation tips based on the following user profile:

USER PROFILE:
- Name: ${profile.name}
- Age: ${profile.age}
- Gender: ${profile.gender}
- Height: ${profile.height} cm
- Weight: ${profile.weight} kg
- Fitness Goal: ${profile.goal}
- Fitness Level: ${profile.level}
- Workout Location: ${profile.location}
- Diet Preference: ${profile.diet}
- Medical Conditions: ${profile.medical || 'None'}
- Stress Level: ${profile.stress || 'Not specified'}

REQUIREMENTS:

1. Generate a 7-day workout plan with:
   - 5-7 exercises per day
   - Sets, reps, and rest time for each exercise
   - Difficulty appropriate to ${profile.level} level
   - Exercises suitable for ${profile.location} location
   - Safety notes for each exercise

2. Generate a 7-day diet plan with:
   - Breakfast, Lunch, Dinner, and 2 Snacks per day
   - Portion sizes
   - Macronutrient balance
   - Items according to ${profile.diet} diet preference

3. Provide 3-5 personalized fitness tips based on the user's profile

4. Include 1 motivational quote per day (7 quotes total)

OUTPUT FORMAT (JSON ONLY):
{
  "workoutPlan": [
    {
      "day": "Day 1",
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": "3",
          "reps": "12",
          "rest": "60 sec",
          "notes": "Safety and form notes"
        }
      ]
    }
  ],
  "dietPlan": [
    {
      "day": "Day 1",
      "meals": {
        "breakfast": "Meal description with portions",
        "lunch": "Meal description with portions",
        "dinner": "Meal description with portions",
        "snacks": ["Snack 1", "Snack 2"]
      }
    }
  ],
  "tips": [
    "Tip 1",
    "Tip 2",
    "Tip 3",
    "Tip 4",
    "Tip 5"
  ],
  "motivation": [
    "Day 1: Motivational quote",
    "Day 2: Motivational quote",
    "Day 3: Motivational quote",
    "Day 4: Motivational quote",
    "Day 5: Motivational quote",
    "Day 6: Motivational quote",
    "Day 7: Motivational quote"
  ]
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, just pure JSON.`;

async function callOpenAI(prompt: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not set');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert fitness and nutrition coach. Respond with ONLY valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI error: ${response.status} ${response.statusText} - ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callGemini(prompt: string): Promise<string> {
  if (!GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY not set');
  }

  const modelsToTry = [
    { name: 'gemini-1.5-flash', apiVersion: 'v1beta' },
    { name: 'gemini-1.5-pro', apiVersion: 'v1beta' },
    { name: 'gemini-1.0-pro-latest', apiVersion: 'v1beta' },
    { name: 'gemini-pro', apiVersion: 'v1beta' },
    { name: 'gemini-1.0-pro', apiVersion: 'v1' },
  ];

  let lastError: any = null;
  for (const modelConfig of modelsToTry) {
    try {
      console.log(`🔄 Trying model: ${modelConfig.name}...`);
      const apiVersion = modelConfig.apiVersion || 'v1beta';
      const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelConfig.name}:generateContent?key=${GOOGLE_API_KEY}`;
      console.log(`📤 Sending request to ${modelConfig.name} via ${apiVersion}...`);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7 },
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${errBody}`);
      }

      const data = await response.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const content = parts.map((p: any) => p.text || '').join(' ').trim();
      if (content) {
        console.log(`✅ Successfully used model: ${modelConfig.name}`);
        return content;
      }
    } catch (modelError: any) {
      lastError = modelError;
      console.error(`❌ Model ${modelConfig.name} failed: ${modelError.message}`);
      continue;
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError?.message || 'Unknown'}`);
}

function tryParsePlan(content: string): PlanShape {
  try {
    return JSON.parse(content);
  } catch (e) {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  }
  return samplePlan;
}

export async function POST(request: NextRequest) {
  try {
    const profile = await request.json();
    const prompt = promptTemplate(profile);

    let content = '';

    // Prefer OpenAI if key present; otherwise try Gemini
    if (OPENAI_API_KEY) {
      console.log('🤖 Using OpenAI for plan generation');
      try {
        content = await callOpenAI(prompt);
      } catch (err) {
        console.error('OpenAI failed, will try Gemini if available:', (err as any).message);
      }
    }

    if (!content && GOOGLE_API_KEY) {
      try {
        content = await callGemini(prompt);
      } catch (err) {
        console.error('Gemini failed:', (err as any).message);
      }
    }

    if (!content) {
      console.warn('⚠️ AI generation failed, falling back to sample plan.');
    }

    const plan = tryParsePlan(content);

    // Validate structure
    if (!plan.workoutPlan || !plan.dietPlan || !plan.tips || !plan.motivation) {
      throw new Error('Invalid plan structure');
    }

    return NextResponse.json(plan);
  } catch (error: any) {
    console.error('Error generating plan:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate plan',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

