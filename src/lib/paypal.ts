const PAYPAL_API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

/**
 * Generates an access token for the PayPal REST API.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = (process.env.PAYPAL_CLIENT_ID || '').trim();
  const clientSecret = (process.env.PAYPAL_CLIENT_SECRET || '').trim();

  if (!clientId || !clientSecret) {
    throw new Error('PayPal Client ID or Secret is not configured in .env');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store'
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Failed to get PayPal access token:', data);
    throw new Error('Failed to generate PayPal access token');
  }

  return data.access_token;
}

/**
 * Creates a PayPal Order (Checkout).
 */
export async function createPayPalOrder(amountUsd: number, referenceId: string, returnUrl: string) {
  const accessToken = await getPayPalAccessToken();

  const orderPayload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: referenceId, // Our DB Support ID
        amount: {
          currency_code: 'USD',
          value: amountUsd.toFixed(2), // Format to 2 decimal places
        },
      },
    ],
    payment_source: {
      paypal: {
        experience_context: {
          payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
          brand_name: 'Batalla de Hinchadas',
          locale: 'es-CO',
          landing_page: 'GUEST_CHECKOUT',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          return_url: returnUrl,
          cancel_url: returnUrl, // Go back to the same page if cancelled
        }
      }
    }
  };

  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      // Idempotency key to avoid duplicate orders for the same support request
      'PayPal-Request-Id': referenceId 
    },
    body: JSON.stringify(orderPayload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Failed to create PayPal order:', data);
    throw new Error('Failed to create PayPal order');
  }

  // Find the approve link to redirect the user
  const approveLink = data.links.find((link: any) => link.rel === 'payer-action' || link.rel === 'approve');

  if (!approveLink) {
    throw new Error('No approve link found in PayPal response');
  }

  return {
    orderId: data.id,
    checkoutUrl: approveLink.href,
  };
}

/**
 * Captures a PayPal order after the user approves it.
 * This is used for webhooks or verification if needed, 
 * but usually the webhook gives the capture directly.
 */
export async function verifyPayPalOrder(orderId: string) {
  const accessToken = await getPayPalAccessToken();
  
  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  return data;
}
