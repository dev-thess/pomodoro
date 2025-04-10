# Deployment Guide

This document outlines the steps for deploying this application to Vercel.

## Environment Variables

The following environment variables are required for production deployment:

### Required Variables

| Variable               | Description                    | Example                                                                                                                |
| ---------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`         | Supabase connection pooler URL | `postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require` |
| `NEXTAUTH_URL`         | Public URL of your application | `https://your-app-name.vercel.app`                                                                                     |
| `NEXTAUTH_SECRET`      | Secret for NextAuth session    | Generate with `openssl rand -base64 32`                                                                                |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID         | From Google Cloud Console                                                                                              |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret     | From Google Cloud Console                                                                                              |

### Optional Variables

| Variable              | Description                                 | Example                                                                                      |
| --------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `DIRECT_DATABASE_URL` | Direct Supabase connection (for migrations) | `postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres?sslmode=require` |

> **Note**: If `DIRECT_DATABASE_URL` is not set, you'll need to run migrations manually before deploying.

## Vercel Setup

1. Connect your GitHub repository to Vercel
2. Configure the environment variables in Vercel's project settings
3. Deploy your application

## Database Migrations

There are two ways to handle database migrations:

### Option 1: Automatic migrations during build

Set the `DIRECT_DATABASE_URL` environment variable in Vercel.

### Option 2: Manual migrations

If you don't want to expose your direct database connection in Vercel, run migrations manually before deploying:

```bash
# Set DATABASE_URL to your direct connection (not the pooler)
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres?sslmode=require"

# Run migrations
npx prisma migrate deploy
```

## Troubleshooting

If you encounter deployment issues:

1. Check that all required environment variables are set
2. Verify that your database connection strings are correct
3. Look at the build logs for specific error messages
4. Refer to `DATABASE.md` for database-specific troubleshooting
