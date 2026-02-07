# Stripe + License Automation Setup Guide

This guide walks you through setting up automated license key generation and delivery for ShiftGrid.

## Overview

When a customer purchases a license:
1. Customer clicks "Get License" on pricing page → redirected to Stripe Checkout
2. Customer completes payment on Stripe
3. Stripe sends webhook to your Netlify function
4. Function generates signed license key using your private key
5. Function emails license key to customer via Resend
6. Customer is redirected to success.html

## Step 1: Stripe Setup

### 1.1 Create Stripe Account
1. Go to https://dashboard.stripe.com/register
2. Create an account and verify your email

### 1.2 Create Products and Prices
In Stripe Dashboard → Products → Add Product:

**Product 1: ShiftGrid Starter**
- Name: ShiftGrid Starter
- Price: $199/year (recurring, yearly)
- Copy the Price ID (starts with `price_`)

**Product 2: ShiftGrid Professional**
- Name: ShiftGrid Professional
- Price: $449/year (recurring, yearly)
- Copy the Price ID

**Product 3: ShiftGrid Enterprise**
- Name: ShiftGrid Enterprise
- Price: $999/year (recurring, yearly)
- Copy the Price ID

### 1.3 Create Payment Links
For each product, create a Payment Link:
1. Go to Products → Click product → Create payment link
2. Set After payment → Redirect to: `https://shiftgrid.app/success.html`
3. Copy the payment link URL

### 1.4 Get API Keys
Go to Developers → API keys (or Settings → API keys):
- Copy the **Secret key** (starts with `sk_live_` for production, `sk_test_` for testing)

If you can't find Developers:
- Look at bottom of left sidebar, or
- Go directly to: https://dashboard.stripe.com/test/apikeys

### 1.5 Set Up Webhook
Go to Developers → Webhooks → Add endpoint:
1. Endpoint URL: `https://shiftgrid.app/.netlify/functions/stripe-webhook`
2. Click "Select events"
3. Search for `checkout.session.completed` and check it
4. Click "Add events", then "Add endpoint"
5. Click on your new endpoint, then click "Reveal" next to Signing secret
6. Copy the signing secret (starts with `whsec_`)

## Step 2: Resend Setup (Email Delivery)

Resend is a simple email API - much easier than SendGrid/Twilio.

### 2.1 Create Resend Account
1. Go to https://resend.com/signup
2. Sign up with your email (or GitHub)

### 2.2 Add Your Domain
1. Go to Domains → Add Domain
2. Enter `shiftgrid.app`
3. Resend will show you DNS records to add

### 2.3 Add DNS Records in Namecheap
1. Go to Namecheap → Domain List → Manage → Advanced DNS
2. Add the records Resend shows you (typically 3 records):
   - One TXT record for SPF
   - One TXT record for DKIM
   - One MX record (optional, for receiving replies)
3. Go back to Resend and click "Verify"
4. It may take a few minutes for DNS to propagate

### 2.4 Create API Key
1. In Resend, go to API Keys → Create API Key
2. Name it "ShiftGrid Licenses"
3. Permission: "Sending access" with Full access
4. Domain: Select `shiftgrid.app`
5. Copy the API key (starts with `re_`)

## Step 3: Netlify Environment Variables

In Netlify Dashboard → Site settings → Environment variables, add:

| Variable | Value |
|----------|-------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key (`sk_test_...` or `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Your webhook signing secret (`whsec_...`) |
| `STRIPE_PRICE_STARTER` | Price ID for Starter ($199) |
| `STRIPE_PRICE_PROFESSIONAL` | Price ID for Professional ($449) |
| `STRIPE_PRICE_ENTERPRISE` | Price ID for Enterprise ($999) |
| `RESEND_API_KEY` | Your Resend API key (`re_...`) |
| `FROM_EMAIL` | `licenses@shiftgrid.app` |
| `LICENSE_PRIVATE_KEY` | Your RSA private key (see below) |

### Adding the Private Key

Your private key has newlines. In Netlify, you need to replace actual newlines with `\n`:

1. Open your `private.pem` file
2. Replace all newlines with the literal string `\n`
3. The result should look like: `-----BEGIN RSA PRIVATE KEY-----\nMIIE...base64...\n-----END RSA PRIVATE KEY-----`

Or use this command in PowerShell:
```powershell
(Get-Content private.pem -Raw) -replace "`r`n", "\n" -replace "`n", "\n"
```

## Step 4: Update Pricing Page

Update the "Get License" buttons in pricing.html with your Stripe payment links:

```html
<!-- Starter -->
<a href="https://buy.stripe.com/YOUR_STARTER_LINK" class="btn">Get License</a>

<!-- Professional -->
<a href="https://buy.stripe.com/YOUR_PROFESSIONAL_LINK" class="btn btn-secondary">Get License</a>

<!-- Enterprise -->
<a href="https://buy.stripe.com/YOUR_ENTERPRISE_LINK" class="btn btn-secondary">Get License</a>
```

## Step 5: Deploy and Test

1. Commit and push your changes
2. Netlify will automatically deploy
3. Use Stripe's test mode first:
   - Use test API keys (`sk_test_...`)
   - Use test card: `4242 4242 4242 4242` with any future date and CVC
4. Complete a test purchase and verify:
   - Webhook is received (check Netlify function logs)
   - Email is sent with license key
   - License key works in ShiftGrid

## Step 6: Go Live

1. Switch to live Stripe keys in Netlify environment variables
2. Update payment links in pricing.html to live links
3. Test with a real $1 payment (refund after testing)

## Troubleshooting

### Webhook not receiving events
- Check the webhook endpoint URL is correct
- Verify the webhook is set to receive `checkout.session.completed` events
- Check Netlify function logs for errors

### License email not sending
- Verify Resend API key is correct
- Check domain is verified in Resend dashboard
- Check Netlify function logs for errors

### Invalid license key
- Ensure private key in environment variable has `\n` for newlines
- Verify the private key matches the public key in your app

## Files Created

- `netlify.toml` - Netlify configuration
- `netlify/functions/stripe-webhook.js` - Webhook handler
- `netlify/functions/package.json` - Function dependencies
- `success.html` - Post-purchase thank you page
