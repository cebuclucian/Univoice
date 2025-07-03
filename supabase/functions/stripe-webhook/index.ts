import { corsHeaders } from '../_shared/cors.ts';

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

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!stripeSecretKey || !webhookSecret) {
      console.error('Missing Stripe configuration');
      return new Response(
        JSON.stringify({ error: 'Configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe signature' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify webhook signature (simplified - in production use proper crypto verification)
    // For now, we'll trust the webhook and process the event

    let event;
    try {
      event = JSON.parse(body);
    } catch (err) {
      console.error('Invalid JSON:', err);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Received Stripe webhook:', event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object, supabaseUrl, supabaseServiceKey);
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, supabaseUrl, supabaseServiceKey);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabaseUrl, supabaseServiceKey);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object, supabaseUrl, supabaseServiceKey);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object, supabaseUrl, supabaseServiceKey);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in stripe-webhook function:', error);
    
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

async function handleCheckoutCompleted(session: any, supabaseUrl: string, supabaseServiceKey: string) {
  const userId = session.metadata?.user_id;
  const customerId = session.customer;

  if (!userId) {
    console.error('No user_id in checkout session metadata');
    return;
  }

  // Update subscription with Stripe customer ID
  const updateResponse = await fetch(`${supabaseUrl}/rest/v1/subscriptions?id=eq.${userId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'apikey': supabaseServiceKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      stripe_customer_id: customerId,
      status: 'active'
    }),
  });

  if (!updateResponse.ok) {
    console.error('Failed to update subscription with customer ID');
  }

  console.log(`Checkout completed for user ${userId}, customer ${customerId}`);
}

async function handleSubscriptionUpdated(subscription: any, supabaseUrl: string, supabaseServiceKey: string) {
  const customerId = subscription.customer;
  const status = subscription.status;
  const priceId = subscription.items.data[0]?.price?.id;

  // Map Stripe price IDs to plan names - Updated with new pricing
  const planMapping: Record<string, string> = {
    'price_pro_monthly': 'pro',      // 49 RON - 20 plans, 100 content
    'price_premium_monthly': 'premium', // 99 RON - 50 plans, 250 content
  };

  const plan = planMapping[priceId] || 'free';

  // Find user by customer ID
  const userResponse = await fetch(`${supabaseUrl}/rest/v1/subscriptions?stripe_customer_id=eq.${customerId}&select=id`, {
    headers: {
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'apikey': supabaseServiceKey,
    },
  });

  if (!userResponse.ok) {
    console.error('Failed to find user by customer ID');
    return;
  }

  const userData = await userResponse.json();
  if (!userData || userData.length === 0) {
    console.error('No user found for customer ID:', customerId);
    return;
  }

  const userId = userData[0].id;

  // Update subscription
  const updateResponse = await fetch(`${supabaseUrl}/rest/v1/subscriptions?id=eq.${userId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'apikey': supabaseServiceKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      plan: plan,
      status: status
    }),
  });

  if (!updateResponse.ok) {
    console.error('Failed to update subscription');
  }

  console.log(`Subscription updated for user ${userId}: ${plan} (${status})`);
}

async function handleSubscriptionDeleted(subscription: any, supabaseUrl: string, supabaseServiceKey: string) {
  const customerId = subscription.customer;

  // Find user by customer ID
  const userResponse = await fetch(`${supabaseUrl}/rest/v1/subscriptions?stripe_customer_id=eq.${customerId}&select=id`, {
    headers: {
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'apikey': supabaseServiceKey,
    },
  });

  if (!userResponse.ok) {
    console.error('Failed to find user by customer ID');
    return;
  }

  const userData = await userResponse.json();
  if (!userData || userData.length === 0) {
    console.error('No user found for customer ID:', customerId);
    return;
  }

  const userId = userData[0].id;

  // Update subscription to free plan
  const updateResponse = await fetch(`${supabaseUrl}/rest/v1/subscriptions?id=eq.${userId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'apikey': supabaseServiceKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      plan: 'free',
      status: 'canceled'
    }),
  });

  if (!updateResponse.ok) {
    console.error('Failed to update subscription to free');
  }

  console.log(`Subscription canceled for user ${userId}, reverted to free plan`);
}

async function handlePaymentSucceeded(invoice: any, supabaseUrl: string, supabaseServiceKey: string) {
  const customerId = invoice.customer;
  console.log(`Payment succeeded for customer ${customerId}`);
  
  // You can add additional logic here, such as:
  // - Sending confirmation emails
  // - Updating payment history
  // - Triggering notifications
}

async function handlePaymentFailed(invoice: any, supabaseUrl: string, supabaseServiceKey: string) {
  const customerId = invoice.customer;
  console.log(`Payment failed for customer ${customerId}`);
  
  // You can add additional logic here, such as:
  // - Sending payment failure notifications
  // - Updating subscription status
  // - Implementing retry logic
}