# Kimi AI Agency Platform — Infrastructure & Build Plan

> A no-code AI agent builder platform for agencies, using Kimi K2.5 exclusively.

---

## 1. Project Structure

```
kimi-platform/
├── apps/
│   ├── web/              # Next.js 14 frontend (App Router)
│   └── api/              # Node.js/Express backend (or Next.js API routes)
├── packages/
│   ├── db/               # Prisma schema + migrations
│   ├── types/            # Shared TypeScript types
│   └── kimi-engine/      # Kimi K2.5 agent execution logic
├── .env
├── docker-compose.yml    # Local dev environment
└── README.md
```

---

## 2. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR, file-based routing, API routes |
| Styling | Tailwind CSS + shadcn/ui | Rapid, consistent UI |
| Canvas | React Flow | Drag-and-drop node-based agent builder |
| Backend | Next.js API Routes + tRPC | Type-safe, colocated with frontend |
| Database | PostgreSQL (self-hosted on VPS) | Full control, no vendor lock-in |
| ORM | Prisma | Type-safe DB queries |
| Auth | NextAuth.js + JWT | Self-hosted auth, no external dependency |
| AI Engine | Moonshot AI (Kimi K2.5) | Sole LLM for all agents |
| Email | Resend | Transactional emails (deployment links, invites) |
| Realtime | Socket.IO (self-hosted) | WebSocket server on VPS |
| Hosting | Hostinger VPS (Ubuntu 22.04) | Full control, custom domain, no cold starts |
| Reverse Proxy | Nginx | SSL termination, routing, static file serving |
| Process Manager | PM2 | Keep Node.js app alive, zero-downtime reloads |
| Containerization | Docker + Docker Compose | Consistent environment, easy service management |

---

## 3. Database Schema

### Core Tables

```sql
users               -- Agency owners (linked to Supabase Auth)
sub_accounts        -- Client accounts (max 50 per user)
agents              -- Agent configs (name, system_prompt, status)
tools               -- Tool definitions (Google Calendar, Gmail, etc.)
agent_tools         -- Join: which tools an agent uses
tool_connections    -- Encrypted OAuth tokens per sub_account per tool
deployment_links    -- 48-hr signed links sent to clients
demo_links          -- Shareable public agent demo pages
channels            -- Deployment channel configs per agent
conversations       -- Chat history (test + deployed)
messages            -- Individual messages in a conversation
```

### Key Relationships
- `user` → many `sub_accounts` (max 50)
- `sub_account` → many `agents`
- `agent` → many `agent_tools` → many `tools`
- `agent` → many `channels`
- `sub_account` + `tool` → one `tool_connection` (OAuth tokens)

---

## 4. Authentication & Multi-Tenancy

- **NextAuth.js** handles signup, login, email verification, password reset (self-hosted)
- Sessions stored in PostgreSQL via Prisma adapter
- Every DB row is scoped by `user_id` or `sub_account_id`
- **PostgreSQL Row-Level Security (RLS)** — users can only read/write their own data
- Sub-account switcher in the UI changes the active context globally (stored in encrypted cookie)
- Sub-account limit (50) enforced at API level before insert

---

## 5. Agent Builder — Drag-and-Drop Canvas

Built with **React Flow**:

```
[Agent Node]  ──────── edge ────────▶  [Tool Node: Gmail]
                                    ▶  [Tool Node: Google Calendar]
                                    ▶  [Tool Node: Google Sheets]
                                    ▶  [Tool Node: Yahoo Mail]
```

- **Agent Node** = center of canvas, holds name + system prompt
- **Tool Nodes** = draggable cards that snap to the canvas
- **Edges** = drawn by dragging from agent to tool = creates `agent_tools` record
- **Right sidebar** = opens when a node is selected (configure tool scopes, view connection status)
- Canvas state is serialized to JSON and stored in the `agents` table

---

## 6. Kimi K2.5 Agent Engine (`packages/kimi-engine`)

This is the core execution logic:

```
User Message
    │
    ▼
Build context (system prompt + tool definitions + history)
    │
    ▼
Call Kimi K2.5 API (/v1/chat/completions with `tools` param)
    │
    ▼
Model returns tool_call?
    ├── YES → Execute tool function → append result → loop back
    └── NO  → Stream final response to user
```

- Tool definitions are formatted as Kimi K2.5 function-calling objects
- Agentic loop runs until model gives a final text response
- All tool results and messages are saved to `conversations` / `messages` tables

---

## 7. Tool Integrations & OAuth

Each tool uses OAuth 2.0. The flow:

