# personal-site

Shawn Mondol's personal portfolio site — a resume/CV viewer, a projects CMS for writing up work whose source isn't public, and an "About Me" page with an interactive travel map. Public visitors see the published content; an admin (authenticated via Google) can upload a resume PDF, have it parsed into structured data by Claude, and edit every section in place on the real page.

## Tech stack

- **React 19** + **TypeScript**, built with **Vite 7**
- **Tailwind CSS v4** (via `@tailwindcss/vite`) over a dark design-token system, with a runtime accent theme (CSS custom properties in [src/models/themes.ts](src/models/themes.ts))
- **React Router 7** for routing
- **Firebase** — Hosting, Firestore (content), Storage (images/PDFs), and Auth (Google sign-in)
- **Firebase Cloud Functions** (Node 24) — a callable function that parses resume text with the **Anthropic Claude** SDK
- **Leaflet** / **react-leaflet** for the travel map
- **pdfjs-dist** for extracting text from uploaded resume PDFs
- **framer-motion**, **lucide-react** icons, **sonner** toasts, **@tanstack/react-table**
- Dev-only: **sharp** + **firebase-admin**, used by the image backfill script (not shipped in the bundle)

## Project structure

```
src/
  App.tsx                 # Routes + provider tree (Theme → Auth → Resume), nav + footer shell
  index.css               # Design tokens, theme wiring, and .btn/.card/.tag component classes
  main.tsx
  components/
    Resume/
      ResumeDisplay/      # Resume sections, inline-editable when editMode is set
      ResumeEditForms/    # Inline editing primitives (InlineText, InlineStringList,
                          # EntryControls, listUtils) shared across the site
      ResumeData/         # Admin table and PDF upload
    Projects/             # ProjectBody — the content-block renderer/editor
    About/                # Travel cards, gallery modal, and map (Leaflet)
    SiteComponents/       # Nav header, footer, buttons, modals, table, theme picker,
                          # admin auth gate
  context/                # AuthContext, ResumeContext, ThemeContext
  pages/
    Resume/               # ResumePage, ResumeDataPage, EditResumePage
    Projects/             # ProjectsPage (index), ProjectDetailPage (case study + CMS)
    AboutMe/              # AboutMePage
  services/
    auth/                 # Firebase app init + user auth
    resume/               # PDF text extraction, Firestore CRUD, callable to parseResume
    projects/             # Firestore CRUD + Storage image upload for projects
    about/                # Firestore CRUD for the About/travel content
    images/               # Client-side canvas downscaling shared by all uploads
  models/                 # Resume, Project, About, and theme type definitions

functions/
  src/index.ts            # parseResume callable — sends resume text to Claude,
                          # returns structured JSON matching the resume schema

scripts/
  backfill-images.mjs     # One-off re-encode of pre-existing Storage images
```

## Routes

| Path                  | Access      | Description                                        |
| --------------------- | ----------- | -------------------------------------------------- |
| `/`, `/resume`        | Public      | Rendered resume / portfolio                        |
| `/about-me`           | Public      | About page with interactive travel map             |
| `/projects`           | Public      | Project index — published only; admins also see drafts |
| `/projects/:id`       | Public      | Project write-up; edits inline when signed in as admin |
| `/resume/data`        | Admin only  | Manage resume records                              |
| `/resume/:guid/edit`  | Admin only  | Edit a resume's sections inline                    |

`/resume/*` admin routes are gated by `AdminAuth`, which checks the signed-in user's UID against `VITE_ADMIN_UID`. The project routes are public pages that reveal editing in place for that same UID.

## Projects CMS

`/projects` is a small CMS for writing up work whose source isn't public. Each project is a doc in the `projects` collection, keyed by a slug derived from its title:

- **Draft / published** — projects stay invisible to visitors until published; admins see drafts with a badge.
- **Content blocks** — the write-up is an ordered list of typed blocks (`heading`, `paragraph`, `list`, `image`, `code`) that can be added, reordered, and deleted, so screenshots sit inline with the text explaining them. Images upload to Storage under `projects/<projectId>/`.
- **Optional link** — projects with no public repo simply render no link.

