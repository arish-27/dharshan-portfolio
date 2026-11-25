# Project Handoff & Context Memory — Dharshan Video Editor Portfolio

This file documents the current state, architecture, client details, and design rules of this portfolio so any future work in `d:\animated-portfolio - Copy` can pick up seamlessly.

## 1. Repository & Deployment
- **Local Workspace**: `d:\animated-portfolio - Copy`
- **GitHub Remote**: `https://github.com/arish-27/dharshan-portfolio.git` (branch: `main`)
- **Live URL**: `https://arish-27.github.io/dharshan-portfolio/`
- **Git Note on Windows Sandbox**: If `git commit`/`git push` hits `.git/index.lock` permission error inside sandbox, remove `.git/index.lock` if present and run git commands outside sandbox.

## 2. Client & Contact Details (Verified & Live)
- **Name / Brand**: Dharshan (`DHARSHAN.EDIT`) — Professional Video Editor & CapCut Specialist
- **Phone & WhatsApp**: `+91 70101 78837`
  - WhatsApp link: `https://wa.me/917010178837?text=Hi%20Dharshan,%20I%20saw%20your%20Video%20Editing%20portfolio%20and%20would%20love%20to%20discuss%20a%20video%20project!`
  - Direct Call link: `tel:+917010178837`
- **Instagram**: `@dharshhh.__j`
  - Link: `https://www.instagram.com/dharshhh.__j/?utm_source=ig_web_button_share_sheet`
- **Email**: `dharshan.edits@gmail.com`

## 3. Core Architecture & Recent Fixes
- **773-Frame Scroll Canvas (`main.js`)**:
  - Uses `dharshan-frames/frame_001.jpg` to `frame_773.jpg`.
  - Optimized with `lastRenderedFrameIndex` caching so the canvas only repaints when the frame advances (saving ~90% GPU cycles).
- **Butter-Smooth Scrolling (`assets/lenis.min.js` + `main.js` + `style.css`)**:
  - Integrated Lenis v1.1.18 locally (`assets/lenis.min.js`) synced with GSAP's `ScrollTrigger` and `gsap.ticker`.
  - Native CSS `scroll-behavior: smooth` was removed to eliminate stuttering/fighting with GSAP pinning.
  - Anchor links (`#about`, `#skills`, `#contact`) glide smoothly via `lenis.scrollTo`.
- **Creative Arsenal (`#skills`) & Specialized Portals (`#specialized-portals`)**:
  - Right-flanked pinned HUD (`max-w-lg ml-auto`) so Dharshan's face on the left remains 100% unobstructed at all times.
  - Artificial container heights (`4800px` / `2000px`) and `position: sticky` conflicts were removed; GSAP pins `min-h-screen` stages cleanly with zero dead scroll gaps.
  - Card 01 (`CapCut Specialist`) and Portal 01 (`Dedicated Video Projects Gallery`) start immediately visible (`opacity: 1`), with seamless overlapping cross-fades (`<0.08`) and snappy scrub (`scrub: 0.35`, `#skills` `end: "+=1800"`, `#specialized-portals` `end: "+=800"`).
  - HUD cards use `height: auto`, `top: 0; left: 0; width: 100%`, and `justify-start` to prevent unwanted center dead space.

## 4. Official Brand Icons (`assets/icons/`)
- Adobe suite color icons: `premiere_color.svg`, `aftereffects_color.svg`, `photoshop_color.svg`, `illustrator_color.svg`, `audition_color.svg`, `media_encoder_color.svg`, `lightroom.svg`, `davinci.svg`
- Social & platform icons: `tiktok.svg`, `reels.svg`, `gmail_official.svg`, `instagram_official.svg`, `whatsapp_official.svg`, `cinema_clapper.svg`
- CapCut uses an inline pitch-black/neon-lime official vector badge in `index.html`.

## 5. Key Files
- `index.html` — Main landing page (Hero, Marquee, About, Creative Arsenal HUD, Specialized Portals HUD, Projects preview, Contact & Footer)
- `projects.html` — Dedicated Video Projects Gallery with category filters, modal video player, and direct WhatsApp/Instagram/Email links
- `main.js` — Lenis setup, 773-frame canvas engine, custom cursor, GSAP ScrollTrigger HUD timelines
- `style.css` — Theme variables (`#080a0e` dark bg, `#9ae600` neon lime accent), glassmorphism, Lenis base rules, HUD layout styles
- `ai-tools.html` — Secondary AI tools page
