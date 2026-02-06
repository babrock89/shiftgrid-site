# ShiftGrid Website

Marketing website for [ShiftGrid](https://github.com/babrock89/lab-scheduler) — a constraint-aware shift scheduling desktop application.

## Pages

- **Home** (`index.html`) — Overview, features, workflow, constraints
- **Features** (`features.html`) — Detailed feature descriptions
- **Download** (`download.html`) — Download links, system requirements
- **Pricing** (`pricing.html`) — Licensing tiers and FAQ
- **Contact** (`contact.html`) — Contact form and support links

## Development

This is a static HTML/CSS site with no build process.

### Run locally

Option 1: VS Code Live Server extension (recommended)
- Install "Live Server" extension
- Right-click `index.html` → Open with Live Server

Option 2: Python
```bash
python -m http.server 8000
```

Option 3: Open directly
- Double-click `index.html` in your file browser

## Deployment

The site uses Netlify for hosting and form handling. Push to the main branch to deploy.

## Assets

- `icon.png` — Favicon and app icon
- `logo.png` — Full logo image
- `style.css` — All styles

## Related

- ShiftGrid desktop application (see `../lab-scheduler/`)
