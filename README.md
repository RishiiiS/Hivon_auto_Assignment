#  The Archive

[📺 Watch the Live Demo](https://drive.google.com/file/d/1V0WBVzaFuUJ1KrvUxz5wEdNrXbrwMmdW/view?usp=sharing)

> A premium editorial blogging platform built with **Next.js 16**, **Supabase**, **Cloudinary**, and **Google Gemini AI**. Write, publish, comment, like, and take private notes — all in one place.

---

##  Features

- **Authentication** — Secure sign-up and login via Supabase Auth with cookie-based session management and automatic token refresh via middleware.
- **Blog Posts** — Create, edit, and delete rich-text posts with a Tiptap editor. Posts include cover images, AI-generated summaries, and editorial category tags.
- **AI Summaries** — Google Gemini AI automatically generates a concise ~200 word summary for every published article. Gracefully falls back to a text excerpt if the API key is missing.
- **Like System** — Users can like any post with optimized batch fetching so like counts across the feed load in a single API call, not one per post.
- **Comments & Replies** — Authenticated users can comment on posts with full threaded discussion support (reply to comments). Authors and admins can edit or delete any comment; regular users can manage their own.
- **Edit & Delete Posts** — Post authors and admins can edit or delete any post. Regular users can only manage posts they authored.
- **Private Notes** — A personal notes panel is available to signed-in users. Notes support bold, italic, and bullet formatting via Tiptap. All notes are private and securely scoped per user.
- **Image Uploads** — Cover images are uploaded to Cloudinary on post creation/edit. Falls back to local `public/uploads/` in development if Cloudinary is not configured.
- **Search** — Full-text search across posts via a dedicated search page (`/search`).
- **User Profiles** — Each user has a profile page showing their published posts, avatar, and bio.
- **Admin Dashboard** — At `/admin`, administrators can view platform stats and manage users. Accessible only to admin-role accounts.
- **Responsive Design** — Fully responsive layout with a hamburger mobile menu, off-canvas notes drawer, and a floating action button on small screens.

---

## AI Summary Generation

When a post is published, `services/ai.service.js` sends the post body to **Gemini 2.5 Flash** and returns a ~200-word editorial summary. If the `GEMINI_API_KEY` environment variable is missing or the API call fails, the service gracefully falls back to returning the first 500 characters of the post content.

---

##  Tech Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| Framework    | [Next.js 16](https://nextjs.org/) (App Router)  |
| Database     | [Supabase](https://supabase.com/) (PostgreSQL)  |
| Auth         | Supabase Auth + `@supabase/ssr`                 |
| Rich Text    | [Tiptap](https://tiptap.dev/) v3               |
| AI           | [Google Gemini AI](https://ai.google.dev/) (gemini-2.5-flash) |
| Media        | [Cloudinary](https://cloudinary.com/)           |
| Styling      | Tailwind CSS v4                                 |
| Sanitization | DOMPurify                                       |
| Runtime      | Node.js ≥ 18.18                                 |

---

##  Project Structure

```
.
├── app/                      # Next.js App Router pages & API routes
│   ├── page.js               # Home feed
│   ├── about/                # About page
│   ├── login/                # Login page
│   ├── signup/               # Sign-up page
│   ├── profile/              # User profile
│   ├── create-post/          # Post creation page
│   ├── edit/[id]/            # Post edit page
│   ├── posts/[id]/           # Single post view
│   ├── notes/[id]/           # Single note view
│   ├── search/               # Search results page
│   ├── admin/                # Admin dashboard (stats, users, posts)
│   └── api/                  # REST API routes (auth, posts, comments, likes, notes, upload)
│
├── components/
│   ├── layout/               # Navbar, Sidebar, MobileMenu
│   ├── post/                 # PostCard, PostList
│   ├── comment/              # CommentSection, CommentForm
│   ├── notes/                # NotesPanel, NoteEditor
│   ├── admin/                # Admin table components
│   └── ui/                   # Shared UI primitives
│
├── services/                 # Server-side logic (called from API routes)
│   ├── auth.service.js
│   ├── authAdmin.service.js
│   ├── post.service.js
│   ├── comment.service.js
│   ├── postLike.service.js
│   ├── note.service.js
│   ├── ai.service.js         # Gemini AI summary generation
│   └── requestUser.service.js
│
├── lib/
│   ├── supabaseServer.js     # Authenticated server Supabase client (cookie-based)
│   └── supabaseAdminClient.js # Admin client (requires SUPABASE_SERVICE_ROLE_KEY)
│
├── hooks/
│   └── useAuth.js            # React hook for client-side auth state
│
├── styles/
│   └── globals.css
│
├── middleware.js             # Refreshes Supabase auth tokens on every request
└── .env.example              # Environment variable template
```

---

##  Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |  |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin features only) | ⚠️ Admin only |
| `GEMINI_API_KEY` | Google Gemini API key for AI summaries | Optional |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Optional |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Optional |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Optional |
| `CLOUDINARY_UPLOAD_FOLDER` | Cloudinary folder for uploads (default: `the-archive`) | Optional |
| `NEXT_PUBLIC_API_URL` | External API base URL (leave unset for same-origin `/api`) | Optional |

> **Note:** `SUPABASE_SERVICE_ROLE_KEY` is **only** required for the admin dashboard (`/admin`). All user-facing features including Notes, Posts, Comments, and Likes use the standard authenticated client and work without it.

---

##  Getting Started

### Prerequisites
- Node.js **≥ 18.18**
- A [Supabase](https://supabase.com) project with your database tables set up
- (Optional) A [Cloudinary](https://cloudinary.com) account for media uploads
- (Optional) A [Google AI Studio](https://aistudio.google.com/) API key for AI summaries

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

##  Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (webpack mode) |
| `npm run build` | Create an optimized production build |
| `npm start` | Start production server (after build) |
| `npm run lint` | Run ESLint |

---

##  Deployment

### Vercel (Recommended)
1. Push the repo to GitHub.
2. Import the project on [Vercel](https://vercel.com).
3. Add all required environment variables in the Vercel project settings.
4. Deploy.

### Other Platforms (Render, Railway, etc.)
1. Set `NODE_ENV=production` and all env vars in the platform dashboard.
2. Use the build command: `npm run build`
3. Use the start command: `npm start`

### Important Notes
- **Never commit** `.env.local` — it is already listed in `.gitignore`.
- **Cloudinary** is required for image uploads in production. Without it, uploads will only write to `public/uploads/` which is **not suitable** for serverless environments.
- **Admin features** require `SUPABASE_SERVICE_ROLE_KEY` to be set in the production environment.

---






