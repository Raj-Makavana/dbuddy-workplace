# DBuddy 🚀
> **Your Intelligent Database Companion**  
> A Next.js-powered no-code platform that lets anyone create, manage, query, and optimize PostgreSQL databases using natural language commands. No SQL knowledge required.

---

## 💎 Features

* **Natural Language to SQL**: Converse with your database using natural language. The built-in AI translates your request, shows you the proposed SQL, executes it, and renders a premium table output.
* **Aesthetic Dashboard**: A fluid, modern dark/light hybrid design complete with staggered loading animations, shimmer skeletons, and smooth interactive elements.
* **Schema Explorer**: Visualize your tables, column constraints, primary/foreign keys, and data relationships at a glance.
* **Mock Data Generator**: Instantly generate structured mock data using AI to test your schemas and pipelines.
* **Data Export**: Export your query results or table structures into **CSV**, **JSON**, or **XLSX (Excel)** formats.
* **Optimization Hub**: Analyze query performances, view index suggestions, and understand query execution plans.

---

## 🛠️ Tech Stack

* **Frontend & Backend**: Next.js (App Router), React, Tailwind CSS
* **Database**: PostgreSQL (Neon Serverless)
* **AI Engine**: Gemini API & LangChain core integration
* **Authentication**: NextAuth.js

---

## 🚀 Quick Start (Local Setup)

Follow these steps to run DBuddy locally:

### 1. Clone the Repository
```bash
git clone https://github.com/Raj-Makavana/dbuddy-workplace.git
cd dbuddy-workplace
```

### 2. Install Dependencies
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root of the project. Copy the template below and fill in your API credentials:
```env
# Database Connection (Neon PostgreSQL URL)
DATABASE_URL="postgres://username:password@host/database?sslmode=require"

# NextAuth Configuration
NEXTAUTH_SECRET="your-32-character-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Gemini AI Integration
GEMINI_API_KEY="your-gemini-api-key"

# Neon Integration API Keys (for dynamic database generation)
NEON_API_KEY="your-neon-console-api-key"
NEON_PROJECT_ID="your-neon-project-id"
NEON_BRANCH_ID="your-neon-branch-id"
NEON_BASE_URI="postgres://username:password@host"

# Email Verification (Brevo/Sendinblue)
BREVO_API_KEY="your-brevo-api-key"
EMAIL_FROM="noreply@dbuddy.com"
```

### 4. Create an Account / Seed Database
If you do not have Brevo set up for email verification, you can bypass email checks by seeding a verified user directly into your database:
```bash
node scratch_create_user.js your_email@example.com your_password "Your Name"
```
This hashes the password and inserts an active, pre-verified user into your database.

### 5. Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to experience DBuddy!

---

## 🌐 Public Deployment (Deploy to Vercel)

DBuddy is optimized for easy, error-free hosting on **Vercel** with Neon PostgreSQL:

1. **Push your code** to your public/private GitHub repository.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New > Project**.
3. Select your `dbuddy-workplace` repository.
4. Under **Environment Variables**, paste all the keys from your `.env` file.
   * *Make sure to change `NEXTAUTH_URL` to your production Vercel domain (e.g. `https://your-app.vercel.app`).*
5. Click **Deploy**.
6. Once deployed, run your database seeding command or use the application normally!

---

## 🤝 Contributing
Feel free to open issues or submit pull requests to help improve DBuddy!
