import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  to: string;
  subject: string;
  html_body: string;
}

interface ResendEmailRequest {
  from: string;
  to: string;
  subject: string;
  html: string;
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
    const { to, subject, html_body }: RequestBody = await req.json();

    // Verifică că toți parametrii necesari sunt furnizați
    if (!to || !subject || !html_body) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters',
          details: 'to, subject, and html_body are required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validează formatul email-ului destinatar
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid email format',
          details: 'The "to" field must contain a valid email address'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Preia cheia API Resend din secretele Supabase
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Configuration error',
          details: 'Email service not properly configured'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Construiește corpul cererii pentru API-ul Resend
    const emailData: ResendEmailRequest = {
      from: 'Univoice <onboarding@mg.univoice.ro>',
      to: to,
      subject: subject,
      html: html_body
    };

    // Trimite cererea către API-ul Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    // Verifică dacă cererea către Resend a fost reușită
    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error('Resend API error:', {
        status: resendResponse.status,
        statusText: resendResponse.statusText,
        body: errorData
      });

      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email',
          details: `Resend API returned ${resendResponse.status}: ${resendResponse.statusText}`,
          resend_error: errorData
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parsează răspunsul de la Resend
    const resendData = await resendResponse.json();

    // Returnează succes cu detaliile de la Resend
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        email_id: resendData.id,
        to: to,
        subject: subject
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in send-email function:', error);
    
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