Editing happens in place on the real page, using the same inline primitives as the resume editor, with a sticky save bar tracking unsaved changes.

> **Firestore/Storage rules:** this repo doesn't check in security rules, so they're managed in the Firebase console. The `projects` collection needs read gated on `published` (or public read) with admin-only write; Storage needs public read + admin-only write on the `projects/` and `travel/` paths.
>
> Note that `getPublishedProjects` queries with `where('published','==',true)` specifically because Firestore evaluates rules against the *query*, not the returned documents — an unfiltered collection read is rejected outright when a per-document `published` rule is in play.

## Design system & theming

The UI runs on a small set of CSS custom properties defined at the top of [src/index.css](src/index.css):

- `--nocturne-bg` / `--nocturne-surface` / `--nocturne-text` / `--nocturne-divider` — the near-neutral dark surface palette, aliased to `--color-bg`, `--color-surface`, `--color-text`, `--color-divider`.
- `--color-accent*` — resolve to `--theme-*`, which [ThemeContext](src/context/ThemeContext.tsx) rewrites on `documentElement` when the theme picker changes. Accent is deliberately the **only** hue that shifts, so buttons, links, active nav, tags, the page's background glow, and table row hovers all repaint together.

A `@layer components` block recreates the design-system classes used throughout: `.btn` (+ `.btn-primary/secondary/danger`), `.card` / `.elev-sm` / `.card-title` / `.card-body`, `.tag` (+ `.tag-neutral/accent`), `.nav`, `.page-shell`, and `.section-rule`.

Fonts are a system stack — the original mockup referenced `--font-heading`/`--font-body` without shipping font files.

## Images

Uploads are downscaled in the browser before they reach Storage ([src/services/images/resizeImage.ts](src/services/images/resizeImage.ts)), because raw phone photos are 20–40× larger than anything the UI renders:

- **Travel photos** store two variants — a 2000px WebP for the gallery and a 400px WebP for cards, map popups, and the gallery's thumbnail strip.
- **Project body images** are downscaled to 2000px WebP; they render full-width, so no thumbnail is needed.
- EXIF orientation is applied during decode, GIF/SVG pass through untouched, and re-encoding is skipped when it wouldn't save bytes.
- All image uploads set `Cache-Control: public, max-age=31536000, immutable` — Storage paths are timestamped, so objects are immutable.

`TravelLocation.images` accepts both the current `{ url, thumb }` shape and the original bare URL string, so **pre-existing photos keep working without migration** — they simply don't benefit from a thumbnail until backfilled. Read them through the `fullUrl()` / `thumbUrl()` helpers in [src/models/About.ts](src/models/About.ts) rather than indexing directly.

### Backfilling existing images

[scripts/backfill-images.mjs](scripts/backfill-images.mjs) re-encodes images uploaded before the resize pipeline and rewrites Firestore to point at the derivatives. It runs server-side through `firebase-admin`, so there is no CORS involvement.

**Prerequisite:** a service-account JSON at `./service-account.json` (Firebase console → Project settings → Service accounts → Generate new private key). It's gitignored.

Run it in three passes:

```bash
# 1. Preview — writes nothing, reports per-image and total savings
npm run backfill:images

# 2. Convert — uploads derivatives and rewrites Firestore, keeping originals
npm run "backfill:images --apply"

# 3. After confirming the site looks right, reclaim the old files
npm run backfill:images -- --apply --delete-originals
```

Step 3 uses `--` because `--delete-originals` has no dedicated npm script. Anything after `--` is appended to the underlying command, so this form reaches **every** flag through the one script — `npm run backfill:images -- --apply` is equivalent to the quoted `--apply` script.

