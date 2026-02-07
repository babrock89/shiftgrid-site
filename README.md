# ShiftGrid Website

Marketing website for [ShiftGrid](https://github.com/babrock89/lab-scheduler) — a constraint-aware shift scheduling desktop application.

**Live site:** https://shiftgrid.app

## Pages

- **Home** (`index.html`) — Overview, features, workflow, constraints
- **Features** (`features.html`) — Detailed feature descriptions with screenshots
- **Download** (`download.html`) — Download links, system requirements (fetches latest version from GitHub)
- **Pricing** (`pricing.html`) — Licensing tiers and FAQ with Stripe payment links
- **Docs** (`docs.html`) — Changelog and manual (fetched dynamically from GitHub releases)
- **Contact** (`contact.html`) — Contact form (handled by Netlify Forms)
- **Success** (`success.html`) — Post-purchase thank you page

## Architecture

```
shiftgrid-site/
├── index.html, features.html, etc.  # Static HTML pages
├── style.css                         # All styles
├── netlify.toml                      # Netlify configuration
├── netlify/functions/
│   ├── stripe-webhook.js             # Handles Stripe payments & license generation
│   └── package.json                  # Function dependencies
├── sitemap.xml                       # SEO sitemap
├── robots.txt                        # Search engine directives
└── STRIPE-SETUP.md                   # Payment system setup guide
```

## Payment & Licensing System

The site uses an automated license delivery system:

1. **Customer clicks "Get License"** on pricing page → redirects to Stripe Checkout
2. **Customer pays** via Stripe (credit card, etc.)
3. **Stripe sends webhook** to `/.netlify/functions/stripe-webhook`
4. **Function generates license** using RSA-2048 signing (same as `generate-license.cjs`)
5. **License emailed** to customer via Resend
6. **Customer redirected** to `success.html`

### License Tiers

| Tier | Price | Assets | Stripe Price ID |
|------|-------|--------|-----------------|
| Starter (A) | $199/year | Up to 3 | `STRIPE_PRICE_STARTER` |
| Professional (B) | $449/year | Up to 6 | `STRIPE_PRICE_PROFESSIONAL` |
| Enterprise (C) | $999/year | Unlimited | `STRIPE_PRICE_ENTERPRISE` |

### Environment Variables (Netlify)

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_STARTER` | Price ID for Starter tier |
| `STRIPE_PRICE_PROFESSIONAL` | Price ID for Professional tier |
| `STRIPE_PRICE_ENTERPRISE` | Price ID for Enterprise tier |
| `RESEND_API_KEY` | Resend email API key |
| `FROM_EMAIL` | Sender email (e.g., `licenses@shiftgrid.app`) |
| `LICENSE_PRIVATE_KEY` | RSA private key for signing licenses (with `\n` for newlines) |

### Services Used

- **Stripe** — Payment processing
- **Resend** — Transactional email delivery
- **Netlify Functions** — Serverless webhook handler

See `STRIPE-SETUP.md` for detailed setup instructions.

## Dynamic Content

### Download Page
Fetches latest release info from GitHub API:
- Version number
- Release date
- Download link points to `ShiftGrid-Setup.exe` from latest release

### Docs Page
Fetches from GitHub:
- **Changelog** — From GitHub Releases API (`/repos/babrock89/shiftgrid-releases/releases`)
- **Manual** — From `MANUAL.md` in repo main branch

## SEO

- `sitemap.xml` — Lists all pages for search engines
- `robots.txt` — Allows all crawlers, points to sitemap
- Google Search Console verified via DNS TXT record

## DNS Configuration (Namecheap)

| Type | Host | Value |
|------|------|-------|
| A | @ | 99.83.190.102 (Netlify) |
| A | @ | 75.2.60.5 (Netlify) |
| CNAME | www | shiftgridapp.netlify.app |
| TXT | @ | google-site-verification=... |
| TXT | resend._domainkey | (DKIM for Resend) |
| TXT | send | (SPF for Resend) |
| MX | send | (Resend bounce handling) |

## Development

This is a static HTML/CSS site. Netlify Functions require Node.js.

### Run locally

**Option 1: VS Code Live Server** (recommended for HTML)
- Install "Live Server" extension
- Right-click `index.html` → Open with Live Server

**Option 2: Netlify CLI** (to test functions locally)
```bash
npm install -g netlify-cli
netlify dev
```

**Option 3: Python**
```bash
python -m http.server 8000
```

## Deployment

Push to `main` branch → Netlify auto-deploys to https://shiftgrid.app

## Assets

- `icon.png` — Favicon and app icon
- `logo.png` — Full logo image
- `style.css` — All styles
- `screenshots/` — Feature screenshots

## Related

- [ShiftGrid Desktop App](https://github.com/babrock89/lab-scheduler)
- [ShiftGrid Releases](https://github.com/babrock89/shiftgrid-releases)
