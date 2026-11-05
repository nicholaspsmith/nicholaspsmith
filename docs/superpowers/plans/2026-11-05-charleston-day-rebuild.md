# Charleston Day Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Angular site with the "one day in Charleston" site: a scroll-driven sky, seven interactive project sections, project pages, a real resume, and hosting ready to move to Cloudflare.

**Architecture:** A static Astro site in `site/`. All content is pre-rendered HTML. Every section carries its own still sky, and JavaScript upgrades the page to one fixed, cross-fading sky, so no-JS and reduced motion share one code path. Interactive pieces are small vanilla TypeScript components. A small Worker in front of the assets handles `www`, old URLs and security headers.

**Tech Stack:** Astro 7, TypeScript, Vitest, Playwright with `@axe-core/playwright`, Wrangler 4, Node 24, Fontsource (self-hosted Fraunces and Hanken Grotesk).

**Spec:** `docs/superpowers/specs/2026-11-05-portfolio-rebuild-design.md`. Prototype: `docs/superpowers/prototype/index.html`, tabs C and B.

## Global Constraints

- Business-owner reader: no jargon, stacks or skills lists anywhere except `/resume`.
- No invented numbers or claims. Facts come from the 2026 resume, project READMEs and the live sites.
- Contact: `me@nicksmith.software`, `https://www.linkedin.com/in/nps90/`, `https://cal.com/nicholas-p-smith`.
- Keep the musictree logo. No Matrix rain, video, theme toggle or contact form.
- No link to menumon.nicksmith.software. Menumon gets no `/work` page.
- Nothing shipped may contain the Menumon slang: test `/pimp|\bhoes?\b|welfare queen|street walker|slap|\bcane\b/i` over `site/dist`. Also none of "daemon", "vessel", "Crypt" in visible copy.
- WCAG 2.2 AA. 320 px up with 16 px gutters and no horizontal scrolling.
- Core Web Vitals: LCP 2.5 s, INP 200 ms, CLS 0.1. About 500 KB first load, with Menumon lazy loaded beyond that.
- Do not change DNS, deploy, push to `main`, or merge. The launch is Nicholas's say-so, and `docs/superpowers/plans/launch-checklist.md` describes it.
- Root `README.md` is the GitHub profile page: leave it alone.

## Review Focus

- A reader reloads halfway down or opens `/#contact`: the sky matches that position on first paint.
- A phone rotates or images finish loading, so sections move: the sky keeps tracking the real positions.
- A keyboard user tabs through the page and the Menumon menus: focus is visible, not under the nav, Esc closes a menu and returns focus.
- Browser storage is blocked: the pause control still works for the visit and nothing throws.
- Menumon's code or images fail to load: the section still reads properly with a still picture of the bar.

---

## File Structure

```text
site/
  astro.config.mjs  package.json  tsconfig.json  wrangler.jsonc
  playwright.config.ts  vitest.config.ts
  public/            favicons, resume PDF, musictree SVGs, og.png, menumon/
  scripts/           make-og.mjs, check-budget.mjs, check-vocabulary.mjs
  src/
    worker.ts        www redirect, old URLs, security headers
    lib/sky.ts       sky stops, interpolation, contrast, clock
    lib/recipe.ts    amount scaling and formatting
    data/day.ts      section order, tying sky stops to content
    data/projects.ts seven projects
    data/resume.ts   structured resume
    layouts/Base.astro
    components/      Sky, Nav, Footer, Palm, DaySection, ContactLinks
    interactive/     FabricPicker, DayNightHouse, HazardLayers, RecipeScaler,
                     SubtitleWords, DoseCalendar, MenumonBar
    interactive/menumon/  cleaned hero.js, hero-menus.js, menumon.css
    assets/work/     project images
    pages/           index, resume, mac-classic, 404, work/[slug]
  tests/unit/  tests/e2e/
```

---

### Task 1: Project scaffold and Worker

**Files:**
- Create: `site/package.json`, `site/astro.config.mjs`, `site/tsconfig.json`, `site/wrangler.jsonc`, `site/vitest.config.ts`, `site/playwright.config.ts`, `site/src/worker.ts`, `site/src/pages/index.astro` (placeholder)
- Test: `site/tests/unit/worker.test.ts`

