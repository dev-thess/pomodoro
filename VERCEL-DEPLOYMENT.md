# Vercel Deployment Guide

This guide provides instructions for deploying the Pomodoro application to Vercel with proper NextAuth and Supabase PostgreSQL configuration.

## Required Environment Variables

In your Vercel project settings, add the following environment variables:

| Variable               | Description                                    | Example                                                                                                                              |
| ---------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`         | Supabase PostgreSQL connection string with SSL | `postgresql://postgres.otfwlurxhanaaogufjnx:7VDd1oCYGuUgrjWD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require` |
| `NEXTAUTH_URL`         | Your production URL                            | `https://pomodoro-alpha-snowy.vercel.app`                                                                                            |
| `NEXTAUTH_SECRET`      | Secret for NextAuth JWT encryption             | (Generate with `openssl rand -base64 32`)                                                                                            |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID                         | (From Google Cloud Console)                                                                                                          |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret                     | (From Google Cloud Console)                                                                                                          |

## Deployment Steps

1. **Set Environment Variables**

   - Go to Vercel dashboard → Your project → Settings → Environment Variables
   - Add all required variables listed above
   - Make sure to validate database connectivity

2. **Google OAuth Setup**

   - In Google Cloud Console, add authorized redirect URI:
   - `https://pomodoro-alpha-snowy.vercel.app/api/auth/callback/google`

3. **Deploy the Application**
   - Connect your GitHub repository to Vercel
   - The build command is already configured in package.json
   - Deploy the application

## Troubleshooting

If you encounter `adapterError` or database connection issues:

1. **Test Database Connection**

   - Visit `https://pomodoro-alpha-snowy.vercel.app/api/auth/test-connection`
   - This will verify if the app can connect to your Supabase database

2. **Check Environment Variables**

   - Ensure all variables are properly set in Vercel
   - The `DATABASE_URL` must include `?sslmode=require`
   - No trailing slashes in `NEXTAUTH_URL`

3. **Verify Prisma Schema**

   - Make sure your Prisma schema matches your database
   - All required tables for NextAuth are created

4. **Check Logs**
   - In Vercel dashboard → Functions → Function Logs
   - Look for database connection errors

## Security Notes

- The test-connection endpoint should be removed after deployment is verified
- Generate a unique `NEXTAUTH_SECRET` for production
- Never commit environment variables to your repository
