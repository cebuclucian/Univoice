const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RequestBody {
  prompt: string;
}

interface GeminiRequestBody {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Verifică că metoda este POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parsează corpul cererii
    const { prompt }: RequestBody = await req.json();

    // Verifică că prompt-ul este furnizat
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid prompt',
          details: 'prompt is required and must be a non-empty string'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Preia cheia API Gemini din secretele Supabase
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Configuration error',
          details: 'Gemini API service not properly configured'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Construiește URL-ul pentru API-ul Gemini
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

    // Construiește corpul cererii pentru API-ul Gemini
    const geminiRequestBody: GeminiRequestBody = {
      contents: [{
        parts: [{
          text: prompt.trim()
        }]
      }]
    };

    // Trimite cererea către API-ul Gemini
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiRequestBody),
    });

    // Verifică dacă cererea către Gemini a fost reușită
    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error('Gemini API error:', {
        status: geminiResponse.status,
        statusText: geminiResponse.statusText,
        body: errorData
      });

      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate response',
          details: `Gemini API returned ${geminiResponse.status}: ${geminiResponse.statusText}`,
          gemini_error: errorData
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parsează răspunsul de la Gemini
    const geminiData: GeminiResponse = await geminiResponse.json();

    // Verifică dacă răspunsul conține o eroare
    if (geminiData.error) {
      console.error('Gemini API returned error:', geminiData.error);
      return new Response(
        JSON.stringify({ 
          error: 'Gemini API error',
          details: geminiData.error.message,
          code: geminiData.error.code
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Extrage textul generat din răspuns
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error('No text generated by Gemini:', geminiData);
      return new Response(
        JSON.stringify({ 
          error: 'No response generated',
          details: 'Gemini did not generate any text response'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Returnează răspunsul cu succes
    return new Response(
      JSON.stringify({
        response: generatedText,
        prompt: prompt,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-gemini-response function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});