# NexBlog

A full-stack blogging platform built with Next.js 14, Supabase, and Google Gemini AI.

## Quick Start

```bash
# 1. Install
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in your Supabase and Google AI keys

# 3. Set up database
# Run supabase/schema.sql in your Supabase SQL Editor

# 4. Start
npm run dev
```

## Tech Stack
- **Next.js 14** (App Router)
- **Supabase** (Auth + PostgreSQL)
- **Google Gemini 1.5 Flash** (AI Summaries)
- **Tiptap** (Rich text editor)
- **Tailwind CSS**

## Roles
| Role | Can Do |
|------|--------|
| Viewer | Read posts, comment |
| Author | Create/edit own posts |
| Admin | Full access, manage users |

## Make yourself admin
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

## Deploy
Push to GitHub → connect to Vercel → add env vars → deploy.