1. Agency owner clicks "Connect tool" for a sub-account
2. Server generates a **signed, 48-hour link** → emails it to the client
3. Client opens link → redirected to Google/Yahoo OAuth consent screen
4. After approval → OAuth tokens saved to `tool_connections` (encrypted AES-256)
5. Canvas tool node shows **"Connected ✓"**

### Tools & Required Scopes

| Tool | OAuth Provider | Key Scopes |
|---|---|---|
| Google Calendar | Google | `calendar`, `calendar.events` |
| Gmail | Google | `gmail.readonly`, `gmail.send` |
| Google Sheets | Google | `spreadsheets` |
| Yahoo Mail | Yahoo | `mail-r`, `mail-w` |

### Tool Functions exposed to Kimi K2.5

Each tool exposes typed functions:
- **Gmail**: `send_email`, `read_email`, `list_emails`, `search_emails`
- **Google Calendar**: `list_events`, `create_event`, `update_event`, `delete_event`
- **Google Sheets**: `read_sheet`, `write_cell`, `append_row`, `list_sheets`
- **Yahoo Mail**: `send_email`, `read_email`, `list_emails`

---

## 8. Testing Window

- Split-screen in the Agent Builder: canvas (left) | chat (right)
- Sends messages to a sandboxed instance of the agent (uses the actual Kimi K2.5 engine)
- Streams responses token-by-token via Server-Sent Events (SSE)
- Shows **tool call trace** (collapsible): which tool was called, with what args, and what it returned
- "Clear conversation" resets the test session

---

## 9. Deployment Channels

### Website Widget
- Generates an embeddable `<script>` tag per agent
- Widget is a lightweight web component / iframe served from the platform's CDN
- Customizable: colors, logo, chat bubble position, welcome message

### WhatsApp
- Uses **Meta WhatsApp Cloud API**
- Webhook at `/api/webhooks/whatsapp` receives messages
- Routes to Kimi K2.5 engine → replies via API
- Phone number linked per sub-account

### Instagram DMs
- Uses **Meta Graph API (Instagram Messaging)**
- Webhook at `/api/webhooks/instagram`
- Auto-replies to DMs using the assigned agent

### Messenger
- Uses **Meta Messenger Platform**
- Webhook at `/api/webhooks/messenger`
- Facebook Page linked per sub-account

---

## 10. Deployment Links (48-Hour Expiry)

Used to let clients set up their account connection:

- `POST /api/deployment-links` → creates signed link with `expires_at = now + 48h`
- Link format: `https://app.kimi.ai/deploy/{token}`
- Email sent to client via Resend with instructions
- Client opens link → sees agent overview + channel setup guide
- After 48h → page shows "Link expired" with option to request a new one
- Agency owner can resend from the dashboard

---

## 11. Demo Presentation Feature

Lets agency owners pitch agents to potential clients:

- Create a demo from any agent → generates `https://app.kimi.ai/demo/{slug}`
- Demo page is **public** (no login required) and shows:
  - Agent name + description
  - Agency branding (logo, colors)
  - **Live interactive chat** powered by the real agent
  - Optional CTA button (e.g. "Get this for your business")
- Demo links can have optional expiry and optional password protection
- View count and chat interaction stats tracked in the dashboard

---

## 12. Sub-Account Management

- Each agency owner can create up to **50 sub-accounts** (one per client)
- Sub-accounts are isolated: separate agents, tool connections, and channels
- Switching sub-account changes the entire dashboard context
- Sub-account settings: name, client email, description, linked channels, tool connection status

---

## 13. Open Source & Self-Hosting

- **MIT License** — fully open source
- Signup required to use the hosted version
- Self-hosting via Docker Compose (same stack used in production on Hostinger VPS)
- `README.md` includes:
  - Full setup guide
  - Environment variables reference
  - How to get API keys for each integration

---

## 14. Hostinger VPS Server Infrastructure

### VPS Recommended Specs

| Resource | Minimum | Recommended |
|---|---|---|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Storage | 50 GB SSD | 100 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Bandwidth | Unmetered | Unmetered |

### Server Stack on VPS

```
[ Domain: yourdomain.com ]
         │
         ▼
   [ Nginx (port 80/443) ]   ← SSL via Let's Encrypt (Certbot)
         │
         ├──▶ /          → Next.js app (PM2, port 3000)
         ├──▶ /api        → Next.js API routes (same process)
         ├──▶ /socket.io  → Socket.IO server (PM2, port 3001)
         └──▶ /widget/*   → Static widget assets (Nginx serves directly)

[ PostgreSQL (port 5432, internal only) ]
[ Redis (port 6379, internal only) ]     ← optional: session/queue caching
```

