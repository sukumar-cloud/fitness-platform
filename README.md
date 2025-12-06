# 🏋️ AI Fitness Coach

An AI-powered fitness assistant built with Next.js that generates personalized workout and diet plans using LLMs. Features include voice narration, AI-generated images, PDF export, and more!

## ✨ Features

### 📝 User Profile Input
- **Personal Details**: Name, Age, Gender
- **Physical Metrics**: Height & Weight
- **Fitness Goals**: Weight Loss, Muscle Gain, Strength Building, Endurance, General Fitness
- **Fitness Level**: Beginner, Intermediate, Advanced
- **Workout Location**: Home, Gym, Outdoor
- **Dietary Preferences**: Vegetarian, Non-Vegetarian, Vegan, Keto
- **Optional Fields**: Medical history, Stress level

### 🧠 AI-Powered Plan Generation
- **🏋️ Workout Plan**: 7-day personalized exercise routines with sets, reps, rest time, and safety notes
- **🥗 Diet Plan**: Daily meal breakdown for breakfast, lunch, dinner, and snacks with portion sizes
- **💬 AI Tips & Motivation**: Personalized lifestyle tips and daily motivational quotes

### 🔊 Voice Features
- **Read My Plan**: Text-to-speech narration of workout and diet plans
- **Section Selection**: Choose to listen to Workout or Diet sections
- **Multiple TTS Options**: ElevenLabs API (premium) or browser's built-in TTS (fallback)

### 🖼️ Image Generation
- **Exercise Images**: Click any exercise to generate a visual representation
- **Food Images**: Click any meal to see an AI-generated food image
- **Multiple Providers**: Supports Replicate, Stability AI, or Unsplash (with fallbacks)

### 🧾 Additional Features
- **📄 PDF Export**: Download your complete fitness plan as a PDF
- **🌗 Dark/Light Mode**: Toggle between themes
- **💾 Local Storage**: Plans are automatically saved in browser storage
- **☁️ Supabase Integration**: Optional cloud storage for plans
- **🔄 Regenerate Plan**: Generate a new plan anytime
- **⚡ Smooth Animations**: Beautiful UI with Framer Motion

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Styling** | Tailwind CSS |
| **Animations** | Framer Motion |
| **State Management** | Zustand |
| **AI APIs** | Google Gemini (for plan generation) |
| **Voice** | ElevenLabs API / Browser TTS |
| **Images** | Replicate / Stability AI / Unsplash |
| **PDF Export** | jsPDF |
| **Database** | Supabase (optional) |
| **Icons** | Lucide React |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Google Gemini API key (required)
- (Optional) ElevenLabs API key for premium voice
- (Optional) Replicate/Stability AI API key for image generation
- (Optional) Supabase account for cloud storage

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd fitness-coach
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Required
   GOOGLE_API_KEY=your_google_gemini_api_key_here
   
   # Optional - Voice Generation
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   
   # Optional - Image Generation
   REPLICATE_API_TOKEN=your_replicate_api_token_here
   STABILITY_API_KEY=your_stability_api_key_here
   UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
   
   # Optional - Database
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 API Keys Setup

### Google Gemini API (Required)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file as `GOOGLE_API_KEY`

### ElevenLabs API (Optional - for premium voice)
1. Sign up at [ElevenLabs](https://elevenlabs.io/)
2. Get your API key from the dashboard
3. Add it to your `.env.local` file as `ELEVENLABS_API_KEY`
4. **Note**: Without this, the app will use browser's built-in TTS

### Replicate API (Optional - for AI images)
1. Sign up at [Replicate](https://replicate.com/)
2. Get your API token from [Account Settings](https://replicate.com/account/api-tokens)
3. Add it to your `.env.local` file as `REPLICATE_API_TOKEN`

### Stability AI (Optional - alternative for images)
1. Sign up at [Stability AI](https://platform.stability.ai/)
2. Get your API key from the dashboard
3. Add it to your `.env.local` file as `STABILITY_API_KEY`

### Supabase (Optional - for cloud storage)
1. Create a project at [Supabase](https://supabase.com/)
2. Create a table named `fitness_plans` with columns:
   - `id` (uuid, primary key)
   - `user_id` (uuid, nullable)
   - `profile` (jsonb)
   - `plan` (jsonb)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)
3. Add your Supabase URL and anon key to `.env.local`

## 🏗️ Project Structure

```
fitness-coach/
├── app/
│   ├── api/
│   │   ├── generate-image/    # Image generation endpoint
│   │   ├── generate-plan/      # Plan generation endpoint
│   │   └── generate-voice/     # Voice generation endpoint
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/
│   ├── PlanDisplay.tsx         # Plan display component
│   ├── ThemeToggle.tsx         # Dark/light mode toggle
│   └── UserForm.tsx            # User input form
├── lib/
│   ├── api.ts                  # API client functions
│   ├── pdfExport.ts            # PDF export functionality
│   ├── supabase.ts             # Supabase client
│   └── utils.ts                # Utility functions
├── store/
│   └── fitnessStore.ts         # Zustand state management
└── public/                     # Static assets
```

## 🎯 Usage

1. **Fill in your profile**: Enter your personal details, fitness goals, and preferences
2. **Generate plan**: Click "Generate My Plan" to create your personalized fitness plan
3. **Explore your plan**: 
   - View your 7-day workout and diet plans
   - Click exercises/meals to generate images
   - Use "Read Plan" to hear your plan narrated
4. **Export**: Download your plan as a PDF
5. **Regenerate**: Create a new plan anytime

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository to [Vercel](https://vercel.com/)
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Import your repository to [Netlify](https://netlify.com/)
3. Add your environment variables in Netlify dashboard
4. Deploy!

## 🔧 Configuration

### Customizing the AI Model
Edit `app/api/generate-plan/route.ts` to change the Gemini model or adjust the prompt.

### Customizing Voice Settings
Edit `app/api/generate-voice/route.ts` to change ElevenLabs voice ID or settings.

### Customizing Image Generation
Edit `app/api/generate-image/route.ts` to change image generation providers or models.

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js and AI**

