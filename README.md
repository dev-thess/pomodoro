# Pomodoro MVP

A minimal Pomodoro timer app built with Next.js, TailwindCSS, and Zustand, with Google authentication and Supabase database integration.

## Features

- Pomodoro timer with customizable work/break durations
- Google authentication
- Session notes for each Pomodoro
- Streak tracking and persistence
- Mobile-responsive design

## Tech Stack

- Next.js (App Router)
- TypeScript
- TailwindCSS
- Zustand
- Prisma ORM
- NextAuth.js
- Supabase PostgreSQL

## Setup Instructions

1. Clone the repository

   ```
   git clone https://github.com/your-username/pomodoro.git
   cd pomodoro
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Create a `.env.local` file with the following environment variables:

   ```
   # Database Connection (Supabase)
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET="your-nextauth-secret-key"

   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. Generate Prisma client

   ```
   npx prisma generate
   ```

5. Push schema to database

   ```
   npx prisma db push
   ```

6. Run the development server
   ```
   npm run dev
   ```

## Deployment

1. Set up a new Supabase project and get your database URL

2. Create Google OAuth credentials through Google Cloud Console

   - Create a new project
   - Enable the Google+ API
   - Create OAuth consent screen
   - Create OAuth credentials (Web application)
   - Add authorized redirect URIs:
     - For development: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://your-domain.com/api/auth/callback/google`

3. Deploy to Vercel
   - Connect your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy!
