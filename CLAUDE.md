# ShiftGrid Website

## Project Overview
Marketing/landing site for ShiftGrid (formerly Lab Scheduler) — a React + Electron desktop app for constraint-aware shift scheduling.

## Tech Stack
- Static HTML/CSS (no build tools)
- Hosted on Netlify (form integration)

## Related Project
The actual ShiftGrid application is at: `../lab-scheduler/`
- See `../lab-scheduler/CLAUDE.md` for app context
- See `../lab-scheduler/MANUAL.md` for full feature documentation

## Site Structure
- `index.html` — Home page with hero, feature cards, workflow, constraints
- `features.html` — Detailed features page with descriptions and screenshot placeholders
- `download.html` — Download page with GitHub release link, system requirements
- `pricing.html` — Pricing tiers (Trial, Starter $99, Professional $199, Enterprise)
- `contact.html` — Contact form (Netlify) + GitHub issues link
- `style.css` — All styles with responsive design
- `icon.png` — Favicon
- `logo.png` — Logo image

---

## To-Do List

### Completed
- [x] Replace generic messaging on index.html with actual feature highlights
- [x] Add drag-and-drop, auto-scheduler, availability, CSV features to home page
- [x] Add hero section with CTAs
- [x] Add "How It Works" workflow section
- [x] Add constraints section
- [x] Fix download.html — removed .NET requirement, added accurate Electron requirements
- [x] Replace placeholder download link with GitHub releases URL
- [x] Add installation instructions and documentation links
- [x] Update pricing.html with planned licensing tiers (Trial, Starter, Professional, Enterprise)
- [x] Add FAQ section to pricing page
- [x] Update contact.html with GitHub issues link
- [x] Add subject dropdown to contact form
- [x] Create features.html with detailed feature descriptions
- [x] Add Open Graph meta tags to all pages
- [x] Add favicon link to all pages
- [x] Copy icon.png and logo.png to site folder
- [x] Add Features link to navigation on all pages

### Pending
- [ ] Add actual screenshots to features.html (replace placeholders)
- [ ] Add logo to header (optional, text logo works fine)
- [ ] Test mobile responsiveness on all pages
- [ ] Consider adding Google Analytics or simple analytics
- [ ] Add the changelog from the repo for the released ShiftGrid software
- [ ] Add the ability to accept Payment. Not sure how we do this. I am thinking i want payment to go to paypal, but want people to pay how they want to.

### Future / Nice to Have
- [ ] Add demo page once web demo is built (link to `/demo/`)
- [ ] Add docs/manual page if needed
- [ ] Add testimonials section once available

---

## Instructions for Claude
- When updating pages, maintain the existing clean/minimal design style
- Use the same CSS variables and class patterns from style.css
- Reference `../lab-scheduler/MANUAL.md` for accurate feature descriptions
- Keep copy concise and benefit-focused
- All pages should have: favicon, OG meta tags, Features in nav