### Setup Steps on Hostinger VPS

1. **Provision VPS** — Choose Ubuntu 22.04 LTS from Hostinger panel
2. **SSH access** — Add your SSH public key via Hostinger hPanel
3. **System setup**
   ```bash
   apt update && apt upgrade -y
   apt install -y git curl ufw nginx certbot python3-certbot-nginx
   ```
4. **Install Node.js** (via nvm)
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   nvm install 20 && nvm use 20
   npm install -g pm2
   ```
5. **Install Docker & Docker Compose**
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```
6. **PostgreSQL** — Run via Docker Compose (isolated container)
   ```yaml
   # docker-compose.yml
   services:
     postgres:
       image: postgres:16
       restart: always
       environment:
         POSTGRES_DB: kimi
         POSTGRES_USER: kimi_user
         POSTGRES_PASSWORD: ${DB_PASSWORD}
       volumes:
         - pgdata:/var/lib/postgresql/data
       ports:
         - "127.0.0.1:5432:5432"   # internal only
   volumes:
     pgdata:
   ```
7. **Nginx configuration** — Reverse proxy to Next.js
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /socket.io/ {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "Upgrade";
       }
   }
   ```
8. **SSL (HTTPS)** — Free via Let's Encrypt
   ```bash
   certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```
9. **Deploy app with PM2**
   ```bash
   git clone https://github.com/your-org/kimi-platform.git
   cd kimi-platform && npm install && npm run build
   pm2 start npm --name "kimi" -- start
   pm2 save && pm2 startup
   ```
10. **Firewall (UFW)**
    ```bash
    ufw allow OpenSSH
    ufw allow 'Nginx Full'
    ufw enable
    # PostgreSQL port 5432 is NOT exposed externally
    ```

### CI/CD Pipeline (GitHub → Hostinger VPS)

```
GitHub push to `main`
        │
        ▼
GitHub Actions workflow:
  1. Run tests
  2. Build Next.js app
  3. SSH into Hostinger VPS
  4. git pull + npm install + npm run build
  5. pm2 reload kimi --update-env
        │
        ▼
Zero-downtime deployment live on VPS
```

GitHub Actions secret required: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`

### Backups

- **PostgreSQL**: Automated daily `pg_dump` → compressed to `/backups/` on VPS
- **Hostinger Backups**: Enable weekly VPS snapshots from hPanel
- **Off-site**: Optionally sync backups to Cloudflare R2 or Backblaze B2

### Domain & DNS (via Hostinger)

| Record | Type | Value |
|---|---|---|
| `@` | A | VPS IP address |
| `www` | CNAME | `yourdomain.com` |
| `api` | A | VPS IP address (if separate) |

Point your domain DNS nameservers to Hostinger's nameservers from your domain registrar.

---

## 15. External API Accounts Required

Before building, set up the following:

| Service | Purpose | Where |
|---|---|---|
| Hostinger VPS | Server hosting | hostinger.com |
| Moonshot AI | Kimi K2.5 API | platform.moonshot.cn |
| Google Cloud Console | OAuth for Calendar, Gmail, Sheets | console.cloud.google.com |
| Yahoo Developer | OAuth for Yahoo Mail | developer.yahoo.com |
| Meta for Developers | WhatsApp, Instagram, Messenger | developers.facebook.com |
| Resend | Transactional email | resend.com |
| GitHub | Source control + CI/CD Actions | github.com |

---

## 16. Security Checklist

- [ ] All OAuth tokens encrypted at rest (AES-256)
- [ ] PostgreSQL only reachable on `127.0.0.1` (not exposed to public internet)
- [ ] Row-Level Security on all PostgreSQL tables
- [ ] Deployment and demo tokens are cryptographically signed (HMAC-SHA256)
- [ ] Rate limiting on all API routes (especially `/api/chat`) via `express-rate-limit`
- [ ] Input sanitization on all user-submitted content (system prompts, agent names)
- [ ] Webhook signature verification for Meta, Google
- [ ] HTTPS enforced everywhere via Let's Encrypt (auto-renews via Certbot)
- [ ] UFW firewall: only ports 22 (SSH), 80 (HTTP), 443 (HTTPS) exposed
- [ ] SSH hardened: disable root login, disable password auth (key-only)
- [ ] `fail2ban` installed to block brute-force SSH attempts
- [ ] Secrets in `.env` — never committed to Git (`.gitignore` enforced)
