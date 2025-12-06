# 🔑 Free API Keys Setup Guide

This guide will help you get free API keys for ElevenLabs (voice) and Replicate (images).

## 🎤 ElevenLabs API Key (Free Voice Generation)

### Free Tier Benefits:
- **10,000 credits per month** (approximately 10 minutes of high-quality TTS)
- API access included
- No credit card required

### Step-by-Step:

1. **Sign Up**
   - Visit: https://elevenlabs.io/
   - Click "Sign Up" or "Get Started"
   - Create an account with your email

2. **Verify Email**
   - Check your inbox for verification email
   - Click the verification link

3. **Get Your API Key**
   - Log in to your account
   - Click on your profile icon (top right)
   - Go to "Profile" or "Settings"
   - Find the "API Key" section
   - Click "Copy" or "Generate" to get your API key
   - It will look like: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

4. **Add to .env file**
   ```env
   ELEVENLABS_API_KEY=your_api_key_here
   ```

### Video Tutorial:
- YouTube: "How to Get Eleven Labs API Key" (search on YouTube)

---

## 🖼️ Replicate API Token (Free AI Image Generation)

### Free Tier Benefits:
- **$5 in free credits** (valid for 14 days)
- Access to Stable Diffusion and other AI models
- No credit card required for free tier

### Step-by-Step:

1. **Sign Up**
   - Visit: https://replicate.com/
   - Click "Sign Up" or "Get Started"
   - Sign up with GitHub, Google, or email

2. **Verify Email** (if using email)
   - Check your inbox for verification email
   - Click the verification link

3. **Get Your API Token**
   - Log in to your account
   - Click on your profile icon (top right)
   - Go to "Account" → "API Tokens"
   - Click "Create Token" or copy existing token
   - It will look like: `r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

4. **Add to .env file**
   ```env
   REPLICATE_API_TOKEN=your_token_here
   ```

### Important Notes:
- Free credits expire after 14 days
- After free credits, you'll need to add payment method (but you can cancel anytime)
- Monitor your usage in the dashboard

---

## 📝 Update Your .env File

After getting both keys, update your `.env` file:

```env
# Google AI API Key (Required)
GOOGLE_API_KEY=AIzaSyCG4MZnfy0_dubaN55kvSupnhIqTmHqqpg

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://cejlokqxqthoiebgdfvf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlamxva3F4cXRob2llYmdkZnZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MjIyMDksImV4cCI6MjA4MDQ5ODIwOX0.538_aQe8rzTgCbXwqTYlbtFGgr47sxwS17t_o1QGuGk

# ElevenLabs API Key for TTS (Optional - Free tier available)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Replicate API Token for image generation (Optional - Free tier available)
REPLICATE_API_TOKEN=your_replicate_api_token_here
```

## 🔄 Restart Your Server

After adding the API keys:

1. Stop the current server (Ctrl+C in terminal)
2. Restart with: `npm run dev`
3. The new API keys will be loaded automatically

## ✅ Test Your Setup

1. **Test Voice:**
   - Generate a fitness plan
   - Click "Read Plan" button
   - Should use ElevenLabs voice (premium quality) instead of browser TTS

2. **Test Images:**
   - Click on any exercise or meal item
   - Should generate AI images using Replicate instead of placeholders

## 💡 Tips

- **ElevenLabs:** 10,000 credits = ~10 minutes of audio per month (free)
- **Replicate:** $5 free credits = ~50-100 images depending on model
- Both services have usage dashboards to monitor your consumption
- You can always use the free browser TTS and placeholder images as fallbacks

## 🆘 Troubleshooting

**If voice doesn't work:**
- Check that `ELEVENLABS_API_KEY` is set correctly in `.env`
- Restart the server after adding the key
- Check browser console for errors

**If images don't work:**
- Check that `REPLICATE_API_TOKEN` is set correctly in `.env`
- Verify you have credits remaining in Replicate dashboard
- Check server logs for API errors

---

**Need Help?** Check the official documentation:
- ElevenLabs: https://elevenlabs.io/docs
- Replicate: https://replicate.com/docs

