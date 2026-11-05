# nicholaspsmith.com rebuild: one day in Charleston

Status: draft for Nicholas's review, 2026-11-05.

Supporting material in this repo:

- Working prototype of the chosen direction: `docs/superpowers/prototype/index.html`, tab **C. Charleston time**. Tab **B. Try the work** shows the kind of interactive pieces wanted. Serve the folder with any static server.
- Research: `docs/superpowers/specs/2026-11-05-portfolio-research.md`. Its advice was written for developers and hiring managers. Where it conflicts with this document, this document wins, notably on audience and on keeping the Matrix rain.

## Intent

nicholaspsmith.com is the business-facing site. nicksmith.software (the Mac OS X Tiger tribute) stays the site for engineers and tech enthusiasts, and this site links to it.

The reader owns a business and wants to hire a software engineer with excellent design and UX skills. They are not technical. They arrive from Nicholas's LinkedIn, GitHub, resume or business card, so they already have his name and want to know whether he is the real thing. Success is that they see what he does, are impressed, and get in touch.

The site's own design is part of the proof. Nicholas rejected three clean, conventional layouts as looking like Squarespace sites, so a tidy professional template is a failure even if it works perfectly.

## Goals

1. Be unmistakably designed and memorable within the first few seconds.
2. Say who Nicholas is and what he does in plain language immediately.
3. Let the reader touch the work, not just look at pictures of it.
4. Include the full interactive Menumon menu bar.
5. Make contacting him easy from any point.
6. Fix what is broken today (see "Current failures").

## Non-goals

- Technical depth: stacks, architecture and code belong on nicksmith.software.
- A blog or a writing section.
- A theme switcher. The sky is the theme, so the dark and light toggle goes.
- A CMS.

## Anti-goals

These make the site a failure even if everything technically works:

- It reads as a template.
- A business owner meets jargon, tech stacks or skills lists.
- The reader must play with something or wait before learning who he is.
- A number or claim appears that Nicholas cannot back up.
- Content inappropriate for a business reader appears anywhere (see the Menumon section).

## The concept

One day in Charleston, with Nicholas's work passing through it.

A fixed sky fills the viewport behind the page. Scrolling carries it from dawn to late night, with the sun rising and setting, then the moon and stars. A marsh horizon sits along the bottom. The musictree logo stands to the right as a large silhouette that sways gently and shifts colour with the light. A small clock chip reads like "11:00 AM in Charleston" and follows the scroll. Body text flips between dark and light as the sky changes, and must stay readable at every point.

The prototype's tab C sets the intended feel, including serif display type (Fraunces) and the sky colours. Treat it as direction, not code to keep.

### Page order

| Time of day | Section |
|---|---|
| Dawn | Opening: name, one plain line on what he does, MongoDB and Cisco visible |
| Early morning | Powell's Upholstery |
| Morning | CHS Irrigation & Lighting |
| Midday | DisasterMaps |
| Afternoon | From Tired to Iron |
| Sunset | Zimu |
| Dusk | PetDoses |
| Night | Menumon |
| Late | Contact |

## Interactive pieces

Decided by Nicholas: the Charleston concept must also carry interactive elements like prototype tab B, plus the full Menumon library.

Every project section has one small, real-feeling thing to use, placed inside the day. Each must work with mouse, touch and keyboard, and the section must still make sense if the reader never touches it.

| Project | Interaction |
|---|---|
| Powell's Upholstery | Pick a fabric and see it on a sofa, as in the prototype |
| CHS Irrigation & Lighting | Switch a house between "by day" and "after dark", using the site's own idea |
| DisasterMaps | Toggle hazard layers on a small illustrative Charleston map |
| From Tired to Iron | Change the servings on a recipe and watch every amount follow, as in the prototype |
| Zimu | Click a word in a subtitle for its meaning, as in the prototype |
| PetDoses | Tick off doses on a small month calendar |
| Menumon | The full interactive menu bar, below |

These are stand-ins for the real products, built for this site. Label sample data where a reader could mistake it for real. Prefer real fabric, photos and art from the projects over drawn placeholders.

## Menumon

Reproduce the interactive menu bar from the hero of https://menumon.nicksmith.software: the Mac menu bar with every app's animated icon, each icon opening its working mock menu, with menus able to change their icon.

The source is `~/Code/widgets.nicksmith.software/site/`: `hero.js`, `hero-menus.js` (62 KB), the matching rules in `style.css`, `img/hero/` (`bar.png`, `anim.json`, sprite strips). `index.html` holds the markup. That repo is private, so CI cannot read it. Copy the files into this repo and add a small refresh script that recopies them from a sibling checkout, so updates are one command.

**Keep it clean for a business reader.** Mac Daddy's default vocabulary uses "Pimp" and "Hoes" wording. `hero-menus.js` already has a Normal Mode: start it with `pimp: false`. Before launch, grep every Menumon string and asset shipped by this site for that vocabulary, and do not show the Pimp Mode toggle or the Menu Pimp mascot. The bar image and Mac Daddy's sprites show Pimp Mode's icon, so regenerate them with the Normal Mode icon, or crop or replace that slot.

