import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const clientId = process.env.PAYPAL_CLIENT_ID || '';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
  const nodeEnv = process.env.NODE_ENV;

  return NextResponse.json({
    nodeEnv,
    clientIdLength: clientId.length,
    clientSecretLength: clientSecret.length,
    clientIdStart: clientId.substring(0, 5),
    clientIdEnd: clientId.substring(clientId.length - 5),
    hasQuotesInId: clientId.includes('"'),
    hasSpacesInId: clientId.includes(' '),
    hasNewlinesInId: clientId.includes('\n') || clientId.includes('\r'),
    hasQuotesInSecret: clientSecret.includes('"'),
    hasSpacesInSecret: clientSecret.includes(' '),
    hasNewlinesInSecret: clientSecret.includes('\n') || clientSecret.includes('\r'),
  });
}
