import Stripe from 'stripe';
import crypto from 'crypto';
import { Resend } from 'resend';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Tier mapping from Stripe price IDs to license tiers
const PRICE_TO_TIER = {
  [process.env.STRIPE_PRICE_STARTER]: 'A',
  [process.env.STRIPE_PRICE_PROFESSIONAL]: 'B',
  [process.env.STRIPE_PRICE_ENTERPRISE]: 'C'
};

const TIER_NAMES = {
  'A': 'Starter',
  'B': 'Professional',
  'C': 'Enterprise'
};

// Generate UUID for license ID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Generate a signed license key (same logic as generate-license.cjs)
// Returns { licenseKey, licenseId, issuedAt } for tracking
function generateLicense(name, tier, expiryDate) {
  // Decode the base64-encoded PEM key from the environment variable
  const privateKey = Buffer.from(process.env.LICENSE_PRIVATE_KEY, 'base64').toString('utf-8');

  const licenseId = generateUUID();
  const issuedAt = new Date().toISOString().split('T')[0];

  const payload = {
    licensee: name,
    tier: tier,
    expiresAt: expiryDate,
    issuedAt: issuedAt,
    licenseId: licenseId
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64');

  const sign = crypto.createSign('SHA256');
  sign.update(payloadB64);
  const signature = sign.sign(privateKey, 'base64');

  const license = {
    payload: payloadB64,
    signature: signature
  };

  return {
    licenseKey: Buffer.from(JSON.stringify(license)).toString('base64'),
    licenseId: licenseId,
    issuedAt: issuedAt
  };
}

// Calculate expiry date (1 year from now)
function getExpiryDate() {
  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 1);
  return expiry.toISOString().split('T')[0];
}

// Send license email via Resend
async function sendLicenseEmail(email, name, tier, licenseKey) {
  const tierName = TIER_NAMES[tier];

  await resend.emails.send({
    from: process.env.FROM_EMAIL || 'licenses@shiftgrid.app',
    to: email,
    subject: `Your ShiftGrid ${tierName} License`,
    attachments: [
      {
        filename: 'shiftgrid-license.lic',
        content: Buffer.from(licenseKey).toString('base64'),
        type: 'application/octet-stream'
      }
    ],
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1e3a8a;">Thank you for purchasing ShiftGrid!</h1>

        <p>Hi ${name},</p>

        <p>Thank you for your purchase of ShiftGrid <strong>${tierName}</strong>. Your license file is attached to this email.</p>

        <h2 style="color: #334155;">How to Activate</h2>

        <ol style="color: #475569; line-height: 1.8;">
          <li>Save the attached <strong>shiftgrid-license.lic</strong> file to your computer</li>
          <li>Open ShiftGrid</li>
          <li>Click <strong>License</strong> in the bottom left</li>
          <li>Click <strong>Update License</strong></li>
          <li>Select the <strong>shiftgrid-license.lic</strong> file</li>
        </ol>

        <p style="color: #475569;">Your license is valid for one year from today and includes all updates during that period.</p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

        <p style="color: #64748b; font-size: 14px;">
          If you have any questions, reply to this email or visit
          <a href="https://shiftgrid.app/contact" style="color: #3b82f6;">shiftgrid.app/contact</a>
        </p>

        <p style="color: #64748b; font-size: 14px;">
          — The ShiftGrid Team
        </p>
      </div>
    `,
    text: `
Thank you for purchasing ShiftGrid!

Hi ${name},

Thank you for your purchase of ShiftGrid ${tierName}. Your license file is attached to this email.

HOW TO ACTIVATE:
1. Save the attached shiftgrid-license.lic file to your computer
2. Open ShiftGrid
3. Click License in the bottom left
4. Click Update License
5. Select the shiftgrid-license.lic file

Your license is valid for one year from today and includes all updates during that period.

If you have any questions, reply to this email or visit https://shiftgrid.app/contact

— The ShiftGrid Team
    `
  });
}

export async function handler(event) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sig = event.headers['stripe-signature'];

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  // Handle checkout.session.completed event
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;

    try {
      // Get customer email and name
      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name || 'Customer';

      if (!customerEmail) {
        console.error('No customer email in session');
        return { statusCode: 400, body: 'No customer email' };
      }

      // Get the line items to determine which tier was purchased
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const priceId = lineItems.data[0]?.price?.id;

      const tier = PRICE_TO_TIER[priceId];

      if (!tier) {
        console.error('Unknown price ID:', priceId);
        return { statusCode: 400, body: 'Unknown product' };
      }

      // Generate the license
      const expiryDate = getExpiryDate();
      const { licenseKey, licenseId, issuedAt } = generateLicense(customerName, tier, expiryDate);
      const tierName = TIER_NAMES[tier];

      // Store license info in Stripe payment metadata
      await stripe.checkout.sessions.update(session.id, {
        metadata: {
          license_id: licenseId,
          license_tier: tierName,
          license_expires: expiryDate,
          license_issued: issuedAt
        }
      });

      // Send the license email to customer
      await sendLicenseEmail(customerEmail, customerName, tier, licenseKey);

      // Send admin notification
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        await resend.emails.send({
          from: process.env.FROM_EMAIL || 'licenses@shiftgrid.app',
          to: adminEmail,
          subject: `New License Sold: ${tierName} - ${customerName}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1e3a8a;">New ShiftGrid License Sold</h2>
              <table style="border-collapse: collapse; width: 100%;">
                <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Customer</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${customerName}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Email</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${customerEmail}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Tier</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${tierName}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">License ID</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${licenseId}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Issued</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${issuedAt}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Expires</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${expiryDate}</td></tr>
              </table>
            </div>
          `
        });
      }

      console.log(`License ${licenseId} sent to ${customerEmail} for tier ${tier}`);

      return { statusCode: 200, body: JSON.stringify({ received: true }) };

    } catch (error) {
      console.error('Error processing payment:', error);
      return { statusCode: 500, body: 'Error processing payment' };
    }
  }

  // Return 200 for other event types
  return { statusCode: 200, body: JSON.stringify({ received: true }) };
}
