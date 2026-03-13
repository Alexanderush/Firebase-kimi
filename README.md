# Kimi AI Agency Platform (Firebase Edition)

A white-label AI agent platform that lets agencies build, deploy, and manage AI chatbots for their clients. This version is configured for **Firebase App Hosting**.

## Tech Stack

- **Framework**: Next.js 15 (App Router, SSR)
- **Hosting**: Firebase App Hosting
- **Database**: PostgreSQL (external — Neon.tech, Supabase, or Cloud SQL)
- **ORM**: Prisma
- **Auth**: NextAuth.js (JWT + Credentials)
- **AI Engine**: Kimi K2.5 via NVIDIA NIM (OpenAI-compatible API)
- **Styling**: Tailwind CSS 4

## Prerequisites

- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project (create at https://console.firebase.google.com)
- An external PostgreSQL database (e.g., [Neon.tech](https://neon.tech) free tier)

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, NEXTAUTH_SECRET, NVIDIA_API_KEY, etc.

# 3. Generate Prisma client & run migrations
npx prisma generate --schema=packages/db/prisma/schema.prisma
npx prisma db push --schema=packages/db/prisma/schema.prisma

# 4. Seed the database (tools: Gmail, Calendar, Sheets, Yahoo Mail)
npx prisma db seed --schema=packages/db/prisma/schema.prisma

# 5. Start the dev server
npm run dev
```

## Deploy to Firebase

### 1. Set up Firebase

```bash
# Login to Firebase
firebase login

# Initialize App Hosting (connect your GitHub repo)
firebase apphosting:backends:create
```

### 2. Configure Secrets

In the Firebase Console → App Hosting → Environment Variables & Secrets, add:

| Secret Name | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (with `?sslmode=require`) |
| `NEXTAUTH_SECRET` | Random 32-char string (`openssl rand -base64 32`) |
| `NVIDIA_API_KEY` | Your NVIDIA NIM API key |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `META_CLIENT_ID` | Meta App ID (for WhatsApp/Messenger) |
| `META_CLIENT_SECRET` | Meta App Secret |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Business phone number ID |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | WhatsApp webhook verification token |

### 3. Deploy

Push to GitHub — Firebase App Hosting auto-deploys on every push to the connected branch.

```bash
git push origin main
```

## Monorepo Structure

```
├── apps/web/           # Next.js application
├── packages/db/        # Prisma schema & database layer
├── packages/kimi-engine/ # AI engine (NVIDIA NIM integration)
├── apphosting.yaml     # Firebase App Hosting configuration
├── firebase.json       # Firebase project config
└── .firebaserc         # Firebase project aliases
```

## Database Setup (Neon.tech Example)

1. Create a free Neon project at https://neon.tech
2. Copy the connection string (format: `postgresql://user:pass@host/dbname?sslmode=require`)
3. Use it as your `DATABASE_URL` in both `.env` (local) and Firebase secrets (production)
