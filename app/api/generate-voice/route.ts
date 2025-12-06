import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let text: string = '';
  try {
    const body = await request.json();
    text = body.text;
    const section = body.section;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Check if ElevenLabs API key is available
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    
    if (!elevenLabsKey) {
      // Fallback: Use Web Speech API (browser-based)
      return NextResponse.json({
        audioUrl: null,
        useBrowserTTS: true,
        text: text,
      });
    }

    // Use ElevenLabs API
    const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Default voice
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('ElevenLabs API error');
    }

    // Convert to base64 so the client can play directly
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${base64}`;

    return NextResponse.json({ audioUrl, useBrowserTTS: false, text });
  } catch (error: any) {
    console.error('Error generating voice:', error);
    // Fallback to browser TTS
    return NextResponse.json({
      audioUrl: null,
      useBrowserTTS: true,
      text: text || '',
    });
  }
}