**Interfaces:**
- Produces: `export default { fetch(request: Request, env: { ASSETS: { fetch: typeof fetch } }): Promise<Response> }` in `site/src/worker.ts`; npm scripts `dev`, `build`, `preview`, `test`, `test:e2e`, `deploy`.

- [ ] **Step 1: Write the failing tests** in `worker.test.ts`:
  - `https://www.nicholaspsmith.com/resume?x=1` answers 301 to `https://nicholaspsmith.com/resume?x=1`.
  - `/about` answers 301 to `/#about`, `/contact` to `/#contact`, `/projects` and `/experience` to `/#work`.
  - Paths such as `/work/zimu` reach `env.ASSETS.fetch`.
  - Asset responses carry `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` and a `Content-Security-Policy` with `frame-src https://jamesfriend.com.au`.
- [ ] **Step 2: Run** `npm test -- worker` in `site/`. Expected: FAIL, module not found.
- [ ] **Step 3: Scaffold Astro** with `output: 'static'`, `site: 'https://nicholaspsmith.com'`, `trailingSlash: 'never'`, `build.format: 'file'`, and `@astrojs/sitemap` filtering out `/mac-classic`. `wrangler.jsonc`: name `nicholaspsmith-com`, `main: src/worker.ts`, assets `./dist` with `binding: ASSETS`, `run_worker_first: true`, `not_found_handling: 404-page`. No routes yet: those go in at launch.
- [ ] **Step 4: Implement the Worker.**
- [ ] **Step 5: Run** `npm test` and `npm run build`. Expected: PASS, and `dist/index.html` exists.
- [ ] **Step 6: Commit.**

### Task 2: Sky engine

**Files:**
- Create: `site/src/lib/sky.ts`
- Test: `site/tests/unit/sky.test.ts`

**Interfaces:**
- Produces:
  - `type SkyStop = { id: string; label: string; top: string; bottom: string; ink: string; land: string; night: number; minutes: number }`
  - `STOPS: SkyStop[]`, nine stops with ids `dawn, early, morning, midday, afternoon, sunset, dusk, night, late`
  - `mix(a: string, b: string, t: number): string`
  - `contrast(a: string, b: string): number`
  - `skyAt(p: number): { index: number; t: number; top: string; bottom: string; ink: string; inverse: string; land: string; night: number; minutes: number; veil: number }`, where `p` runs from 0 to `STOPS.length - 1`
  - `progressAt(y: number, centres: number[]): number`
  - `formatClock(minutes: number): string`

- [ ] **Step 1: Write the failing tests:**
  - `formatClock(660)` is `'11:00 AM'`, `formatClock(0)` is `'12:00 AM'`, `formatClock(750)` is `'12:30 PM'`.
  - `progressAt` gives 0 above the first centre, `STOPS.length - 1` below the last, and 1.5 halfway between the second and third.
  - Contrast sweep: for `p` from 0 to 8 in 400 steps, composite `inverse` at alpha `veil` over `top` and over `bottom`. `contrast(ink, composite)` is at least 4.5 for both.
  - `skyAt(i).veil` is 0 at every whole-number stop.
