import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let prompt: string = '';
  const fallbackSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%235865F2"/><stop offset="100%" stop-color="%237E64F2"/></linearGradient></defs><rect width="512" height="512" rx="32" fill="url(#g)"/><rect x="96" y="232" width="60" height="48" rx="12" fill="white" fill-opacity="0.9"/><rect x="356" y="232" width="60" height="48" rx="12" fill="white" fill-opacity="0.9"/><rect x="156" y="244" width="200" height="24" rx="12" fill="white" fill-opacity="0.95"/><circle cx="136" cy="256" r="10" fill="%234F46E5"/><circle cx="376" cy="256" r="10" fill="%234F46E5"/></svg>`
  )}`;
  const toDataUrl = async (url: string): Promise<string> => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Upstream ${res.status}`);
      const buf = await res.arrayBuffer();
      const contentType = res.headers.get('content-type') || 'image/jpeg';
      const base64 = Buffer.from(buf).toString('base64');
      return `data:${contentType};base64,${base64}`;
    } catch (err) {
      console.error('Failed to proxy image, falling back to inline SVG', err);
      return fallbackSvg;
    }
  };
  try {
    const body = await request.json();
    prompt = body.prompt;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const enhancedPrompt = `Professional high-quality image of: ${prompt}. Realistic, clear, well-lit, suitable for fitness or nutrition content.`;

    // Try Replicate API first (free tier available)
    const replicateApiKey = process.env.REPLICATE_API_TOKEN;
    
    if (replicateApiKey) {
      try {
        // Using Stable Diffusion via Replicate
        const response = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${replicateApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: 'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4', // Stable Diffusion XL
            input: {
              prompt: enhancedPrompt,
              num_outputs: 1,
              aspect_ratio: '1:1',
              output_format: 'url',
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          // Poll for result (Replicate is async)
          let result = data;
          let attempts = 0;
          while (result.status !== 'succeeded' && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
              headers: {
                'Authorization': `Token ${replicateApiKey}`,
              },
            });
            result = await statusResponse.json();
            attempts++;
          }

          if (result.status === 'succeeded' && result.output && result.output[0]) {
            const dataUrl = await toDataUrl(result.output[0]);
            return NextResponse.json({ imageUrl: dataUrl });
          }
        }
      } catch (replicateError) {
        console.error('Replicate API error:', replicateError);
        // Fall through to alternative methods
      }
    }

    // Alternative: Try Stability AI if available
    const stabilityApiKey = process.env.STABILITY_API_KEY;
    if (stabilityApiKey) {
      try {
        const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${stabilityApiKey}`,
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            prompt: enhancedPrompt,
            aspect_ratio: '1:1',
            output_format: 'png',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.image) {
            // Stability AI returns base64
            return NextResponse.json({ imageUrl: `data:image/png;base64,${data.image}` });
          }
        }
      } catch (stabilityError) {
        console.error('Stability AI error:', stabilityError);
      }
    }

    // Next: Try Pollinations (no key, on-the-fly generation)
    try {
      const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=800&height=800&seed=${Date.now()}`;
      const dataUrl = await toDataUrl(pollUrl);
      return NextResponse.json({ imageUrl: dataUrl });
    } catch (pollError) {
      console.error('Pollinations error:', pollError);
    }

    // Fallback: Use Unsplash (with key if provided, otherwise public featured endpoint)
    try {
      const searchQuery = prompt.toLowerCase().replace(/fitness exercise:|food meal:/g, '').trim() || 'fitness';
      const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
      if (unsplashAccessKey) {
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&client_id=${unsplashAccessKey}`
        );
        const data = await response.json();
        if (data.results && data.results[0]) {
          const dataUrl = await toDataUrl(data.results[0].urls.regular);
          return NextResponse.json({ imageUrl: dataUrl });
        }
      } else {
        // No key: use public featured endpoint (no auth) with cache-busting
        const bust = Date.now();
        const directUrl = `https://source.unsplash.com/featured/800x800/?${encodeURIComponent(searchQuery)}&sig=${bust}`;
        const dataUrl = await toDataUrl(directUrl);
        return NextResponse.json({ imageUrl: dataUrl });
      }
    } catch (unsplashError) {
      console.error('Unsplash API error:', unsplashError);
    }

    // Final fallback: stable hosted photo (no auth) + inline illustration backup
    const stablePhoto = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80';
    const dataUrl = await toDataUrl(stablePhoto);
    return NextResponse.json({ imageUrl: dataUrl });
  } catch (error: any) {
    console.error('Error generating image:', error);
    
    const stablePhoto = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80';
    const dataUrl = await toDataUrl(stablePhoto);

    return NextResponse.json(
      { 
        imageUrl: dataUrl,
        error: error.message 
      },
      { status: 200 }
    );
  }
}

