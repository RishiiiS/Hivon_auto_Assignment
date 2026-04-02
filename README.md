# The Archive

Next.js app with Supabase auth + posts, Cloudinary uploads, and a notes panel.

## Setup

1. Install deps: `npm install`
2. Create env file: copy `.env.example` → `.env.local` and fill values
3. Run dev: `npm run dev`

## Production / Deployment

- Do **not** commit `.env.local` (already ignored by `.gitignore`).
- Uploads:
  - Configure Cloudinary env vars to store images/videos in production.
  - If Cloudinary isn’t configured, `/api/upload` falls back to writing files into `public/uploads/` (dev-only / not recommended for serverless).
- API base URL:
  - By default the frontend calls same-origin `/api`.
  - Set `NEXT_PUBLIC_API_URL` only if your API is hosted on a different domain.

