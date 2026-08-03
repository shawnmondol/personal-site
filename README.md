# personal-site

Shawn Mondol's personal portfolio site — a resume/CV viewer and an "About Me" page with an interactive travel map. Public visitors see the published content; an admin (authenticated via Google) can upload a resume PDF, have it parsed into structured data by Claude, and edit every section inline.

## Tech stack

- **React 19** + **TypeScript**, built with **Vite 7**
- **Tailwind CSS v4** (via `@tailwindcss/vite`) with a runtime theme system (CSS custom properties in [src/models/themes.ts](src/models/themes.ts))
- **React Router 7** for routing
- **Firebase** — Hosting, Firestore (content storage), and Auth (Google sign-in)
- **Firebase Cloud Functions** (Node 24) — a callable function that parses resume text with the **Anthropic Claude** SDK
- **Leaflet** / **react-leaflet** for the travel map
- **pdfjs-dist** for extracting text from uploaded resume PDFs
- **framer-motion**, **lucide-react** icons, **sonner** toasts, **@tanstack/react-table**

## Project structure

```
src/
  App.tsx                 # Routes + provider tree (Theme → Auth → Resume)
  main.tsx
  components/
    Resume/
      ResumeDisplay/      # Resume sections, inline-editable when editMode is set
      ResumeEditForms/    # Inline editing primitives (InlineText, InlineStringList,
                          # EntryControls, listUtils) shared across the site
      ResumeData/         # Admin table and PDF upload
    Projects/             # ProjectBody — the content-block renderer/editor
    About/                # Travel cards, gallery modal, and map (Leaflet)
    SiteComponents/       # Header, buttons, modals, theme picker, admin auth gate
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
  models/                 # Resume, Project, About, and theme type definitions

functions/
  src/index.ts            # parseResume callable — sends resume text to Claude,
                          # returns structured JSON matching the resume schema
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

> **Firestore/Storage rules:** this repo doesn't check in security rules, so they're managed in the Firebase console. The `projects` collection needs public read and admin-only write, and Storage needs the same for the `projects/` path.

## Getting started

### Prerequisites

- Node.js 24 (matches the Cloud Functions runtime)
- A Firebase project with Firestore and Authentication (Google provider) enabled
- The [Firebase CLI](https://firebase.google.com/docs/cli) (`npm i -g firebase-tools`)
- An Anthropic API key (for the resume-parsing function)

### Install

```bash
npm install
cd functions && npm install && cd ..
```

### Environment variables

Copy `.env.example` to `.env` and fill in the values:

```
VITE_ADMIN_UID=              # Firebase Auth UID allowed to access admin routes
VITE_GITHUB=                 # Social profile URLs shown in the header/footer
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

| Command           | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start the Vite dev server                    |
| `npm run build`   | Type-check (`tsc -b`) and build for production|
| `npm run preview` | Preview the production build locally         |
| `npm run lint`    | Run ESLint                                    |

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
