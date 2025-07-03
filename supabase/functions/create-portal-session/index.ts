import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  user_id: string;
  return_url: string;
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
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { user_id, return_url }: RequestBody = await req.json();

    if (!user_id || !return_url) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters',
          details: 'user_id and return_url are required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Configuration error',
          details: 'Stripe service not properly configured'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user's Stripe customer ID from Supabase
    const subscriptionResponse = await fetch(`${supabaseUrl}/rest/v1/subscriptions?id=eq.${user_id}&select=stripe_customer_id`, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
      },
    });

    if (!subscriptionResponse.ok) {
      throw new Error('Failed to fetch subscription data');
    }

    const subscriptionData = await subscriptionResponse.json();
    
    if (!subscriptionData || subscriptionData.length === 0 || !subscriptionData[0].stripe_customer_id) {
      return new Response(
        JSON.stringify({ 
          error: 'No active subscription found',
          details: 'User does not have an active Stripe subscription'
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const customerId = subscriptionData[0].stripe_customer_id;

    // Create Stripe customer portal session
    const portalData = {
      customer: customerId,
      return_url: return_url,
    };

    const stripeResponse = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(portalData).toString(),
    });

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.text();
      console.error('Stripe API error:', {
        status: stripeResponse.status,
        statusText: stripeResponse.statusText,
        body: errorData
      });

      return new Response(
        JSON.stringify({ 
          error: 'Failed to create portal session',
          details: `Stripe API returned ${stripeResponse.status}: ${stripeResponse.statusText}`
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const session = await stripeResponse.json();

    return new Response(
      JSON.stringify({
        url: session.url
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in create-portal-session function:', error);
    
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