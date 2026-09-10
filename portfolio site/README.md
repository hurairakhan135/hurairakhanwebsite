# Huraira Khan — Portfolio

A personal portfolio that borrows Steam's profile *structure* — avatar frame, level ring,
hours on record, achievements — with a modern flat surface treatment. Plain HTML, CSS, and
JavaScript. No build step, no framework, no CDN except Google Fonts.

```
portfolio site/
├── index.html              # All page content
├── styles.css              # Design tokens + all layout
├── app.js                  # Tooltips, counters, reveals, copy-to-clipboard
├── assets/favicon.svg
└── Resume_Huraira-13.pdf   # Linked from the "Download Resume" button
```

## Running it

Open `index.html` directly, or serve the folder:

```bash
npx serve .          # or: python -m http.server 4173
```

## Design tokens

Everything lives in `:root` at the top of `styles.css`.

- **Type** — Plus Jakarta Sans for UI and prose, JetBrains Mono for data, labels, and metrics.
- **Color** — flat fills only. Surfaces step `--surface` → `--surface-2` → `--surface-3`;
  neutrals are biased cool toward the blue accent rather than pure grey. The only gradients
  left are the project art (single-hue radial) and the ambient page glow.
- **Shape** — `--r-card` 12px, `--r-btn` 8px, `--r-pill` for tags and chips.

## Section names

Headings match the resume: About, Project Experience, Work Experience, Education, Skills,
Extracurriculars, Let's Connect. Achievement Showcase is the one deliberately game-flavored
heading.

Steam mechanics still carry content where they earn it:

| Element             | What it shows                                             |
| ------------------- | --------------------------------------------------------- |
| Avatar frame + dot  | Availability                                               |
| "Currently In-Game" | Honors B.Sc. Computer Science at Brock                     |
| Level + XP ring     | Year of study, hours across co-op terms                    |
| Hrs on record       | Length of each work term                                   |
| Achievement Showcase| Real resume metrics (342%, 765%, 70%, 99.1% …)             |

## Numbers worth reviewing

- **Hours on record** are derived from employment date ranges at roughly 160 hrs/month
  full-time: 640 (May–Aug 2026), 1,280 (Jan–Aug 2025), 800 (Mar–Jul 2024) = **2,720 total**.
  If you change one, update the total in two places: the XP line in the profile header and
  the Work Experience panel meta.
- **Level 5** is year of study, XP bar at 82%. Adjust `data-count` on `.lvl-value` and
  `--xp` on `.xp-bar i`.

## Editing notes

- **Project art** is a single-hue CSS radial (`.cap-integricode`, `.cap-btc`, …). For a real
  screenshot instead, add `background-image: url(...)` with `background-size: cover`.
- **Tooltips** come from any `data-tip` attribute; `app.js` positions them. They are on the
  profile badges and achievement cards only.
- **Konami code** (↑↑↓↓←→←→BA) unlocks a hidden achievement toast.
- **Reveal on scroll** only animates panels below the fold, so the first painted frame is
  always complete.

## Deploying

Static folder — drop it on GitHub Pages, Netlify, Cloudflare Pages, or Vercel as-is.
For GitHub Pages: push to a repo, then Settings → Pages → deploy from branch root.