Do not copy the site's goth wording either ("daemons", "vessels", "Crypt"). Describe Menumon here as a family of Mac apps. Apollo Monitor and Homestead are told within this section rather than as separate projects.

On a phone, follow the Menumon site's own phone behaviour, which already exists in `hero-menus.js`.

Load Menumon's code and images only as the reader nears that section.

## Project pages

Each project also gets its own page at `/work/<project>`, in plain language: the problem, what Nicholas did, the result, then a link to the live product where one exists. Each page opens with a sentence a business owner would care about.

- Results come only from facts Nicholas can stand behind. If a personal project has no measured result, describe what it does for its user and leave numbers out.
- DisasterMaps is a team project (about 300 of 543 commits are his). Its page states his role and credits the team. Its public site is an under-construction page, so images must come from the app itself.
- Powell's Upholstery is unfinished by Nicholas's own account. Show it as live work without implying it is complete, in wording he approves.
- From Tired to Iron and CHS need screenshots. The CHS README lists claims awaiting its owner's review, so use only what is on the live site.

## Other pages

- **Resume** at `/resume`: real HTML text, with a link to the PDF at `frontend/public/resume/Nicholas_Smith_Resume_2026.pdf`. Generate the page from one structured source so that it can't drift from the rest of the site.
- **Contact**: email, LinkedIn and the booking link `https://cal.com/nicholas-p-smith`, in the Late section and reachable from everywhere. Wording covers both a job and contract work through Bright Logic Digital.
- **Mac Classic** at `/mac-classic`: kept as a hidden extra, not in the navigation. It iframes `https://jamesfriend.com.au/pce-js/pce-js-apps/`. Restyle it to match.
- **Link to nicksmith.software** in the footer, for technical readers.
- **404 page** in the site's style.

Old URLs `/about`, `/contact`, `/projects` and `/experience` redirect to the matching place. The current projects list (old WordPress sites and similar) is retired.

## Brand and content

- **The musictree logo stays** (palm tree with music note, `frontend/public/musictree*.svg`). It is both the navigation mark and the large silhouette.
- The Matrix rain, video and translucent boxes go.
- Copy is first person, plain, and short. Prototype wording is placeholder. Nicholas reviews all copy before launch.
- Facts come from the 2026 resume and the existing site (`frontend/src/app/about/about.html`).

## Quality requirements

- Name, what he does and contact are in the HTML without JavaScript. With JavaScript off, every section is readable on a fixed sky and every page works.
- `prefers-reduced-motion`: no swaying or scroll-linked animation. Each section shows its own still sky, so the idea survives. Interactive pieces keep working.
- WCAG 2.2 AA, including text contrast at every point of the sky. The sky is decorative.
- Works from 320 px wide up, with a 16 px side gutter and no horizontal scrolling. Phones are a primary case, since cards and LinkedIn get opened there.
- Core Web Vitals at the good thresholds: LCP 2.5 s, INP 200 ms, CLS 0.1. Aim for about 500 KB on first load, with Menumon lazy loaded beyond that. Scrolling stays smooth on a mid-range phone.
- Every page has a title, description and Open Graph image, with `Person` structured data, a sitemap and a canonical apex domain.
- Cookieless analytics via Cloudflare Web Analytics, to see whether anyone reaches the projects and the contact links.

## Current failures to fix

All measured 2026-11-05.

- Direct links fail: `/about`, `/contact`, `/projects` and `/resume/` return 404.
- `https://www.nicholaspsmith.com` fails with a certificate name mismatch because its DNS record bypasses Cloudflare. No certificate needs installing: the Cloudflare certificate already covers `*.nicholaspsmith.com`. Serve `www` through Cloudflare and redirect it to the apex.
- The page HTML is empty, with no description or sharing tags.
- The background video is 45 MB.
- White text on the green buttons fails contrast.

## How it gets built

These are Claude's calls, approved in the summary Nicholas read:

- **Astro**, replacing the Angular app, because almost all of this is static content and the interactive pieces can load one at a time. Plain TypeScript for the interactive pieces.
- **Hosted on Cloudflare**, as Workers static assets, replacing GitHub Pages, with deploy on push to `main` as today. This repo's root `README.md` is Nicholas's GitHub profile page, so leave it as is.
- The DNS, certificate and hosting changes go live only with Nicholas's say-so at launch, since they affect the live domain.

## Claude's calls, not yet seen by Nicholas

- The order of projects through the day.
- The interactions for CHS, DisasterMaps and PetDoses, which were not in the prototype.
- Project pages live under `/work/<project>`.
- The contact form is removed in favour of email and a booking link. The form sends through a third party and exposes his Gmail address in the code.
- Cloudflare's block on AI crawlers is left as it is.

## Left to the builder

- Exact sky colours, typefaces, spacing and animation timing, within the prototype's feel.
- How the sky is drawn, provided it meets the performance and accessibility requirements.
- Test tooling, and the CI details of the deploy.
- How each interactive piece is structured.
