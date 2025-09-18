This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Auth integration with Firebase Web SDK has been added to support Cryptic Hunt 2024 backend authentication using Firebase ID tokens. The Sign In and Sign Up pages mirror the UI from the mobile frontend.

## Configure

1. Copy `.env.example` to `.env.local` and fill the Firebase config (from your Firebase console) and backend base URL. In the backend `.env`, set `RSVP_MODE=true` to enable RSVP behavior (auto check-in on creation, list questions without phase gating).

```
cp .env.example .env.local
# then edit values
```

2. Install dependencies (includes `firebase`).

```
npm install
```

## Routes

- `/signin` — Sign in with Google (styled like the mobile LoginScreen)
- `/signup` — Sign up with Google (same flow)
- `/onboarding` — Submit phone and gender (mirrors mobile ExtraInfo)
- `/checkin` — Show check‑in QR for organizers to scan
- `/` — Home, requires auth and attempts `/api/main` against the backend with `Authorization: Bearer <FirebaseIDToken>`
- `/spa` — Single Page App container that renders views via Zustand state
- `/team` — Create team, join by code, view members, QR join, leave
- `/profile` — View name, email, rank and points

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### SPA Mode (Zustand)

- Set `NEXT_PUBLIC_SPA=1` in `.env.local` to enable SPA NavBar behavior (uses Zustand to change views without route changes).
- Visit `/spa` to use the single-page container that renders `signin / signup / onboarding / team / questions / profile / leaderboard` views based on global state and `/api/main` decisions.
- NavBar switches tabs using the store; external Register link stays a normal link.

4. Assets (required for exact visuals)

Copy the following SVGs from the mobile repo into `public/cryptic-assets/`:

- `bgworldmap.svg` from `cryptic-hunt-frontend/assets/images/bgworldmap.svg`
- `cryptichuntcorner.svg` from `cryptic-hunt-frontend/assets/images/JoinPage/cryptichuntcorner.svg`
- Optionally: `six-owls.svg`, `JoinPage/AllOwls.svg`, `JoinPage/scanning.svg` if you want those specific illustrations/buttons

After copying, the auth and team screens will show the same background and corner logo.

### Guest Mode (no backend / no auth)

If you want to run the app without Firebase auth or the backend, enable Guest Mode:

- In `.env.local`, set `NEXT_PUBLIC_GUEST_MODE=1` (or `GUEST_MODE=1`).
- The app will:
	- Skip Firebase sign-in and treat you as a synthetic “Guest” user.
	- Short-circuit backend calls by serving mock data for key endpoints (`/api/main`, `/api/profile/`, `/api/questions/:id`, `/api/response/`, `/api/leaderboard/team`, `/api/team/user/qr`).
	- Auto-place you into a ready “Guest Team” to avoid onboarding and team creation flows.
	- Route you straight to `/hunt` and land on the About page (informational mode).
	- Filter the navigation to only show: About, FAQ, Rules, Resources, Announcements.
	- Hide gameplay / team management UI (questions list can still be accessed internally if you navigate, but nav excludes it).
	- Hide QR / NFC scanning buttons in question detail.
	- Simulate phase timing: shows `PHASE_NOT_STARTED` until 26 Sept 2025 (UTC), then automatically flips to `PHASE_ACTIVE`.

Notes:
- Team create/join/leave actions are disabled in Guest Mode (no-ops).
- FCM messaging is ignored in Guest Mode.
- To return to normal behavior, unset the env and restart the dev server.
