# Vercel Deployment Guide

This document provides instructions for deploying this application to Vercel with the correct database configuration.

## Database Connection Setup

### Required Environment Variables

Set these in your Vercel project settings:

| Variable               | Description                                  | Format                                                                                                                 |
| ---------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`         | **REQUIRED**: Supabase pooled connection URL | `postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require` |
| `NEXTAUTH_URL`         | Your app's production URL                    | `https://yourdomain.vercel.app`                                                                                        |
| `NEXTAUTH_SECRET`      | Auth encryption key                          | Generate with `openssl rand -base64 32`                                                                                |
| `GOOGLE_CLIENT_ID`     | Google OAuth credentials                     | From Google Cloud Console                                                                                              |
| `GOOGLE_CLIENT_SECRET` | Google OAuth credentials                     | From Google Cloud Console                                                                                              |

### Migration Handling

Migrations are **not** included in the build process to prevent deployment failures.

To apply database migrations:

1. **Run migrations locally** before deploying:

   ```bash
   # Set your direct database URL locally
   export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres?sslmode=require"

   # Apply migrations
   npx prisma migrate deploy
   ```

2. **Or add migrations back** to the build process (not recommended for production):
   ```json
   "build": "prisma generate && prisma migrate deploy && next build"
   ```
   This requires setting `DIRECT_DATABASE_URL` in Vercel, which gives direct database access.

## Troubleshooting

If you encounter issues:

1. **Database connection errors**:

   - Ensure `DATABASE_URL` uses the pooler URL (contains `pooler.supabase.com`)
   - Include `?sslmode=require` in your connection string
   - Check that your Supabase project is active

2. **503 errors or timeouts**:
   - This could be due to connection pool exhaustion
   - Ensure your code properly disconnects from the database
   - Consider upgrading your Supabase plan for more connections