- [ ] **Step 2: Run** `npm test -- sky`. Expected: FAIL.
- [ ] **Step 3: Implement.** Colours mix in sRGB, matching a CSS opacity crossfade. Dawn is a pastel sky with dark ink, and sunset keeps both ends dark enough for white ink (bottom near `#a23a3e`, not the prototype's `#f2704e`). `veil` is the smallest alpha that passes, rounded up to 0.01. The veil exists because the sky passes through mid-tones where neither ink passes alone.
- [ ] **Step 4: Run** `npm test -- sky`. Expected: PASS.
- [ ] **Step 5: Commit.**

### Task 3: The day

**Files:**
- Create: `site/src/layouts/Base.astro`, `site/src/components/{Sky,Nav,Footer,Palm,DaySection,ContactLinks}.astro`, `site/src/data/day.ts`, `site/src/pages/index.astro`
- Copy: `frontend/public/musictree*.svg`, favicons
- Test: `site/tests/e2e/day.spec.ts`

**Interfaces:**
- Consumes: `sky.ts`.
- Produces:
  - `DaySection.astro` props `{ stop: string; id?: string; heading: string; level?: 1|2 }` with a default slot for copy and an `interactive` slot.
  - The contract between sections and sky: each section has `data-stop`, and its still background and ink come from CSS custom properties set inline from `STOPS`. `<html class="sky-live">` makes sections transparent.
  - `Base.astro` props `{ title: string; description: string; image?: string; noindex?: boolean }`.

- [ ] **Step 1: Write the failing tests:**
  - With JavaScript disabled: the name, "software engineer", MongoDB, Cisco and a `mailto:me@nicksmith.software` link are in the page, and all nine sections have a non-transparent background.
  - With `reducedMotion: 'reduce'`: `html` lacks `sky-live`, and the palm has `animation-name: none`.
  - With JS: scrolling to `#contact` makes the `late` layer's opacity 1.
  - Loading `/#contact` directly has the `late` layer visible with no scrolling (Review Focus).
  - Shrinking the viewport after load changes which layer shows at a fixed section (Review Focus).
  - The clock chip reads `/\d+:\d{2} (AM|PM) in Charleston/` and changes on scroll.
  - The pause button sets `aria-pressed` and stops the sway, with `localStorage` stubbed to throw (Review Focus).
  - `scroll-padding-top` keeps a focused element clear of the nav.
- [ ] **Step 2: Run** `npm run test:e2e -- day`. Expected: FAIL.
- [ ] **Step 3: Build the layout and components.** `Sky.astro` has one absolutely positioned layer per stop, crossfaded by opacity so scrolling never repaints the gradient, plus orb, stars, marsh and palm. The script measures section centres with a `ResizeObserver`, runs in `requestAnimationFrame`, and sets layer opacities, `--ink`, `--land` and `--veil`. On narrow screens the sun is dimmed so it can't undercut text. Self-host Fraunces and Hanken Grotesk through Fontsource, preloading only the display weight. Copy is a first pass in Nicholas's voice, plain and short.
- [ ] **Step 4: Run** `npm run test:e2e -- day`. Expected: PASS.
- [ ] **Step 5: Look at it** at 1440, 768 and 375 wide, at each stop, and fix what looks wrong.
- [ ] **Step 6: Commit.**

### Task 4: Projects and project pages

**Files:**
- Create: `site/src/data/projects.ts`, `site/src/pages/work/[slug].astro`, `site/src/assets/work/*`
- Test: `site/tests/e2e/projects.spec.ts`

**Interfaces:**
- Produces: `type Project = { slug: string; name: string; stop: string; oneLine: string; problem: string; did: string; result: string; live?: { href: string; label: string }; image: ImageMetadata; imageAlt: string; credit?: string }` and `PROJECTS: Project[]`, slugs `powells-upholstery, chs-irrigation-lighting, disaster-maps, from-tired-to-iron, zimu, petdoses`.

- [ ] **Step 1: Write the failing tests:**
  - Every slug returns 200 with the name in an `h1`, and links back to its section on the home page.
  - `/work/menumon` is 404.
  - `/work/disaster-maps` names Nicholas's role and credits the team.
  - No project page contains the word "React", "TypeScript" or "API".
- [ ] **Step 2: Run** the tests. Expected: FAIL.
- [ ] **Step 3: Capture and add images:** Powell's and CHS at 2× from their live sites, Zimu from `~/Code/zimu/docs/screenshots`, DisasterMaps from `frontend/public/info/disastermaps-map-dark.png`, From Tired to Iron from `apps/apple/iOS/Tests/__Snapshots__`, and PetDoses from its live site. Render through `astro:assets`.
- [ ] **Step 4: Write the data and page.** Word Powell's as live work without implying it's finished. For CHS use only what is on its live site and do not present its stock photos as completed jobs. Leave a project's result qualitative where nothing is measured.
- [ ] **Step 5: Run** the tests. Expected: PASS.
- [ ] **Step 6: Commit.**

### Task 5: Interactive pieces from the prototype

**Files:**
- Create: `site/src/lib/recipe.ts`, `site/src/interactive/{FabricPicker,RecipeScaler,SubtitleWords}.astro`
- Modify: `site/src/pages/index.astro`
- Test: `site/tests/unit/recipe.test.ts`, `site/tests/e2e/interactive.spec.ts`

**Interfaces:**
- Produces: `formatAmount(amount: number, unit: 'g'|'cup'|'tbsp'): string`.

- [ ] **Step 1: Write the failing tests:**
  - `formatAmount(600, 'g')` is `'600 g'`, `(1200, 'g')` is `'1.2 kg'`, `(0.5, 'cup')` is `'½ cup'`, `(1.5, 'cup')` is `'1½ cups'`, `(2, 'cup')` is `'2 cups'`.
  - FabricPicker: choosing a swatch sets `aria-pressed` and updates the live name. It works by keyboard.
  - RecipeScaler: `+` from 2 to 3 servings changes the ingredient list and the amounts inside the steps. `−` stops at 1 and `+` at 12.
  - SubtitleWords: pressing a word's button shows its pinyin and meaning in a popup announced with `aria-live="polite"`. Esc closes it.
  - With JS off, each shows a sensible default state and hides its "try it" prompt.
- [ ] **Step 2: Run** the tests. Expected: FAIL.
- [ ] **Step 3: Implement.** FabricPicker uses real swatches from `~/Code/powells-upholstery/apps/web/public/fabrics` or `textures` on the sofa where the textures suit. Subtitle words use the system CJK font stack, so no web font is added. Recipe is labelled sample data.
- [ ] **Step 4: Run** the tests. Expected: PASS.
- [ ] **Step 5: Commit.**

### Task 6: New interactive pieces

**Files:**
- Create: `site/src/interactive/{DayNightHouse,HazardLayers,DoseCalendar}.astro`
- Modify: `site/src/pages/index.astro`
- Test: `site/tests/e2e/interactive.spec.ts`

- [ ] **Step 1: Write the failing tests:**
  - DayNightHouse: a two-state control with `aria-pressed` switches between "By day" and "After dark", and the scene's state changes.
  - HazardLayers: three named layers (flooding, road closures, warnings), each a checkbox that shows or hides its marks. The map has a text alternative that names what's visible.
  - DoseCalendar: morning and evening doses tick off, and a "remaining" count falls and rises. Labelled sample data.
- [ ] **Step 2: Run** the tests. Expected: FAIL.
- [ ] **Step 3: Implement** as inline SVG and HTML. The house is drawn, not a stock photo. The map is a simplified Charleston shape marked "Illustration".
- [ ] **Step 4: Run** the tests. Expected: PASS.
- [ ] **Step 5: Commit.**

### Task 7: Menumon

**Files:**
- Create: `site/src/interactive/MenumonBar.astro`, `site/src/interactive/menumon/{hero.js,hero-menus.js,menumon.css}`, `site/public/menumon/*`, `site/scripts/check-vocabulary.mjs`, `site/scripts/menumon-icon.swift`
- Modify: `site/src/pages/index.astro`
- Test: `site/tests/e2e/menumon.spec.ts`

**Interfaces:**
- Consumes: from the Menumon site: `window.menumonHero.{ready,setState,getState}`, the `.display`, `.bezel` and `.bar-wrap` markup, and `img/hero/anim.json`.
- Produces: `MenumonBar.astro` with no props. `npm run check:vocabulary` exits non-zero on a match over `dist`.

- [ ] **Step 1: Write the failing tests:**
  - Each app's button in the bar opens a menu, Esc closes it, and focus returns to the button (Review Focus).
  - Opening Homestead and using a control changes the icon's state.
  - No `menumon/` image or script is requested until the section nears the viewport.
  - With `menumon/*` requests aborted, the still bar image and the section's copy remain (Review Focus).
  - Phone width follows the Menumon site's phone behaviour with no horizontal scrolling.
- [ ] **Step 2: Run** the tests. Expected: FAIL.
- [ ] **Step 3: Copy** `hero.js`, `hero-menus.js`, the `hm-*`, `bar-*`, `.display`, `.bezel` and `.wallpaper` rules, and `img/hero/` from `~/Code/widgets.nicksmith.software/site/`.
- [ ] **Step 4: Clean the code.** Remove the `W()` helper and Mode switch so only Normal Mode strings remain, rename `hoes` and `slaps` keys, and delete comments with the vocabulary. Rewrite asset paths to `/menumon/`, and make the module lazy, loaded by an `IntersectionObserver`.
- [ ] **Step 5: Clean the images.** Render the sparkles symbol in the Normal Mode colours from `mac-daddy-menubar/Sources/MacDaddy/main.swift` with `menumon-icon.swift`, composite it into `bar.png`, regenerate `state-mac-daddy.png` for each state key, remove `anim-mac-daddy.png`, and drop Mac Daddy's animation entry from `anim.json`. Commit the outputs and the script.
- [ ] **Step 6: Run** the tests and `npm run build && npm run check:vocabulary`. Expected: PASS.
- [ ] **Step 7: Commit.**

### Task 8: Resume, extras and metadata

**Files:**
- Create: `site/src/data/resume.ts`, `site/src/pages/resume.astro`, `site/src/pages/mac-classic.astro`, `site/src/pages/404.astro`, `site/scripts/make-og.mjs`, `site/public/og.png`
- Copy: `frontend/public/resume/Nicholas_Smith_Resume_2026.pdf`
- Modify: `site/src/layouts/Base.astro`
- Test: `site/tests/e2e/pages.spec.ts`

- [ ] **Step 1: Write the failing tests:**
  - `/resume` has every employer as text, a PDF link that returns 200, and print CSS that hides the nav.
  - `/mac-classic` has the iframe, isn't in the nav, and isn't in the sitemap.
  - An unknown path shows the styled 404 with a link home.
  - Every page has a unique title, a description, `og:image`, and a canonical on the apex. The home page has `Person` JSON-LD.
- [ ] **Step 2: Run** the tests. Expected: FAIL.
- [ ] **Step 3: Implement.** Transcribe `resume.ts` from the PDF. The experience shown on the home page reads from it. Add the Cloudflare Web Analytics beacon behind `PUBLIC_CF_BEACON`, rendering nothing while it's unset.
- [ ] **Step 4: Run** the tests. Expected: PASS.
- [ ] **Step 5: Commit.**

### Task 9: Quality pass and handover

**Files:**
- Create: `site/tests/e2e/quality.spec.ts`, `site/scripts/check-budget.mjs`, `docs/superpowers/plans/launch-checklist.md`
- Modify: `.github/workflows/deploy.yaml`
- Delete: `frontend/`

- [ ] **Step 1: Write the failing tests:**
  - axe finds no WCAG A or AA violations on every page, at dawn, midday, sunset and night scroll positions.
  - No horizontal scroll at 320, 375, 768 and 1440 wide on every page.
  - `check-budget.mjs` fails if the home page's first-load HTML, CSS, JS, fonts and above-the-fold images exceed 500 KB.
- [ ] **Step 2: Run** the tests. Expected: FAIL until fixed.
- [ ] **Step 3: Fix** what they find. Measure LCP, CLS and scroll frame rate at 4× CPU throttling through Playwright's CDP session, and fix anything outside the targets.
- [ ] **Step 4: Replace the deploy workflow:** on push to `main`, Node 24, install, test, build, `cloudflare/wrangler-action`, using secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. It doesn't run until this branch merges.
- [ ] **Step 5: Delete `frontend/`.** Keep root `README.md`.
- [ ] **Step 6: Write the launch checklist:** add the secrets; add `custom_domain` routes for the apex and `www` to `wrangler.jsonc`; deploy; confirm `https://www.nicholaspsmith.com` passes TLS and redirects; disable GitHub Pages; add the analytics token; Nicholas's copy review; confirm the CHS owner is happy to be shown.
- [ ] **Step 7: Run** `npm test`, `npm run test:e2e`, `npm run build`, `npm run check:vocabulary` and `npm run check:budget`. Expected: all PASS.
- [ ] **Step 8: Commit.**
