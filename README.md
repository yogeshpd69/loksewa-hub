# Loksewa Hub 🇳🇵

Loksewa Hub is an advanced, AI-powered preparation platform tailored specifically for Nepal's Public Service Commission (Loksewa) Engineering and Administrative examinations. 

Built with React, Supabase, and cutting-edge Edge Functions, the application gamifies the study experience, intelligently paces learning via Spaced Repetition (SuperMemo-2), and autonomously curates weekly news and subject-matter updates.

## Core Features ✨
* **Mock Test Simulator:** Timer-enforced full exams matching official syllabus weights, complete with server-side grading via Postgres RPC to prevent cheating.
* **Practice Engine & Spaced Repetition:** An intelligent engine deploying the SM-2 algorithm to surface questions precisely when you're about to forget them.
* **Autonomous Current Affairs Pipeline:** Fetches AI-clustered daily news and generates localized bullet-point summaries using LLMs on the edge.
* **Gorkhapatra Loksewa Bishesh:** Automatically scrapes and organizes official Wednesday/Saturday study materials published in Gorkhapatra.
* **Gamification & Social Competition:** XP points, 7-day study heatmaps, global leaderboards, and exact-email friend network using Row-Level Security.

## Tech Stack 🛠️
* **Frontend:** React 19, TypeScript, TailwindCSS v4, Vite, React Router, Lucide Icons
* **Backend:** Supabase (PostgreSQL, Row Level Security, Edge Functions)
* **AI & Parsing:** Groq SDK (LLama 3), `fast-xml-parser`, `cheerio`
* **Testing:** Vitest

## Local Setup 🚀

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yogeshpd69/loksewa-hub.git
   cd loksewa-hub
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Edge Functions & Architecture

This platform relies on several serverless Supabase Edge Functions:
* **`ai-chat`**: Authenticates users via JWT, applies daily usage limits (RPC `check_and_increment_ai_usage`), and connects to Groq for summarizing articles and answering syllabus questions.
* **`fetch-news`**: Scheduled function that hits the fast Kchakhabar API and populates the `daily_news` table. Only permitted via `SERVICE_ROLE_KEY`.
* **`fetch-loksewa`**: Scheduled scraper pulling the latest weekly Q&A materials directly from gorkhapatraonline.com, converting them into a clean native UI struct.

### Security
Application data is highly secured:
* **"Server-Side Truth"**: Gamification (XP, streaks) and Answer grading is never trusted from the client. It's executed through SECURITY DEFINER RPCs.
* **Row-Level Security**: Profiles and user data are strictly locked down to `auth.uid()`.

## License
MIT License.