| Flag / env                       | Effect                                                                 |
| -------------------------------- | ---------------------------------------------------------------------- |
| *(none)*                         | Dry run. Reports only — nothing is written.                            |
| `--apply`                        | Upload derivatives and rewrite Firestore.                              |
| `--delete-originals`             | With `--apply`, delete each source file after converting it.           |
| `--key <path>`                   | Service-account JSON. Both npm scripts pass `./service-account.json`.  |
| `GOOGLE_APPLICATION_CREDENTIALS` | Alternative to `--key`, if you'd rather not pass a path.               |
| `FIREBASE_STORAGE_BUCKET`        | Override the bucket. Defaults to `<project-id>.firebasestorage.app`.   |

Bypassing npm entirely works too, which is handy for a one-off against a different project:

```bash
node scripts/backfill-images.mjs --key ../keys/other-project.json --apply
```

Notes:

- Already-migrated entries are skipped, so the script is **safe to re-run** — a failed or interrupted pass can simply be run again.
- `--delete-originals` is irreversible. Keep the originals until you've loaded `/about-me` and a project page and confirmed the images resolve.
- It walks both `about/profile` (visited + wishlist) and every doc in `projects`.

> **Watch the quoting on step 2.** `backfill:images --apply` is a literal npm script *name*, so the quotes are required. Running `npm run backfill:images --apply` without them makes npm swallow the flag and silently perform a dry run. The output always opens with either a `DRY RUN` banner or `Backfilling images (writing changes)…` — check which one you got. Prefer the `--` form above if you find that fragile.

## Getting started

### Prerequisites

- Node.js 24 (matches the Cloud Functions runtime)
- A Firebase project with Firestore, Storage, and Authentication (Google provider) enabled
- The [Firebase CLI](https://firebase.google.com/docs/cli) (`npm i -g firebase-tools`)
- An Anthropic API key (for the resume-parsing function)
- Only for the image backfill script: a service-account JSON at `./service-account.json`

### Install

```bash
npm install
cd functions && npm install && cd ..
```

### Environment variables

Copy `.env.example` to `.env` and fill in the values:

```
VITE_ADMIN_UID=              # Firebase Auth UID allowed to access admin routes
VITE_GITHUB=                 # Social profile URLs shown as buttons in the resume hero
VITE_LINKEDIN=
VITE_GITLAB=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

The Cloud Function reads `ANTHROPIC_API_KEY` from its own environment (set it as a Functions secret/config, not in the client `.env`).

### Develop

```bash
npm run dev
```

Runs Vite with HMR. In dev mode the app connects to the local Functions emulator on `localhost:5001`, so to exercise resume parsing locally run the emulator too:

```bash
cd functions && npm run serve
```

## Scripts

Root:

| Command                             | Description                                     |
| ----------------------------------- | ----------------------------------------------- |
| `npm run dev`                       | Start the Vite dev server                       |
| `npm run build`                     | Type-check (`tsc -b`) and build for production  |
| `npm run preview`                   | Preview the production build locally            |
| `npm run lint`                      | Run ESLint                                      |
| `npm run backfill:images`           | Dry-run the image backfill (reports only)       |
| `npm run "backfill:images --apply"` | Run the backfill for real — quotes required     |
| `npm run backfill:images -- <flags>`| Same script with arbitrary flags, e.g. `-- --apply --delete-originals` |

See [Backfilling existing images](#backfilling-existing-images) for the full flag reference.

Functions (`cd functions`):

| Command             | Description                                       |
| ------------------- | ------------------------------------------------- |
| `npm run build`     | Compile TypeScript to `lib/`                      |
| `npm run serve`     | Build and start the Functions emulator            |
| `npm run deploy`    | Deploy functions with the Firebase CLI            |
| `npm run logs`      | Tail Functions logs                               |

## Deployment

The site deploys to **Firebase Hosting**; hosting serves the Vite `dist/` output and rewrites all routes to `index.html` for client-side routing (see [firebase.json](firebase.json)).

```bash
npm run build
firebase deploy
```

This builds and deploys both hosting and functions. To deploy only one target, use `firebase deploy --only hosting` or `--only functions`.
