Here’s a **professional, assignment-ready README.md** tailored exactly to your requirements 👇

---

## ✅ FINAL README.md (Submission Ready)

````md
# NexBlog – AI Powered Blogging Platform

## 📌 Objective
This project is a full-stack blogging platform built using **Next.js** and **Supabase**, with AI-powered summary generation. It demonstrates role-based access control, database design, AI integration, and deployment.

---

## 🚀 Tech Stack

| Layer | Technology |
|------|-----------|
| Frontend + Backend | Next.js 14 (App Router) |
| Authentication | Supabase Auth |
| Database | Supabase |
| AI Integration | GROQ_API (gemini has limit )|
| Version Control | Git + GitHub |
| Deployment | Netlify |

---

## 🤖 AI-Assisted Development

### Tool Used
- CHATGPT (AI coding assistant)

### Why Chosen
- Faster development with inline AI suggestions
- Helps debug errors quickly
- Improves code structure and best practices

### How It Helped
- Generated API route logic
- Assisted in fixing authentication and RBAC issues
- Helped optimize AI summary prompts
- Debugged deployment and environment issues

---

## 👥 User Roles & Permissions

| Role | Permissions |
|------|------------|
| Author | Create posts, Edit own posts, View comments on their posts |
| Viewer | View posts, Read summaries, Comment on posts |
| Admin | View all posts, Edit any post, Monitor comments |

---

## 📝 Blog Features

### Required Fields
- Title
- Featured Image
- Body Content
- Comments Section

### Additional Features
- Search posts
- Pagination
- Edit functionality (Author + Admin)

---

## 🤖 AI Feature (Summary Generation)

When a post is created:

1. Content is cleaned and trimmed  
2. Sent to Google Gemini API  
3. AI generates ~200-word summary  
4. Summary is stored in database  
5. Displayed on blog listing page  

---

## 🗄️ Database Schema (Supabase)

### Users
- id
- name
- email
- role

### Posts
- id
- title
- body
- image_url
- author_id
- summary

### Comments
- id
- post_id
- user_id
- comment_text

---

## 🔐 Authentication Flow

- Users sign up/login via Supabase Auth
- Role is assigned in `users` table
- Role is used in frontend + backend to control access

---

## 🔄 Feature Logic

### Post Creation Flow
1. Author creates post
2. API receives title + body
3. AI generates summary
4. Post + summary stored in DB

### Role-Based Access (RBAC)
- Author → Only own posts
- Admin → All posts
- Viewer → Read-only

### AI Summary Flow
- Triggered once during post creation
- Stored permanently (no repeated API calls)

---

## 💰 Cost Optimization

- Limit input text (trim to ~1500 chars)
- Generate summary **only once**
- Store summary in database
- Avoid repeated API calls

---

## 🛠️ Development Challenges

### Issue Faced
- Gemini API quota errors (429 limit exceeded)

### Solution
- Implemented fallback summary logic
- Switched to efficient API usage
- Reduced token usage

---

## 🧠 Key Architectural Decisions

- Used **Next.js App Router** for full-stack structure
- Supabase for both Auth + DB (simplified backend)
- API routes for AI processing
- RBAC handled on both frontend and backend

---

## 🧪 Run Locally

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
````

Add:

```
SUPABASE_URL=https://vguyxupnnqkwryhmydux.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZndXl4dXBubnFrd3J5aG15ZHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDE1MTEsImV4cCI6MjA5MjcxNzUxMX0.WB8GvalEMrYFJSPjvDs5BK7bhB_NNpffkYy0oOHZcao
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZndXl4dXBubnFrd3J5aG15ZHV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE0MTUxMSwiZXhwIjoyMDkyNzE3NTExfQ.9Nzs1bcyhsErmGlxJVwJ4nXG_LVYysxz_Zv3aZYLWZ0
GROQ_API_KEY=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
```

```bash
# Run dev server
npm run dev
```

---

## 🌍 Deployment (Netlify)

### Steps

1. Push code to GitHub
2. Import project in Netlify
3. Set:

```
Base directory: nexblog2
Build command: npm run build
```

4. Add environment variables
5. Add `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

6. Deploy 🚀

---

## 🔗 Submission Details

* GitHub Repo: (https://github.com/Yashkadam1234/blogs)
* Live URL: (Add your deployed link)

---

## ✨ Features

* AI-generated summaries
* Role-based dashboard
* Authentication system
* Search + pagination
* Comment system
* Admin panel

---
 
